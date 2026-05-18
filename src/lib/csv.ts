// CSV analysis utilities for the CSV Explorer tool

export type InferredType =
  | "string"
  | "integer"
  | "float"
  | "boolean"
  | "date"
  | "timestamp"
  | "unknown";

export interface ColumnProfile {
  name: string;
  inferredType: InferredType;
  nullCount: number;
  totalCount: number;
  uniqueCount: number;
  samples: string[];
  nullPercentage: number;
}

export interface ParseResult {
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
  delimiter: string;
  encoding?: string;
}

// Common null-like values we can suggest
export const COMMON_NULL_VALUES = ["", "NULL", "null", "N/A", "na", "NA", "None", "none", "-", "--", "?", "9999", "-999", "-9999"];

// Try to infer the best type from a list of string values
export function inferTypeFromValues(values: string[]): InferredType {
  const nonEmpty = values.filter((v) => v !== null && v.trim() !== "");

  if (nonEmpty.length === 0) return "string";

  let integerCount = 0;
  let floatCount = 0;
  let booleanCount = 0;
  let dateCount = 0;
  let timestampCount = 0;

  for (const val of nonEmpty) {
    const trimmed = val.trim();

    // Boolean
    if (/^(true|false|yes|no|y|n|1|0)$/i.test(trimmed)) {
      booleanCount++;
      continue;
    }

    // Integer
    if (/^-?\d+$/.test(trimmed)) {
      integerCount++;
      continue;
    }

    // Float
    if (/^-?\d+\.\d+$/.test(trimmed)) {
      floatCount++;
      continue;
    }

    // Timestamp (ISO-like or common formats)
    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(trimmed) || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(trimmed)) {
      timestampCount++;
      continue;
    }

    // Date
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed) || /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
      dateCount++;
      continue;
    }
  }

  const total = nonEmpty.length;

  // Heuristic: require majority match
  if (timestampCount / total > 0.7) return "timestamp";
  if (dateCount / total > 0.7) return "date";
  if (booleanCount / total > 0.7) return "boolean";
  if (integerCount / total > 0.7) return "integer";
  if (floatCount / total > 0.7) return "float";

  return "string";
}

// Analyze a parsed dataset and return column profiles
export function analyzeColumns(
  rows: Record<string, string>[],
  headers: string[],
  nullValues: string[]
): ColumnProfile[] {
  return headers.map((header) => {
    const values = rows.map((row) => row[header] ?? "");
    const nullCount = values.filter((v) => isNullValue(v, nullValues)).length;
    const nonNullValues = values.filter((v) => !isNullValue(v, nullValues));

    const uniqueValues = new Set(nonNullValues);
    const samples = Array.from(uniqueValues).slice(0, 6);

    const inferredType = inferTypeFromValues(nonNullValues);

    return {
      name: header,
      inferredType,
      nullCount,
      totalCount: values.length,
      uniqueCount: uniqueValues.size,
      samples,
      nullPercentage: values.length > 0 ? Math.round((nullCount / values.length) * 100) : 0,
    };
  });
}

export function isNullValue(value: string, nullValues: string[]): boolean {
  const trimmed = value.trim();
  return nullValues.some((nv) => trimmed === nv || trimmed.toLowerCase() === nv.toLowerCase());
}

// Convert our internal type to BigQuery type
export function toBigQueryType(type: InferredType): string {
  switch (type) {
    case "integer":
      return "INTEGER";
    case "float":
      return "FLOAT";
    case "boolean":
      return "BOOLEAN";
    case "date":
      return "DATE";
    case "timestamp":
      return "TIMESTAMP";
    default:
      return "STRING";
  }
}

// Generate BigQuery schema JSON
export function generateBigQuerySchema(
  profiles: ColumnProfile[],
  overrides: Record<string, InferredType>,
  nullValues: string[]
): string {
  const schema = profiles.map((profile) => {
    const finalType = overrides[profile.name] || profile.inferredType;
    const bqType = toBigQueryType(finalType);
    const mode = profile.nullCount > 0 ? "NULLABLE" : "REQUIRED";

    return {
      name: profile.name,
      type: bqType,
      mode,
    };
  });

  return JSON.stringify(schema, null, 2);
}

// Generate basic dbt sources.yml stub
export function generateDbtSourcesYaml(
  profiles: ColumnProfile[],
  overrides: Record<string, InferredType>,
  tableName: string = "my_table"
): string {
  const columnLines = profiles
    .map((profile) => {
      const finalType = overrides[profile.name] || profile.inferredType;
      return `          - name: ${profile.name}\n            data_type: ${finalType}`;
    })
    .join("\n");

  return `version: 2

sources:
  - name: raw
    tables:
      - name: ${tableName}
        columns:
${columnLines}`;
}

// Basic JSON Schema generator
export function generateJsonSchema(profiles: ColumnProfile[], overrides: Record<string, InferredType>): string {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  profiles.forEach((profile) => {
    const finalType = overrides[profile.name] || profile.inferredType;
    let jsonType = "string";

    if (finalType === "integer" || finalType === "float") jsonType = "number";
    if (finalType === "boolean") jsonType = "boolean";

    properties[profile.name] = { type: jsonType };

    if (profile.nullCount === 0) {
      required.push(profile.name);
    }
  });

  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties,
    required,
  };

  return JSON.stringify(schema, null, 2);
}
