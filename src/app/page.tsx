import { CatalogExperience } from "@/components/catalog-experience";
import { normalizeCatalogFilters } from "@/lib/catalog";
import {
  listCatalogCollections,
  listCatalogIndexRecords,
  listCatalogLearningPaths,
} from "@/lib/catalog-repository";
import { catalogTopicOrder } from "@/lib/catalog-taxonomy";

type HomePageProps = {
  searchParams: Promise<{
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
  const [algorithms, collections, learningPaths] = await Promise.all([
    listCatalogIndexRecords(),
    listCatalogCollections(),
    listCatalogLearningPaths(),
  ]);
  const dataStructures = Array.from(
    new Set(algorithms.flatMap((algorithm) => algorithm.dataStructures)),
  ).sort((left, right) => left.localeCompare(right));
  const techniques = Array.from(
    new Set(algorithms.flatMap((algorithm) => algorithm.techniques)),
  ).sort((left, right) => left.localeCompare(right));
  const primaryTopics = catalogTopicOrder.filter((topic) =>
    algorithms.some((algorithm) => algorithm.grouping.primaryTopic === topic),
  );

  return (
    <main className="shell-grid min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <CatalogExperience
        algorithms={algorithms}
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
