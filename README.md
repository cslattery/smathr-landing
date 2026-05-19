# Smathr

**Smart, private, browser-based tools for data engineers.**

Smathr is a personal collection of lightweight utilities built to remove daily friction when working with data pipelines, warehouses, transformation tools, and logs.

## Current Tools

- **[JSON Validator](/json-validator)** — Validate, format, repair, and explore JSON with live validation and tree view (beta)
- **[YAML Validator](/yaml-validator)** — Parse, format, and explore YAML configs with tree view (beta)
- **[CSV Explorer](/csv-explorer)** — Profile sample CSVs, handle messy delimiters/nulls, and generate BigQuery + dbt schemas (beta)

The site is deployed on **Google Cloud Run** (Terraform + GitHub Actions) with DNS managed in **Cloudflare**.

More tools are planned and listed on the [live site](https://smathr.com).

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

## Local Development

```bash
npm install
npm run dev
```

---

Built with care by [Christopher Slattery](https://github.com/smathr).
