import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CatalogBrowseDetailPage } from "@/components/catalog-browse-detail-page";
import {
  describeCategoryBrowseShelf,
  getCategoryBrowseShelfBySlug,
  getCategoryBrowseShelves,
} from "@/lib/catalog-browse";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getCategoryBrowseShelves()).map((shelf) => ({ slug: shelf.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const shelf = await getCategoryBrowseShelfBySlug(slug);

  if (!shelf) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${shelf.category} Category`,
    description: describeCategoryBrowseShelf(shelf),
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const shelf = await getCategoryBrowseShelfBySlug(slug);

  if (!shelf) {
    notFound();
  }

  return (
    <CatalogBrowseDetailPage
      algorithms={shelf.algorithms}
      backHref="/categories"
      backLabel="Back to categories"
      description={describeCategoryBrowseShelf(shelf)}
      eyebrow="Category Shelf"
      highlightChips={[...shelf.primaryTopics, ...shelf.techniqueFamilies.slice(0, 4)]}
      secondaryMetricLabel="Primary Topics"
      secondaryMetricValue={String(shelf.primaryTopics.length)}
      title={shelf.category}
      typeLabel="Category"
    />
  );
}