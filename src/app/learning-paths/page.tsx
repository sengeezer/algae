import Link from "next/link";
import type { Metadata } from "next";

import { CuratedCatalogCard } from "@/components/curated-catalog";
import { listCatalogLearningPaths } from "@/lib/catalog-repository";

export const metadata: Metadata = {
  title: "Learning Paths",
  description:
    "Follow curated algorithm learning paths built from the database-backed Algae catalog.",
};

export default async function LearningPathsPage() {
  const learningPaths = await listCatalogLearningPaths();

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
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Learning Paths</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Practice in a deliberate sequence
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              These routes turn the database-backed catalog into guided progressions, so interview prep can start from a coherent path instead of a blank search box.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {learningPaths.map((path) => (
            <CuratedCatalogCard
              key={path.slug}
              algorithms={path.algorithms}
              ctaLabel="Open path"
              description={path.summary}
              eyebrow={path.primaryTopic}
              href={`/learning-paths/${path.slug}`}
              metricLabel="refs"
              metricValue={String(path.algorithms.length)}
              title={path.title}
            />
          ))}
        </section>
      </div>
    </main>
  );
}