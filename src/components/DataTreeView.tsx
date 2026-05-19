"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown, Copy } from "lucide-react";

interface DataTreeViewProps {
  data: any;
  rootLabel?: string;
}

interface TreeNodeProps {
  keyName: string | number;
  value: any;
  path: string;
  depth: number;
  defaultExpanded?: boolean;
}

function getTypeLabel(value: any): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return `array[${value.length}]`;
  if (typeof value === "object") return `object{${Object.keys(value).length}}`;
  return typeof value;
}

function TreeNode({ keyName, value, path, depth, defaultExpanded = true }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded && (typeof value === "object" && value !== null));

  const isExpandable = value !== null && typeof value === "object";

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(path || String(keyName)).catch(() => {});
  };

  const toggle = () => {
    if (isExpandable) setIsOpen(!isOpen);
  };

  return (
    <div className="select-none">
      <div
        className="group flex items-center gap-1.5 rounded py-0.5 pr-2 font-mono text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
        onClick={toggle}
      >
        <span className="w-4 text-center text-zinc-400">
          {isExpandable ? (isOpen ? <ChevronDown className="inline h-3.5 w-3.5" /> : <ChevronRight className="inline h-3.5 w-3.5" />) : null}
        </span>

        <span className="text-zinc-500 dark:text-zinc-400">{String(keyName)}:</span>

        {!isExpandable && (
          <span className="font-medium text-emerald-700 dark:text-emerald-400">
            {JSON.stringify(value)}
          </span>
        )}

        {isExpandable && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {getTypeLabel(value)}
          </span>
        )}

        <button
          onClick={handleCopyPath}
          className="ml-1 hidden text-zinc-400 opacity-0 hover:text-primary-600 group-hover:block group-hover:opacity-100"
          title={`Copy path: ${path || keyName}`}
        >
          <Copy className="h-3 w-3" />
        </button>
      </div>

      {isExpandable && isOpen && (
        <div className="border-l border-zinc-200 pl-5 dark:border-zinc-800">
          {Object.entries(value).map(([k, v]) => (
            <TreeNode
              key={k}
              keyName={Array.isArray(value) ? Number(k) : k}
              value={v}
              path={path ? `${path}.${k}` : String(k)}
              depth={depth + 1}
              defaultExpanded={depth < 2}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DataTreeView({ data, rootLabel = "root" }: DataTreeViewProps) {
  const [expandAll, setExpandAll] = useState(true);

  const handleExpandAll = () => setExpandAll(true);
  const handleCollapseAll = () => setExpandAll(false);

  if (data === null || typeof data !== "object") {
    return <div className="font-mono text-sm text-zinc-500">Not an object or array.</div>;
  }

  return (
    <div>
      <div className="mb-2 flex gap-2 text-xs">
        <button onClick={handleExpandAll} className="rounded border px-2 py-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800">Expand all</button>
        <button onClick={handleCollapseAll} className="rounded border px-2 py-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800">Collapse all</button>
      </div>

      <div className="rounded border border-zinc-200 bg-zinc-50 p-3 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-950">
        <TreeNode
          keyName={rootLabel}
          value={data}
          path=""
          depth={0}
          defaultExpanded={expandAll}
        />
      </div>

      <p className="mt-2 text-[10px] text-zinc-500 dark:text-zinc-400">
        Click any row to toggle. Click the copy icon to copy the path (e.g. <code>properties.duration_ms</code>).
      </p>
    </div>
  );
}
