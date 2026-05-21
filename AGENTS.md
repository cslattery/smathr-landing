# AGENTS.md — Smathr Landing & Tools

This document provides essential context for AI agents (Grok, Claude, Cursor, etc.) working on the Smathr codebase.

---

## 1. Project Purpose

**Smathr** is a personal collection of lightweight, high-quality, **private, browser-based tools** built for data engineers.

The original vision was a simple landing page (`smathr.com`) that pointed to many data engineering utilities living on subdomains (`yaml-validator.smathr.com`, etc.).

**Current direction (2026)**:
- We follow a **hybrid model**:
  - Simple, client-only tools (validators, formatters, explorers) are built **inside this Next.js app** as first-class routes (`/json-validator`, `/yaml-validator`, `/csv-explorer`, etc.).
  - Heavier or backend-dependent tools may still live on subdomains.
- The app is deployed to **Cloud Run** (currently in `europe-west1`) using **Terraform** and **GitHub Actions** (OIDC).
- DNS is managed in **Cloudflare**.
- A Global Load Balancer module exists in Terraform but is currently commented out (we moved to a supported region instead to avoid LB cost). It can be re-enabled later if subdomains or advanced routing are needed.
- The main site (`/`) acts as both a **marketing hub** and a **tool directory**.

Goal: Fast, private, no-sign-up, delightful micro-tools that remove daily friction for data engineers.

---

## 2. Current State (as of late 2026)

| Area                    | Status                                      | Notes |
|-------------------------|---------------------------------------------|-------|
| Landing Page            | Complete & modern                           | Filterable directory with search + categories |
| JSON Validator          | `/json-validator` (beta)                    | Live validation, repair via jsonrepair, tree view, samples |
| YAML Validator          | `/yaml-validator` (beta)                    | Live parsing with js-yaml, tree view, samples |
| GCloud Command Explorer | `/gcloud-explorer` (beta)                   | Interactive CLI explorer with live subcommand + flag suggestions |
| JSON ↔ YAML             | `/json-yaml` (beta)                         | Bidirectional converter with Pretty / Minified / One Line modes |
| CSV Explorer            | `/csv-explorer` (beta)                      | Data preview table, profiling, type overrides, BigQuery + dbt schema generation |
| SQL Formatter           | `/sql-formatter` (beta)                     | Pretty-print + Minify + One Line modes, multiple dialects (BigQuery, Postgres, Snowflake, etc.) |
| Hosting                 | Cloud Run (europe-west1)                    | Deployed via Terraform + GitHub Actions |
| DNS                     | Cloudflare                                  | Used for custom domains and future flexibility |
| Infrastructure          | Terraform (GCS remote state)                | Manages Cloud Run, Artifact Registry, IAM, OIDC |
| CI/CD                   | GitHub Actions (OIDC)                       | Deploys on push to `main` |
| Other tools             | Listed in `src/data/tools.ts`               | See the tools catalog |
| Design System           | Tailwind + custom classes                   | Dark mode via `prefers-color-scheme` |

---

## 3. Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS 3 + custom utilities in `globals.css`
- **Icons**: `lucide-react`
- **Key libraries**:
  - `jsonrepair` — forgiving JSON parsing (JSON Validator)
  - `js-yaml` — YAML parsing (YAML Validator)
  - `papaparse` — robust CSV parsing (CSV Explorer)
  - `sql-formatter` — SQL formatting with dialect + style options (SQL Formatter)
- No heavy component libraries (no shadcn/ui, no Radix yet)

**Important**: Keep the bundle light. The landing page should feel fast.

---

## 4. Code Organization

