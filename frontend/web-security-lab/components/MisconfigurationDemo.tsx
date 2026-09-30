"use client";

import { useState } from "react";
import { apiFetch, moduleBasePath, type Mode } from "@/lib/api";
import { ResultPanel } from "./ModuleShell";

export function MisconfigurationDemo({ mode }: { mode: Mode }) {
  const base = moduleBasePath("misconfiguration", mode);
  const [crashResult, setCrashResult] = useState<unknown>(undefined);
  const [infoResult, setInfoResult] = useState<unknown>(undefined);
  const [headers, setHeaders] = useState<unknown>(undefined);

  async function crash() {
    const res = await apiFetch(`${base}/crash`);
    setCrashResult(res.data);
  }

  async function info() {
    const res = await apiFetch(`${base}/info`);
    setInfoResult(res.data);
    setHeaders(Object.fromEntries(res.headers.entries()));
  }

  return (
    <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex gap-2 text-sm">
        <button onClick={crash} className="rounded bg-red-600 px-3 py-1.5 text-white hover:bg-red-700">
          Trigger server error
        </button>
        <button onClick={info} className="rounded bg-zinc-800 px-3 py-1.5 text-white hover:bg-zinc-700">
          Fetch /info
        </button>
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        Vulnerable /crash leaks the exception message, stack trace and
        environment name; vulnerable /info leaks the connection string and
        runtime details. Compare the response headers on /info too — the
        secure version adds X-Content-Type-Options, X-Frame-Options,
        Referrer-Policy and Strict-Transport-Security.
      </p>
      <ResultPanel label="Crash response" value={crashResult} />
      <ResultPanel label="Info response" value={infoResult} />
      <ResultPanel label="Response headers" value={headers} />
    </div>
  );
}
