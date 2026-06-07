"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import {
  Cloud,
  Copy,
  RotateCcw,
  Plus,
  X,
  Check,
  Terminal,
  ArrowRight,
} from "lucide-react";
import {
  GCloudCommand,
  GCloudFlag,
  buildCommandString,
  findCommand,
  flagNeedsValue,
  getApplicableFlags,
  getContextHelp,
  getContextLabel,
  getNextSubcommands,
  getPositionalArg,
  COMMON_REGIONS_LIST,
} from "@/lib/gcloud";

// Quick-start presets — realistic data engineering tasks
const QUICK_STARTS: Array<{
  label: string;
  path: string[];
  flagValues: Record<string, string | boolean>;
  description?: string;
}> = [
  {
    label: "Deploy Run service from source",
    path: ["run", "deploy"],
    flagValues: {
      "--source": ".",
      "--region": "europe-west1",
      "--allow-unauthenticated": true,
    },
    description: "Most common pattern for new services",
  },
  {
    label: "Deploy Run service from image",
    path: ["run", "deploy"],
    flagValues: {
      "--image": "europe-west1-docker.pkg.dev/PROJECT/images/my-app:latest",
      "--region": "europe-west1",
    },
    description: "Promote a pre-built container",
  },
  {
    label: "Map custom domain (domain-mappings create)",
    path: ["run", "domain-mappings", "create"],
    flagValues: {
      "--service": "my-service",
      "--domain": "api.mycompany.com",
      "--region": "europe-west1",
    },
    description: "After domain verification",
  },
  {
    label: "List Cloud Run services",
    path: ["run", "services", "list"],
    flagValues: { "--region": "europe-west1" },
  },
  {
    label: "Create GCS bucket",
    path: ["storage", "buckets", "create"],
    flagValues: { "--location": "europe-west1", "--uniform-bucket-level-access": true },
  },
  {
    label: "Submit Cloud Build",
    path: ["builds", "submit"],
    flagValues: { "--tag": "europe-west1-docker.pkg.dev/PROJECT/images/app" },
  },
  {
    label: "Activate service account",
    path: ["auth", "activate-service-account"],
    flagValues: { "--key-file": "./deployer-key.json" },
  },
];

type FlagEntry = { flag: GCloudFlag; value: string | boolean };

