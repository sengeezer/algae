import { algorithms } from "@/content/algorithms";
import type { AlgorithmEntry } from "@/types/algorithm";

export interface AlgorithmContentSource {
  getAllAlgorithms(): AlgorithmEntry[];
  getAlgorithmBySlug(slug: string): AlgorithmEntry | undefined;
}

const staticContentSource: AlgorithmContentSource = {
  getAllAlgorithms() {
    return algorithms;
  },
  getAlgorithmBySlug(slug) {
    return algorithms.find((algorithm) => algorithm.slug === slug);
  },
};

export function listAlgorithms(): AlgorithmEntry[] {
  return [...staticContentSource.getAllAlgorithms()].sort((left, right) =>
    left.title.localeCompare(right.title),
  );
}

export function getAlgorithmBySlug(slug: string): AlgorithmEntry | undefined {
  return staticContentSource.getAlgorithmBySlug(slug);
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

export function listRelatedAlgorithms(slugs: string[]): AlgorithmEntry[] {
  return slugs
    .map((slug) => getAlgorithmBySlug(slug))
    .filter((algorithm): algorithm is AlgorithmEntry => Boolean(algorithm));
}