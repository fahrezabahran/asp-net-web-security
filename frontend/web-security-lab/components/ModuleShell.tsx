import Link from "next/link";
import type { ReactNode } from "react";
import type { Mode } from "@/lib/api";

export function ModuleShell({
  title,
  mode,
  description,
  children,
}: {
  title: string;
  mode: Mode;
  description: string;
  children: ReactNode;
}) {
  const isVulnerable = mode === "vulnerable";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          &larr; All modules
        </Link>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white ${
            isVulnerable ? "bg-red-600" : "bg-emerald-600"
          }`}
        >
          {isVulnerable ? "Before · vulnerable" : "After · secure"}
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

export function ResultPanel({ label, value }: { label: string; value: unknown }) {
  if (value === undefined) return null;

  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all text-sm text-zinc-800 dark:text-zinc-200">
        {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
