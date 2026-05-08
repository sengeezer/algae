# Algae

Algae is a quick algorithm reference tool built on Next.js App Router for Vercel deployment. The product is intentionally limited to JavaScript and TypeScript examples and is organized around how algorithms surface in coding assessments and software engineering interviews.

## Current Slice

- Search the catalog by algorithm name, data structure, technique, or interview-style phrasing.
- Browse the catalog by normalized primary topic groups with a topic navigator in the UI.
- Browse algorithm reference pages with complexity notes, interview cues, and authored MDX study notes.
- Read JavaScript and TypeScript examples directly inside each algorithm entry.
- Review source lineage on expanded entries through per-entry implementation and study-reference metadata.
- Save or complete algorithms with local-first study state stored in the browser.
- Seed a Neon-backed catalog index, learning paths, and interview collections while keeping MDX as the editorial source of truth.
- Surface database-backed learning paths and collections directly on the home page as curated browse entry points.
- Open dedicated learning-path and collection routes for richer guided browsing beyond the home-page cards.
- Review and mutate the Postgres-backed editorial queue from an in-app `/editorial/queue` workflow with password-gated access and inline action feedback.
- The catalog currently includes 790 MDX-backed interview-core algorithms.

## Tech Stack

- Next.js 16 App Router with Turbopack
- TypeScript
- Tailwind CSS 4
- Filesystem MDX content with frontmatter and a content-source seam for database-backed catalog indexing
- Neon serverless Postgres for the catalog index foundation on Vercel

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

Set up or refresh the catalog database schema:

```bash
npm run db:catalog:migrate
```

Seed the catalog index, learning paths, and interview collections from the current MDX corpus:

```bash
npm run db:catalog:seed
```

Inspect the indexed row count and topic distribution:

```bash
npm run db:catalog:inspect
```

Import the latest actionable expansion queue from `catalog-expansion.md` into `editorial_source_queue`:

```bash
npm run db:queue:import-current
```

List the current database-backed editorial queue:

```bash
npm run db:queue:list
```

Move a queue row into drafted, published, or duplicate state by its `#id` from `npm run db:queue:list`:

```bash
npm run db:queue:mark-drafted -- --id 1 --notes "Drafting started"
npm run db:queue:mark-published -- --id 1 --candidate-slug program-to-calculate-value-of-npr --notes "Published in batch 166"
npm run db:queue:mark-duplicate -- --id 1 --duplicate-of binomial-coefficient --notes "Covered semantically already"
```

Use the generic updater when you need to move a row back to `queued` or set metadata in one step:

```bash
npm run db:queue:update -- queued --id 1 --notes "Imported from catalog-expansion.md latest next clean queue."
```

If you prefer to review and mutate the queue in the app, open `/editorial/queue` while the dev server is running.

The in-app queue route is protected by `EDITORIAL_QUEUE_PASSWORD`. Set that variable locally and in Vercel before using `/editorial/queue`.

Run the official Playwright smoke check against a running local server:

```bash
npm run smoke:ui
```

The smoke check defaults to `http://localhost:3001`. Override it with `ALGAE_BASE_URL` if needed.

For the database scripts, set either `DATABASE_URL` or `POSTGRES_URL` in your local environment. To unlock the in-app editorial route, also set `EDITORIAL_QUEUE_PASSWORD`. The current application still renders detail pages from MDX and uses the database as the new catalog-index foundation for browse/search, curated learning paths, collections, and the active editorial queue. `catalog-expansion.md` remains the long-form research and publish log.

## Project Structure

```text
db/migrations/                   SQL schema for the catalog index foundation
scripts/                         Cleanup, smoke tests, and catalog database workflows
src/app/                         App Router entry points
src/app/algorithms/[slug]/       Algorithm detail routes
src/app/collections/             Collection overview and detail routes
src/app/editorial/queue/         In-app editorial queue review and mutation UI
src/app/learning-paths/          Learning-path overview and detail routes
src/components/                  Catalog, MDX rendering, and study-state UI
src/content/algorithms/          MDX algorithm reference entries
src/lib/catalog-index.ts         Database-ready catalog index records, learning paths, and collections
src/lib/catalog-repository.ts    Database-backed catalog index seam with filesystem fallback
src/lib/content-source.ts        Content repository seam
src/lib/database.ts              Neon connection helpers
src/lib/editorial-queue.ts       Shared editorial queue import/list/update helpers
src/lib/catalog.ts               Search and filter logic
src/lib/study-state.ts           Local-first persistence adapter
src/types/algorithm.ts           Shared domain model
```

## Roadmap

- Expand the catalog from the current 790-entry core toward the broader launch target.
- Add authentication and permissions around the editorial queue once the workflow moves beyond single-operator use.
- Continue replacing the remaining markdown-driven expansion process with more structured source-queue records and in-app review tooling.
- Add richer MDX components for diagrams, callouts, and side-by-side example presentation.
- Add account-backed sync later without changing the study-state UI contract.

## Deployment

This repository is Vercel-ready. The current implementation can still run without a database, but the new catalog-index foundation is designed for a Neon-backed Postgres deployment on Vercel using `DATABASE_URL` or `POSTGRES_URL`.
