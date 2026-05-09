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

import { groupAlgorithmsByPrimaryTopic } from "@/lib/catalog-taxonomy";
import { buildCatalogQueryString, filterAlgorithms } from "@/lib/catalog";
import {
  type CatalogCollection,
  type CatalogLearningPath,
} from "@/lib/catalog-index";
import {
  getStudyStateServerSnapshot,
  getStudyMarker,
  isReviewDue,
  readStudyState,
  subscribeToStudyState,
  toggleStudyFlag,
  type StudyState,
  writeStudyState,
} from "@/lib/study-state";
import type {
  AlgorithmCatalogEntry,
  CatalogFilters,
  CatalogPrimaryTopic,
} from "@/types/algorithm";

type CatalogExperienceProps = {
  algorithms: AlgorithmCatalogEntry[];
  categories: string[];
  collections: CatalogCollection[];
  dataStructures: string[];
  initialFilters: CatalogFilters;
  learningPaths: CatalogLearningPath[];
  primaryTopics: CatalogPrimaryTopic[];
  techniques: string[];
};

type CatalogBrowseMode = "category" | "topic";

export function CatalogExperience({
  algorithms,
  categories,
  collections,
  dataStructures,
  initialFilters,
  learningPaths,
  primaryTopics,
  techniques,
}: CatalogExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hasMounted = useRef(false);
  const [browseMode, setBrowseMode] = useState<CatalogBrowseMode>(
    initialFilters.category ? "category" : initialFilters.topic ? "topic" : "category",
  );
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
  const groupedTopicAlgorithms = groupAlgorithmsByPrimaryTopic(filteredAlgorithms);
  const groupedCategoryAlgorithms = groupAlgorithmsByCategory(filteredAlgorithms);
  const shouldGroupCatalog = deferredQuery.trim().length === 0;
  const topicCounts = groupedTopicAlgorithms.map((group) => ({
    topic: group.primaryTopic,
    count: group.algorithms.length,
  }));
  const categoryCounts = groupedCategoryAlgorithms.map((group) => ({
    category: group.category,
    count: group.algorithms.length,
  }));
  const activeFilterChips = getActiveFilterChips(filters);
  const visibleGroupCount =
    browseMode === "category" ? groupedCategoryAlgorithms.length : groupedTopicAlgorithms.length;

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

  function focusCategory(category: string) {
    setBrowseMode("category");
    setFilters((current) => ({
      ...current,
      category: current.category === category ? "" : category,
      topic: "",
    }));
  }

  function focusTopic(topic: CatalogPrimaryTopic) {
    setBrowseMode("topic");
    setFilters((current) => ({
      ...current,
      category: "",
      topic: current.topic === topic ? "" : topic,
    }));
  }

  function clearShelfFocus() {
    setFilters((current) => ({
      ...current,
      category: "",
      topic: "",
    }));
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 py-4 sm:py-8">
      <section className="glass-panel overflow-hidden rounded-[36px] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
              Catalog Workspace
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Browse interview algorithms by category before you search line by line.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              With {algorithms.length} references in play, the fastest way into the catalog is a shelf, not a flat list. Start from categories, swap to broader primary topics when the prompt is still fuzzy, and only then narrow by technique, structure, or study state.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/categories"
                className="rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
              >
                Category routes
              </Link>
              <Link
                href="/topics"
                className="pill rounded-full px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
              >
                Topic routes
              </Link>
              <a
                href="#browse-atlas"
                className="pill rounded-full px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
              >
                Browse atlas
              </a>
              <a
                href="#catalog-results"
                className="pill rounded-full px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
              >
                Catalog shelves
              </a>
              <a
                href="#practice-queue"
                className="pill rounded-full px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
              >
                Practice queue
              </a>
            </div>
          </div>
          <div className="grid min-w-full gap-3 sm:grid-cols-2 lg:min-w-[420px] lg:max-w-xl xl:grid-cols-4">
            <div className="rounded-[24px] bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Algorithms</p>
              <p className="mt-2 text-3xl font-semibold">{algorithms.length}</p>
            </div>
            <div className="rounded-[24px] bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Categories</p>
              <p className="mt-2 text-3xl font-semibold">{categories.length}</p>
            </div>
            <div className="rounded-[24px] bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Primary Topics</p>
              <p className="mt-2 text-3xl font-semibold">{primaryTopics.length}</p>
            </div>
            <div className="rounded-[24px] bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Due Today</p>
              <p className="mt-2 text-3xl font-semibold">{dueReviewCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="browse-atlas"
        className="glass-panel rounded-[36px] px-5 py-6 sm:px-8 sm:py-8"
      >
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Browse Atlas</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              {browseMode === "category"
                ? "Start from concrete categories"
                : "Switch to broader primary topics"}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
              {browseMode === "category"
                ? "Categories are the fastest way to split a catalog this large into recognisable shelves. Use them when you already know the problem family you want to study."
                : "Primary topics group related categories into broader lanes. Use them when you want to stay in one domain but still compare multiple problem families side by side."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setBrowseMode("category")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                browseMode === "category"
                  ? "bg-[var(--accent)] text-white"
                  : "pill hover:border-[var(--accent)]"
              }`}
            >
              Category shelves
            </button>
            <button
              type="button"
              onClick={() => setBrowseMode("topic")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                browseMode === "topic"
                  ? "bg-[var(--accent)] text-white"
                  : "pill hover:border-[var(--accent)]"
              }`}
            >
              Primary topics
            </button>
            {filters.category || filters.topic ? (
              <button
                type="button"
                onClick={clearShelfFocus}
                className="pill rounded-full px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
              >
                Reset shelf
              </button>
            ) : null}
          </div>
        </div>
        {filteredAlgorithms.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {browseMode === "category"
              ? groupedCategoryAlgorithms.slice(0, 8).map((group) => (
                  <button
                    key={group.category}
                    type="button"
                    onClick={() => focusCategory(group.category)}
                    className={`rounded-[28px] border px-5 py-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                      filters.category === group.category
                        ? "border-[var(--accent)] bg-[linear-gradient(160deg,rgba(223,242,229,0.88),rgba(255,255,255,0.92))]"
                        : "border-black/10 bg-white/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                          Category
                        </p>
                        <h3 className="mt-2 text-xl font-semibold">{group.category}</h3>
                      </div>
                      <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
                        {group.algorithms.length} refs
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                      {group.primaryTopics.slice(0, 3).join(" · ")}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {group.techniqueFamilies.slice(0, 3).map((family) => (
                        <span
                          key={family}
                          className="pill rounded-full px-3 py-1 text-xs font-medium"
                        >
                          {family}
                        </span>
                      ))}
                    </div>
                  </button>
                ))
              : groupedTopicAlgorithms.map((group) => {
                  const sampledCategories = uniqueValues(
                    group.algorithms.map((algorithm) => algorithm.category),
                  ).slice(0, 3);

                  return (
                    <button
                      key={group.primaryTopic}
                      type="button"
                      onClick={() => focusTopic(group.primaryTopic)}
                      className={`rounded-[28px] border px-5 py-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                        filters.topic === group.primaryTopic
                          ? "border-[var(--accent)] bg-[linear-gradient(160deg,rgba(223,242,229,0.88),rgba(255,255,255,0.92))]"
                          : "border-black/10 bg-white/70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                            Primary topic
                          </p>
                          <h3 className="mt-2 text-xl font-semibold">{group.primaryTopic}</h3>
                        </div>
                        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
                          {group.algorithms.length} refs
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                        {sampledCategories.join(" · ")}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {uniqueValues(
                          group.algorithms.flatMap((algorithm) => algorithm.grouping.techniqueFamilies),
                        )
                          .slice(0, 3)
                          .map((family) => (
                            <span
                              key={family}
                              className="pill rounded-full px-3 py-1 text-xs font-medium"
                            >
                              {family}
                            </span>
                          ))}
                      </div>
                    </button>
                  );
                })}
          </div>
        ) : (
          <div className="mt-6 rounded-[24px] bg-white/70 p-5 text-sm leading-6 text-[var(--muted)]">
            No shelves match the current filters. Clear one or two filters to widen the browse surface again.
          </div>
        )}
      </section>

      <section className="glass-panel rounded-[32px] px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                Narrow The Shelf
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Search inside the current browse lane</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Category or topic picks decide the shelf. Structure, technique, difficulty, and study-state filters narrow within that shelf without collapsing the broader browse model.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.7fr_repeat(6,minmax(0,1fr))]">
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
            label="Category"
            options={categories}
            value={filters.category}
            onChange={(value) => {
              setBrowseMode("category");
              setFilters((current) => ({
                ...current,
                category: value,
                topic: value ? "" : current.topic,
              }));
            }}
          />
          <FilterSelect
            label="Topic"
            options={primaryTopics}
            value={filters.topic}
            onChange={(value) => {
              setBrowseMode("topic");
              setFilters((current) => ({
                ...current,
                category: value ? "" : current.category,
                topic: value as CatalogFilters["topic"],
              }));
            }}
          />
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
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <div id="catalog-results" className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                  Catalog Shelves
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {filteredAlgorithms.length} matches across {visibleGroupCount}{" "}
                  {browseMode === "category" ? "categories" : "primary topics"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBrowseMode("category");
                  setFilters({
                    query: "",
                    category: "",
                    topic: "",
                    structure: "",
                    technique: "",
                    difficulty: "",
                    status: "all",
                  });
                }}
                className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium transition hover:border-[var(--accent)]"
              >
                Clear filters
              </button>
            </div>
            {activeFilterChips.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {activeFilterChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent-strong)]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-[var(--muted)]">
                Use the browse atlas to pick a shelf, then stack filters only when you need a tighter scan.
              </p>
            )}
          </div>
          {filteredAlgorithms.length === 0 ? (
            <div className="glass-panel rounded-[28px] p-6 text-sm leading-7 text-[var(--muted)]">
              No references match the current combination of shelf focus and filters. Clear one of the active chips above to reopen the catalog surface.
            </div>
          ) : shouldGroupCatalog ? (
            <div className="space-y-8">
              {browseMode === "category"
                ? groupedCategoryAlgorithms.map((group) => (
                    <section key={group.category} id={getCategorySectionId(group.category)}>
                      <div className="mb-4 flex flex-col gap-3 border-b border-black/10 px-1 pb-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                            Category
                          </p>
                          <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">
                            {group.category}
                          </h3>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {group.primaryTopics.slice(0, 4).map((topic) => (
                              <span key={topic} className="pill rounded-full px-3 py-1 text-xs font-medium">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-[var(--muted)]">
                          {group.algorithms.length} algorithms
                        </span>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {group.algorithms.map((algorithm) => (
                          <CatalogCard
                            key={algorithm.slug}
                            algorithm={algorithm}
                            studyState={studyState}
                          />
                        ))}
                      </div>
                    </section>
                  ))
                : groupedTopicAlgorithms.map((group) => (
                    <section key={group.primaryTopic} id={getTopicSectionId(group.primaryTopic)}>
                      <div className="mb-4 flex flex-col gap-3 border-b border-black/10 px-1 pb-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                            Primary topic
                          </p>
                          <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">
                            {group.primaryTopic}
                          </h3>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {uniqueValues(group.algorithms.map((algorithm) => algorithm.category))
                              .slice(0, 4)
                              .map((category) => (
                                <span
                                  key={category}
                                  className="pill rounded-full px-3 py-1 text-xs font-medium"
                                >
                                  {category}
                                </span>
                              ))}
                          </div>
                        </div>
                        <span className="text-sm text-[var(--muted)]">
                          {group.algorithms.length} algorithms
                        </span>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {group.algorithms.map((algorithm) => (
                          <CatalogCard
                            key={algorithm.slug}
                            algorithm={algorithm}
                            studyState={studyState}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredAlgorithms.map((algorithm) => (
                <CatalogCard key={algorithm.slug} algorithm={algorithm} studyState={studyState} />
              ))}
            </div>
          )}
        </div>

        <aside className="flex h-fit flex-col gap-4">
          <section className="glass-panel rounded-[28px] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
              Browse Navigator
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {browseMode === "category"
                ? "Jump between category shelves"
                : "Jump between primary topics"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {browseMode === "category"
                ? "Category shelves are the most concrete browse surface. Use them when the problem family is already clear."
                : "Primary topics stay broader and help when you want one domain without locking yourself into a single category."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/categories"
                className="pill rounded-full px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
              >
                Open category directory
              </Link>
              <Link
                href="/topics"
                className="pill rounded-full px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
              >
                Open topic directory
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {browseMode === "category"
                ? categoryCounts.map(({ category, count }) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => focusCategory(category)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        filters.category === category
                          ? "bg-[var(--accent)] text-white"
                          : "pill hover:border-[var(--accent)]"
                      }`}
                    >
                      {category} · {count}
                    </button>
                  ))
                : topicCounts.map(({ topic, count }) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => focusTopic(topic)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        filters.topic === topic
                          ? "bg-[var(--accent)] text-white"
                          : "pill hover:border-[var(--accent)]"
                      }`}
                    >
                      {topic} · {count}
                    </button>
                  ))}
            </div>
            {shouldGroupCatalog && filteredAlgorithms.length > 0 ? (
              <div className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted)]">
                {browseMode === "category"
                  ? groupedCategoryAlgorithms.map((group) => (
                      <a
                        key={group.category}
                        href={`#${getCategorySectionId(group.category)}`}
                        className="block rounded-[18px] bg-white/70 px-3 py-2 transition hover:bg-white"
                      >
                        {group.category}
                      </a>
                    ))
                  : groupedTopicAlgorithms.map((group) => (
                      <a
                        key={group.primaryTopic}
                        href={`#${getTopicSectionId(group.primaryTopic)}`}
                        className="block rounded-[18px] bg-white/70 px-3 py-2 transition hover:bg-white"
                      >
                        {group.primaryTopic}
                      </a>
                    ))}
              </div>
            ) : null}
          </section>

          <section className="glass-panel rounded-[28px] p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                  Learning Paths
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Start from a curated sequence</h2>
              </div>
              <Link
                href="/learning-paths"
                className="text-sm font-medium text-[var(--accent-strong)] transition hover:text-[var(--foreground)]"
              >
                View all
              </Link>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              These DB-backed paths group references in a deliberate order so the catalog reads like a study track instead of a flat list.
            </p>
            <div className="mt-4 space-y-3">
              {learningPaths.map((path) => (
                <article key={path.slug} className="rounded-[22px] bg-white/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                        {path.primaryTopic}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">{path.title}</h3>
                    </div>
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                      {path.algorithms.length} refs
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{path.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {path.algorithms.slice(0, 3).map((algorithm) => (
                      <Link
                        key={algorithm.slug}
                        href={`/algorithms/${algorithm.slug}`}
                        className="pill rounded-full px-3 py-1 text-xs font-medium hover:border-[var(--accent)]"
                      >
                        {algorithm.title}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end border-t border-black/10 pt-4">
                    <Link
                      href={`/learning-paths/${path.slug}`}
                      className="rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
                    >
                      Open path
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-[28px] p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                  Collections
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Practice with tighter slices</h2>
              </div>
              <Link
                href="/collections"
                className="text-sm font-medium text-[var(--accent-strong)] transition hover:text-[var(--foreground)]"
              >
                View all
              </Link>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Collections give the browse surface a few opinionated entry points for revision-heavy and interview-heavy rounds.
            </p>
            <div className="mt-4 space-y-3">
              {collections.map((collection) => (
                <article key={collection.slug} className="rounded-[22px] bg-white/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold">{collection.title}</h3>
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                      {collection.algorithms.length} refs
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{collection.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {collection.algorithms.slice(0, 3).map((algorithm) => (
                      <Link
                        key={algorithm.slug}
                        href={`/algorithms/${algorithm.slug}`}
                        className="pill rounded-full px-3 py-1 text-xs font-medium hover:border-[var(--accent)]"
                      >
                        {algorithm.title}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end border-t border-black/10 pt-4">
                    <Link
                      href={`/collections/${collection.slug}`}
                      className="rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
                    >
                      Open collection
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="practice-queue" className="glass-panel rounded-[28px] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
              Practice Queue
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Keep review momentum</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Saved references stay local-first. Right now {bookmarkedCount} are saved, {completedCount} are completed, and anything due for review rises to the top of the queue.
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
              <li>Search reads aliases, use cases, interview signals, categories, and topic fields, not titles alone.</li>
              <li>Category shelves stay concrete while primary topics preserve a broader browse lane when the prompt is still vague.</li>
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

type CategoryGroup = {
  algorithms: AlgorithmCatalogEntry[];
  category: string;
  primaryTopics: string[];
  techniqueFamilies: string[];
};

function groupAlgorithmsByCategory(algorithms: AlgorithmCatalogEntry[]): CategoryGroup[] {
  const groupedAlgorithms = new Map<string, AlgorithmCatalogEntry[]>();

  for (const algorithm of algorithms) {
    const currentGroup = groupedAlgorithms.get(algorithm.category) ?? [];
    currentGroup.push(algorithm);
    groupedAlgorithms.set(algorithm.category, currentGroup);
  }

  return Array.from(groupedAlgorithms.entries())
    .map(([category, categoryAlgorithms]) => ({
      category,
      algorithms: [...categoryAlgorithms].sort((left, right) =>
        left.title.localeCompare(right.title),
      ),
      primaryTopics: uniqueValues(
        categoryAlgorithms.map((algorithm) => algorithm.grouping.primaryTopic),
      ),
      techniqueFamilies: uniqueValues(
        categoryAlgorithms.flatMap((algorithm) => algorithm.grouping.techniqueFamilies),
      ),
    }))
    .sort((left, right) => {
      if (right.algorithms.length !== left.algorithms.length) {
        return right.algorithms.length - left.algorithms.length;
      }

      return left.category.localeCompare(right.category);
    });
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function getActiveFilterChips(filters: CatalogFilters): string[] {
  const chips: string[] = [];

  if (filters.category) {
    chips.push(`Category: ${filters.category}`);
  }

  if (filters.topic) {
    chips.push(`Topic: ${filters.topic}`);
  }

  if (filters.structure) {
    chips.push(`Structure: ${filters.structure}`);
  }

  if (filters.technique) {
    chips.push(`Technique: ${filters.technique}`);
  }

  if (filters.difficulty) {
    chips.push(`Difficulty: ${filters.difficulty}`);
  }

  if (filters.status !== "all") {
    chips.push(`Study state: ${filters.status}`);
  }

  if (filters.query.trim()) {
    chips.push(`Query: ${filters.query.trim()}`);
  }

  return chips;
}

type CatalogCardProps = {
  algorithm: AlgorithmCatalogEntry;
  studyState: StudyState;
};

function CatalogCard({ algorithm, studyState }: CatalogCardProps) {
  const marker = getStudyMarker(studyState, algorithm.slug);

  return (
    <article className="glass-panel flex h-full flex-col rounded-[28px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            <span>{algorithm.category}</span>
            <span>•</span>
            <span>{algorithm.grouping.primaryTopic}</span>
          </div>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
            {algorithm.title}
          </h3>
        </div>
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
          {algorithm.difficulty}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{algorithm.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-[var(--muted)]">
        {algorithm.dataStructures.map((structure) => (
          <span key={structure} className="pill rounded-full px-3 py-1">
            {structure}
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-[var(--accent-strong)]">
        {algorithm.grouping.techniqueFamilies.slice(0, 3).map((family) => (
          <span key={family} className="rounded-full bg-[var(--accent-soft)] px-3 py-1">
            {family}
          </span>
        ))}
      </div>
      <div className="mt-5 space-y-2 text-sm text-[var(--foreground)]">
        <p>
          <span className="font-semibold">Time:</span> {algorithm.complexity.time}
        </p>
        <p>
          <span className="font-semibold">Interview use:</span> {algorithm.interviewSignals[0]}
        </p>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            writeStudyState(toggleStudyFlag(readStudyState(), algorithm.slug, "bookmarked"))
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
            writeStudyState(toggleStudyFlag(readStudyState(), algorithm.slug, "completed"))
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
}

function getTopicSectionId(topic: CatalogPrimaryTopic): string {
  return `topic-${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function getCategorySectionId(category: string): string {
  return `category-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
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