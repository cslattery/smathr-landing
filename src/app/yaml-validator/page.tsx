"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { DataTreeView } from "@/components/DataTreeView";
import * as yaml from "js-yaml";
import {
  Copy,
  Download,
  RotateCcw,
  Wand2,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

type ValidationState =
  | { status: "valid" }
  | { status: "invalid"; error: string; line?: number; column?: number }
  | { status: "empty" };

const SAMPLE_DATA: Record<string, string> = {
  "Kubernetes Deployment": `apiVersion: apps/v1
kind: Deployment
metadata:
  name: data-pipeline
  namespace: analytics
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pipeline-worker
  template:
    metadata:
      labels:
        app: pipeline-worker
    spec:
      containers:
        - name: worker
          image: ghcr.io/smathr/pipeline-worker:v1.4.2
          env:
            - name: WAREHOUSE
              value: prod-us-west
`,

  "GitHub Actions Workflow": `name: Daily Data Refresh

on:
  schedule:
    - cron: "0 4 * * *"
  workflow_dispatch:

jobs:
  dbt-run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run dbt
        run: |
          dbt run --target prod
          dbt test --target prod
`,

  "dbt profiles.yml": `analytics:
  target: prod
  outputs:
    prod:
      type: snowflake
      account: company.us-east-1
      user: dbt_user
      role: TRANSFORMER
      database: ANALYTICS
      warehouse: COMPUTE_WH
      schema: dbt_prod
      threads: 4
      client_session_keep_alive: true
`,

  "Docker Compose (Airflow)": `version: "3.8"
services:
  webserver:
    image: apache/airflow:2.9.2
    environment:
      - AIRFLOW__CORE__EXECUTOR=LocalExecutor
      - AIRFLOW__DATABASE__SQL_ALCHEMY_CONN=postgresql+psycopg2://airflow:airflow@postgres/airflow
    volumes:
      - ./dags:/opt/airflow/dags
    ports:
      - "8080:8080"
    depends_on:
      - postgres
`,

  "Simple Config": `project:
  name: smathr-data-platform
  version: 2.1.0
  owners:
    - name: data-platform
      email: data-eng@smathr.com
  settings:
    retries: 3
    timeout_seconds: 300
    enable_monitoring: true
`,
};

export default function YamlValidatorPage() {
  const [input, setInput] = useState("");
  const [formatted, setFormatted] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);
  const [validation, setValidation] = useState<ValidationState>({ status: "empty" });
  const [indent, setIndent] = useState<2 | 4>(2);
  const [activeView, setActiveView] = useState<"pretty" | "tree" | "raw">("pretty");

  // Debounced validation + formatting
  const validateAndFormat = useCallback((raw: string) => {
    if (!raw.trim()) {
      setValidation({ status: "empty" });
      setFormatted("");
      setParsedData(null);
      return;
    }

    try {
      const parsed = yaml.load(raw);
      const output = yaml.dump(parsed, {
        indent,
        lineWidth: 120,
        noRefs: true,
        sortKeys: false,
      });

      setFormatted(output);
      setParsedData(parsed);
      setValidation({ status: "valid" });
    } catch (err: any) {
      setFormatted("");
      setParsedData(null);

      // Try to extract line information from js-yaml errors
      const match = err.message?.match(/at line (\d+), column (\d+)/i);
      setValidation({
        status: "invalid",
        error: err.message || "Invalid YAML",
        line: match ? parseInt(match[1]) : undefined,
        column: match ? parseInt(match[2]) : undefined,
      });
    }
  }, [indent]);

  useEffect(() => {
    const timer = setTimeout(() => validateAndFormat(input), 150);
    return () => clearTimeout(timer);
  }, [input, validateAndFormat]);

  // Re-format when indent changes
  useEffect(() => {
    if (validation.status === "valid" && parsedData) {
      const output = yaml.dump(parsedData, { indent, lineWidth: 120, noRefs: true });
      setFormatted(output);
    }
  }, [indent, parsedData, validation.status]);

  // === Actions ===

  const loadSample = (key: string) => {
    const sample = SAMPLE_DATA[key];
    if (sample) {
      setInput(sample);
      setActiveView("pretty");
    }
  };

  const formatYaml = () => {
    if (!input.trim() || !parsedData) return;
    const pretty = yaml.dump(parsedData, {
      indent,
      lineWidth: 120,
      noRefs: true,
    });
    setInput(pretty);
  };

  const minifyYaml = () => {
    if (!input.trim() || !parsedData) return;
    const compact = yaml.dump(parsedData, {
      indent: 1,
      lineWidth: -1,
      noRefs: true,
    });
    setInput(compact);
  };

  const clearAll = () => {
    setInput("");
    setFormatted("");
    setParsedData(null);
    setValidation({ status: "empty" });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      alert("Copy failed. Please select the text manually.");
    }
  };

  const downloadYaml = () => {
    if (!formatted) return;
    const blob = new Blob([formatted], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "config.yaml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      formatYaml();
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
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">YAML Validator</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Validate, format, and explore YAML configuration files — all in your browser.
                </p>
              </div>
            </div>
          </div>
          <a href="/#tools" className="text-sm text-primary-600 hover:underline dark:text-primary-400">
            ← Back to all tools
          </a>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-1.5 pr-3">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">SAMPLES</span>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(SAMPLE_DATA).map((key) => (
                <button
                  key={key}
                  onClick={() => loadSample(key)}
                  className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

          <button onClick={formatYaml} className="tool-btn" title="Format YAML (⌘S)">
            <Wand2 className="h-4 w-4" /> Format
          </button>
          <button onClick={minifyYaml} className="tool-btn">
            Compact
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
                    {validation.status === "valid" && "Valid"}
                    {validation.status === "invalid" && "Invalid"}
                    {validation.status === "empty" && "Empty"}
                  </span>
                </div>
              </div>
              <div className="text-xs text-zinc-500">{input.length.toLocaleString()} chars</div>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              placeholder={`Paste or type YAML here...\n\nSupports Kubernetes, dbt, GitHub Actions, Docker Compose, etc.`}
              className="min-h-[420px] flex-1 resize-y border-0 bg-transparent p-4 font-mono text-sm leading-relaxed focus:outline-none dark:placeholder:text-zinc-600"
            />

            {/* Error bar */}
            <div className="min-h-[42px] border-t border-zinc-200 px-4 py-2 text-sm dark:border-zinc-800">
              {validation.status === "valid" && (
                <span className="text-emerald-600 dark:text-emerald-400">YAML parsed successfully.</span>
              )}
              {validation.status === "invalid" && (
                <div className="text-red-600 dark:text-red-400">
                  <div className="font-medium">Invalid YAML</div>
                  <div className="font-mono text-xs opacity-90">
                    {validation.error}
                    {validation.line && ` (line ${validation.line}${validation.column ? `, col ${validation.column}` : ""})`}
                  </div>
                </div>
              )}
              {validation.status === "empty" && (
                <span className="text-zinc-500 dark:text-zinc-400">Load a sample or start typing.</span>
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
                  onClick={downloadYaml}
                  disabled={!formatted}
                  className="tool-btn-sm"
                  title="Download .yaml file"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              </div>
            </div>

            <div className="min-h-[420px] flex-1 overflow-auto p-4 font-mono text-sm">
              {activeView === "pretty" && (
                <pre className="whitespace-pre-wrap break-words text-zinc-800 dark:text-zinc-200">
                  {formatted || <span className="text-zinc-400">Formatted YAML will appear here…</span>}
                </pre>
              )}

              {activeView === "raw" && (
                <pre className="whitespace-pre text-zinc-800 dark:text-zinc-200">
                  {formatted || "Compact YAML output appears here…"}
                </pre>
              )}

              {activeView === "tree" && parsedData && <DataTreeView data={parsedData} rootLabel="document" />}
              {activeView === "tree" && !parsedData && (
                <div className="text-sm text-zinc-500">Valid YAML will render an interactive tree here.</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          All processing happens locally in your browser. No data is sent anywhere. &nbsp;•&nbsp; ⌘S to format &nbsp;•&nbsp; ⌘K to clear
        </div>
      </div>
    </>
  );
}
