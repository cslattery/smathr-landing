import { Navbar } from "@/components/Navbar";
import Link from "next/link";

export default function CliPage() {
  return (
    <>
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
              <span className="text-2xl">⌘</span>
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">Smathr CLI</h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                The same tools you love — now in your terminal.
              </p>
            </div>
          </div>
          <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
            Built first for AI agents, but just as useful for humans. Fast, private, and designed for data engineering workflows.
          </p>
        </div>

        {/* Status Banner */}
        <div className="mb-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-medium text-white">
              Available now
            </span>
            <span className="text-emerald-700 dark:text-emerald-300">
              <strong>npx smathr</strong> works today. Standalone binaries for macOS, Linux, and Windows are in active preparation.
            </span>
          </div>
        </div>

        {/* Quick Start */}
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Quick Start</h2>

          <div className="space-y-4">
            <div>
              <div className="mb-1.5 text-sm font-medium text-zinc-500">Try it instantly (no install)</div>
              <pre className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-950 p-4 text-sm text-white dark:border-zinc-800">
                npx smathr --help
              </pre>
            </div>

            <div>
              <div className="mb-1.5 text-sm font-medium text-zinc-500">Install globally</div>
              <pre className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-950 p-4 text-sm text-white dark:border-zinc-800">
                npm install -g smathr
              </pre>
            </div>
          </div>
        </div>

        {/* What’s Included */}
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">What’s included</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { cmd: "validate json", desc: "Validate, repair, and format JSON with jsonrepair" },
              { cmd: "validate yaml", desc: "Validate and reformat YAML configs" },
              { cmd: "convert", desc: "Bidirectional JSON ↔ YAML conversion" },
              { cmd: "format sql", desc: "Pretty-print, minify, or one-line SQL (8 dialects)" },
              { cmd: "csv profile", desc: "Profile CSVs + generate BigQuery, dbt, and JSON schemas" },
            ].map((item) => (
              <div key={item.cmd} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <code className="font-mono text-sm text-primary-600 dark:text-primary-400">smathr {item.cmd}</code>
                <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why the CLI? */}
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Why the CLI?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Built for agents",
                desc: "Structured JSON output, reliable exit codes, and clear error details with line/column information.",
              },
              {
                title: "Private by default",
                desc: "Everything runs locally. No data is ever sent anywhere.",
              },
              {
                title: "Data engineering focused",
                desc: "dbt, BigQuery, Airflow, Snowflake — the tools and examples are built for real data work.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-3">
          <a
            href="https://github.com/smathr/smathr-cli"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            View on GitHub
          </a>
          <a
            href="https://github.com/smathr/smathr-cli/blob/main/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Full documentation & examples
          </a>
          <Link
            href="/#tools"
            className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-black dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Back to all tools
          </Link>
        </div>

        <div className="mt-16 border-t border-zinc-200 pt-8 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          The first release with standalone binaries will be announced on the GitHub releases page and here on smathr.com.
        </div>
      </div>
    </>
  );
}
