import type { MetadataRoute } from "next";

import {
  getCategoryBrowseShelves,
  getProblemBrowseShelves,
  getTopicBrowseShelves,
} from "@/lib/catalog-browse";
import {
  listCatalogCollections,
  listCatalogLearningPaths,
} from "@/lib/catalog-repository";
import { listAlgorithms } from "@/lib/content-source";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://algae.vercel.app";
  const [categoryShelves, collections, learningPaths, problemShelves, topicShelves] =
    await Promise.all([
    getCategoryBrowseShelves(),
    listCatalogCollections(),
    listCatalogLearningPaths(),
    getProblemBrowseShelves(),
    getTopicBrowseShelves(),
  ]);

  return [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/collections`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/learning-paths`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/topics`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/problems`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...listAlgorithms().map((algorithm) => ({
      url: `${baseUrl}/algorithms/${algorithm.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...categoryShelves.map((shelf) => ({
      url: `${baseUrl}/categories/${shelf.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...collections.map((collection) => ({
      url: `${baseUrl}/collections/${collection.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...learningPaths.map((path) => ({
      url: `${baseUrl}/learning-paths/${path.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...topicShelves.map((shelf) => ({
      url: `${baseUrl}/topics/${shelf.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...problemShelves.map((shelf) => ({
      url: `${baseUrl}/problems/${shelf.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  ];
}