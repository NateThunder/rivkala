import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const cookieName = "rivkala_admin";
const sessionDays = 1;
const maxAttempts = 5;
const lockoutMinutes = 15;

type SessionPayload = {
  sub: string;
  role: "admin";
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string) {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index] ^ right[index];
  }
  return diff === 0;
}

export async function verifyAdminPassword(password: string) {
  const configuredPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!configuredPasswordHash) throw new Error("Admin password is not configured");
  const submittedHash = await sha256Hex(password);
  return timingSafeEqual(submittedHash, configuredPasswordHash);
}

export async function createAdminSession() {
  const token = await new SignJWT({ role: "admin" } satisfies Omit<SessionPayload, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(`${sessionDays}d`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionDays * 24 * 60 * 60,
  });
}

type LoginAttempt = { attempts: number; locked_until: string | null };
type D1Like = {
  prepare(query: string): {
    bind(...values: unknown[]): {
      first<T>(): Promise<T | null>;
      run(): Promise<unknown>;
    };
  };
};

const localAttempts = new Map<string, LoginAttempt>();

async function getDb(): Promise<D1Like | null> {
  try {
    const context = await getCloudflareContext({ async: true });
    return ((context.env as { DB?: D1Like }).DB ?? null);
  } catch {
    return null;
  }
}

function clientAddress(req: NextRequest) {
  return req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

async function clientKey(req: NextRequest) {
  return sha256Hex(`${process.env.SESSION_SECRET}:${clientAddress(req)}`);
}

export async function getLoginLock(req: NextRequest) {
  const key = await clientKey(req);
  const db = await getDb();
  const row = db
    ? await db.prepare("SELECT attempts, locked_until FROM admin_login_attempts WHERE client_key = ?").bind(key).first<LoginAttempt>()
    : localAttempts.get(key) ?? null;
  if (!row?.locked_until) return { key, db, locked: false, retryAfter: 0 };
  const retryAfter = Math.ceil((Date.parse(row.locked_until) - Date.now()) / 1000);
  return { key, db, locked: retryAfter > 0, retryAfter: Math.max(0, retryAfter) };
}

export async function recordFailedLogin(req: NextRequest) {
  const { key, db } = await getLoginLock(req);
  let attempts = 1;
  if (db) {
    const row = await db.prepare("SELECT attempts FROM admin_login_attempts WHERE client_key = ?").bind(key).first<{ attempts: number }>();
    attempts = (row?.attempts ?? 0) + 1;
  } else {
    attempts = (localAttempts.get(key)?.attempts ?? 0) + 1;
  }
  const lockedUntil = attempts >= maxAttempts
    ? new Date(Date.now() + lockoutMinutes * 60 * 1000).toISOString()
    : null;
  const nextAttempts = lockedUntil ? 0 : attempts;
  if (db) {
    await db.prepare(`INSERT INTO admin_login_attempts (client_key, attempts, locked_until, updated_at)
      VALUES (?, ?, ?, ?) ON CONFLICT(client_key) DO UPDATE SET attempts = excluded.attempts,
      locked_until = excluded.locked_until, updated_at = excluded.updated_at`)
      .bind(key, nextAttempts, lockedUntil, new Date().toISOString()).run();
  } else {
    localAttempts.set(key, { attempts: nextAttempts, locked_until: lockedUntil });
  }
  return { locked: Boolean(lockedUntil), remaining: Math.max(0, maxAttempts - attempts) };
}

export async function clearFailedLogins(req: NextRequest) {
  const { key, db } = await getLoginLock(req);
  if (db) await db.prepare("DELETE FROM admin_login_attempts WHERE client_key = ?").bind(key).run();
  else localAttempts.delete(key);
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (!token) return null;
  try {
    const result = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    if (result.payload.role !== "admin" || !result.payload.sub) return null;
    return { username: String(result.payload.sub), role: "admin" as const };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
