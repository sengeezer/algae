import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CodeTabs } from "@/components/code-tabs";
import { StudyActions } from "@/components/study-actions";
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

            <CodeTabs variants={algorithm.codeVariants} />

            <section className="glass-panel rounded-[28px] p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Worked Examples
              </p>
              <div className="mt-4 grid gap-4">
                {algorithm.workedExamples.map((example) => (
                  <article key={example.title} className="rounded-[24px] bg-white/70 p-4">
                    <h2 className="text-xl font-semibold">{example.title}</h2>
                    <p className="mt-3 text-sm text-[var(--muted)]">
                      <span className="font-semibold text-[var(--foreground)]">Input:</span> {example.input}
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      <span className="font-semibold text-[var(--foreground)]">Output:</span> {example.output}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{example.explanation}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <StudyActions slug={algorithm.slug} />

            <section className="glass-panel rounded-[28px] p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Follow-up Questions
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
                {algorithm.followUps.map((followUp) => (
                  <li key={followUp} className="rounded-[20px] bg-white/70 px-4 py-3">
                    {followUp}
                  </li>
                ))}
              </ul>
            </section>

            <section className="glass-panel rounded-[28px] p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Common Pitfalls
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
                {algorithm.pitfalls.map((pitfall) => (
                  <li key={pitfall} className="rounded-[20px] bg-white/70 px-4 py-3">
                    {pitfall}
                  </li>
                ))}
              </ul>
            </section>
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