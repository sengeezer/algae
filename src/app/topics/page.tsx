import Link from "next/link";
import type { Metadata } from "next";

import { CuratedCatalogCard } from "@/components/curated-catalog";
import { describeTopicBrowseShelf, getTopicBrowseShelves } from "@/lib/catalog-browse";

export const metadata: Metadata = {
  title: "Primary Topics",
  description:
    "Browse the Algae catalog by primary topic when you want a broader interview-prep lane than a single category.",
};

export default async function TopicsPage() {
  const shelves = await getTopicBrowseShelves();

  return (
    <main className="shell-grid min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4 sm:py-8">
        <section className="glass-panel rounded-[36px] px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
            >
              Back to catalog
            </Link>
            <Link
              href="/categories"
              className="pill inline-flex rounded-full px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
            >
              Open category directory
            </Link>
          </div>
          <div className="mt-6 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Primary Topics</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Stay inside one broader domain
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              Topic routes keep adjacent categories together, which is useful when the prompt is still fuzzy but you know you want to stay inside graphs, dynamic programming, geometry, or another larger domain.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {shelves.map((shelf) => (
            <CuratedCatalogCard
              key={shelf.slug}
              algorithms={shelf.algorithms}
              ctaLabel="Open topic"
              description={describeTopicBrowseShelf(shelf)}
              eyebrow="Primary Topic"
              href={`/topics/${shelf.slug}`}
              metricLabel="refs"
              metricValue={String(shelf.algorithms.length)}
              title={shelf.topic}
            />
          ))}
        </section>
      </div>
    </main>
  );
}