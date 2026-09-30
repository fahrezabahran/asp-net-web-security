"use client";

import { useState } from "react";
import { apiFetch, moduleBasePath, type Mode } from "@/lib/api";
import { ResultPanel } from "./ModuleShell";

const ATTACK_PAYLOAD = "' OR '1'='1";

export function SqlInjectionDemo({ mode }: { mode: Mode }) {
  const base = moduleBasePath("sql-injection", mode);
  const [term, setTerm] = useState("Desk");
  const [result, setResult] = useState<unknown>(undefined);

  async function search(value: string) {
    const res = await apiFetch(`${base}/search?term=${encodeURIComponent(value)}`);
    setResult(res.data);
  }

  return (
    <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
        Product search
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          className="flex-1 rounded border border-zinc-300 px-3 py-1.5 text-sm font-mono dark:border-zinc-700 dark:bg-zinc-900"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <button
          onClick={() => search(term)}
          className="rounded bg-zinc-800 px-3 py-1.5 text-sm text-white hover:bg-zinc-700"
        >
          Search
        </button>
        <button
          onClick={() => {
            setTerm(ATTACK_PAYLOAD);
            search(ATTACK_PAYLOAD);
          }}
          className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
        >
          Try attack payload
        </button>
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        Attack payload: <code className="font-mono">{ATTACK_PAYLOAD}</code> —
        on the vulnerable endpoint this returns every product regardless of
        the search term; on the secure endpoint it is treated as a literal
        string and returns nothing.
      </p>
      <ResultPanel label="Response" value={result} />
    </div>
  );
}
