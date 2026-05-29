// Central catalog of Smathr tools.
// Add new tools here — the UI will pick them up automatically.

export type ToolStatus = "live" | "beta" | "soon";
export type ToolCategory =
  | "Validation"
  | "Transformation"
  | "Formatting"
  | "AI Assistant"
  | "Exploration"
  | "Utilities";

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  tags: string[];
  /** Lucide icon name (https://lucide.dev/icons) */
  icon: string;
  /** Internal path (e.g. "/json-validator") or full external URL */
  href: string;
  status: ToolStatus;
  isExternal?: boolean;
  comingSoonNote?: string;
}

export const tools: Tool[] = [
  {
    id: "json-validator",
    name: "JSON Validator",
    description: "Validate, format, repair, and explore JSON with live validation and tree view.",
    category: "Validation",
    tags: ["JSON", "Schema", "Client-side"],
    icon: "Braces",
    href: "/json-validator",
    status: "beta",
  },
  {
    id: "yaml-validator",
    name: "YAML Validator",
    description: "Validate, format, and explore YAML configs with live parsing and tree view.",
    category: "Validation",
    tags: ["YAML", "Config", "Client-side"],
    icon: "FileCode",
    href: "/yaml-validator",
    status: "beta",
  },
  {
    id: "gcloud-explorer",
    name: "GCloud Command Explorer",
    description: "Interactively discover and build gcloud commands with live argument suggestions — 100% client-side.",
    category: "Utilities",
    tags: ["GCP", "CLI", "Autocomplete"],
    icon: "Cloud",
    href: "/gcloud-explorer",
    status: "beta",
  },
  {
    id: "json-yaml-converter",
    name: "JSON ↔ YAML",
    description: "Instantly convert between JSON and YAML with perfect fidelity.",
    category: "Transformation",
    tags: ["JSON", "YAML", "Convert"],
    icon: "ArrowLeftRight",
    href: "/json-yaml",
    status: "beta",
  },
  {
    id: "csv-explorer",
    name: "CSV Explorer",
    description: "Profile messy CSVs, detect quality issues, and generate BigQuery + dbt schemas.",
    category: "Exploration",
    tags: ["CSV", "Data", "Client-side"],
    icon: "Table",
    href: "/csv-explorer",
    status: "beta",
  },
  {
    id: "sql-formatter",
    name: "SQL Formatter",
    description: "Pretty-print and lint SQL queries with dbt / BigQuery dialect support and customizable style.",
    category: "Formatting",
    tags: ["SQL", "dbt", "BigQuery"],
    icon: "Database",
    href: "/sql-formatter",
    status: "beta",
  },
  {
    id: "smathr-cli",
    name: "Smathr CLI",
    description: "The same data engineering tools in your terminal. Built for AI agents with structured output. npx works today.",
    category: "Utilities",
    tags: ["CLI", "Agents", "Automation", "Terminal"],
    icon: "Terminal",
    href: "/cli",
    status: "beta",
    isExternal: false,
  },
];

export const categories: ToolCategory[] = [
  "Validation",
  "Transformation",
  "Formatting",
  "AI Assistant",
  "Exploration",
  "Utilities",
];
