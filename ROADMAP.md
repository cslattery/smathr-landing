# Smathr Roadmap

This document tracks what has shipped and what is planned next. The live site focuses on available tools; future plans live here on GitHub.

## Shipped

- JSON Validator — live validation, repair, tree view
- YAML Validator — live parsing, tree view
- GCloud Command Explorer — interactive client-side gcloud command builder
- JSON ↔ YAML — bidirectional converter with Pretty / Minified / One Line modes
- CSV Explorer — data preview, profiling, BigQuery + dbt schema generation
- SQL Formatter — Pretty / Minified / One Line modes across multiple dialects
- Smathr CLI — `npx smathr` with validate, convert, format sql, and csv profile

## In progress

- Smathr CLI first tagged release with standalone binaries (macOS, Linux, Windows)
- Custom domain mapping for `smathr.com` via Cloud Run

## Planned

- Expand GCloud Command Explorer coverage (BigQuery, Cloud SQL, Artifact Registry, GKE, etc.)
- Improve CSV Explorer type inference and schema quality
- Light client-side transformations in CSV Explorer
- More formatters and explorers for daily data engineering work
- Re-enable Global Load Balancer + Cloud CDN if subdomains are needed again

## Ideas / backlog

- Parquet preview (client-side)
- Additional validation tools (schema-aware JSON/YAML)
- Shared component polish across tools

## How to suggest something

Open an issue on [github.com/cslattery/smathr-landing](https://github.com/cslattery/smathr-landing/issues) with the `enhancement` label.