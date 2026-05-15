import { cache } from "react";

import type {
  CatalogCollection,
  CatalogIndexRecord,
  CatalogLearningPath,
} from "@/lib/catalog-index";
import {
  listCatalogCollections,
  listCatalogIndexRecords,
  listCatalogLearningPaths,
} from "@/lib/catalog-repository";
import { catalogTopicOrder } from "@/lib/catalog-taxonomy";
import type { CatalogPrimaryTopic } from "@/types/algorithm";

export type CatalogBrowseContext = {
  algorithms: CatalogIndexRecord[];
  categories: string[];
  collections: CatalogCollection[];
  dataStructures: string[];
  learningPaths: CatalogLearningPath[];
  problems: string[];
  primaryTopics: CatalogPrimaryTopic[];
  techniques: string[];
};

export type CategoryBrowseShelf = {
  algorithms: CatalogIndexRecord[];
  category: string;
  primaryTopics: string[];
  slug: string;
  techniqueFamilies: string[];
};

export type TopicBrowseShelf = {
  algorithms: CatalogIndexRecord[];
  categories: string[];
  slug: string;
  techniqueFamilies: string[];
  topic: CatalogPrimaryTopic;
};

export type ProblemBrowseShelf = {
  algorithms: CatalogIndexRecord[];
  categories: string[];
  primaryTopics: string[];
  problem: string;
  slug: string;
  techniqueFamilies: string[];
};

