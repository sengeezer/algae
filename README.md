# Algae

Algae is a quick algorithm reference tool built on Next.js App Router for Vercel deployment. The product is intentionally limited to JavaScript and TypeScript examples and is organized around how algorithms surface in coding assessments and software engineering interviews.

## Current Slice

- Search the catalog by algorithm name, data structure, technique, or interview-style phrasing.
- Browse typed reference pages with complexity notes, worked examples, follow-up questions, and pitfalls.
- Switch between JavaScript and TypeScript code examples on each algorithm page.
- Save or complete algorithms with local-first study state stored in the browser.

## Tech Stack

- Next.js 16 App Router with Turbopack
- TypeScript
- Tailwind CSS 4
- Static typed content with a content-source seam for future CMS support

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

Lint the project:

```bash
npm run lint
```

## Project Structure

```text
src/app/                         App Router entry points
src/app/algorithms/[slug]/       Algorithm detail routes
src/components/                  Catalog, code tabs, and study-state UI
src/content/algorithms.ts        Typed algorithm reference data
src/lib/content-source.ts        Content repository seam
src/lib/catalog.ts               Search and filter logic
src/lib/study-state.ts           Local-first persistence adapter
src/types/algorithm.ts           Shared domain model
```

## Roadmap

- Expand the catalog toward a curated core library of high-frequency interview algorithms.
- Replace the in-memory content source with MDX-backed entries behind the same repository boundary.
- Add account-backed sync later without changing the study-state UI contract.

## Deployment

This repository is Vercel-ready. The current implementation does not require external services or environment variables for its first slice.
