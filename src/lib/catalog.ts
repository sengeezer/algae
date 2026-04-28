import { getStudyMarker, type StudyState } from "@/lib/study-state";
import type { AlgorithmEntry, CatalogFilters, Difficulty } from "@/types/algorithm";

const allowedDifficulties = new Set<Difficulty>(["Easy", "Medium", "Hard"]);
const allowedStatuses = new Set<CatalogFilters["status"]>([
  "all",
  "bookmarked",
  "completed",
]);

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function scoreCandidate(query: string, text: string, multiplier: number): number {
  const candidate = normalizeText(text);

  if (!candidate) {
    return 0;
  }

  if (candidate === query) {
    return 12 * multiplier;
  }

  if (candidate.startsWith(query)) {
    return 8 * multiplier;
  }

  if (candidate.includes(query)) {
    return 5 * multiplier;
  }

  return 0;
}

function weightedField(text: string, multiplier: number): [text: string, multiplier: number] {
  return [text, multiplier];
}

function scoreAlgorithm(algorithm: AlgorithmEntry, query: string): number {
  if (!query) {
    return 1;
  }

  const fields: Array<[text: string, multiplier: number]> = [
    weightedField(algorithm.title, 5),
    weightedField(algorithm.summary, 4),
    weightedField(algorithm.description, 3),
    weightedField(algorithm.category, 2),
    ...algorithm.dataStructures.map((value) => weightedField(value, 3)),
    ...algorithm.techniques.map((value) => weightedField(value, 3)),
    ...algorithm.aliases.map((value) => weightedField(value, 4)),
    ...algorithm.useCases.map((value) => weightedField(value, 4)),
    ...algorithm.interviewSignals.map((value) => weightedField(value, 2)),
  ];

  return fields.reduce((score, [text, multiplier]) => {
    return score + scoreCandidate(query, text, multiplier);
  }, 0);
}

function matchesStatus(
  filters: CatalogFilters,
  studyState: StudyState,
  slug: string,
): boolean {
  const marker = getStudyMarker(studyState, slug);

  if (filters.status === "bookmarked") {
    return marker.bookmarked;
  }

  if (filters.status === "completed") {
    return marker.completed;
  }

  return true;
}

export function normalizeCatalogFilters(input: {
  difficulty?: string;
  q?: string;
  status?: string;
  structure?: string;
  technique?: string;
}): CatalogFilters {
  return {
    query: input.q?.trim() ?? "",
    structure: input.structure?.trim() ?? "",
    technique: input.technique?.trim() ?? "",
    difficulty: allowedDifficulties.has(input.difficulty as Difficulty)
      ? (input.difficulty as Difficulty)
      : "",
    status: allowedStatuses.has(input.status as CatalogFilters["status"])
      ? (input.status as CatalogFilters["status"])
      : "all",
  };
}

export function buildCatalogQueryString(filters: CatalogFilters): string {
  const params = new URLSearchParams();

  if (filters.query) {
    params.set("q", filters.query);
  }

  if (filters.structure) {
    params.set("structure", filters.structure);
  }

  if (filters.technique) {
    params.set("technique", filters.technique);
  }

  if (filters.difficulty) {
    params.set("difficulty", filters.difficulty);
  }

  if (filters.status !== "all") {
    params.set("status", filters.status);
  }

  return params.toString();
}

export function filterAlgorithms(
  algorithms: AlgorithmEntry[],
  filters: CatalogFilters,
  studyState: StudyState,
): AlgorithmEntry[] {
  const query = normalizeText(filters.query);

  return algorithms
    .filter((algorithm) => {
      if (filters.structure && !algorithm.dataStructures.includes(filters.structure)) {
        return false;
      }

      if (filters.technique && !algorithm.techniques.includes(filters.technique)) {
        return false;
      }

      if (filters.difficulty && algorithm.difficulty !== filters.difficulty) {
        return false;
      }

      return matchesStatus(filters, studyState, algorithm.slug);
    })
    .map((algorithm) => ({ algorithm, score: scoreAlgorithm(algorithm, query) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.algorithm.title.localeCompare(right.algorithm.title);
    })
    .map(({ algorithm }) => algorithm);
}