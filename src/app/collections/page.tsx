import Link from "next/link";
import type { Metadata } from "next";

import { CuratedCatalogCard } from "@/components/curated-catalog";
import { listCatalogCollections } from "@/lib/catalog-repository";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Browse interview-focused algorithm collections built from the database-backed Algae catalog.",
};

export default async function CollectionsPage() {
  const collections = await listCatalogCollections();

  return (
    <main className="shell-grid min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4 sm:py-8">
        <section className="glass-panel rounded-[36px] px-5 py-6 sm:px-8 sm:py-8">
          <Link
            href="/"
            className="inline-flex rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
          >
            Back to catalog
          </Link>
          <div className="mt-6 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Collections</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Open a tighter practice set
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              Collections group the same database-backed references into smaller revision slices, making it easier to focus on high-frequency and high-pressure rounds.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {collections.map((collection) => (
            <CuratedCatalogCard
              key={collection.slug}
              algorithms={collection.algorithms}
              ctaLabel="Open collection"
              description={collection.summary}
              eyebrow="Interview Collection"
              href={`/collections/${collection.slug}`}
              metricLabel="refs"
              metricValue={String(collection.algorithms.length)}
              title={collection.title}
            />
          ))}
        </section>
      </div>
    </main>
  );
}