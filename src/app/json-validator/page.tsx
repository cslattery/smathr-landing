"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { jsonrepair } from "jsonrepair";
import { DataTreeView } from "@/components/DataTreeView";
import {
  Copy,
  Download,
  RotateCcw,
  Wand2,
  FileJson,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

type ValidationState =
  | { status: "valid"; repaired: boolean }
  | { status: "invalid"; error: string; line?: number; column?: number }
  | { status: "empty" };

const SAMPLE_DATA = {
  "Simple Event": JSON.stringify(
    {
      event_id: "evt_9f8a7b2c",
      timestamp: "2025-05-18T14:22:11Z",
      user_id: "u_42",
      action: "query_executed",
      properties: {
        warehouse: "prod-us-west",
        query_type: "select",
        duration_ms: 1240,
        bytes_scanned: 48291023,
      },
    },
    null,
    2
  ),

  "dbt Model Metadata": JSON.stringify(
    {
      metadata: {
        dbt_version: "1.8.0",
        project_id: "analytics",
        generated_at: "2025-05-18T09:15:00Z",
      },
      nodes: {
        "model.analytics.fct_orders": {
          name: "fct_orders",
          resource_type: "model",
          config: { materialized: "incremental" },
          depends_on: { nodes: ["model.analytics.stg_orders"] },
        },
      },
    },
    null,
    2
  ),

  "BigQuery Schema": JSON.stringify(
    [
      { name: "user_id", type: "STRING", mode: "REQUIRED" },
      { name: "event_date", type: "DATE", mode: "REQUIRED" },
      {
        name: "attributes",
        type: "RECORD",
        mode: "REPEATED",
        fields: [
          { name: "key", type: "STRING" },
          { name: "value", type: "STRING" },
        ],
      },
    ],
    null,
    2
  ),

  "Airflow Task Log": JSON.stringify(
    {
      task_id: "load_snowflake",
      dag_id: "daily_warehouse",
      state: "failed",
      start_date: "2025-05-17T23:45:00Z",
      end_date: "2025-05-18T00:12:41Z",
      duration: 1651,
      try_number: 3,
      error: "Snowflake connector error: 390114 (02000): Authentication token has expired",
    },
    null,
    2
  ),
};

export default function JsonValidatorPage() {
  const [input, setInput] = useState("");
  const [formatted, setFormatted] = useState("");
  const [validation, setValidation] = useState<ValidationState>({ status: "empty" });
  const [indent, setIndent] = useState<2 | 4>(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [activeView, setActiveView] = useState<"pretty" | "tree" | "raw">("pretty");

  // Create a safe replacer for sorted keys
  const getReplacer = useCallback(() => {
    if (!sortKeys) return undefined;
    return (key: string, value: any) => {
      if (key === "" || value === null || typeof value !== "object") return value;
      if (Array.isArray(value)) return value.map((v) => sortObjectKeys(v));
      return sortObjectKeys(value);
    };
  }, [sortKeys]);

  // Debounced validation
  const validateInput = useCallback((raw: string) => {
    if (!raw.trim()) {
      setValidation({ status: "empty" });
      setFormatted("");
      return;
    }

    const replacer = getReplacer();

    // Try native first
    try {
      const parsed = JSON.parse(raw);
      const output = JSON.stringify(parsed, replacer, indent);
      setFormatted(output);
      setValidation({ status: "valid", repaired: false });
      return;
    } catch (nativeErr: any) {
      // Attempt repair
      try {
        const repaired = jsonrepair(raw);
        const parsed = JSON.parse(repaired);
        const output = JSON.stringify(parsed, replacer, indent);
        setFormatted(output);
        setValidation({ status: "valid", repaired: true });
        return;
      } catch (repairErr: any) {
        // Both failed — show best error we can
        const errorInfo = extractLineColumn(nativeErr.message, raw);
        setValidation({
          status: "invalid",
          error: nativeErr.message,
          line: errorInfo.line,
          column: errorInfo.column,
        });
        setFormatted("");
      }
    }
  }, [indent, sortKeys, getReplacer]);

  // Run validation on input change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => validateInput(input), 120);
    return () => clearTimeout(timer);
  }, [input, validateInput]);

  // Re-validate when indent or sortKeys change
  useEffect(() => {
    if (validation.status === "valid" || validation.status === "invalid") {
      validateInput(input);
    }
  }, [indent, sortKeys]);

  function extractLineColumn(message: string, text: string) {
    // Common patterns from V8 / browsers
    const match = message.match(/at position (\d+)/i) || message.match(/line (\d+) column (\d+)/i);
    if (match) {
      if (match[2]) return { line: parseInt(match[1]), column: parseInt(match[2]) };
      // position-based
      const pos = parseInt(match[1]);
      const lines = text.slice(0, pos).split("\n");
      return { line: lines.length, column: lines[lines.length - 1].length + 1 };
    }
    return {};
  }

  function sortObjectKeys(obj: any): any {
    if (Array.isArray(obj)) return obj.map(sortObjectKeys);
    if (obj && typeof obj === "object") {
      return Object.keys(obj)
        .sort()
        .reduce((acc: any, key) => {
          acc[key] = sortObjectKeys(obj[key]);
          return acc;
        }, {});
    }
    return obj;
  }

  // === Actions ===

  const loadSample = (key: keyof typeof SAMPLE_DATA) => {
    const sample = SAMPLE_DATA[key];
    setInput(sample);
    setActiveView("pretty");
  };

  const formatJson = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(jsonrepair(input));
      const replacer = getReplacer();
      const pretty = JSON.stringify(parsed, replacer, indent);
      setInput(pretty);
    } catch {
      // ignore — validation will catch it
    }
  };

  const minifyJson = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(jsonrepair(input));
      const minified = JSON.stringify(parsed);
      setInput(minified);
    } catch {}
  };

  const repairJson = () => {
    if (!input.trim()) return;
    try {
      const repaired = jsonrepair(input);
      setInput(repaired);
    } catch (e: any) {
      alert("Could not repair this input: " + e.message);
    }
  };

  const clearAll = () => {
    setInput("");
    setFormatted("");
    setValidation({ status: "empty" });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast here later
    } catch {
      alert("Failed to copy. Please select and copy manually.");
    }
  };

  const downloadJson = () => {
    if (!formatted) return;
    const blob = new Blob([formatted], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      formatJson();
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      clearAll();
    }
  };

  const statusIcon =
    validation.status === "valid" ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    ) : validation.status === "invalid" ? (
      <XCircle className="h-4 w-4 text-red-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-amber-500" />
    );

  return (
    <>
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Tool Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
                <FileJson className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">JSON Validator</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Validate, format, repair, and explore JSON — 100% in your browser.
                </p>
              </div>
            </div>
          </div>
          <a
            href="/#tools"
            className="text-sm text-primary-600 hover:underline dark:text-primary-400"
          >
            ← Back to all tools
          </a>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-1.5 pr-3">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">SAMPLES</span>
            <div className="flex gap-1.5">
              {Object.keys(SAMPLE_DATA).map((key) => (
                <button
                  key={key}
                  onClick={() => loadSample(key as keyof typeof SAMPLE_DATA)}
                  className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

          <button onClick={formatJson} className="tool-btn" title="Pretty print (⌘S)">
            <Wand2 className="h-4 w-4" /> Format
          </button>
          <button onClick={minifyJson} className="tool-btn">
            Minify
          </button>
          <button onClick={repairJson} className="tool-btn" title="Fix common JSON mistakes">
            <RotateCcw className="h-4 w-4" /> Repair
          </button>
          <button onClick={clearAll} className="tool-btn text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" title="Clear (⌘K)">
            Clear
          </button>

          <div className="ml-auto flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5">
              Indent:
              <select
                value={indent}
                onChange={(e) => setIndent(Number(e.target.value) as 2 | 4)}
                className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
              </select>
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={sortKeys}
                onChange={(e) => setSortKeys(e.target.checked)}
                className="accent-primary-600"
              />
              Sort keys
            </label>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* INPUT PANE */}
          <div className="flex flex-col rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-sm font-medium">
                Input
                <div className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-900">
                  {statusIcon}
                  <span className="font-mono text-[10px] uppercase tracking-widest">
                    {validation.status === "valid" && (validation.repaired ? "Repaired" : "Valid")}
                    {validation.status === "invalid" && "Invalid"}
                    {validation.status === "empty" && "Empty"}
                  </span>
                </div>
              </div>
              <div className="text-xs text-zinc-500">
                {input.length.toLocaleString()} chars
              </div>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              placeholder={`Paste or type JSON here...\n\nTip: Use Repair for messy data from logs, Mongo, etc.`}
              className="min-h-[420px] flex-1 resize-y border-0 bg-transparent p-4 font-mono text-sm leading-relaxed focus:outline-none dark:placeholder:text-zinc-600"
            />

            {/* Error / Status bar */}
            <div className="min-h-[42px] border-t border-zinc-200 px-4 py-2 text-sm dark:border-zinc-800">
              {validation.status === "valid" && validation.repaired && (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Input had issues but was automatically repaired for preview.</span>
                </div>
              )}
              {validation.status === "invalid" && (
                <div className="text-red-600 dark:text-red-400">
                  <div className="font-medium">Invalid JSON</div>
                  <div className="font-mono text-xs opacity-90">
                    {validation.error}
                    {validation.line && ` (line ${validation.line}${validation.column ? `, col ${validation.column}` : ""})`}
                  </div>
                </div>
              )}
              {validation.status === "empty" && (
                <span className="text-zinc-500 dark:text-zinc-400">Start typing or load a sample above.</span>
              )}
            </div>
          </div>

          {/* OUTPUT PANE */}
          <div className="flex flex-col rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
              <div className="flex items-center gap-1 text-sm font-medium">
                Output
                <div className="ml-2 flex rounded-full bg-zinc-100 p-0.5 text-xs dark:bg-zinc-900">
                  {(["pretty", "tree", "raw"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setActiveView(v)}
                      className={`rounded-full px-3 py-0.5 capitalize transition ${activeView === v ? "bg-white shadow dark:bg-zinc-800" : "hover:bg-zinc-200 dark:hover:bg-zinc-800"}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(formatted || input)}
                  disabled={!formatted && !input}
                  className="tool-btn-sm"
                  title="Copy to clipboard"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
                <button
                  onClick={downloadJson}
                  disabled={!formatted}
                  className="tool-btn-sm"
                  title="Download .json file"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              </div>
            </div>

            {/* Output content */}
            <div className="min-h-[420px] flex-1 overflow-auto p-4 font-mono text-sm">
              {activeView === "pretty" && (
                <pre className="whitespace-pre-wrap break-words text-zinc-800 dark:text-zinc-200">
                  {formatted || <span className="text-zinc-400">Formatted JSON will appear here…</span>}
                </pre>
              )}

              {activeView === "raw" && (
                <pre className="whitespace-pre text-zinc-800 dark:text-zinc-200">
                  {formatted ? JSON.stringify(JSON.parse(formatted)) : "Minified output appears here…"}
                </pre>
              )}

              {activeView === "tree" && formatted && (
                (() => {
                  try {
                    return <DataTreeView data={JSON.parse(formatted)} />;
                  } catch {
                    return <div className="text-xs text-red-500">Could not render tree (invalid JSON).</div>;
                  }
                })()
              )}
              {activeView === "tree" && !formatted && (
                <div className="text-sm text-zinc-500">Valid JSON will render an interactive tree here.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer help */}
        <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          All processing happens locally in your browser. No data is sent anywhere. &nbsp;•&nbsp; ⌘S to format &nbsp;•&nbsp; ⌘K to clear
        </div>
      </div>
    </>
  );
}

// Small button styles (we can move to globals later)
const btnBase = `
  inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium
  hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800
`.trim();
