"use client";

import React, { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import Papa from "papaparse";
import {
  analyzeColumns,
  ColumnProfile,
  COMMON_NULL_VALUES,
  generateBigQuerySchema,
  generateDbtSourcesYaml,
  generateJsonSchema,
  InferredType,
  isNullValue,
  ParseResult,
} from "@/lib/csv";
import { Copy, Download, FileSpreadsheet, RefreshCw } from "lucide-react";

type SchemaTab = "bigquery" | "dbt" | "json";

const DELIMITERS = [
  { label: "Auto-detect", value: "" },
  { label: "Comma (,)", value: "," },
  { label: "Tab", value: "\t" },
  { label: "Semicolon (;)", value: ";" },
  { label: "Pipe (|)", value: "|" },
];

const ENCODINGS = ["UTF-8", "UTF-8 with BOM", "ISO-8859-1 (Latin1)", "Windows-1252"];

const SAMPLE_CSVS: Record<string, string> = {
  "Messy Events (Tab + Weird Nulls)": `event_id\ttimestamp\tuser_id\taction\tvalue\tregion
evt_001\t2025-05-01 14:22:10\tu_42\tpurchase\t99.5\tus-west
evt_002\t2025-05-01 14:23:45\tu_43\tview\t\tus-east
evt_003\t2025-05-01 14:25:01\tu_42\tpurchase\tNULL\tus-west
evt_004\t2025-05-01 14:27:33\t\tclick\t12.0\t
evt_005\t2025-05-01 14:29:10\tu_44\tpurchase\t-999\tEU`,

  "Sales Export (Semicolon + Encoding Issues)": `id;date;customer;amount;status
1;2024-12-01;Acme Corp;1250.00;closed
2;2024-12-02;Beta Inc;;open
3;2024-12-03;Gamma LLC;890.5;closed
4;2024-12-04;;450.0;pending`,

  "User Profiles (Mixed Types)": `user_id,signup_date,active,last_login,score,tags
42,2023-01-15,true,2025-05-18 09:14:22,87.5,"admin,premium"
43,2023-03-02,false,2024-11-30 22:01:05,12.0,""
44,2024-07-19,true,,94,"beta,early"`
};

export default function CsvExplorerPage() {
  const [rawInput, setRawInput] = useState("");
  const [delimiter, setDelimiter] = useState("");
  const [encoding, setEncoding] = useState("UTF-8");
  const [nullValues, setNullValues] = useState<string[]>(["", "NULL", "null", "N/A", "-999"]);
  const [customNullInput, setCustomNullInput] = useState("");

  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [profiles, setProfiles] = useState<ColumnProfile[]>([]);
  const [typeOverrides, setTypeOverrides] = useState<Record<string, InferredType>>({});
  const [activeSchemaTab, setActiveSchemaTab] = useState<SchemaTab>("bigquery");
  const [previewRowLimit, setPreviewRowLimit] = useState<25 | 50 | 100 | number>(50);

  // Parse the CSV whenever input or settings change
  const parsedData = useMemo(() => {
    if (!rawInput.trim()) {
      setParseResult(null);
      setProfiles([]);
      return null;
    }

    try {
      const result = Papa.parse(rawInput, {
        delimiter: delimiter || undefined,
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
      });

      if (result.errors.length > 0 && result.errors[0].code !== "UndetectableDelimiter") {
        console.warn("PapaParse warnings:", result.errors);
      }

      const rows = result.data as Record<string, string>[];
      const headers = result.meta.fields || [];

      const parsed: ParseResult = {
        headers,
        rows,
        rowCount: rows.length,
        delimiter: result.meta.delimiter || delimiter || ",",
      };

      setParseResult(parsed);

      // Analyze columns
      const analyzed = analyzeColumns(rows, headers, nullValues);
      setProfiles(analyzed);

      // Reset overrides when data changes significantly
      setTypeOverrides({});

      return parsed;
    } catch (e) {
      console.error("Failed to parse CSV", e);
      return null;
    }
  }, [rawInput, delimiter, nullValues]);

  // Current profiles with overrides applied
  const effectiveProfiles = useMemo(() => {
    return profiles.map((p) => ({
      ...p,
      effectiveType: typeOverrides[p.name] || p.inferredType,
    }));
  }, [profiles, typeOverrides]);

  // Generated schemas
  const bigquerySchema = useMemo(() => {
    if (profiles.length === 0) return "";
    return generateBigQuerySchema(profiles, typeOverrides, nullValues);
  }, [profiles, typeOverrides, nullValues]);

  const dbtYaml = useMemo(() => {
    if (profiles.length === 0) return "";
    return generateDbtSourcesYaml(profiles, typeOverrides, "raw_events");
  }, [profiles, typeOverrides]);

  const jsonSchema = useMemo(() => {
    if (profiles.length === 0) return "";
    return generateJsonSchema(profiles, typeOverrides);
  }, [profiles, typeOverrides]);

  const currentSchema =
    activeSchemaTab === "bigquery" ? bigquerySchema : activeSchemaTab === "dbt" ? dbtYaml : jsonSchema;

  // Handle type override
  const updateTypeOverride = (column: string, newType: InferredType) => {
    setTypeOverrides((prev) => ({
      ...prev,
      [column]: newType,
    }));
  };

  // Reset overrides
  const resetOverrides = () => {
    setTypeOverrides({});
  };

  // Add custom null value
  const addCustomNull = () => {
    const val = customNullInput.trim();
    if (val && !nullValues.includes(val)) {
      setNullValues([...nullValues, val]);
      setCustomNullInput("");
    }
  };

  // Remove null value
  const removeNullValue = (val: string) => {
    setNullValues(nullValues.filter((v) => v !== val));
  };

  // Load sample
  const loadSample = (key: string) => {
    const sample = SAMPLE_CSVS[key];
    if (sample) {
      setRawInput(sample);
      // Reset some settings to sensible defaults for the sample
      setDelimiter("");
      setNullValues(["", "NULL", "null", "N/A", "-999"]);
      setTypeOverrides({});
    }
  };

  // Copy / Download
  const copyToClipboard = async () => {
    if (!currentSchema) return;
    await navigator.clipboard.writeText(currentSchema);
  };

  const downloadSchema = () => {
    if (!currentSchema) return;
    const ext = activeSchemaTab === "dbt" ? "yml" : "json";
    const blob = new Blob([currentSchema], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schema.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setRawInput("");
    setParseResult(null);
    setProfiles([]);
    setTypeOverrides({});
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
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">CSV Explorer</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Profile sample CSVs, understand quality issues, and generate BigQuery + dbt schemas — all client-side.
                </p>
              </div>
            </div>
          </div>
          <a href="/#tools" className="text-sm text-primary-600 hover:underline dark:text-primary-400">
            ← Back to all tools
          </a>
        </div>

        {/* Controls */}
        <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-wrap items-end gap-4">
            {/* Samples */}
            <div>
              <div className="mb-1 text-xs font-medium text-zinc-500">SAMPLE DATA</div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(SAMPLE_CSVS).map((key) => (
                  <button key={key} onClick={() => loadSample(key)} className="tool-btn text-xs">
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-9 w-px bg-zinc-200 dark:bg-zinc-700" />

            {/* Delimiter */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Delimiter</label>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="rounded border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                {DELIMITERS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Encoding */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Encoding</label>
              <select
                value={encoding}
                onChange={(e) => setEncoding(e.target.value)}
                className="rounded border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                {ENCODINGS.map((enc) => (
                  <option key={enc} value={enc}>
                    {enc}
                  </option>
                ))}
              </select>
            </div>

            {/* Null Values */}
            <div className="min-w-[260px] flex-1">
              <label className="mb-1 block text-xs font-medium text-zinc-500">Treat these as NULL</label>
              <div className="flex flex-wrap gap-1">
                {nullValues.map((val) => (
                  <span
                    key={val}
                    className="inline-flex items-center rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800"
                  >
                    {val || '""'}
                    <button onClick={() => removeNullValue(val)} className="ml-1 text-zinc-400 hover:text-red-500">×</button>
                  </span>
                ))}
                <input
                  type="text"
                  value={customNullInput}
                  onChange={(e) => setCustomNullInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomNull()}
                  placeholder="Add custom"
                  className="w-24 rounded border border-zinc-200 bg-white px-2 py-0.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
            </div>

            <button onClick={clearAll} className="tool-btn ml-auto text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
              Clear
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="mb-6">
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="Paste CSV content here or load a sample above..."
            className="h-48 w-full rounded-xl border border-zinc-200 bg-white p-4 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-950"
          />
        </div>

        {/* Data Preview */}
        {parseResult && parseResult.rows.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Data Preview</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-500">Show first</span>
                {[25, 50, 100, 500].map((n) => (
                  <button
                    key={n}
                    onClick={() => setPreviewRowLimit(n as any)}
                    className={`rounded px-2.5 py-0.5 text-xs font-medium transition ${
                      previewRowLimit === n
                        ? "bg-primary-600 text-white"
                        : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPreviewRowLimit(999999)}
                  className={`rounded px-2.5 py-0.5 text-xs font-medium transition ${
                    previewRowLimit > 500
                      ? "bg-primary-600 text-white"
                      : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  }`}
                >
                  All
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    <th className="w-12 px-3 py-2 text-left font-medium text-zinc-500">#</th>
                    {parseResult.headers.map((header, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {parseResult.rows.slice(0, previewRowLimit).map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="px-3 py-2 text-xs text-zinc-400 dark:text-zinc-500">
                        {rowIndex + 1}
                      </td>
                      {parseResult.headers.map((header, colIndex) => {
                        const value = row[header] ?? "";
                        const isNull = isNullValue(value, nullValues);
                        const display = value.length > 80 ? value.slice(0, 77) + "..." : value;
                        return (
                          <td
                            key={colIndex}
                            className={`px-4 py-2 text-sm ${isNull ? "text-zinc-400 italic" : "text-zinc-700 dark:text-zinc-300"}`}
                            title={value}
                          >
                            {isNull ? (value || "∅") : display}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Showing {Math.min(parseResult.rows.length, previewRowLimit)} of {parseResult.rows.length} rows.
              Long values are truncated — hover for full content.
            </p>
          </div>
        )}

        {/* Results */}
        {parseResult && profiles.length > 0 && (
          <div className="space-y-8">
            {/* Summary */}
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">{parseResult.rowCount}</span> rows •{" "}
                <span className="font-medium">{parseResult.headers.length}</span> columns • Delimiter:{" "}
                <code>{parseResult.delimiter}</code>
              </div>
              <button onClick={resetOverrides} className="flex items-center gap-1 text-primary-600 hover:underline">
                <RefreshCw className="h-4 w-4" /> Reset type overrides
              </button>
            </div>

            {/* Column Profiles + Type Overrides */}
            <div>
              <h3 className="mb-3 text-lg font-semibold">Column Profiles</h3>
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                  <thead className="bg-zinc-50 dark:bg-zinc-900">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Column</th>
                      <th className="px-4 py-2 text-left font-medium">Inferred Type</th>
                      <th className="px-4 py-2 text-left font-medium">Override</th>
                      <th className="px-4 py-2 text-right font-medium">Nulls</th>
                      <th className="px-4 py-2 text-right font-medium">Unique</th>
                      <th className="px-4 py-2 text-left font-medium">Sample Values</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                    {effectiveProfiles.map((profile) => (
                      <tr key={profile.name}>
                        <td className="px-4 py-3 font-medium">{profile.name}</td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{profile.inferredType}</td>
                        <td className="px-4 py-3">
                          <select
                            value={typeOverrides[profile.name] || profile.inferredType}
                            onChange={(e) => updateTypeOverride(profile.name, e.target.value as InferredType)}
                            className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                          >
                            {(["string", "integer", "float", "boolean", "date", "timestamp"] as const).map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-500">
                          {profile.nullCount} ({profile.nullPercentage}%)
                        </td>
                        <td className="px-4 py-3 text-right">{profile.uniqueCount}</td>
                        <td className="px-4 py-3 text-xs text-zinc-500">
                          {profile.samples.slice(0, 4).join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Schema Generation */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Generated Schema</h3>
                <div className="flex gap-2">
                  <button onClick={copyToClipboard} disabled={!currentSchema} className="tool-btn-sm">
                    <Copy className="h-4 w-4" /> Copy
                  </button>
                  <button onClick={downloadSchema} disabled={!currentSchema} className="tool-btn-sm">
                    <Download className="h-4 w-4" /> Download
                  </button>
                </div>
              </div>

              <div className="mb-3 flex gap-1 rounded-lg bg-zinc-100 p-1 text-sm dark:bg-zinc-900">
                {(["bigquery", "dbt", "json"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSchemaTab(tab)}
                    className={`rounded-md px-4 py-1.5 font-medium capitalize transition ${
                      activeSchemaTab === tab
                        ? "bg-white shadow dark:bg-zinc-800"
                        : "hover:bg-white/70 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    {tab === "bigquery" ? "BigQuery" : tab === "dbt" ? "dbt YAML" : "JSON Schema"}
                  </button>
                ))}
              </div>

              <pre className="max-h-[420px] overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                {currentSchema || "Schema will appear here after parsing..."}
              </pre>

              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Change types in the table above to update the generated schema. BigQuery schema is ready to use with <code>bq load</code> or Terraform.
              </p>
            </div>
          </div>
        )}

        {!parseResult && rawInput.trim() && (
          <div className="rounded-xl border border-dashed p-8 text-center text-zinc-500">
            Could not parse the input. Try adjusting the delimiter or encoding.
          </div>
        )}
      </div>
    </>
  );
}
