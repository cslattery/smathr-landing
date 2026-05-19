import React from "react";

export function Hero() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="mb-3 inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        Built for data engineers, by data engineers
      </div>

      <h1 className="mb-4 text-5xl font-semibold tracking-tighter md:text-6xl">
        Smart tools for<br />data workflows.
      </h1>

      <p className="mx-auto mb-8 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
        Private, instant, no-sign-up utilities. Validate, transform, and explore your data right in the browser.
      </p>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href="#tools"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary-600 px-6 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          Browse all tools
        </a>
        <a
          href="https://github.com/smathr"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          View on GitHub
        </a>
      </div>

      <div className="mt-6 text-xs text-zinc-500 dark:text-zinc-500">
        100% client-side • No data leaves your browser • Free forever
      </div>
    </div>
  );
}
