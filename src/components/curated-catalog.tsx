import Link from "next/link";

import type { CatalogIndexRecord } from "@/lib/catalog-index";

type CuratedCatalogCardProps = {
  algorithms: CatalogIndexRecord[];
  ctaLabel: string;
  description: string;
  eyebrow: string;
  href: string;
  metricLabel: string;
  metricValue: string;
  title: string;
};

export function CuratedCatalogCard({
  algorithms,
  ctaLabel,
  description,
  eyebrow,
  href,
  metricLabel,
  metricValue,
  title,
}: CuratedCatalogCardProps) {
  return (
    <article className="glass-panel flex h-full flex-col rounded-[28px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
        </div>
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
          {metricValue} {metricLabel}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {algorithms.slice(0, 4).map((algorithm) => (
          <Link
            key={algorithm.slug}
            href={`/algorithms/${algorithm.slug}`}
            className="pill rounded-full px-3 py-1 text-xs font-medium hover:border-[var(--accent)]"
          >
            {algorithm.title}
          </Link>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-black/10 pt-4">
        <span className="text-sm text-[var(--muted)]">Curated route</span>
        <Link
          href={href}
          className="rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}

type CuratedCatalogDetailPageProps = {
  algorithms: CatalogIndexRecord[];
  backHref: string;
  backLabel: string;
  description: string;
  eyebrow: string;
  secondaryMetricLabel?: string;
  secondaryMetricValue?: string;
  title: string;
  typeLabel: string;
};

export function CuratedCatalogDetailPage({
  algorithms,
  backHref,
  backLabel,
  description,
  eyebrow,
  secondaryMetricLabel,
  secondaryMetricValue,
  title,
  typeLabel,
}: CuratedCatalogDetailPageProps) {
  return (
    <main className="shell-grid min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4 sm:py-8">
        <section className="glass-panel rounded-[36px] px-5 py-6 sm:px-8 sm:py-8">
          <Link
            href={backHref}
            className="inline-flex rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
          >
            {backLabel}
          </Link>
          <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">{eyebrow}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
                {description}
              </p>
            </div>
            <div className="grid gap-3 rounded-[28px] bg-white/70 p-4 sm:grid-cols-2 lg:min-w-[300px]">
              <Metric label="References" value={String(algorithms.length)} />
              <Metric label="Route Type" value={typeLabel} />
              {secondaryMetricLabel && secondaryMetricValue ? (
                <Metric label={secondaryMetricLabel} value={secondaryMetricValue} />
              ) : null}
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-[28px] p-5 sm:p-6">
          <div className="flex flex-col gap-3 border-b border-black/8 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Sequence</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                Follow the curated order
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
              Each entry links back to the full algorithm reference while preserving the broader path or collection framing.
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {algorithms.map((algorithm, index) => (
              <article key={algorithm.slug} className="rounded-[24px] bg-white/70 p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">{algorithm.title}</h3>
                  </div>
                  <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
                    {algorithm.difficulty}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{algorithm.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {algorithm.grouping.techniqueFamilies.slice(0, 3).map((family) => (
                    <span key={family} className="pill rounded-full px-3 py-1 text-xs font-medium">
                      {family}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/10 pt-4">
                  <span className="text-sm text-[var(--muted)]">
                    {algorithm.interviewFrequency} interview frequency
                  </span>
                  <Link
                    href={`/algorithms/${algorithm.slug}`}
                    className="rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
                  >
                    Open reference
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-[22px] bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-base font-semibold">{value}</p>
    </div>
  );
}