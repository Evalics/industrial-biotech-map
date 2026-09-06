# Industrial Biotech Company Map — Design Spec

**Date:** 2026-09-06  
**Owner:** Differential Bio  
**Status:** Approved

## Purpose

A static, browser-only landscape map of ~50–100 curated industrial biotech and biomanufacturing companies. Visitors explore companies by space (taxonomy), search, and pan/zoom on a full-bleed force-layout graph with fixed node positions derived at build time.

## Universe

Industrial biotech / biomanufacturing only — not pharma drug-discovery or general life-science tools unless they directly serve bioprocess, scale-up, or manufacturing.

## Architecture

```
data/companies/*.yaml  +  data/taxonomy.yaml
            │
            ▼
    scripts/build-map.ts
    (validate → embed → PCA 2D → write)
            │
            ▼
      public/map.json
            │
            ▼
   Vite + React SPA (fetch at runtime)
```

No backend, no API keys. Embeddings use deterministic bag-of-words + truncated SVD to 2D coordinates.

## Data Model

### Company YAML (authoritative fields)

| Field | Required | Notes |
|-------|----------|-------|
| `id` | yes | kebab-case slug |
| `name` | yes | display name |
| `website` | yes | canonical URL |
| `short_description` | yes | one-line blurb |
| `spaces` | yes | taxonomy ids (multi-label) |
| `primary_space` | yes | must be in `spaces` |
| `sources` | yes | `{ url, note? }[]` attribution |
| `hq_country` | no | ISO-ish country name |
| `embedding_text` | no | extra text for layout |
| `highlight` | no | `true` for Differential Bio |

### Taxonomy ids

`bioprocess`, `strain_engineering`, `lab_automation`, `ai_ml_bioprocess`, `software_lims_mes`, `downstream`, `media_inputs`, `analytical_qc`, `cdmo_scaleup`, `hardware_bioreactors`

### map.json output

```json
{
  "taxonomy": [{ "id", "label", "color" }],
  "companies": [{ …company fields, "x", "y" }],
  "meta": { "generated_at", "company_count", "embedding_model", "layout_method" }
}
```

## UI

- **Full-bleed map** — `react-force-graph-2d` with `d3AlphaDecay(1)` / fixed `fx,fy` so nodes do not drift.
- **Filter chips** — intersection filter on `spaces[]`; empty selection shows all.
- **Search** — substring match on name + description.
- **Legend** — color key by `primary_space`.
- **Detail panel** — slide-over desktop; bottom sheet on mobile. Shows description, spaces, HQ, website, sources.
- **Highlight** — Differential Bio rendered with larger node + ring.

## Build & Deploy

```bash
npm install
npm run build:map   # regenerate public/map.json
npm run build       # production bundle → dist/
npm run build:all   # both
```

Deploy `dist/` to any static host (Netlify, Cloudflare Pages, S3, etc.).

## Adding a Company

1. Create `data/companies/<id>.yaml` following the schema.
2. Run `npm run build:map`.
3. Commit YAML + regenerated `public/map.json`.
4. `npm run build` and deploy `dist/`.

## Non-Goals

Outreach tooling, admin CMS, live crawl, partnership edges, auth, Next.js, pharma drug-discovery universe.
