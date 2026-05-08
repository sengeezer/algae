import type {
  AlgorithmCatalogEntry,
  CatalogPrimaryTopic,
  Difficulty,
  InterviewFrequency,
  ComplexityProfile,
} from "@/types/algorithm";

export interface CatalogIndexRecord extends AlgorithmCatalogEntry {
  searchText: string;
}

export interface CatalogLearningPathDefinition {
  slug: string;
  title: string;
  summary: string;
  primaryTopic: CatalogPrimaryTopic;
  algorithmSlugs: string[];
}

export interface CatalogLearningPath {
  slug: string;
  title: string;
  summary: string;
  primaryTopic: CatalogPrimaryTopic;
  algorithms: CatalogIndexRecord[];
}

export interface CatalogCollectionDefinition {
  slug: string;
  title: string;
  summary: string;
  match: (record: CatalogIndexRecord) => boolean;
}

export interface CatalogCollection {
  slug: string;
  title: string;
  summary: string;
  algorithms: CatalogIndexRecord[];
}

export interface CatalogCollectionEntry {
  collectionSlug: string;
  algorithmSlug: string;
  position: number;
}

export const defaultCatalogLearningPaths: CatalogLearningPathDefinition[] = [
  {
    slug: "array-string-foundations",
    title: "Array and String Foundations",
    summary:
      "Start with the prompt shapes that show up earliest in interviews: array scans, pointer movement, and basic ordering.",
    primaryTopic: "Arrays & Matrices",
    algorithmSlugs: [
      "two-sum",
      "binary-search",
      "sliding-window",
      "merge-sort",
      "quick-sort",
    ],
  },
  {
    slug: "graph-traversal-core",
    title: "Graph Traversal Core",
    summary:
      "Move from raw reachability to weighted paths and DAG ordering once the traversal surface feels natural.",
    primaryTopic: "Graphs",
    algorithmSlugs: [
      "breadth-first-search",
      "depth-first-search",
      "number-of-islands",
      "dijkstra",
      "topological-sort",
      "union-find",
    ],
  },
  {
    slug: "dynamic-programming-core",
    title: "Dynamic Programming Core",
    summary:
      "Practice the recurrence patterns most often used to turn brute-force branching into reusable state transitions.",
    primaryTopic: "Dynamic Programming",
    algorithmSlugs: [
      "house-robber",
      "coin-change",
      "longest-increasing-subsequence",
    ],
  },
  {
    slug: "range-query-toolkit",
    title: "Range Query Toolkit",
    summary:
      "Use these references when the prompt turns into repeated updates, aggregated ranges, or indexed prefix reasoning.",
    primaryTopic: "Advanced Data Structures",
    algorithmSlugs: ["segment-tree", "trie", "union-find"],
  },
];

export const defaultCatalogCollections: CatalogCollectionDefinition[] = [
  {
    slug: "very-high-frequency",
    title: "Very High Frequency",
    summary:
      "The shortest path to interview-ready coverage: prompts that recur often enough to deserve constant review.",
    match: (record) => record.interviewFrequency === "Very High",
  },
  {
    slug: "hard-round-drills",
    title: "Hard Round Drills",
    summary:
      "Use this collection when you want a tighter practice set for late-stage or senior-level interview loops.",
    match: (record) => record.difficulty === "Hard",
  },
  {
    slug: "quick-win-revision",
    title: "Quick Win Revision",
    summary:
      "High-yield problems that are still light enough to cycle through in short review sessions.",
    match: (record) =>
      record.interviewFrequency !== "Medium" && record.difficulty !== "Hard",
  },
];

const interviewFrequencyRank: Record<InterviewFrequency, number> = {
  "Very High": 0,
  High: 1,
  Medium: 2,
};

const difficultyRank: Record<Difficulty, number> = {
  Easy: 0,
  Medium: 1,
  Hard: 2,
};

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function createComplexityProfile(
  time: string,
  space: string,
  notes: string,
): ComplexityProfile {
  return {
    time,
    space,
    notes,
  };
}

