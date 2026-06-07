import React from "react";
import { Shield, Zap, Wrench } from "lucide-react";

export function Hero() {
  return (
    <div className="hero-surface relative overflow-hidden rounded-3xl px-6 py-16 md:px-12 md:py-20">
      <div className="relative mx-auto max-w-3xl text-center">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center rounded-full border border-zinc-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-zinc-600 backdrop-blur dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:text-zinc-400">
            Built for data engineers
          </div>
          <a
            href="/cli"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary-200/80 bg-primary-50/90 px-3 py-1 text-xs font-medium text-primary-700 transition hover:bg-primary-100 dark:border-primary-900/80 dark:bg-primary-950/80 dark:text-primary-300 dark:hover:bg-primary-900"
          >
            CLI available — <span className="font-mono">npx smathr</span>
          </a>
        </div>

        <h1 className="mb-5 text-5xl font-semibold tracking-tighter text-zinc-900 dark:text-white md:text-6xl">
          Smart tools for
          <br />
          <span className="text-primary-600 dark:text-primary-500">data workflows</span>
        </h1>

        <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Private, instant utilities that run entirely in your browser. Validate, transform, and explore — no sign-up required.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/#tools"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
          >
            Browse all tools
          </a>
          <a
            href="/cli"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-300 bg-white/80 px-5 text-sm font-medium text-zinc-700 backdrop-blur transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Try the CLI
          </a>
        </div>

        <div className="mt-10 grid gap-3 text-left sm:grid-cols-3">
          {[
            { icon: Shield, label: "Private", desc: "Nothing leaves your browser" },
            { icon: Zap, label: "Instant", desc: "No backend, no waiting" },
            { icon: Wrench, label: "Practical", desc: "Built for real pipeline work" },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-start gap-3 rounded-xl border border-zinc-200/70 bg-white/60 p-3 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/50"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}