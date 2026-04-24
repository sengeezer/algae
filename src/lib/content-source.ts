import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { cache } from "react";

import type { AlgorithmEntry } from "@/types/algorithm";

export interface AlgorithmContentSource {
  getAllAlgorithms(): AlgorithmEntry[];
  getAlgorithmBySlug(slug: string): AlgorithmEntry | undefined;
}

const algorithmDirectory = path.join(process.cwd(), "src", "content", "algorithms");

function parseAlgorithmFile(fileName: string): AlgorithmEntry {
  const filePath = path.join(algorithmDirectory, fileName);
  const source = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(source);

  const algorithm = data as Omit<AlgorithmEntry, "body">;

  return {
    ...algorithm,
    aliases: algorithm.aliases ?? [],
    body: content.trim(),
    dataStructures: algorithm.dataStructures ?? [],
    interviewSignals: algorithm.interviewSignals ?? [],
    relatedSlugs: algorithm.relatedSlugs ?? [],
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

export function listRelatedAlgorithms(slugs: string[]): AlgorithmEntry[] {
  return slugs
    .map((slug) => getAlgorithmBySlug(slug))
    .filter((algorithm): algorithm is AlgorithmEntry => Boolean(algorithm));
}