import type { MetadataRoute } from "next";

import {
  listCatalogCollections,
  listCatalogLearningPaths,
} from "@/lib/catalog-repository";
import { listAlgorithms } from "@/lib/content-source";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://algae.vercel.app";
  const [collections, learningPaths] = await Promise.all([
    listCatalogCollections(),
    listCatalogLearningPaths(),
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
      url: `${baseUrl}/learning-paths`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...listAlgorithms().map((algorithm) => ({
      url: `${baseUrl}/algorithms/${algorithm.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
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
  ];
}