import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { AlgorithmMdx } from "@/components/algorithm-mdx";
import { StudyActions } from "@/components/study-actions";
import { extractMdxHeadings } from "@/lib/mdx-navigation";
import {
  getAlgorithmBySlug,
  listAlgorithms,
  listRelatedAlgorithms,
} from "@/lib/content-source";

type AlgorithmPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return listAlgorithms().map((algorithm) => ({ slug: algorithm.slug }));
}

export async function generateMetadata({ params }: AlgorithmPageProps): Promise<Metadata> {
  const { slug } = await params;
  const algorithm = getAlgorithmBySlug(slug);

  if (!algorithm) {
    return {
      title: "Algorithm Not Found",
    };
  }

  return {
    title: algorithm.title,
    description: algorithm.summary,
  };
}

export default async function AlgorithmPage({ params }: AlgorithmPageProps) {
  const { slug } = await params;
  const algorithm = getAlgorithmBySlug(slug);

  if (!algorithm) {
    notFound();
  }

  const relatedAlgorithms = listRelatedAlgorithms(algorithm.relatedSlugs);
  const mdxHeadings = extractMdxHeadings(algorithm.body);

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
          <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                {algorithm.category}
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                {algorithm.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
                {algorithm.description}
              </p>
            </div>
            <div className="grid gap-3 rounded-[28px] bg-white/70 p-4 sm:grid-cols-2 lg:min-w-[300px]">
              <Metric label="Time" value={algorithm.complexity.time} />
              <Metric label="Space" value={algorithm.complexity.space} />
              <Metric label="Difficulty" value={algorithm.difficulty} />
              <Metric label="Interview Frequency" value={algorithm.interviewFrequency} />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {algorithm.dataStructures.map((structure) => (
              <span key={structure} className="pill rounded-full px-3 py-1 text-sm text-[var(--muted)]">
                {structure}
              </span>
            ))}
            {algorithm.techniques.map((technique) => (
              <span key={technique} className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-medium text-[var(--accent-strong)]">
                {technique}
              </span>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <section className="glass-panel rounded-[28px] p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Interview Surface
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--foreground)] sm:text-base">
                {algorithm.interviewSignals.map((signal) => (
                  <li key={signal} className="rounded-[20px] bg-white/70 px-4 py-3">
                    {signal}
                  </li>
                ))}
              </ul>
            </section>

            <AlgorithmMdx source={algorithm.body} />
          </div>

          <div className="space-y-6">
            {mdxHeadings.length > 0 ? (
              <section className="glass-panel rounded-[28px] p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  On This Page
                </p>
                <nav className="mt-4 space-y-2">
                  {mdxHeadings.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className={`flex rounded-[18px] px-3 py-2 text-sm transition hover:bg-white/70 hover:text-[var(--foreground)] ${
                        heading.level === 3
                          ? "ml-3 text-[var(--muted)]"
                          : "bg-white/55 font-medium text-[var(--foreground)]"
                      }`}
                    >
                      {heading.title}
                    </a>
                  ))}
                </nav>
              </section>
            ) : null}

            <section className="glass-panel rounded-[28px] p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Quick Scan
              </p>
              <div className="mt-4 space-y-3">
                <CalloutCard label="Best fit" value={algorithm.summary} />
                <CalloutCard label="Watch for" value={algorithm.interviewSignals[0]} />
                <CalloutCard label="Boundary risk" value={algorithm.complexity.notes} />
              </div>
            </section>

            {algorithm.provenance.length > 0 ? (
              <section className="glass-panel rounded-[28px] p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  Source Lineage
                </p>
                <div className="mt-4 space-y-3">
                  {algorithm.provenance.map((source) => (
                    <a
                      key={`${source.kind}:${source.href}`}
                      href={source.href}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-[22px] bg-white/70 px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
                        {source.kind}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                        {source.title}
                      </p>
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            <StudyActions slug={algorithm.slug} />
          </div>
        </section>

        <section className="glass-panel rounded-[28px] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Search Vocabulary
              </p>
              <h2 className="mt-2 text-2xl font-semibold">How this algorithm tends to be phrased</h2>
            </div>
            <div className="max-w-xl text-sm leading-6 text-[var(--muted)]">
              {algorithm.complexity.notes}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {algorithm.useCases.concat(algorithm.aliases).map((token) => (
              <span key={token} className="pill rounded-full px-4 py-2 text-sm text-[var(--foreground)]">
                {token}
              </span>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-[28px] p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Related Algorithms
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {relatedAlgorithms.map((related) => (
              <Link
                key={related.slug}
                href={`/algorithms/${related.slug}`}
                className="rounded-[24px] bg-white/70 p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                  {related.category}
                </p>
                <h2 className="mt-2 text-xl font-semibold">{related.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{related.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

type CalloutCardProps = {
  label: string;
  value: string;
};

function CalloutCard({ label, value }: CalloutCardProps) {
  return (
    <div className="rounded-[22px] border border-black/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(255,243,221,0.9))] px-4 py-4 shadow-[0_20px_50px_-40px_rgba(184,92,56,0.75)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{value}</p>
    </div>
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