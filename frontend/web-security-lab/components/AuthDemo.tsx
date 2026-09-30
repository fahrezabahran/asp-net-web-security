"use client";

import { useState } from "react";
import { apiFetch, moduleBasePath, type Mode } from "@/lib/api";
import { ResultPanel } from "./ModuleShell";
import { AccountPanel } from "./AccountPanel";

export function AuthDemo({ mode }: { mode: Mode }) {
  const base = moduleBasePath("auth", mode);
  const [email, setEmail] = useState("demo@lab.test");
  const [password, setPassword] = useState("wrong-password");
  const [loginResult, setLoginResult] = useState<unknown>(undefined);
  const [whoAmI, setWhoAmI] = useState<unknown>(undefined);

  async function login() {
    const res = await apiFetch(`${base}/login`, {
      method: "POST",
      body: { email, password },
    });
    setLoginResult({ status: res.status, ...(res.data as object) });
  }

  async function bruteForce() {
    let last: unknown;
    for (let i = 0; i < 7; i++) {
      const res = await apiFetch(`${base}/login`, {
        method: "POST",
        body: { email, password: `guess-${i}` },
      });
      last = { attempt: i + 1, status: res.status, data: res.data };
    }
    setLoginResult(last);
  }

  async function checkWhoAmI() {
    const res = await apiFetch(`${base}/whoami`);
    setWhoAmI({ status: res.status, ...(res.data as object) });
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs text-zinc-500">
        First create an account below using the shared registration form
        (real accounts live in the secure Identity store either way — this
        module only compares login/session handling, not how the account
        itself is created).
      </p>
      <AccountPanel />

      <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Module login (compares cookie flags &amp; session handling)
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            className="flex-1 rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="flex-1 rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <button onClick={login} className="rounded bg-zinc-800 px-3 py-1.5 text-white hover:bg-zinc-700">
            Log in
          </button>
          <button onClick={checkWhoAmI} className="rounded border border-zinc-300 px-3 py-1.5 dark:border-zinc-700">
            Who am I? (reads module cookie)
          </button>
          <button onClick={bruteForce} className="rounded bg-red-600 px-3 py-1.5 text-white hover:bg-red-700">
            Simulate brute force (7 rapid attempts)
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Open devtools → Application → Cookies to inspect{" "}
          <code>session_{mode}</code>: vulnerable is missing HttpOnly/Secure
          and never rotates on login; secure sets HttpOnly + Secure +
          SameSite=Strict and issues a brand-new id every login.
        </p>
        <ResultPanel label="Login result" value={loginResult} />
        <ResultPanel label="Who am I" value={whoAmI} />
      </div>
    </div>
  );
}
