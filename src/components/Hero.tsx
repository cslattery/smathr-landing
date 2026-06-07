import React from "react";

export function Hero() {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Smart tools for{" "}
          <span className="text-primary-600 dark:text-primary-500">data workflows</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Private, instant utilities — 100% in your browser, no sign-up.
        </p>
      </div>
      <a
        href="/cli"
        className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 transition hover:bg-primary-100 dark:border-primary-900 dark:bg-primary-950 dark:text-primary-300 dark:hover:bg-primary-900"
      >
        CLI · <span className="font-mono">npx smathr</span>
      </a>
    </div>
  );
}