export default function GCloudExplorerPage() {
  // Core builder state
  const [path, setPath] = useState<string[]>([]);
  const [flagValues, setFlagValues] = useState<Record<string, string | boolean>>({});
  const [pendingFlag, setPendingFlag] = useState<string | null>(null);
  const [pendingValue, setPendingValue] = useState("");
  const [copied, setCopied] = useState(false);

  // Derived data
  const currentNode = useMemo(() => findCommand(path), [path]);
  const nextSubcommands = useMemo(() => getNextSubcommands(path), [path]);
  const applicableFlags = useMemo(() => getApplicableFlags(path), [path]);
  const positional = useMemo(() => getPositionalArg(path), [path]);
  const contextHelp = useMemo(() => getContextHelp(path), [path]);
  const fullCommand = useMemo(
    () => buildCommandString(path, flagValues),
    [path, flagValues]
  );

  // Group flags for nicer display
  const groupedFlags = useMemo(() => {
    const groups: Record<string, GCloudFlag[]> = {
      common: [],
      output: [],
      iam: [],
      advanced: [],
      other: [],
    };
    for (const f of applicableFlags) {
      const cat = f.category ?? "other";
      if (groups[cat]) groups[cat].push(f);
      else groups.other.push(f);
    }
    return groups;
  }, [applicableFlags]);

  // Currently set flags (for the preview chips)
  const activeFlags: FlagEntry[] = useMemo(() => {
    return applicableFlags
      .map((f) => {
        const v = flagValues[f.name];
        if (v === undefined || v === false) return null;
        return { flag: f, value: v };
      })
      .filter(Boolean) as FlagEntry[];
  }, [applicableFlags, flagValues]);

  // Refs for focus management
  const valueInputRef = useRef<HTMLInputElement>(null);

  // When pendingFlag changes, focus the input
  useEffect(() => {
    if (pendingFlag && valueInputRef.current) {
      valueInputRef.current.focus();
    }
  }, [pendingFlag]);

  // --- Actions ---

  const appendToPath = (segment: string) => {
    const newPath = [...path, segment];
    setPath(newPath);
    // Clear any pending flag when we change level
    setPendingFlag(null);
    setPendingValue("");
  };

  const truncatePathTo = (index: number) => {
    const newPath = path.slice(0, index + 1);
    setPath(newPath);
    setPendingFlag(null);
    setPendingValue("");
  };

  const resetAll = () => {
    setPath([]);
    setFlagValues({});
    setPendingFlag(null);
    setPendingValue("");
    setCopied(false);
  };

  const removeLastFromPath = () => {
    if (path.length === 0) return;
    setPath(path.slice(0, -1));
    setPendingFlag(null);
    setPendingValue("");
  };

  // Remove a specific flag
  const removeFlag = (name: string) => {
    setFlagValues((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  // Handle clicking "Add" on a flag
  const handleAddFlag = (flag: GCloudFlag) => {
    if (flagNeedsValue(flag)) {
      setPendingFlag(flag.name);
      setPendingValue(
        typeof flagValues[flag.name] === "string" ? String(flagValues[flag.name]) : ""
      );
    } else {
      // Boolean toggle-on
      setFlagValues((prev) => ({ ...prev, [flag.name]: true }));
    }
  };

  // Commit a value for the pending flag
  const commitPendingFlag = () => {
    if (!pendingFlag) return;
    const trimmed = pendingValue.trim();
    if (trimmed) {
      setFlagValues((prev) => ({ ...prev, [pendingFlag]: trimmed }));
    } else {
      // If user cleared it, remove the flag entirely
      setFlagValues((prev) => {
        const next = { ...prev };
        delete next[pendingFlag];
        return next;
      });
    }
    setPendingFlag(null);
    setPendingValue("");
  };

  const cancelPendingFlag = () => {
    setPendingFlag(null);
    setPendingValue("");
  };

  // Handle Enter / Escape in the value input
  const handlePendingKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitPendingFlag();
    } else if (e.key === "Escape") {
      cancelPendingFlag();
    }
  };

  // Set a common value chip directly
  const setFlagFromChip = (flagName: string, value: string) => {
    setFlagValues((prev) => ({ ...prev, [flagName]: value }));
    if (pendingFlag === flagName) {
      setPendingFlag(null);
      setPendingValue("");
    }
  };

  // Positional (service name, bucket name, etc.)
  const setPositionalValue = (val: string) => {
    setFlagValues((prev) => ({ ...prev, __positional__: val }));
  };

  // Load a quick start preset
  const loadQuickStart = (qs: (typeof QUICK_STARTS)[number]) => {
    setPath(qs.path);
    setFlagValues(qs.flagValues);
    setPendingFlag(null);
    setPendingValue("");
  };

  // Copy command
  const copyCommand = async (withComments = false) => {
    let text = fullCommand;
    if (withComments) {
      const help = contextHelp;
      const lines = [
        `# ${getContextLabel(path)}`,
        text,
        "",
        help.notes.length > 0 ? "# Notes:" : "",
        ...help.notes.map((n) => `# ${n}`),
      ].filter(Boolean);
      text = lines.join("\n");
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // fallback
      alert(text);
    }
  };

  // Remove a path segment (also cleans up flags that may no longer apply)
  const removePathSegment = (index: number) => {
    const newPath = path.slice(0, index);
    setPath(newPath);
    // Keep only flags that are still valid in the new (shallower) context
    const stillValid = getApplicableFlags(newPath).map((f) => f.name);
    setFlagValues((prev) => {
      const next: Record<string, string | boolean> = {};
      for (const [k, v] of Object.entries(prev)) {
        if (k === "__positional__" || stillValid.includes(k)) next[k] = v;
      }
      return next;
    });
    setPendingFlag(null);
    setPendingValue("");
  };

  // Current leaf status
  const isAtLeaf = currentNode?.isLeaf === true;

  return (
    <>
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
                <Cloud className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">GCloud Command Explorer</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Build valid gcloud commands step-by-step. See exactly what arguments are available at every level — 100% client-side.
                </p>
              </div>
            </div>
          </div>
          <a href="/#tools" className="text-sm text-primary-600 hover:underline dark:text-primary-400">
            ← Back to all tools
          </a>
        </div>

        {/* Command Preview Bar */}
        <div className="mb-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-zinc-500">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5" /> CURRENT COMMAND
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyCommand(false)}
                className="tool-btn-sm"
                title="Copy command to clipboard"
              >
                <Copy className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() => copyCommand(true)}
                className="tool-btn-sm"
                title="Copy command plus helpful notes"
              >
                <Copy className="h-3.5 w-3.5" /> Copy + notes
              </button>
              <button onClick={resetAll} className="tool-btn-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </div>

          {/* The actual command with clickable segments */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-zinc-800 dark:text-zinc-200">
              <span
                onClick={() => setPath([])}
                className="cursor-pointer rounded px-1.5 py-0.5 hover:bg-primary-100 dark:hover:bg-primary-950"
              >
                gcloud
              </span>
              {path.map((segment, idx) => (
                <React.Fragment key={`${segment}-${idx}`}>
                  <span className="text-zinc-400">/</span>
                  <span
                    onClick={() => truncatePathTo(idx)}
                    className="cursor-pointer rounded px-1.5 py-0.5 hover:bg-primary-100 dark:hover:bg-primary-950"
                    title={`Go back to here`}
                  >
                    {segment}
                  </span>
                  <button
                    onClick={() => removePathSegment(idx)}
                    className="ml-0.5 text-zinc-400 hover:text-red-500"
                    title="Remove this segment"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </React.Fragment>
              ))}

              {path.length === 0 && (
                <span className="text-zinc-400">— choose a command below to begin</span>
              )}
            </div>

            {/* Positional argument input (service name, etc.) */}
            {positional && (
              <div className="mt-3 flex items-center gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <span className="text-xs font-medium text-zinc-500">{positional.name}:</span>
                <input
                  type="text"
                  value={String(flagValues["__positional__"] ?? "")}
                  onChange={(e) => setPositionalValue(e.target.value)}
                  placeholder={positional.example || positional.description}
                  className="flex-1 rounded border border-zinc-300 bg-white px-2 py-1 font-mono text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>
            )}
          </div>

          {/* Active flag chips */}
          {activeFlags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {activeFlags.map(({ flag, value }) => (
                <span
                  key={flag.name}
                  className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-xs font-mono dark:border-zinc-700 dark:bg-zinc-900"
                >
                  {flag.name}={String(value)}
                  <button
                    onClick={() => removeFlag(flag.name)}
                    className="text-zinc-400 hover:text-red-500"
                    title="Remove flag"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Quick Starts */}
        <div className="mb-6">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Quick starts — common data engineering tasks
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_STARTS.map((qs, i) => (
              <button
                key={i}
                onClick={() => loadQuickStart(qs)}
                className="tool-btn text-sm"
                title={qs.description}
              >
                {qs.label}
              </button>
            ))}
            <button onClick={resetAll} className="tool-btn text-sm text-zinc-500">
              Clear everything
            </button>
          </div>
        </div>

        {/* Main interactive area */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Subcommands */}
          <div className="lg:col-span-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                {path.length === 0 ? "Top-level commands" : "Next subcommands"}
              </div>
              {path.length > 0 && (
                <button onClick={removeLastFromPath} className="text-xs text-primary-600 hover:underline">
                  ← Back one level
                </button>
              )}
            </div>

            {nextSubcommands.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {nextSubcommands.map((cmd) => (
                  <button
                    key={cmd.name}
                    onClick={() => appendToPath(cmd.name)}
                    className="group flex h-full flex-col justify-between rounded-xl border border-zinc-200 bg-white p-3 text-left transition hover:border-primary-300 hover:bg-primary-50/30 active:bg-primary-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-primary-800 dark:hover:bg-primary-950/30"
                  >
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-white">{cmd.name}</div>
                      <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{cmd.description}</div>
                    </div>
                    <div className="mt-2 flex items-center text-xs text-primary-600 group-hover:text-primary-700 dark:text-primary-400">
                      Choose <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500 dark:border-zinc-800">
                {isAtLeaf
                  ? "This is a terminal command. Add flags below or start a new command."
                  : "No further subcommands at this level."}
              </div>
            )}
          </div>

          {/* Flags + Value Entry */}
          <div className="lg:col-span-7">
            <div className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              Flags for {getContextLabel(path)}
            </div>

            {/* Pending value input */}
            {pendingFlag && (
              <div className="mb-3 rounded-xl border border-primary-200 bg-primary-50/50 p-3 dark:border-primary-900 dark:bg-primary-950/30">
                <div className="mb-1 text-xs font-medium text-primary-700 dark:text-primary-300">
                  Value for <span className="font-mono">{pendingFlag}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    ref={valueInputRef}
                    type="text"
                    value={pendingValue}
                    onChange={(e) => setPendingValue(e.target.value)}
                    onKeyDown={handlePendingKeyDown}
                    placeholder="Enter value or pick from suggestions below"
                    className="flex-1 rounded border border-primary-300 bg-white px-3 py-1.5 font-mono text-sm focus:border-primary-500 focus:outline-none dark:border-primary-800 dark:bg-zinc-950"
                  />
                  <button onClick={commitPendingFlag} className="tool-btn-sm bg-primary-600 text-white hover:bg-primary-700">
                    <Check className="h-4 w-4" /> Add
                  </button>
                  <button onClick={cancelPendingFlag} className="tool-btn-sm">
                    Cancel
                  </button>
                </div>

                {/* Smart value chips for common flags */}
                {pendingFlag === "--region" && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {COMMON_REGIONS_LIST.map((r) => (
                      <button
                        key={r}
                        onClick={() => setFlagFromChip("--region", r)}
                        className="rounded bg-white px-2 py-0.5 text-xs font-mono hover:bg-primary-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
                {pendingFlag === "--format" && (
                  <div className="mt-2 flex gap-1">
                    {["json", "yaml", "table"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFlagFromChip("--format", f)}
                        className="rounded bg-white px-2 py-0.5 text-xs font-mono hover:bg-primary-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Flag groups */}
            {applicableFlags.length > 0 ? (
              <div className="space-y-4">
                {(["common", "iam", "output", "advanced", "other"] as const).map((group) => {
                  const list = groupedFlags[group];
                  if (!list || list.length === 0) return null;
                  return (
                    <div key={group}>
                      <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                        {group === "common" ? "Common" : group}
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {list.map((flag) => {
                          const isSet = flagValues[flag.name] !== undefined && flagValues[flag.name] !== false;
                          return (
                            <div
                              key={flag.name}
                              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                                isSet
                                  ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30"
                                  : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="font-mono text-[13px] font-medium text-zinc-900 dark:text-white">
                                  {flag.name}
                                </div>
                                <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                                  {flag.description}
                                </div>
                              </div>
                              <button
                                onClick={() => handleAddFlag(flag)}
                                disabled={!!pendingFlag}
                                className="tool-btn-sm shrink-0 disabled:opacity-40"
                              >
                                {isSet ? "Edit" : "Add"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-4 text-sm text-zinc-500 dark:border-zinc-800">
                No additional flags for the current command.
              </div>
            )}
          </div>
        </div>

        {/* Contextual help / notes */}
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-3 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            About {getContextLabel(path)}
          </div>

          <p className="text-sm text-zinc-700 dark:text-zinc-300">{contextHelp.description}</p>

          {contextHelp.notes.length > 0 && (
            <div className="mt-4">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Important notes
              </div>
              <ul className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                {contextHelp.notes.map((note, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-amber-500" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {contextHelp.examples.length > 0 && (
            <div className="mt-4">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">Examples</div>
              <div className="space-y-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                {contextHelp.examples.map((ex, i) => (
                  <div key={i} className="rounded bg-zinc-50 p-2 dark:bg-zinc-900">
                    {ex}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
            All processing happens locally in your browser. No commands or data are sent anywhere.
            For the complete reference, see the{" "}
            <a
              href={`https://cloud.google.com/sdk/gcloud/reference/${path.join("/")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary-600"
            >
              official gcloud documentation
            </a>
            .
          </p>
        </div>

        {/* Footer hint */}
        <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-500">
          Tip: Click any segment in the command bar to jump back. Use Quick Starts for realistic one-click examples.
          Want more commands (BigQuery, SQL, GKE, etc.)?{" "}
          <a
            href="https://github.com/cslattery/smathr-landing/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary-600"
          >
            Open an issue
          </a>
          .
        </div>
      </div>
    </>
  );
}
