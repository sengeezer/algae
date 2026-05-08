import { getStudyMarker, type StudyState } from "@/lib/study-state";
import { catalogTopicOrder } from "@/lib/catalog-taxonomy";
import type {
  AlgorithmCatalogEntry,
  CatalogFilters,
  CatalogPrimaryTopic,
  Difficulty,
} from "@/types/algorithm";

const allowedDifficulties = new Set<Difficulty>(["Easy", "Medium", "Hard"]);
const allowedTopics = new Set<CatalogPrimaryTopic>(catalogTopicOrder);
const allowedStatuses = new Set<CatalogFilters["status"]>([
  "all",
  "bookmarked",
  "completed",
]);

function normalizeText(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
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

function scoreAlgorithm(algorithm: AlgorithmCatalogEntry, query: string): number {
  if (!query) {
    return 1;
  }

  const fields: Array<[text: string, multiplier: number]> = [
    weightedField(algorithm.title, 5),
    weightedField(algorithm.summary, 4),
    weightedField(algorithm.description, 3),
    weightedField(algorithm.category, 2),
    weightedField(algorithm.grouping.primaryTopic, 4),
    ...algorithm.dataStructures.map((value) => weightedField(value, 3)),
    ...algorithm.techniques.map((value) => weightedField(value, 3)),
    ...algorithm.grouping.techniqueFamilies.map((value) => weightedField(value, 2)),
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
  topic?: string;
}): CatalogFilters {
  return {
    query: input.q?.trim() ?? "",
    topic: allowedTopics.has(input.topic as CatalogPrimaryTopic)
      ? (input.topic as CatalogPrimaryTopic)
      : "",
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

  if (filters.topic) {
    params.set("topic", filters.topic);
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
  algorithms: AlgorithmCatalogEntry[],
  filters: CatalogFilters,
  studyState: StudyState,
): AlgorithmCatalogEntry[] {
  const query = normalizeText(filters.query);

  return algorithms
    .filter((algorithm) => {
      if (filters.topic && algorithm.grouping.primaryTopic !== filters.topic) {
        return false;
      }

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