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
    id: "gcloud-finisher",
    name: "GCloud Finisher",
    description: "AI-powered gcloud command completion and explanations.",
    category: "AI Assistant",
    tags: ["GCP", "CLI", "AI"],
    icon: "Cloud",
    href: "https://gcloud-finisher.smathr.com",
    status: "soon",
    isExternal: true,
  },
  {
    id: "json-yaml-converter",
    name: "JSON ↔ YAML",
    description: "Instantly convert between JSON and YAML with perfect fidelity.",
    category: "Transformation",
    tags: ["JSON", "YAML", "Convert"],
    icon: "ArrowLeftRight",
    href: "/json-yaml",
    status: "soon",
  },
  {
    id: "csv-explorer",
    name: "CSV Explorer",
    description: "Validate, preview, and transform CSV/TSV files in the browser.",
    category: "Exploration",
    tags: ["CSV", "Data", "Client-side"],
    icon: "Table",
    href: "/csv-explorer",
    status: "soon",
  },
  {
    id: "regex-sandbox",
    name: "Regex Sandbox",
    description: "Test log parsing and extraction patterns with live highlighting.",
    category: "Utilities",
    tags: ["Regex", "Logs", "Parsing"],
    icon: "SearchCode",
    href: "/regex-sandbox",
    status: "soon",
  },
  {
    id: "sql-formatter",
    name: "SQL Formatter",
    description: "Pretty-print and lint SQL queries with dbt / BigQuery dialect support.",
    category: "Formatting",
    tags: ["SQL", "dbt", "BigQuery"],
    icon: "Database",
    href: "/sql-formatter",
    status: "soon",
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
