import { NextRequest, NextResponse } from "next/server";
import { clearFailedLogins, createAdminSession, getLoginLock, recordFailedLogin, verifyAdminPassword } from "@/lib/admin/auth";
import { jsonError, parseBody } from "../../_lib";

export async function POST(req: NextRequest) {
  try {
    const lock = await getLoginLock(req);
    if (lock.locked) {
      return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429, headers: { "Retry-After": String(lock.retryAfter) } });
    }
    const body = await parseBody<{ password?: string }>(req);
    const password = String(body.password ?? "");
    const valid = await verifyAdminPassword(password);
    if (!valid) {
      const failure = await recordFailedLogin(req);
      return jsonError(failure.locked ? "Too many attempts. Try again in 15 minutes." : "Invalid password", failure.locked ? 429 : 401);
    }
    await clearFailedLogins(req);
    await createAdminSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError((error as Error).message, 500);
  }
}