function sortText(left: string, right: string) {
  return left.localeCompare(right);
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function createBrowseSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function createSlugMap(labels: string[]): Map<string, string> {
  const slugCounts = new Map<string, number>();

  return new Map(
    labels.map((label) => {
      const baseSlug = createBrowseSlug(label);
      const nextCount = (slugCounts.get(baseSlug) ?? 0) + 1;

      slugCounts.set(baseSlug, nextCount);

      return [label, nextCount === 1 ? baseSlug : `${baseSlug}-${nextCount}`] as const;
    }),
  );
}

function sortAlgorithmsByTitle(algorithms: CatalogIndexRecord[]): CatalogIndexRecord[] {
  return [...algorithms].sort((left, right) => left.title.localeCompare(right.title));
}

// Cache metadata separately (aggregates are small, under 100KB)
const getCachedCatalogMetadata = cache(async () => {
  const algorithms = await listCatalogIndexRecords();
  const categories = uniqueValues(algorithms.map((algorithm) => algorithm.category)).sort(sortText);
  const dataStructures = uniqueValues(
    algorithms.flatMap((algorithm) => algorithm.dataStructures),
  ).sort(sortText);
  const problems = uniqueValues(
    algorithms.flatMap((algorithm) => [...algorithm.useCases, ...algorithm.interviewSignals]),
  ).sort(sortText);
  const techniques = uniqueValues(algorithms.flatMap((algorithm) => algorithm.techniques)).sort(
    sortText,
  );
  const primaryTopics = catalogTopicOrder.filter((topic) =>
    algorithms.some((algorithm) => algorithm.grouping.primaryTopic === topic),
  );

  return {
    categories,
    dataStructures,
    problems,
    primaryTopics,
    techniques,
  };
});

export const getCatalogBrowseContext = cache(async (): Promise<CatalogBrowseContext> => {
  const algorithms = await listCatalogIndexRecords();
  const [collections, learningPaths, metadata] = await Promise.all([
    listCatalogCollections(),
    listCatalogLearningPaths(),
    getCachedCatalogMetadata(),
  ]);

  return {
    algorithms,
    categories: metadata.categories,
    collections,
    dataStructures: metadata.dataStructures,
    learningPaths,
    problems: metadata.problems,
    primaryTopics: metadata.primaryTopics,
    techniques: metadata.techniques,
  };
});

export const getCategoryBrowseShelves = cache(async (): Promise<CategoryBrowseShelf[]> => {
  const { algorithms, categories } = await getCatalogBrowseContext();
  const slugByCategory = createSlugMap(categories);

  return categories
    .map((category) => {
      const categoryAlgorithms = algorithms.filter((algorithm) => algorithm.category === category);

      return {
        category,
        slug: slugByCategory.get(category) ?? createBrowseSlug(category),
        algorithms: sortAlgorithmsByTitle(categoryAlgorithms),
        primaryTopics: uniqueValues(
          categoryAlgorithms.map((algorithm) => algorithm.grouping.primaryTopic),
        ),
        techniqueFamilies: uniqueValues(
          categoryAlgorithms.flatMap((algorithm) => algorithm.grouping.techniqueFamilies),
        ),
      };
    })
    .sort((left, right) => {
      if (right.algorithms.length !== left.algorithms.length) {
        return right.algorithms.length - left.algorithms.length;
      }

      return left.category.localeCompare(right.category);
    });
});

export const getTopicBrowseShelves = cache(async (): Promise<TopicBrowseShelf[]> => {
  const { algorithms, primaryTopics } = await getCatalogBrowseContext();
  const slugByTopic = createSlugMap(primaryTopics);

  return primaryTopics.map((topic) => {
    const topicAlgorithms = algorithms.filter(
      (algorithm) => algorithm.grouping.primaryTopic === topic,
    );

    return {
      topic,
      slug: slugByTopic.get(topic) ?? createBrowseSlug(topic),
      algorithms: sortAlgorithmsByTitle(topicAlgorithms),
      categories: uniqueValues(topicAlgorithms.map((algorithm) => algorithm.category)).sort(sortText),
      techniqueFamilies: uniqueValues(
        topicAlgorithms.flatMap((algorithm) => algorithm.grouping.techniqueFamilies),
      ),
    };
  });
});

export const getProblemBrowseShelves = cache(async (): Promise<ProblemBrowseShelf[]> => {
  const { algorithms, problems } = await getCatalogBrowseContext();
  const slugByProblem = createSlugMap(problems);

  return problems
    .map((problem) => {
      const problemAlgorithms = algorithms.filter(
        (algorithm) =>
          algorithm.useCases.includes(problem) || algorithm.interviewSignals.includes(problem),
      );

      return {
        problem,
        slug: slugByProblem.get(problem) ?? createBrowseSlug(problem),
        algorithms: sortAlgorithmsByTitle(problemAlgorithms),
        categories: uniqueValues(problemAlgorithms.map((algorithm) => algorithm.category)).sort(
          sortText,
        ),
        primaryTopics: uniqueValues(
          problemAlgorithms.map((algorithm) => algorithm.grouping.primaryTopic),
        ),
        techniqueFamilies: uniqueValues(
          problemAlgorithms.flatMap((algorithm) => algorithm.grouping.techniqueFamilies),
        ),
      };
    })
    .filter((shelf) => shelf.algorithms.length > 0)
    .sort((left, right) => {
      if (right.algorithms.length !== left.algorithms.length) {
        return right.algorithms.length - left.algorithms.length;
      }

      return left.problem.localeCompare(right.problem);
    });
});

export async function getCategoryBrowseShelfBySlug(
  slug: string,
): Promise<CategoryBrowseShelf | undefined> {
  return (await getCategoryBrowseShelves()).find((shelf) => shelf.slug === slug);
}

export async function getTopicBrowseShelfBySlug(
  slug: string,
): Promise<TopicBrowseShelf | undefined> {
  return (await getTopicBrowseShelves()).find((shelf) => shelf.slug === slug);
}

export async function getProblemBrowseShelfBySlug(
  slug: string,
): Promise<ProblemBrowseShelf | undefined> {
  return (await getProblemBrowseShelves()).find((shelf) => shelf.slug === slug);
}

export function describeCategoryBrowseShelf(shelf: CategoryBrowseShelf): string {
  const topicPreview = shelf.primaryTopics.slice(0, 2).join(" and ");
  const techniquePreview = shelf.techniqueFamilies.slice(0, 3).join(", ");

  if (topicPreview && techniquePreview) {
    return `Use this shelf when the prompt is clearly ${shelf.category.toLowerCase()}. It sits inside ${topicPreview} and leans on ${techniquePreview}.`;
  }

  if (topicPreview) {
    return `Use this shelf when the prompt is clearly ${shelf.category.toLowerCase()}. It keeps ${topicPreview} references in one dedicated route.`;
  }

  return `Use this shelf when the prompt is clearly ${shelf.category.toLowerCase()}. It gathers related references into one dedicated route.`;
}

export function describeTopicBrowseShelf(shelf: TopicBrowseShelf): string {
  const categoryPreview = shelf.categories.slice(0, 3).join(", ");
  const techniquePreview = shelf.techniqueFamilies.slice(0, 3).join(", ");

  if (categoryPreview && techniquePreview) {
    return `Use this shelf when you want to stay inside ${shelf.topic} while comparing neighboring categories such as ${categoryPreview}. Core technique families include ${techniquePreview}.`;
  }

  if (categoryPreview) {
    return `Use this shelf when you want to stay inside ${shelf.topic} while comparing neighboring categories such as ${categoryPreview}.`;
  }

  return `Use this shelf when you want to stay inside ${shelf.topic} without dropping into a single category too early.`;
}

export function describeProblemBrowseShelf(shelf: ProblemBrowseShelf): string {
  const categoryPreview = shelf.categories.slice(0, 3).join(", ");
  const topicPreview = shelf.primaryTopics.slice(0, 2).join(" and ");

  if (categoryPreview && topicPreview) {
    return `Use this shelf when the prompt features ${shelf.problem.toLowerCase()}. You can compare ${categoryPreview} references while staying aligned with ${topicPreview}.`;
  }

  if (categoryPreview) {
    return `Use this shelf when the prompt features ${shelf.problem.toLowerCase()}. It gathers related references across categories such as ${categoryPreview}.`;
  }

  return `Use this shelf when the prompt features ${shelf.problem.toLowerCase()}. It gathers matching references into one dedicated route.`;
}