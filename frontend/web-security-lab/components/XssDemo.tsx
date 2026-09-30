"use client";

import { useState } from "react";
import { API_BASE_URL, apiFetch, moduleBasePath, type Mode } from "@/lib/api";
import { ResultPanel } from "./ModuleShell";

export function XssDemo({ mode }: { mode: Mode }) {
  const base = moduleBasePath("xss", mode);
  const [author, setAuthor] = useState("attacker");
  const [body, setBody] = useState(
    "<script>alert('XSS: cookie=' + document.cookie)</script>"
  );
  const [search, setSearch] = useState("<img src=x onerror=alert('reflected XSS')>");
  const [postResult, setPostResult] = useState<unknown>(undefined);
  const renderUrl = `${API_BASE_URL}${base}/comments/render`;
  const searchUrl = `${API_BASE_URL}${base}/search?q=${encodeURIComponent(search)}`;

  async function post() {
    const res = await apiFetch(`${base}/comments`, {
      method: "POST",
      body: { authorName: author, body },
    });
    setPostResult(res.data);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Stored XSS: post a comment
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <input
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="author name"
          />
          <textarea
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm font-mono dark:border-zinc-700 dark:bg-zinc-900"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
          />
        </div>
        <button onClick={post} className="mt-3 rounded bg-zinc-800 px-3 py-1.5 text-sm text-white hover:bg-zinc-700">
          Post comment
        </button>
        <ResultPanel label="Post response" value={postResult} />

        <p className="mt-4 text-xs text-zinc-500">
          Rendered comments (open in a new tab — this is server-rendered raw
          HTML, exactly like a real page would show it):
        </p>
        <a
          href={renderUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-block break-all text-sm text-blue-600 underline"
        >
          {renderUrl}
        </a>
        <iframe
          src={renderUrl}
          className="mt-3 h-40 w-full rounded border border-zinc-300 dark:border-zinc-700"
          sandbox={mode === "vulnerable" ? "allow-scripts" : undefined}
        />
      </div>

      <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Reflected XSS: search
        </p>
        <input
          className="mt-3 w-full rounded border border-zinc-300 px-3 py-1.5 text-sm font-mono dark:border-zinc-700 dark:bg-zinc-900"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <a
          href={searchUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block break-all text-sm text-blue-600 underline"
        >
          {searchUrl}
        </a>
      </div>
    </div>
  );
}