function createRecordMap(records: CatalogIndexRecord[]): Map<string, CatalogIndexRecord> {
  return new Map(records.map((record) => [record.slug, record]));
}

export function mapAlgorithmToCatalogIndexRecord(
  algorithm: AlgorithmCatalogEntry,
): CatalogIndexRecord {
  const searchValues = uniqueValues([
    algorithm.title,
    algorithm.summary,
    algorithm.description,
    algorithm.category,
    algorithm.grouping.primaryTopic,
    ...algorithm.grouping.techniqueFamilies,
    ...algorithm.dataStructures,
    ...algorithm.techniques,
    ...algorithm.aliases,
    ...algorithm.useCases,
    ...algorithm.interviewSignals,
  ]);

  return {
    slug: algorithm.slug,
    title: algorithm.title,
    category: algorithm.category,
    grouping: algorithm.grouping,
    summary: algorithm.summary,
    description: algorithm.description,
    difficulty: algorithm.difficulty,
    interviewFrequency: algorithm.interviewFrequency,
    dataStructures: algorithm.dataStructures,
    techniques: algorithm.techniques,
    aliases: algorithm.aliases,
    useCases: algorithm.useCases,
    interviewSignals: algorithm.interviewSignals,
    relatedSlugs: algorithm.relatedSlugs,
    complexity: createComplexityProfile(
      algorithm.complexity.time,
      algorithm.complexity.space,
      algorithm.complexity.notes,
    ),
    searchText: searchValues.join("\n"),
  };
}

export function buildCatalogCollectionEntries(
  records: CatalogIndexRecord[],
  definitions = defaultCatalogCollections,
): CatalogCollectionEntry[] {
  return definitions.flatMap((definition) => {
    return records
      .filter((record) => definition.match(record))
      .sort((left, right) => {
        const frequencyDelta =
          interviewFrequencyRank[left.interviewFrequency] -
          interviewFrequencyRank[right.interviewFrequency];

        if (frequencyDelta !== 0) {
          return frequencyDelta;
        }

        const difficultyDelta =
          difficultyRank[left.difficulty] - difficultyRank[right.difficulty];

        if (difficultyDelta !== 0) {
          return difficultyDelta;
        }

        return left.title.localeCompare(right.title);
      })
      .map((record, index) => ({
        collectionSlug: definition.slug,
        algorithmSlug: record.slug,
        position: index + 1,
      }));
  });
}

export function buildCatalogLearningPaths(
  records: CatalogIndexRecord[],
  definitions = defaultCatalogLearningPaths,
): CatalogLearningPath[] {
  const recordsBySlug = createRecordMap(records);

  return definitions.map((definition) => ({
    slug: definition.slug,
    title: definition.title,
    summary: definition.summary,
    primaryTopic: definition.primaryTopic,
    algorithms: definition.algorithmSlugs
      .map((slug) => recordsBySlug.get(slug))
      .filter((record): record is CatalogIndexRecord => Boolean(record)),
  }));
}

export function buildCatalogCollections(
  records: CatalogIndexRecord[],
  definitions = defaultCatalogCollections,
): CatalogCollection[] {
  const definitionsBySlug = new Map(definitions.map((definition) => [definition.slug, definition]));
  const recordsBySlug = createRecordMap(records);
  const collectionEntries = buildCatalogCollectionEntries(records, definitions);

  return definitions
    .map((definition) => ({
      slug: definition.slug,
      title: definition.title,
      summary: definition.summary,
      algorithms: collectionEntries
        .filter((entry) => entry.collectionSlug === definition.slug)
        .map((entry) => recordsBySlug.get(entry.algorithmSlug))
        .filter((record): record is CatalogIndexRecord => Boolean(record)),
    }))
    .filter((collection) => definitionsBySlug.has(collection.slug));
}
