"use client";

import { useState } from "react";
import styles from "./admin.module.css";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(json?.error || "Login failed");
      window.location.reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className={styles.loginPage}>
      <form className={styles.loginPanel} onSubmit={submit}>
        <p className={styles.eyebrow}>Rivkala admin</p>
        <h1>Sign in</h1>
        <label>
          Password
          <input
            autoComplete="current-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <p className={styles.error}>{error}</p> : null}
        <button className={styles.primaryButton} disabled={pending} type="submit">
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
