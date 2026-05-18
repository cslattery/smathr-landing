# AGENTS.md — Smathr Landing & Tools

This document provides essential context for AI agents (Grok, Claude, Cursor, etc.) working on the Smathr codebase.

---

## 1. Project Purpose

**Smathr** is a personal collection of lightweight, high-quality, **private, browser-based tools** built for data engineers.

The original vision was a simple landing page (`smathr.com`) that pointed to many data engineering utilities living on subdomains (`yaml-validator.smathr.com`, etc.).

**Current direction (2026)**:
- We follow a **hybrid model**:
  - Simple, client-only tools (validators, formatters, explorers) are built **inside this Next.js app** as first-class routes (`/json-validator`, `/yaml-validator`, etc.).
  - Heavier or backend-dependent tools may still live on subdomains.
- The main site (`/`) acts as both a **marketing hub** and a **tool directory**.

Goal: Fast, private, no-sign-up, delightful micro-tools that remove daily friction for data engineers.

---

## 2. Current State (as of May 2026)

| Area                    | Status                          | Notes |
|-------------------------|----------------------------------|-------|
| Landing Page            | Complete & modern               | Filterable directory with search + categories |
| JSON Validator          | Live at `/json-validator` (beta) | Full-featured: live validation, repair, tree view, samples |
| YAML Validator          | Planned                         | Next priority after JSON |
| Other tools             | Listed in roadmap               | See `src/data/tools.ts` |
| Design System           | Tailwind + custom classes       | Dark mode via `prefers-color-scheme` |

---

## 3. Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS 3 + custom utilities in `globals.css`
- **Icons**: `lucide-react`
- **Key libraries**:
  - `jsonrepair` — used heavily for forgiving JSON parsing
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
│   └── [tool-name]/            # Individual tool pages (e.g. json-validator/)
│       └── page.tsx
├── components/
│   ├── Navbar.tsx              # Shared sticky navbar
│   ├── Hero.tsx, ToolCard.tsx, ToolFilters.tsx
│   └── [tool-name]/            # Tool-specific components
│       └── JsonTreeView.tsx
├── data/
│   └── tools.ts                # ← SINGLE SOURCE OF TRUTH for all tools
```

### Adding a New Tool — Recommended Flow

1. Add the tool definition in **`src/data/tools.ts`** (very important).
2. Create a new route: `src/app/your-tool/page.tsx`
3. (Optional) Create tool-specific components under `src/components/your-tool/`
4. Update status from `"soon"` → `"beta"` → `"live"` as it matures.
5. Consider whether the tool belongs on the main domain or a subdomain.

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

- Full JSON Schema validation (AJV) in the JSON Validator
- YAML Validator implementation (high priority)
- Decide final hosting strategy for more complex tools
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

**Last updated**: May 2026 — after JSON Validator v1 launch.

When making significant changes, please update this file.
