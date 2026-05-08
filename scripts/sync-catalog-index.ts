import { loadEnvConfig } from "@next/env";

import {
  buildCatalogCollectionEntries,
  defaultCatalogCollections,
  defaultCatalogLearningPaths,
  mapAlgorithmToCatalogIndexRecord,
} from "../src/lib/catalog-index";
import { listAlgorithms } from "../src/lib/content-source";
import { getDatabaseClient } from "../src/lib/database";

async function main() {
  loadEnvConfig(process.cwd());

  const sql = getDatabaseClient();
  const indexRecords = listAlgorithms().map(mapAlgorithmToCatalogIndexRecord);
  const knownSlugs = new Set(indexRecords.map((record) => record.slug));

  for (const path of defaultCatalogLearningPaths) {
    for (const slug of path.algorithmSlugs) {
      if (!knownSlugs.has(slug)) {
        throw new Error(`Learning path ${path.slug} references missing slug: ${slug}`);
      }
    }
  }

  const collectionEntries = buildCatalogCollectionEntries(indexRecords);

  await sql.transaction([
    sql`delete from catalog_collection_entries`,
    sql`delete from catalog_collections`,
    sql`delete from catalog_learning_path_entries`,
    sql`delete from catalog_learning_paths`,
    sql`delete from algorithm_catalog_index`,
    ...indexRecords.map((record) => sql`
      insert into algorithm_catalog_index (
        slug,
        title,
        category,
        primary_topic,
        summary,
        description,
        difficulty,
        interview_frequency,
        data_structures,
        techniques,
        technique_families,
        aliases,
        use_cases,
        interview_signals,
        related_slugs,
        complexity_time,
        complexity_space,
        complexity_notes,
        search_text,
        indexed_at
      ) values (
        ${record.slug},
        ${record.title},
        ${record.category},
        ${record.grouping.primaryTopic},
        ${record.summary},
        ${record.description},
        ${record.difficulty},
        ${record.interviewFrequency},
        ${JSON.stringify(record.dataStructures)}::jsonb,
        ${JSON.stringify(record.techniques)}::jsonb,
        ${JSON.stringify(record.grouping.techniqueFamilies)}::jsonb,
        ${JSON.stringify(record.aliases)}::jsonb,
        ${JSON.stringify(record.useCases)}::jsonb,
        ${JSON.stringify(record.interviewSignals)}::jsonb,
        ${JSON.stringify(record.relatedSlugs)}::jsonb,
        ${record.complexity.time},
        ${record.complexity.space},
        ${record.complexity.notes},
        ${record.searchText},
        now()
      )
    `),
    ...defaultCatalogLearningPaths.map((path, index) => sql`
      insert into catalog_learning_paths (
        slug,
        title,
        summary,
        primary_topic,
        sort_order,
        updated_at
      ) values (
        ${path.slug},
        ${path.title},
        ${path.summary},
        ${path.primaryTopic},
        ${index + 1},
        now()
      )
    `),
    ...defaultCatalogLearningPaths.flatMap((path) =>
      path.algorithmSlugs.map((slug, index) => sql`
        insert into catalog_learning_path_entries (
          path_slug,
          algorithm_slug,
          position
        ) values (
          ${path.slug},
          ${slug},
          ${index + 1}
        )
      `),
    ),
    ...defaultCatalogCollections.map((collection, index) => sql`
      insert into catalog_collections (
        slug,
        title,
        summary,
        sort_order,
        updated_at
      ) values (
        ${collection.slug},
        ${collection.title},
        ${collection.summary},
        ${index + 1},
        now()
      )
    `),
    ...collectionEntries.map((entry) => sql`
      insert into catalog_collection_entries (
        collection_slug,
        algorithm_slug,
        position
      ) values (
        ${entry.collectionSlug},
        ${entry.algorithmSlug},
        ${entry.position}
      )
    `),
  ]);

  console.log(
    `Synced ${indexRecords.length} algorithms, ${defaultCatalogLearningPaths.length} learning paths, and ${defaultCatalogCollections.length} collections.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
