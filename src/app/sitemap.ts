import type { MetadataRoute } from "next";

import { listAlgorithms } from "@/lib/content-source";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://algae.vercel.app";

  return [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...listAlgorithms().map((algorithm) => ({
      url: `${baseUrl}/algorithms/${algorithm.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}