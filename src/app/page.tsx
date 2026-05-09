import { CatalogExperience } from "@/components/catalog-experience";
import { getCatalogBrowseContext } from "@/lib/catalog-browse";
import { normalizeCatalogFilters } from "@/lib/catalog";

type HomePageProps = {
  searchParams: Promise<{
    category?: string;
    difficulty?: string;
    q?: string;
    status?: string;
    structure?: string;
    technique?: string;
    topic?: string;
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const filters = normalizeCatalogFilters(await searchParams);
  const {
    algorithms,
    categories,
    collections,
    dataStructures,
    learningPaths,
    primaryTopics,
    techniques,
  } = await getCatalogBrowseContext();

  return (
    <main className="shell-grid min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <CatalogExperience
        algorithms={algorithms}
        categories={categories}
        collections={collections}
        dataStructures={dataStructures}
        initialFilters={filters}
        learningPaths={learningPaths}
        primaryTopics={primaryTopics}
        techniques={techniques}
      />
    </main>
  );
}
