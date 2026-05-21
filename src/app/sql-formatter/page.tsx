"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { formatDialect } from "sql-formatter";
import * as dialects from "sql-formatter";
import {
  Copy,
  RotateCcw,
  Play,
  Settings,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type DialectKey = keyof typeof dialects;

const DIALECT_OPTIONS: { label: string; value: DialectKey }[] = [
  { label: "BigQuery", value: "bigquery" },
  { label: "PostgreSQL", value: "postgresql" },
  { label: "Snowflake", value: "snowflake" },
  { label: "Spark SQL", value: "spark" },
  { label: "Trino / Presto", value: "trino" },
  { label: "Redshift", value: "redshift" },
  { label: "MySQL", value: "mysql" },
  { label: "SQLite", value: "sqlite" },
];

const CASE_OPTIONS = [
  { label: "Upper", value: "upper" as const },
  { label: "Lower", value: "lower" as const },
  { label: "Preserve", value: "preserve" as const },
];

const INDENT_STYLES = [
  { label: "Standard", value: "standard" as const },
  { label: "Tabular Left", value: "tabularLeft" as const },
  { label: "Tabular Right", value: "tabularRight" as const },
];

const LOGICAL_NEWLINE_OPTIONS = [
  { label: "Before (AND / OR on new line)", value: "before" as const },
  { label: "After", value: "after" as const },
];

const SAMPLE_QUERIES: Record<string, string> = {
  "dbt Model (BigQuery)": `with source as (
  select * from {{ source('raw', 'orders') }}
),

renamed as (
  select
    id,
    user_id,
    order_date,
    status,
    amount,
    created_at
  from source
)

select * from renamed`,

  "Complex BigQuery Query": `select
  date_trunc(order_date, month) as month,
  customer_id,
  count(*) as order_count,
  sum(total_amount) as revenue
from ` + "`project.dataset.orders`" + `
where order_date >= date_sub(current_date(), interval 12 month)
  and status in ('completed', 'shipped')
group by 1, 2
having count(*) > 5
order by revenue desc
limit 100`,

  "Window Functions (Postgres)": `select
  id,
  user_id,
  amount,
  created_at,
  sum(amount) over (partition by user_id order by created_at) as running_total,
  row_number() over (partition by user_id order by amount desc) as rank_in_user
from orders
where created_at >= now() - interval '90 days'`,

  "MERGE Statement (BigQuery)": `merge into ` + "`analytics.fct_orders`" + ` as target
using (
  select * from ` + "`staging.stg_orders`" + `
) as source
on target.order_id = source.order_id
when matched then
  update set
    status = source.status,
    updated_at = current_timestamp()
when not matched then
  insert (order_id, user_id, amount, status, created_at)
  values (source.order_id, source.user_id, source.amount, source.status, source.created_at)`,
};

interface FormatterOptions {
  dialect: DialectKey;
  keywordCase: "upper" | "lower" | "preserve";
  identifierCase: "upper" | "lower" | "preserve";
  tabWidth: number;
  indentStyle: "standard" | "tabularLeft" | "tabularRight";
  logicalOperatorNewline: "before" | "after";
  linesBetweenQueries: number;
}

const DEFAULT_OPTIONS: FormatterOptions = {
  dialect: "bigquery",
  keywordCase: "upper",
  identifierCase: "preserve",
  tabWidth: 2,
  indentStyle: "standard",
  logicalOperatorNewline: "before",
  linesBetweenQueries: 2,
};

export default function SqlFormatterPage() {
  const [input, setInput] = useState("");
  const [formatted, setFormatted] = useState("");
  const [minified, setMinified] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<FormatterOptions>(DEFAULT_OPTIONS);
  const [showSettings, setShowSettings] = useState(true);
  const [view, setView] = useState<"pretty" | "minified" | "oneline">("pretty");
  const [oneLine, setOneLine] = useState("");

  const formatSql = useCallback((sql: string, opts: FormatterOptions) => {
    if (!sql.trim()) {
      setFormatted("");
      setMinified("");
      setOneLine("");
      setError(null);
      setView("pretty");
      return;
    }

    try {
      const dialect = (dialects as any)[opts.dialect];
      if (!dialect) throw new Error("Unknown dialect");

      const pretty = formatDialect(sql, {
        dialect,
        keywordCase: opts.keywordCase,
        identifierCase: opts.identifierCase,
        tabWidth: opts.tabWidth,
        indentStyle: opts.indentStyle,
        logicalOperatorNewline: opts.logicalOperatorNewline,
        linesBetweenQueries: opts.linesBetweenQueries,
      });

      const compact = formatDialect(sql, {
        dialect,
        keywordCase: opts.keywordCase,
        identifierCase: opts.identifierCase,
        linesBetweenQueries: 0,
        denseOperators: true,
        indentStyle: "standard",
        tabWidth: 0,
        logicalOperatorNewline: "after",
        expressionWidth: 200,
        newlineBeforeSemicolon: false,
      });

      // True one-line version
      const rawOneLine = formatDialect(sql, {
        dialect,
        keywordCase: opts.keywordCase,
        identifierCase: opts.identifierCase,
        linesBetweenQueries: 0,
        denseOperators: true,
        indentStyle: "standard",
        tabWidth: 0,
        logicalOperatorNewline: "after",
        expressionWidth: 9999,
        newlineBeforeSemicolon: false,
      });
      const oneLineVersion = rawOneLine.replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim();

      setFormatted(pretty);
      setMinified(compact.trim());
      setOneLine(oneLineVersion);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to format SQL");
      setFormatted("");
      setMinified("");
    }
  }, []);

  // Debounced formatting
  useEffect(() => {
    const timer = setTimeout(() => {
      formatSql(input, options);
    }, 180);
    return () => clearTimeout(timer);
  }, [input, options, formatSql]);

  const loadSample = (key: string) => {
    const sample = SAMPLE_QUERIES[key];
    if (sample) {
      setInput(sample);
    }
  };

  const updateOption = <K extends keyof FormatterOptions>(
    key: K,
    value: FormatterOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const resetOptions = () => {
    setOptions(DEFAULT_OPTIONS);
  };

  const copyFormatted = async () => {
    let textToCopy = "";
    if (view === "pretty") textToCopy = formatted;
    else if (view === "minified") textToCopy = minified;
    else if (view === "oneline") textToCopy = oneLine;

    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
    }
  };

  const clearAll = () => {
    setInput("");
    setFormatted("");
    setMinified("");
    setOneLine("");
    setError(null);
    setView("pretty");
  };

  return (
    <>
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
                <DatabaseIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">SQL Formatter</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Pretty-print SQL with dbt, BigQuery, and PostgreSQL friendly options — all client-side.
                </p>
              </div>
            </div>
          </div>
          <a href="/#tools" className="text-sm text-primary-600 hover:underline dark:text-primary-400">
            ← Back to all tools
          </a>
        </div>

        {/* Toolbar */}
        <div className="mb-4 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-wrap items-center gap-3">
            {/* Samples */}
            <div>
              <div className="mb-1 text-xs font-medium text-zinc-500">SAMPLES</div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(SAMPLE_QUERIES).map((key) => (
                  <button key={key} onClick={() => loadSample(key)} className="tool-btn text-xs">
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="tool-btn"
            >
              <Settings className="h-4 w-4" /> {showSettings ? "Hide" : "Show"} Settings
            </button>

            <button onClick={resetOptions} className="tool-btn text-sm">
              Reset to defaults
            </button>

            <div className="flex-1" />

            <button onClick={clearAll} className="tool-btn text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
              <RotateCcw className="h-4 w-4" /> Clear
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Dialect */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Dialect</label>
                <select
                  value={options.dialect}
                  onChange={(e) => updateOption("dialect", e.target.value as DialectKey)}
                  className="w-full rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  {DIALECT_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              {/* Keyword Case */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Keywords</label>
                <select
                  value={options.keywordCase}
                  onChange={(e) => updateOption("keywordCase", e.target.value as any)}
                  className="w-full rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  {CASE_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Identifier Case */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Identifiers / Columns</label>
                <select
                  value={options.identifierCase}
                  onChange={(e) => updateOption("identifierCase", e.target.value as any)}
                  className="w-full rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  {CASE_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Tab Width */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Indent Size</label>
                <div className="flex rounded border border-zinc-200 dark:border-zinc-700">
                  {[2, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => updateOption("tabWidth", n)}
                      className={`flex-1 px-3 py-1.5 text-sm transition ${
                        options.tabWidth === n
                          ? "bg-primary-600 text-white"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {n} spaces
                    </button>
                  ))}
                </div>
              </div>

              {/* Indent Style */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Indent Style</label>
                <select
                  value={options.indentStyle}
                  onChange={(e) => updateOption("indentStyle", e.target.value as any)}
                  className="w-full rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  {INDENT_STYLES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Logical Operator Newline */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">AND / OR Placement</label>
                <select
                  value={options.logicalOperatorNewline}
                  onChange={(e) => updateOption("logicalOperatorNewline", e.target.value as any)}
                  className="w-full rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  {LOGICAL_NEWLINE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Lines Between Queries */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Blank Lines Between Queries</label>
                <div className="flex rounded border border-zinc-200 dark:border-zinc-700">
                  {[1, 2].map((n) => (
                    <button
                      key={n}
                      onClick={() => updateOption("linesBetweenQueries", n)}
                      className={`flex-1 px-3 py-1.5 text-sm transition ${
                        options.linesBetweenQueries === n
                          ? "bg-primary-600 text-white"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Editor Area */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Input */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold">Input SQL</span>
              <span className="text-xs text-zinc-500">{input.length} characters</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your SQL query here..."
              spellCheck={false}
              className="h-[520px] w-full resize-y rounded-xl border border-zinc-200 bg-white p-4 font-mono text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          {/* Output */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-semibold">
                  {view === "pretty" && "Formatted SQL"}
                  {view === "minified" && "Minified SQL"}
                  {view === "oneline" && "One Line SQL"}
                </span>

                {/* View Toggle */}
                <div className="flex rounded border border-zinc-200 text-xs dark:border-zinc-700">
                  <button
                    onClick={() => setView("pretty")}
                    className={`px-2.5 py-0.5 transition ${
                      view === "pretty"
                        ? "bg-primary-600 text-white"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    Pretty
                  </button>
                  <button
                    onClick={() => setView("minified")}
                    disabled={!minified}
                    className={`px-2.5 py-0.5 transition ${
                      view === "minified"
                        ? "bg-primary-600 text-white"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                    }`}
                  >
                    Minified
                  </button>
                  <button
                    onClick={() => setView("oneline")}
                    disabled={!oneLine}
                    className={`px-2.5 py-0.5 transition ${
                      view === "oneline"
                        ? "bg-primary-600 text-white"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                    }`}
                  >
                    One Line
                  </button>
                </div>

                {error ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : formatted ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : null}
              </div>

              <button
                onClick={copyFormatted}
                disabled={
                  (view === "pretty" && !formatted) ||
                  (view === "minified" && !minified) ||
                  (view === "oneline" && !oneLine)
                }
                className="tool-btn-sm disabled:opacity-50"
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
            </div>

            <div className="relative">
              <textarea
                value={
                  error
                    ? `-- Error: ${error}`
                    : view === "pretty"
                    ? formatted
                    : view === "minified"
                    ? minified
                    : oneLine
                }
                readOnly
                className={`h-[520px] w-full resize-y rounded-xl border p-4 font-mono text-sm ${
                  error
                    ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                }`}
              />
              {!formatted && !error && (
                <div className="absolute left-4 top-4 text-sm text-zinc-400 pointer-events-none">
                  Formatted output will appear here...
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
          All formatting happens in your browser using the excellent{" "}
          <a href="https://github.com/sql-formatter-org/sql-formatter" target="_blank" className="underline hover:text-primary-600">
            sql-formatter
          </a>{" "}
          library. No data is sent anywhere.
        </p>
      </div>
    </>
  );
}

// Simple Database icon since we don't want to import extra
function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14a9 3 0 0 0 18 0V5" />
      <path d="M3 12a9 3 0 0 0 18 0" />
    </svg>
  );
}
