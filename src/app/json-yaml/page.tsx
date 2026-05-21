"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import * as yaml from "js-yaml";
import {
  Copy,
  RotateCcw,
  ArrowLeftRight,
  Wand2,
  Minimize2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

type Side = "json" | "yaml";
type SideState =
  | { status: "valid" }
  | { status: "invalid"; error: string }
  | { status: "empty" };

const SAMPLE_DATA: Record<string, { json: string; yaml: string }> = {
  "dbt Model Config": {
    json: `{
  "name": "fct_orders",
  "materialized": "incremental",
  "schema": "marts",
  "tags": ["daily", "core"],
  "config": {
    "partition_by": "order_date",
    "cluster_by": ["customer_id", "status"]
  }
}`,
    yaml: `name: fct_orders
materialized: incremental
schema: marts
tags:
  - daily
  - core
config:
  partition_by: order_date
  cluster_by:
    - customer_id
    - status
`,
  },
  "Kubernetes Deployment": {
    json: `{
  "apiVersion": "apps/v1",
  "kind": "Deployment",
  "metadata": {
    "name": "data-pipeline",
    "namespace": "analytics"
  },
  "spec": {
    "replicas": 3,
    "selector": {
      "matchLabels": { "app": "pipeline-worker" }
    }
  }
}`,
    yaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: data-pipeline
  namespace: analytics
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pipeline-worker
`,
  },
  "GitHub Actions Workflow": {
    json: `{
  "name": "Daily Data Refresh",
  "on": {
    "schedule": [{ "cron": "0 4 * * *" }],
    "workflow_dispatch": null
  },
  "jobs": {
    "dbt-run": {
      "runs-on": "ubuntu-latest",
      "steps": [
        { "uses": "actions/checkout@v4" },
        { "name": "Run dbt", "run": "dbt run --target prod" }
      ]
    }
  }
}`,
    yaml: `name: Daily Data Refresh
on:
  schedule:
    - cron: "0 4 * * *"
  workflow_dispatch: null
jobs:
  dbt-run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run dbt
        run: dbt run --target prod
`,
  },
};

export default function JsonYamlConverterPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [yamlInput, setYamlInput] = useState("");
  const [indent, setIndent] = useState<2 | 4>(2);
  const [lastEdited, setLastEdited] = useState<Side | null>(null);

  const [jsonState, setJsonState] = useState<SideState>({ status: "empty" });
  const [yamlState, setYamlState] = useState<SideState>({ status: "empty" });

  // Convert JSON → YAML
  const convertJsonToYaml = useCallback(
    (jsonStr: string): string | null => {
      if (!jsonStr.trim()) return null;
      try {
        const parsed = JSON.parse(jsonStr);
        return yaml.dump(parsed, {
          indent,
          lineWidth: 120,
          noRefs: true,
          sortKeys: false,
        });
      } catch {
        return null;
      }
    },
    [indent]
  );

  // Convert YAML → JSON
  const convertYamlToJson = useCallback(
    (yamlStr: string): string | null => {
      if (!yamlStr.trim()) return null;
      try {
        const parsed = yaml.load(yamlStr);
        if (parsed === undefined || parsed === null) return null;
        return JSON.stringify(parsed, null, indent) + "\n";
      } catch {
        return null;
      }
    },
    [indent]
  );

  // Debounced live conversion
  useEffect(() => {
    const timer = setTimeout(() => {
      if (lastEdited === "json") {
        const converted = convertJsonToYaml(jsonInput);
        if (converted !== null) {
          if (converted.trim() !== yamlInput.trim()) {
            setYamlInput(converted);
          }
          setYamlState({ status: "valid" });
          setJsonState({ status: "valid" });
        } else if (jsonInput.trim()) {
          setYamlState({ status: "invalid", error: "Could not convert — check JSON syntax" });
          setJsonState({ status: "invalid", error: "Invalid JSON" });
        }
      } else if (lastEdited === "yaml") {
        const converted = convertYamlToJson(yamlInput);
        if (converted !== null) {
          if (converted.trim() !== jsonInput.trim()) {
            setJsonInput(converted);
          }
          setJsonState({ status: "valid" });
          setYamlState({ status: "valid" });
        } else if (yamlInput.trim()) {
          setJsonState({ status: "invalid", error: "Could not convert — check YAML syntax" });
          setYamlState({ status: "invalid", error: "Invalid YAML" });
        }
      }

      // Update individual states when not actively converting
      if (lastEdited !== "json") {
        try {
          if (jsonInput.trim()) {
            JSON.parse(jsonInput);
            setJsonState({ status: "valid" });
          } else {
            setJsonState({ status: "empty" });
          }
        } catch {
          if (jsonInput.trim()) setJsonState({ status: "invalid", error: "Invalid JSON" });
          else setJsonState({ status: "empty" });
        }
      }
      if (lastEdited !== "yaml") {
        try {
          if (yamlInput.trim()) {
            yaml.load(yamlInput);
            setYamlState({ status: "valid" });
          } else {
            setYamlState({ status: "empty" });
          }
        } catch {
          if (yamlInput.trim()) setYamlState({ status: "invalid", error: "Invalid YAML" });
          else setYamlState({ status: "empty" });
        }
      }
    }, 140);

    return () => clearTimeout(timer);
  }, [jsonInput, yamlInput, lastEdited, convertJsonToYaml, convertYamlToJson]);

  // Re-convert when indent changes (using last edited as source of truth)
  useEffect(() => {
    if (lastEdited === "json" && jsonInput.trim()) {
      const converted = convertJsonToYaml(jsonInput);
      if (converted) setYamlInput(converted);
    } else if (lastEdited === "yaml" && yamlInput.trim()) {
      const converted = convertYamlToJson(yamlInput);
      if (converted) setJsonInput(converted);
    }
  }, [indent, lastEdited, jsonInput, yamlInput, convertJsonToYaml, convertYamlToJson]);

  // === Handlers ===

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    setLastEdited("json");
  };

  const handleYamlChange = (value: string) => {
    setYamlInput(value);
    setLastEdited("yaml");
  };

  const loadSample = (key: string) => {
    const sample = SAMPLE_DATA[key];
    if (sample) {
      setJsonInput(sample.json);
      setYamlInput(sample.yaml);
      setLastEdited("json"); // treat JSON as the source for this sample
    }
  };

  const formatJson = () => {
    if (!jsonInput.trim()) return;
    try {
      const parsed = JSON.parse(jsonInput);
      const pretty = JSON.stringify(parsed, null, indent) + "\n";
      setJsonInput(pretty);
      setLastEdited("json");
    } catch {
      // ignore
    }
  };

  const minifyJson = () => {
    if (!jsonInput.trim()) return;
    try {
      const parsed = JSON.parse(jsonInput);
      const compact = JSON.stringify(parsed) + "\n";
      setJsonInput(compact);
      setLastEdited("json");
    } catch {
      // ignore
    }
  };

  const formatYaml = () => {
    if (!yamlInput.trim()) return;
    try {
      const parsed = yaml.load(yamlInput);
      const pretty = yaml.dump(parsed, { indent, lineWidth: 120, noRefs: true });
      setYamlInput(pretty);
      setLastEdited("yaml");
    } catch {
      // ignore
    }
  };

  const minifyYaml = () => {
    if (!yamlInput.trim()) return;
    try {
      const parsed = yaml.load(yamlInput);
      const compact = yaml.dump(parsed, { indent: 1, lineWidth: -1, noRefs: true });
      setYamlInput(compact);
      setLastEdited("yaml");
    } catch {
      // ignore
    }
  };

  const swapSides = () => {
    const tempJson = jsonInput;
    const tempYaml = yamlInput;
    setJsonInput(tempYaml);
    setYamlInput(tempJson);
    setLastEdited(lastEdited === "json" ? "yaml" : "json");
  };

  const clearAll = () => {
    setJsonInput("");
    setYamlInput("");
    setLastEdited(null);
    setJsonState({ status: "empty" });
    setYamlState({ status: "empty" });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast here in future
    } catch {
      alert(`Copied ${label} to clipboard (fallback)`);
    }
  };

  const getStatusIcon = (state: SideState) => {
    if (state.status === "valid") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (state.status === "invalid") return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertTriangle className="h-4 w-4 text-amber-500" />;
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
                <ArrowLeftRight className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">JSON ↔ YAML</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Instantly convert between JSON and YAML with perfect fidelity — all client-side.
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
                {Object.keys(SAMPLE_DATA).map((key) => (
                  <button key={key} onClick={() => loadSample(key)} className="tool-btn text-xs">
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />

            {/* Indent */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Indent</label>
              <div className="flex rounded border border-zinc-200 dark:border-zinc-700">
                {[2, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setIndent(n as 2 | 4)}
                    className={`px-3 py-1 text-sm transition ${
                      indent === n
                        ? "bg-primary-600 text-white"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1" />

            <button onClick={swapSides} className="tool-btn" title="Swap JSON and YAML content">
              <ArrowLeftRight className="h-4 w-4" /> Swap sides
            </button>
            <button onClick={clearAll} className="tool-btn text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
              <RotateCcw className="h-4 w-4" /> Clear all
            </button>
          </div>
        </div>

        {/* Two-pane converter */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* JSON Pane */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">JSON</span>
                {getStatusIcon(jsonState)}
                {jsonState.status === "invalid" && (
                  <span className="text-xs text-red-500">{jsonState.error}</span>
                )}
              </div>
              <div className="flex gap-1">
                <button onClick={formatJson} disabled={!jsonInput.trim()} className="tool-btn-sm" title="Pretty print JSON">
                  <Wand2 className="h-3.5 w-3.5" /> Format
                </button>
                <button onClick={minifyJson} disabled={!jsonInput.trim()} className="tool-btn-sm" title="Minify JSON">
                  <Minimize2 className="h-3.5 w-3.5" /> Minify
                </button>
                <button onClick={() => copyToClipboard(jsonInput, "JSON")} disabled={!jsonInput.trim()} className="tool-btn-sm">
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
            </div>

            <textarea
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder="Paste or type JSON here..."
              spellCheck={false}
              className="h-[480px] w-full resize-y rounded-xl border border-zinc-200 bg-white p-4 font-mono text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950"
            />
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              Editing JSON will automatically update the YAML on the right.
            </p>
          </div>

          {/* YAML Pane */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">YAML</span>
                {getStatusIcon(yamlState)}
                {yamlState.status === "invalid" && (
                  <span className="text-xs text-red-500">{yamlState.error}</span>
                )}
              </div>
              <div className="flex gap-1">
                <button onClick={formatYaml} disabled={!yamlInput.trim()} className="tool-btn-sm" title="Pretty print YAML">
                  <Wand2 className="h-3.5 w-3.5" /> Format
                </button>
                <button onClick={minifyYaml} disabled={!yamlInput.trim()} className="tool-btn-sm" title="Minify YAML">
                  <Minimize2 className="h-3.5 w-3.5" /> Minify
                </button>
                <button onClick={() => copyToClipboard(yamlInput, "YAML")} disabled={!yamlInput.trim()} className="tool-btn-sm">
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
            </div>

            <textarea
              value={yamlInput}
              onChange={(e) => handleYamlChange(e.target.value)}
              placeholder="Paste or type YAML here..."
              spellCheck={false}
              className="h-[480px] w-full resize-y rounded-xl border border-zinc-200 bg-white p-4 font-mono text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950"
            />
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              Editing YAML will automatically update the JSON on the left.
            </p>
          </div>
        </div>

        {/* Privacy note */}
        <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-500">
          All conversion happens instantly in your browser. Nothing is uploaded or stored.
        </div>
      </div>
    </>
  );
}
