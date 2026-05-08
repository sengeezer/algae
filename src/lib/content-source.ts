import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { cache } from "react";

import { deriveAlgorithmGrouping } from "@/lib/catalog-taxonomy";
import type {
  AlgorithmEntry,
  AlgorithmFrontmatter,
  CatalogPrimaryTopic,
  Difficulty,
  InterviewFrequency,
} from "@/types/algorithm";

export interface AlgorithmContentSource {
  getAllAlgorithms(): AlgorithmEntry[];
  getAlgorithmBySlug(slug: string): AlgorithmEntry | undefined;
}

const algorithmDirectory = path.join(process.cwd(), "src", "content", "algorithms");
const supportedDifficulties = new Set<Difficulty>(["Easy", "Medium", "Hard"]);
const supportedInterviewFrequencies = new Set<InterviewFrequency>([
  "Very High",
  "High",
  "Medium",
]);

function normalizeTextField(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function normalizeEnumField<T extends string>(
  value: unknown,
  supportedValues: ReadonlySet<T>,
  fallbackValue: T,
): T {
  if (typeof value === "string" && supportedValues.has(value as T)) {
    return value as T;
  }

  return fallbackValue;
}

function parseAlgorithmFile(fileName: string): AlgorithmEntry {
  const filePath = path.join(algorithmDirectory, fileName);
  const source = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(source);

  const algorithm = data as AlgorithmFrontmatter;
  const description = normalizeTextField(algorithm.description) ?? "";
  const difficulty = normalizeEnumField(
    algorithm.difficulty,
    supportedDifficulties,
    "Medium",
  );
  const interviewFrequency = normalizeEnumField(
    algorithm.interviewFrequency,
    supportedInterviewFrequencies,
    "Medium",
  );
  const summary = normalizeTextField(algorithm.summary) ?? description;

  return {
    ...algorithm,
    aliases: algorithm.aliases ?? [],
    body: content.trim(),
    dataStructures: algorithm.dataStructures ?? [],
    description,
    difficulty,
    grouping: deriveAlgorithmGrouping({
      category: algorithm.category,
      dataStructures: algorithm.dataStructures ?? [],
      difficulty,
      techniques: algorithm.techniques ?? [],
    }),
    interviewFrequency,
    interviewSignals: algorithm.interviewSignals ?? [],
    provenance: algorithm.provenance ?? [],
    relatedSlugs: algorithm.relatedSlugs ?? [],
    summary,
    techniques: algorithm.techniques ?? [],
    useCases: algorithm.useCases ?? [],
  };
}

const readAlgorithmDocuments = cache(() => {
  return fs
    .readdirSync(algorithmDirectory)
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map(parseAlgorithmFile);
});

const filesystemContentSource: AlgorithmContentSource = {
  getAllAlgorithms() {
    return readAlgorithmDocuments();
  },
  getAlgorithmBySlug(slug) {
    return readAlgorithmDocuments().find((algorithm) => algorithm.slug === slug);
  },
};

export function listAlgorithms(): AlgorithmEntry[] {
  return [...filesystemContentSource.getAllAlgorithms()].sort((left, right) =>
    left.title.localeCompare(right.title),
  );
}

export function getAlgorithmBySlug(slug: string): AlgorithmEntry | undefined {
  return filesystemContentSource.getAlgorithmBySlug(slug);
}

export function listDataStructures(): string[] {
  return Array.from(
    new Set(listAlgorithms().flatMap((algorithm) => algorithm.dataStructures)),
  ).sort((left, right) => left.localeCompare(right));
}

export function listTechniques(): string[] {
  return Array.from(
    new Set(listAlgorithms().flatMap((algorithm) => algorithm.techniques)),
  ).sort((left, right) => left.localeCompare(right));
}

export function listPrimaryTopics(): CatalogPrimaryTopic[] {
  return Array.from(
    new Set(listAlgorithms().map((algorithm) => algorithm.grouping.primaryTopic)),
  ).sort((left, right) => left.localeCompare(right)) as CatalogPrimaryTopic[];
}

export function listRelatedAlgorithms(slugs: string[]): AlgorithmEntry[] {
  return slugs
    .map((slug) => getAlgorithmBySlug(slug))
    .filter((algorithm): algorithm is AlgorithmEntry => Boolean(algorithm));
}