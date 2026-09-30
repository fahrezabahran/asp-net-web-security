import Link from "next/link";
import { modules } from "@/lib/modules";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Web Security Lab
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Each module ships a <strong>Before</strong> (vulnerable) and{" "}
            <strong>After</strong> (secure) implementation of the same
            feature, so you can try an attack and see exactly which fix
            defeats it.
          </p>
        </div>

        <ul className="flex flex-col gap-4">
          {modules.map((mod) => (
            <li
              key={mod.slug}
              className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800"
            >
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                {mod.title}
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {mod.summary}
              </p>
              <div className="mt-3 flex gap-3 text-sm font-medium">
                <Link
                  href={`/${mod.slug}/before`}
                  className="rounded-full bg-red-600 px-4 py-1.5 text-white hover:bg-red-700"
                >
                  Before (vulnerable)
                </Link>
                <Link
                  href={`/${mod.slug}/after`}
                  className="rounded-full bg-emerald-600 px-4 py-1.5 text-white hover:bg-emerald-700"
                >
                  After (secure)
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
