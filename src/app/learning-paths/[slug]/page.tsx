import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CuratedCatalogDetailPage } from "@/components/curated-catalog";
import {
  getCatalogLearningPathBySlug,
  listCatalogLearningPaths,
} from "@/lib/catalog-repository";

type LearningPathPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return (await listCatalogLearningPaths()).map((path) => ({ slug: path.slug }));
}

export async function generateMetadata({ params }: LearningPathPageProps): Promise<Metadata> {
  const { slug } = await params;
  const learningPath = await getCatalogLearningPathBySlug(slug);

  if (!learningPath) {
    return {
      title: "Learning Path Not Found",
    };
  }

  return {
    title: learningPath.title,
    description: learningPath.summary,
  };
}

export default async function LearningPathPage({ params }: LearningPathPageProps) {
  const { slug } = await params;
  const learningPath = await getCatalogLearningPathBySlug(slug);

  if (!learningPath) {
    notFound();
  }

  return (
    <CuratedCatalogDetailPage
      algorithms={learningPath.algorithms}
      backHref="/learning-paths"
      backLabel="Back to learning paths"
      description={learningPath.summary}
      eyebrow={learningPath.primaryTopic}
      secondaryMetricLabel="Primary Topic"
      secondaryMetricValue={learningPath.primaryTopic}
      title={learningPath.title}
      typeLabel="Learning Path"
    />
  );
}