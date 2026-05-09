import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CatalogBrowseDetailPage } from "@/components/catalog-browse-detail-page";
import {
  describeTopicBrowseShelf,
  getTopicBrowseShelfBySlug,
  getTopicBrowseShelves,
} from "@/lib/catalog-browse";

type TopicPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getTopicBrowseShelves()).map((shelf) => ({ slug: shelf.slug }));
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const shelf = await getTopicBrowseShelfBySlug(slug);

  if (!shelf) {
    return {
      title: "Primary Topic Not Found",
    };
  }

  return {
    title: `${shelf.topic} Topic`,
    description: describeTopicBrowseShelf(shelf),
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const shelf = await getTopicBrowseShelfBySlug(slug);

  if (!shelf) {
    notFound();
  }

  return (
    <CatalogBrowseDetailPage
      algorithms={shelf.algorithms}
      backHref="/topics"
      backLabel="Back to topics"
      description={describeTopicBrowseShelf(shelf)}
      eyebrow="Primary Topic"
      highlightChips={[...shelf.categories.slice(0, 6), ...shelf.techniqueFamilies.slice(0, 3)]}
      secondaryMetricLabel="Categories"
      secondaryMetricValue={String(shelf.categories.length)}
      title={shelf.topic}
      typeLabel="Primary Topic"
    />
  );
}