```
src/
├── app/
│   ├── layout.tsx              # Root layout + metadata
│   ├── page.tsx                # Main landing page (filterable tool directory)
│   ├── globals.css
│   └── [tool-name]/            # Individual tool pages (e.g. json-validator/, yaml-validator/, csv-explorer/)
│       └── page.tsx
├── components/
│   ├── Navbar.tsx              # Shared sticky navbar
│   ├── Hero.tsx, ToolCard.tsx, ToolFilters.tsx
│   └── DataTreeView.tsx        # Reusable tree viewer (used by JSON + YAML validators)
├── data/
│   └── tools.ts                # ← SINGLE SOURCE OF TRUTH for all tools
├── lib/
│   ├── csv.ts                  # CSV analysis, type inference, schema generators
│   └── gcloud.ts               # GCloud command tree + formatting helpers (GCloud Explorer)
```

**Infrastructure** lives in the `terraform/` directory (not under `src/`):
- Manages Cloud Run, Artifact Registry, IAM, and OIDC (Workload Identity Federation)
- A Load Balancer module exists but is currently commented out.

### Adding a New Tool — Recommended Flow

1. Add the tool definition in **`src/data/tools.ts`** (very important).
2. Create a new route: `src/app/your-tool/page.tsx`
3. (Optional) Create tool-specific components under `src/components/your-tool/`
4. For complex analysis/parsing logic, consider adding shared utilities under `src/lib/`
5. Update status from `"soon"` → `"beta"` → `"live"` as it matures.
6. Consider whether the tool belongs on the main domain or a subdomain.

---

## 5. Design & UX Philosophy

- **Private by default** — everything runs in the browser.
- **Fast feedback** — no loading spinners when possible.
- **Engineer taste** — clean typography, good dark mode, subtle interactions.
- **Data engineering flavor** — samples and features should feel relevant to people who work with dbt, Airflow, BigQuery, Snowflake, logs, pipelines, etc.
- **Progressive enhancement** — start simple, add power features (tree view, schema validation, etc.) over time.

**Styling conventions**:
- Use Tailwind utilities heavily.
- Custom component classes live in `globals.css` (e.g. `.tool-btn`, `.tool-card`).
- Dark mode classes should be explicit (`dark:`).

---

## 6. The Tools Catalog (`src/data/tools.ts`)

This file is the **single source of truth** for what tools exist and their status.

Every tool must have:
- `id`, `name`, `description`
- `category`, `tags`
- `icon` (lucide icon name)
- `href` (internal path or external URL)
- `status`: `"live" | "beta" | "soon"`

When you implement a tool, update its entry here.

---

## 7. Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build (must pass cleanly)
npm run lint         # Next.js linting
```

Always run `npm run build` before considering a feature complete.

---

## 8. Current Open Questions / Roadmap

- Add custom domain (`smathr.com` + `www.smathr.com`) via Cloud Run native mapping
- Improve type inference and schema quality in CSV Explorer
- Add more data engineering tools (Regex Sandbox was removed; more formatters/explorers planned)
- Consider adding light client-side transformations to CSV Explorer
- Re-enable Global Load Balancer + Cloud CDN if/when subdomains are needed
- Potential future: better shared component library between tools
- Personal branding / About section depth

See the landing page "Roadmap" section and `src/data/tools.ts` for the latest list of planned tools.

---

## 9. Important Notes for Agents

- Do **not** over-engineer. These are micro-tools — keep them delightful and focused.
- Prefer client-side solutions. Only introduce a backend if there's a very strong reason.
- When modifying the landing page, keep the tool grid fast and filterable.
- The user (Christopher) values quality and taste over feature bloat.
- Session-specific planning docs live in `.grok/sessions/...` — they are not part of the repo.

---

**Last updated**: 2026 — after adding GCloud Command Explorer, JSON ↔ YAML Converter, and SQL Formatter (with Pretty/Minified/One Line modes). Regex Sandbox placeholder was removed. Current stack: Terraform + GitHub Actions (OIDC) + Cloud Run (europe-west1) + Cloudflare DNS.

When making significant changes (new tools, infrastructure changes, Terraform updates, CI/CD changes), please update this file.
