"use client";

import { useState } from "react";
import { apiFetch, moduleBasePath, type Mode } from "@/lib/api";
import { ResultPanel } from "./ModuleShell";
import { AccountPanel } from "./AccountPanel";

export function CsrfDemo({ mode }: { mode: Mode }) {
  const base = moduleBasePath("csrf", mode);
  const [amount, setAmount] = useState(50);
  const [balance, setBalance] = useState<unknown>(undefined);
  const [transferResult, setTransferResult] = useState<unknown>(undefined);
  const [csrfToken, setCsrfToken] = useState<string | undefined>(undefined);

  async function fetchBalance() {
    const res = await apiFetch(`${base}/balance`);
    setBalance(res.data);
  }

  async function fetchCsrfToken() {
    const res = await apiFetch(`${base}/csrf-token`);
    setCsrfToken((res.data as { token?: string })?.token);
  }

  async function transfer() {
    const res = await apiFetch(`${base}/transfer`, {
      method: "POST",
      body: { amount },
      headers: mode === "secure" && csrfToken ? { "X-XSRF-TOKEN": csrfToken } : undefined,
    });
    setTransferResult(res.data);
  }

  // Simulates what a malicious third-party page would do: a hidden
  // auto-submitting form on another origin, using nothing but the
  // browser's ambient cookie. If it succeeds, the module is exploitable.
  function simulateCrossOriginAttack() {
    fetch(`https://localhost:7254${base}/transfer`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 999 }),
    })
      .then((r) => r.json().catch(() => r.text()))
      .then((data) => setTransferResult({ simulatedAttack: true, data }))
      .catch((err) => setTransferResult({ simulatedAttack: true, error: String(err) }));
  }

  return (
    <div className="flex flex-col gap-6">
      <AccountPanel />

      <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Account</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <button onClick={fetchBalance} className="rounded bg-zinc-800 px-3 py-1.5 text-white hover:bg-zinc-700">
            Check balance
          </button>
          {mode === "secure" && (
            <button
              onClick={fetchCsrfToken}
              className="rounded border border-zinc-300 px-3 py-1.5 dark:border-zinc-700"
            >
              Get CSRF token
            </button>
          )}
          <input
            type="number"
            className="w-28 rounded border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <button onClick={transfer} className="rounded bg-zinc-800 px-3 py-1.5 text-white hover:bg-zinc-700">
            Transfer (legitimate request)
          </button>
        </div>

        <div className="mt-4 border-t border-dashed border-zinc-300 pt-4 dark:border-zinc-700">
          <p className="text-xs text-zinc-500">
            Simulates a cross-origin attacker page silently submitting this
            same request using only the ambient auth cookie.
          </p>
          <button
            onClick={simulateCrossOriginAttack}
            className="mt-2 rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
          >
            Simulate cross-origin CSRF attack
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <ResultPanel label="Balance" value={balance} />
          <ResultPanel label="CSRF token" value={csrfToken} />
          <ResultPanel label="Transfer result" value={transferResult} />
        </div>
      </div>
    </div>
  );
}
