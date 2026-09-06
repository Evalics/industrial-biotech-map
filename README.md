# Industrial Biotech Company Map

Interactive landscape map of **industrial biotech and biomanufacturing** companies, curated by [Differential Bio](https://differential.bio). A static Vite + React site with no backend — the browser loads `public/map.json` generated at build time from curated YAML data.

## Quick start

```bash
npm install
npm run build:map   # generate public/map.json from data/
npm run dev         # local dev server at http://localhost:5173
```

Run everything (map + production bundle):

```bash
npm run build:all
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build:map` | Validate YAML, compute embeddings/layout, write `public/map.json` |
| `npm run build` | Typecheck + production bundle → `dist/` |
| `npm run build:all` | `build:map` then `build` |
| `npm test` | Vitest unit tests (schema + filters) |
| `npm run preview` | Serve production build locally |

## Adding a company

1. Create `data/companies/<id>.yaml` (filename must match `id`):

```yaml
id: example-co
name: Example Co
website: https://example.com
short_description: One-line description of what they do in industrial biotech (10–500 chars).
spaces:
  - bioprocess
  - strain_engineering
primary_space: bioprocess
hq_country: USA
sources:
  - url: https://example.com/about
    note: About page
```

**Required fields:** `id`, `name`, `website`, `short_description`, `spaces[]`, `primary_space`, `sources[]`  
**Optional:** `hq_country`, `embedding_text`, `highlight` (boolean; Differential Bio uses `highlight: true`)

`primary_space` must be one of the values in `spaces`. Taxonomy ids are defined in `data/taxonomy.yaml`.

2. Regenerate the map:

```bash
npm run build:map
```

3. Commit both the new YAML and updated `public/map.json`.

4. Verify:

```bash
npm test
npm run build
```

## Deploy

Build the static site and deploy the `dist/` folder to any static host (Netlify, Cloudflare Pages, GitHub Pages, S3 + CloudFront, etc.):

```bash
npm run build:all
```

Upload or point your host at `dist/`. Ensure `map.json` is served from the site root (Vite copies `public/` into `dist/` automatically).

## Architecture

```
data/companies/*.yaml  +  data/taxonomy.yaml
            │
            ▼
    scripts/build-map.ts
    (zod validate → bag-of-words embed → PCA 2D)
            │
            ▼
      public/map.json
            │
            ▼
   React SPA (fetch at runtime)
```

- **Layout:** deterministic bag-of-words embeddings + PCA; fixed `x,y` on nodes (no simulation drift).
- **Filters:** intersection on `spaces[]` chip selection + text search.
- **Node color:** `primary_space` from taxonomy.

## Design docs

See [`docs/superpowers/specs/2026-09-06-industrial-biotech-map-design.md`](docs/superpowers/specs/2026-09-06-industrial-biotech-map-design.md).

## License

Data attributions are in each company's `sources[]`. Code is provided as-is for Differential Bio's landscape map project.
