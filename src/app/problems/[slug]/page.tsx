import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CatalogBrowseDetailPage } from "@/components/catalog-browse-detail-page";
import {
  describeProblemBrowseShelf,
  getProblemBrowseShelfBySlug,
  getProblemBrowseShelves,
} from "@/lib/catalog-browse";

type ProblemPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProblemBrowseShelves()).map((shelf) => ({ slug: shelf.slug }));
}

export async function generateMetadata({ params }: ProblemPageProps): Promise<Metadata> {
  const { slug } = await params;
  const shelf = await getProblemBrowseShelfBySlug(slug);

  if (!shelf) {
    return {
      title: "Problem Not Found",
    };
  }

  return {
    title: `${shelf.problem} Problem`,
    description: describeProblemBrowseShelf(shelf),
  };
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { slug } = await params;
  const shelf = await getProblemBrowseShelfBySlug(slug);

  if (!shelf) {
    notFound();
  }

  return (
    <CatalogBrowseDetailPage
      algorithms={shelf.algorithms}
      backHref="/problems"
      backLabel="Back to problems"
      description={describeProblemBrowseShelf(shelf)}
      eyebrow="Problem Shelf"
      highlightChips={[
        ...shelf.categories.slice(0, 4),
        ...shelf.primaryTopics.slice(0, 3),
        ...shelf.techniqueFamilies.slice(0, 3),
      ]}
      secondaryMetricLabel="Categories"
      secondaryMetricValue={String(shelf.categories.length)}
      title={shelf.problem}
      typeLabel="Problem"
    />
  );
}
