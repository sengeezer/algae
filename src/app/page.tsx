import { CatalogExperience } from "@/components/catalog-experience";
import {
  listAlgorithms,
  listDataStructures,
  listTechniques,
} from "@/lib/content-source";
import { normalizeCatalogFilters } from "@/lib/catalog";

type HomePageProps = {
  searchParams: Promise<{
    difficulty?: string;
    q?: string;
    status?: string;
    structure?: string;
    technique?: string;
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const filters = normalizeCatalogFilters(await searchParams);
  const algorithms = listAlgorithms();

  return (
    <main className="shell-grid min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <CatalogExperience
        algorithms={algorithms}
        dataStructures={listDataStructures()}
        initialFilters={filters}
        techniques={listTechniques()}
      />
    </main>
  );
}
