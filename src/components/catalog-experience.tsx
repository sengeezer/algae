"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { buildCatalogQueryString, filterAlgorithms } from "@/lib/catalog";
import {
  getStudyStateServerSnapshot,
  getStudyMarker,
  isReviewDue,
  readStudyState,
  subscribeToStudyState,
  toggleStudyFlag,
  writeStudyState,
} from "@/lib/study-state";
import type { AlgorithmEntry, CatalogFilters } from "@/types/algorithm";

type CatalogExperienceProps = {
  algorithms: AlgorithmEntry[];
  dataStructures: string[];
  initialFilters: CatalogFilters;
  techniques: string[];
};

export function CatalogExperience({
  algorithms,
  dataStructures,
  initialFilters,
  techniques,
}: CatalogExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hasMounted = useRef(false);
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters);
  const deferredQuery = useDeferredValue(filters.query);
  const studyState = useSyncExternalStore(
    subscribeToStudyState,
    readStudyState,
    getStudyStateServerSnapshot,
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const queryString = buildCatalogQueryString(filters);
    const href = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }, [filters, pathname, router]);

  const filteredAlgorithms = filterAlgorithms(
    algorithms,
    { ...filters, query: deferredQuery },
    studyState,
  );

  const studyEntries = algorithms.map((algorithm) => ({
    algorithm,
    marker: getStudyMarker(studyState, algorithm.slug),
  }));

  const bookmarkedCount = studyEntries.filter(({ marker }) => marker.bookmarked).length;
  const completedCount = studyEntries.filter(({ marker }) => marker.completed).length;
  const dueReviewCount = studyEntries.filter(
    ({ marker }) => marker.bookmarked && isReviewDue(marker),
  ).length;
  const practiceQueue = studyEntries
    .filter(({ marker }) => marker.bookmarked && !marker.completed)
    .sort((left, right) => {
      const leftDueRank = isReviewDue(left.marker) ? 0 : 1;
      const rightDueRank = isReviewDue(right.marker) ? 0 : 1;

      if (leftDueRank !== rightDueRank) {
        return leftDueRank - rightDueRank;
      }

      const leftReviewedAt = left.marker.lastReviewedAt
        ? new Date(left.marker.lastReviewedAt).getTime()
        : 0;
      const rightReviewedAt = right.marker.lastReviewedAt
        ? new Date(right.marker.lastReviewedAt).getTime()
        : 0;

      if (leftReviewedAt !== rightReviewedAt) {
        return leftReviewedAt - rightReviewedAt;
      }

      return left.algorithm.title.localeCompare(right.algorithm.title);
    })
    .slice(0, 4);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 py-4 sm:py-8">
      <section className="glass-panel overflow-hidden rounded-[36px] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
              Quick Algorithm Reference
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Search interview algorithms the way prompts actually surface.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              Algae keeps the catalog centered on JavaScript and TypeScript, with searchable data structures, worked examples, and cues for how questions show up in software engineering interviews.
            </p>
          </div>
          <div className="grid min-w-full gap-3 sm:grid-cols-2 lg:min-w-[420px] lg:max-w-xl xl:grid-cols-4">
            <div className="rounded-[24px] bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Algorithms</p>
              <p className="mt-2 text-3xl font-semibold">{algorithms.length}</p>
            </div>
            <div className="rounded-[24px] bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Saved</p>
              <p className="mt-2 text-3xl font-semibold">{bookmarkedCount}</p>
            </div>
            <div className="rounded-[24px] bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Completed</p>
              <p className="mt-2 text-3xl font-semibold">{completedCount}</p>
            </div>
            <div className="rounded-[24px] bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Due Today</p>
              <p className="mt-2 text-3xl font-semibold">{dueReviewCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[32px] px-5 py-5 sm:px-7 sm:py-6">
        <div className="grid gap-4 lg:grid-cols-[2fr_repeat(4,minmax(0,1fr))]">
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Search</span>
            <input
              value={filters.query}
              onChange={(event) =>
                setFilters((current) => ({ ...current, query: event.target.value }))
              }
              placeholder="Try matrix, shortest path, or rules of tic tac toe"
              className="rounded-[20px] border border-black/10 bg-white px-4 py-3 outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
            />
          </label>
          <FilterSelect
            label="Data Structure"
            options={dataStructures}
            value={filters.structure}
            onChange={(value) => setFilters((current) => ({ ...current, structure: value }))}
          />
          <FilterSelect
            label="Technique"
            options={techniques}
            value={filters.technique}
            onChange={(value) => setFilters((current) => ({ ...current, technique: value }))}
          />
          <FilterSelect
            label="Difficulty"
            options={["Easy", "Medium", "Hard"]}
            value={filters.difficulty}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                difficulty: value as CatalogFilters["difficulty"],
              }))
            }
          />
          <FilterSelect
            label="Study State"
            options={["all", "bookmarked", "completed"]}
            value={filters.status}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                status: value as CatalogFilters["status"],
              }))
            }
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Catalog</p>
              <h2 className="mt-1 text-2xl font-semibold">
                {filteredAlgorithms.length} matches ready to scan
              </h2>
            </div>
            <button
              type="button"
              onClick={() =>
                setFilters({
                  query: "",
                  structure: "",
                  technique: "",
                  difficulty: "",
                  status: "all",
                })
              }
              className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium transition hover:border-[var(--accent)]"
            >
              Clear filters
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredAlgorithms.map((algorithm) => {
              const marker = getStudyMarker(studyState, algorithm.slug);

              return (
                <article
                  key={algorithm.slug}
                  className="glass-panel flex h-full flex-col rounded-[28px] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                        {algorithm.category}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                        {algorithm.title}
                      </h3>
                    </div>
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
                      {algorithm.difficulty}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {algorithm.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-[var(--muted)]">
                    {algorithm.dataStructures.map((structure) => (
                      <span key={structure} className="pill rounded-full px-3 py-1">
                        {structure}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 space-y-2 text-sm text-[var(--foreground)]">
                    <p>
                      <span className="font-semibold">Time:</span> {algorithm.complexity.time}
                    </p>
                    <p>
                      <span className="font-semibold">Interview use:</span>{" "}
                      {algorithm.interviewSignals[0]}
                    </p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        writeStudyState(
                          toggleStudyFlag(readStudyState(), algorithm.slug, "bookmarked"),
                        )
                      }
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        marker.bookmarked
                          ? "bg-[var(--accent)] text-white"
                          : "pill hover:border-[var(--accent)]"
                      }`}
                    >
                      {marker.bookmarked ? "Saved" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        writeStudyState(
                          toggleStudyFlag(readStudyState(), algorithm.slug, "completed"),
                        )
                      }
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        marker.completed
                          ? "bg-[var(--accent-strong)] text-white"
                          : "pill hover:border-[var(--accent)]"
                      }`}
                    >
                      {marker.completed ? "Completed" : "Mark complete"}
                    </button>
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-black/10 pt-4">
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
              );
            })}
          </div>
        </div>

        <aside className="flex h-fit flex-col gap-4">
          <section className="glass-panel rounded-[28px] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
              Practice Queue
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Keep review momentum</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Saved references stay local-first, and anything due for review rises to the top of the queue.
            </p>
            {practiceQueue.length > 0 ? (
              <div className="mt-4 space-y-3">
                {practiceQueue.map(({ algorithm, marker }) => (
                  <Link
                    key={algorithm.slug}
                    href={`/algorithms/${algorithm.slug}`}
                    className="block rounded-[22px] bg-white/70 p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                          {algorithm.category}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold">{algorithm.title}</h3>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                          isReviewDue(marker)
                            ? "bg-[var(--accent)] text-white"
                            : "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                        }`}
                      >
                        {getQueueLabel(marker)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{algorithm.summary}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                      {marker.reviewCount > 0
                        ? `${marker.reviewCount} reviews logged`
                        : "First review not logged yet"}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-[22px] bg-white/70 p-4 text-sm leading-6 text-[var(--muted)]">
                Save algorithms from the catalog to build a lightweight practice queue.
              </div>
            )}
          </section>

          <section className="glass-panel rounded-[28px] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
              Search Notes
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Prompt-aware indexing</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
              <li>Search reads aliases, use cases, interview signals, and taxonomy fields, not titles alone.</li>
              <li>Data-structure filters are explicit so prompts like matrix or queue collapse the catalog quickly.</li>
              <li>Study-state filters stay local-first for now, but the state model is isolated for future account sync.</li>
            </ul>
          </section>
        </aside>
      </section>
    </div>
  );
}

function formatReviewDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getQueueLabel(marker: ReturnType<typeof getStudyMarker>): string {
  if (isReviewDue(marker)) {
    return "Due now";
  }

  if (marker.nextReviewAt) {
    return `Next ${formatReviewDate(marker.nextReviewAt)}`;
  }

  return "New";
}

type FilterSelectProps = {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
};

function FilterSelect({ label, onChange, options, value }: FilterSelectProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-[20px] border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}