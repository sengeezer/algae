import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CuratedCatalogDetailPage } from "@/components/curated-catalog";
import {
  getCatalogCollectionBySlug,
  listCatalogCollections,
} from "@/lib/catalog-repository";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return (await listCatalogCollections()).map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCatalogCollectionBySlug(slug);

  if (!collection) {
    return {
      title: "Collection Not Found",
    };
  }

  return {
    title: collection.title,
    description: collection.summary,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCatalogCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  return (
    <CuratedCatalogDetailPage
      algorithms={collection.algorithms}
      backHref="/collections"
      backLabel="Back to collections"
      description={collection.summary}
      eyebrow="Interview Collection"
      title={collection.title}
      typeLabel="Collection"
    />
  );
}