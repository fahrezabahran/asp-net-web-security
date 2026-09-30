"use client";

import { useState } from "react";
import { apiFetch, moduleBasePath, type Mode } from "@/lib/api";
import { ResultPanel } from "./ModuleShell";
import { AccountPanel } from "./AccountPanel";

export function IdorDemo({ mode }: { mode: Mode }) {
  const base = moduleBasePath("idor", mode);
  const [title, setTitle] = useState("My private note");
  const [content, setContent] = useState("Something only I should read.");
  const [createResult, setCreateResult] = useState<unknown>(undefined);
  const [mine, setMine] = useState<unknown>(undefined);
  const [lookupId, setLookupId] = useState(1);
  const [lookupResult, setLookupResult] = useState<unknown>(undefined);

  async function createDocument() {
    const res = await apiFetch(`${base}/documents`, {
      method: "POST",
      body: { title, content },
    });
    setCreateResult(res.data);
  }

  async function loadMine() {
    const res = await apiFetch(`${base}/documents/mine`);
    setMine(res.data);
  }

  async function lookup(id: number) {
    const res = await apiFetch(`${base}/documents/${id}`);
    setLookupResult({ status: res.status, data: res.data });
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs text-zinc-500">
        Register/log in as two different accounts (in two browser
        tabs/profiles) to see the effect clearly: create a document as user
        A, then, logged in as user B, try to fetch it by id below.
      </p>
      <AccountPanel />

      <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Create a document (owned by the current user)
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <input
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
          />
        </div>
        <div className="mt-3 flex gap-2 text-sm">
          <button onClick={createDocument} className="rounded bg-zinc-800 px-3 py-1.5 text-white hover:bg-zinc-700">
            Create
          </button>
          <button onClick={loadMine} className="rounded border border-zinc-300 px-3 py-1.5 dark:border-zinc-700">
            List my documents
          </button>
        </div>
        <ResultPanel label="Create result" value={createResult} />
        <ResultPanel label="My documents" value={mine} />
      </div>

      <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Fetch a document by id (try ids belonging to other users)
        </p>
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            className="w-28 rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={lookupId}
            onChange={(e) => setLookupId(Number(e.target.value))}
          />
          <button
            onClick={() => lookup(lookupId)}
            className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
          >
            Fetch document #{lookupId}
          </button>
        </div>
        <ResultPanel label="Lookup result" value={lookupResult} />
      </div>
    </div>
  );
}
