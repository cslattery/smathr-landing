# Smathr

**Smart, private, browser-based tools for data engineers.**

Smathr is a personal collection of lightweight utilities built to remove daily friction when working with data pipelines, warehouses, transformation tools, and logs.

## Current Tools

- **[JSON Validator](/json-validator)** — Validate, format, repair, and explore JSON (beta)
- **[YAML Validator](/yaml-validator)** — Parse and format YAML configs (beta)
- **[GCloud Command Explorer](/gcloud-explorer)** — Interactive builder for gcloud CLI commands with live suggestions (beta)
- **[JSON ↔ YAML](/json-yaml)** — Bidirectional converter with Pretty, Minified, and One Line modes (beta)
- **[CSV Explorer](/csv-explorer)** — Profile CSVs and generate BigQuery + dbt schemas (beta)
- **[SQL Formatter](/sql-formatter)** — Pretty-print, minify, and one-line SQL with dialect support (BigQuery, Postgres, Snowflake, etc.) (beta)
- **[Smathr CLI](https://github.com/smathr/smathr-cli)** — Fast, private terminal + agent-first versions of the tools. Includes `validate`, `convert`, `format sql` (8 dialects), and powerful `csv profile` with schema generation. `npx smathr` works today. The first release with pre-built binaries for macOS, Linux, and Windows is in active preparation.

The site is deployed on **Google Cloud Run** (Terraform + GitHub Actions) with DNS managed in **Cloudflare**.

All tools are listed on the [live site](https://smathr.com).

## Philosophy

- Everything runs **client-side** — your data never leaves your browser
- Fast, delightful, engineer-grade micro-tools
- No sign-ups, no rate limits, no tracking

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Focused on small, high-quality experiences

## For Agents & Contributors

See [AGENTS.md](./AGENTS.md) for architecture decisions, how to add new tools, coding conventions, and current status.

### Smathr CLI (Recommended for Agents)

A dedicated CLI is available at [github.com/smathr/smathr-cli](https://github.com/smathr/smathr-cli).

```bash
npx smathr --help
```

It provides the same tools with excellent support for AI agents:
- Structured JSON output by default when piped
- Reliable exit codes and error details (with line/column)
- `validate`, `convert`, `format sql`, and `csv profile` (with BigQuery/dbt schema output)

The first release with pre-built binaries is being prepared. See the CLI repository’s [RELEASE.md](https://github.com/smathr/smathr-cli/blob/main/RELEASE.md).

Standalone binaries are published with each release.

## Local Development

```bash
npm install
npm run dev
```

---

Built with care by [Christopher Slattery](https://github.com/smathr).
