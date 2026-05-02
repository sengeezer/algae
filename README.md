# Algae

Algae is a quick algorithm reference tool built on Next.js App Router for Vercel deployment. The product is intentionally limited to JavaScript and TypeScript examples and is organized around how algorithms surface in coding assessments and software engineering interviews.

## Current Slice

- Search the catalog by algorithm name, data structure, technique, or interview-style phrasing.
- Browse algorithm reference pages with complexity notes, interview cues, and authored MDX study notes.
- Read JavaScript and TypeScript examples directly inside each algorithm entry.
- Review source lineage on expanded entries through per-entry implementation and study-reference metadata.
- Save or complete algorithms with local-first study state stored in the browser.
- The catalog currently includes 450 MDX-backed interview-core algorithms.

## Tech Stack

- Next.js 16 App Router with Turbopack
- TypeScript
- Tailwind CSS 4
- Filesystem MDX content with frontmatter and a content-source seam for future CMS support

## Development

Install dependencies if needed:

```bash
npm install
```

Run the development server:

```bash
npm run dev -- --port 3001
```

Then open `http://localhost:3001`.

Clean up stale repo-owned dev processes before restarting validation or after an interrupted session:

```bash
npm run cleanup:dev
```

Lint the project:

```bash
npm run lint
```

Run the official Playwright smoke check against a running local server:

```bash
npm run smoke:ui
```

The smoke check defaults to `http://localhost:3001`. Override it with `ALGAE_BASE_URL` if needed.

## Project Structure

```text
src/app/                         App Router entry points
src/app/algorithms/[slug]/       Algorithm detail routes
src/components/                  Catalog, MDX rendering, and study-state UI
src/content/algorithms/          MDX algorithm reference entries
src/lib/content-source.ts        Content repository seam
src/lib/catalog.ts               Search and filter logic
src/lib/study-state.ts           Local-first persistence adapter
src/types/algorithm.ts           Shared domain model
```

## Roadmap

- Expand the catalog from the current 450-entry core toward the broader launch target.
- Add richer MDX components for diagrams, callouts, and side-by-side example presentation.
- Add account-backed sync later without changing the study-state UI contract.

## Deployment

This repository is Vercel-ready. The current implementation does not require external services or environment variables for its first slice.
