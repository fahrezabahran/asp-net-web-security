"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { ResultPanel } from "./ModuleShell";

// Shared login/register box used by modules that need a real logged-in
// session (CSRF, IDOR). Always talks to the non-vulnerable /api/account
// endpoints — the vulnerability under test lives in the module's own
// vulnerable/secure controllers, not in how the session is established.
export function AccountPanel() {
  const [email, setEmail] = useState("demo@lab.test");
  const [password, setPassword] = useState("Password1");
  const [result, setResult] = useState<unknown>(undefined);

  async function register() {
    const res = await apiFetch("/api/account/register", {
      method: "POST",
      body: { email, password, displayName: "Demo User" },
    });
    setResult(res.data);
  }

  async function login() {
    const res = await apiFetch("/api/account/login", {
      method: "POST",
      body: { email, password },
    });
    setResult(res.data);
  }

  async function me() {
    const res = await apiFetch("/api/account/me");
    setResult(res.data);
  }

  return (
    <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
        Session (shared, secure login)
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          className="flex-1 rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
        />
        <input
          className="flex-1 rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          type="password"
        />
      </div>
      <div className="mt-3 flex gap-2 text-sm">
        <button onClick={register} className="rounded bg-zinc-800 px-3 py-1.5 text-white hover:bg-zinc-700">
          Register
        </button>
        <button onClick={login} className="rounded bg-zinc-800 px-3 py-1.5 text-white hover:bg-zinc-700">
          Log in
        </button>
        <button onClick={me} className="rounded border border-zinc-300 px-3 py-1.5 dark:border-zinc-700">
          Who am I?
        </button>
      </div>
      <div className="mt-3">
        <ResultPanel label="Account response" value={result} />
      </div>
    </div>
  );
}
