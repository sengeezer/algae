import { unstable_cache } from "next/cache";

import {
  buildCatalogCollections,
  buildCatalogLearningPaths,
  mapAlgorithmToCatalogIndexRecord,
  type CatalogCollection,
  type CatalogIndexRecord,
  type CatalogLearningPath,
} from "@/lib/catalog-index";
import { listAlgorithms } from "@/lib/content-source";
import { getDatabaseClient, isDatabaseConfigured } from "@/lib/database";
import type { CatalogPrimaryTopic } from "@/types/algorithm";

type CatalogIndexDatabaseRow = {
  aliases: string[];
  category: string;
  complexity_notes: string;
  complexity_space: string;
  complexity_time: string;
  data_structures: string[];
  description: string;
  difficulty: CatalogIndexRecord["difficulty"];
  interview_frequency: CatalogIndexRecord["interviewFrequency"];
  interview_signals: string[];
  primary_topic: CatalogPrimaryTopic;
  related_slugs: string[];
  search_text: string;
  slug: string;
  summary: string;
  technique_families: string[];
  techniques: string[];
  title: string;
  use_cases: string[];
};

type CatalogLearningPathDatabaseRow = {
  algorithm_slug: string | null;
  primary_topic: CatalogPrimaryTopic;
  slug: string;
  summary: string;
  title: string;
};

type CatalogCollectionDatabaseRow = {
  algorithm_slug: string | null;
  slug: string;
  summary: string;
  title: string;
};

function mapDatabaseRowToCatalogIndexRecord(row: CatalogIndexDatabaseRow): CatalogIndexRecord {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    grouping: {
      primaryTopic: row.primary_topic,
      techniqueFamilies: row.technique_families,
    },
    summary: row.summary,
    description: row.description,
    difficulty: row.difficulty,
    interviewFrequency: row.interview_frequency,
    dataStructures: row.data_structures,
    techniques: row.techniques,
    aliases: row.aliases,
    useCases: row.use_cases,
    interviewSignals: row.interview_signals,
    relatedSlugs: row.related_slugs,
    complexity: {
      time: row.complexity_time,
      space: row.complexity_space,
      notes: row.complexity_notes,
    },
    searchText: row.search_text,
  };
}

async function readCatalogIndexFromDatabase(): Promise<CatalogIndexRecord[]> {
  const sql = getDatabaseClient();
  const rows = (await sql.query(`
    select
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
      search_text
    from algorithm_catalog_index
    order by title asc
  `)) as CatalogIndexDatabaseRow[];

  return rows.map(mapDatabaseRowToCatalogIndexRecord);
}

function createRecordMap(records: CatalogIndexRecord[]): Map<string, CatalogIndexRecord> {
  return new Map(records.map((record) => [record.slug, record]));
}

async function readCatalogLearningPathsFromDatabase(): Promise<CatalogLearningPath[]> {
  const sql = getDatabaseClient();
  const recordsBySlug = createRecordMap(await getCachedCatalogIndexFromDatabase());
  const rows = (await sql.query(`
    select
      paths.slug,
      paths.title,
      paths.summary,
      paths.primary_topic,
      entries.algorithm_slug
    from catalog_learning_paths as paths
    left join catalog_learning_path_entries as entries
      on entries.path_slug = paths.slug
    order by paths.sort_order asc, paths.title asc, entries.position asc
  `)) as CatalogLearningPathDatabaseRow[];

  const paths = new Map<string, CatalogLearningPath>();

  for (const row of rows) {
    const existingPath = paths.get(row.slug);

    if (existingPath) {
      if (row.algorithm_slug) {
        const algorithm = recordsBySlug.get(row.algorithm_slug);

        if (algorithm) {
          existingPath.algorithms.push(algorithm);
        }
      }

      continue;
    }

    paths.set(row.slug, {
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      primaryTopic: row.primary_topic,
      algorithms: row.algorithm_slug
        ? [recordsBySlug.get(row.algorithm_slug)].filter(
            (algorithm): algorithm is CatalogIndexRecord => Boolean(algorithm),
          )
        : [],
    });
  }

  return Array.from(paths.values());
}

async function readCatalogCollectionsFromDatabase(): Promise<CatalogCollection[]> {
  const sql = getDatabaseClient();
  const recordsBySlug = createRecordMap(await getCachedCatalogIndexFromDatabase());
  const rows = (await sql.query(`
    select
      collections.slug,
      collections.title,
      collections.summary,
      entries.algorithm_slug
    from catalog_collections as collections
    left join catalog_collection_entries as entries
      on entries.collection_slug = collections.slug
    order by collections.sort_order asc, collections.title asc, entries.position asc
  `)) as CatalogCollectionDatabaseRow[];

  const collections = new Map<string, CatalogCollection>();

  for (const row of rows) {
    const existingCollection = collections.get(row.slug);

    if (existingCollection) {
      if (row.algorithm_slug) {
        const algorithm = recordsBySlug.get(row.algorithm_slug);

        if (algorithm) {
          existingCollection.algorithms.push(algorithm);
        }
      }

      continue;
    }

    collections.set(row.slug, {
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      algorithms: row.algorithm_slug
        ? [recordsBySlug.get(row.algorithm_slug)].filter(
            (algorithm): algorithm is CatalogIndexRecord => Boolean(algorithm),
          )
        : [],
    });
  }

  return Array.from(collections.values());
}

const getCachedCatalogIndexFromDatabase = unstable_cache(
  readCatalogIndexFromDatabase,
  ["catalog-index"],
  {
    revalidate: 3600,
    tags: ["catalog-index"],
  },
);

const getCachedCatalogLearningPathsFromDatabase = unstable_cache(
  readCatalogLearningPathsFromDatabase,
  ["catalog-learning-paths"],
  {
    revalidate: 3600,
    tags: ["catalog-index", "catalog-learning-paths"],
  },
);

const getCachedCatalogCollectionsFromDatabase = unstable_cache(
  readCatalogCollectionsFromDatabase,
  ["catalog-collections"],
  {
    revalidate: 3600,
    tags: ["catalog-index", "catalog-collections"],
  },
);

export async function listCatalogIndexRecords(): Promise<CatalogIndexRecord[]> {
  if (!isDatabaseConfigured()) {
    return listAlgorithms().map(mapAlgorithmToCatalogIndexRecord);
  }

  return getCachedCatalogIndexFromDatabase();
}

export async function getCatalogIndexRecordBySlug(
  slug: string,
): Promise<CatalogIndexRecord | undefined> {
  const records = await listCatalogIndexRecords();
  return records.find((record) => record.slug === slug);
}

export async function listCatalogLearningPaths(): Promise<CatalogLearningPath[]> {
  if (!isDatabaseConfigured()) {
    return buildCatalogLearningPaths(await listCatalogIndexRecords());
  }

  return getCachedCatalogLearningPathsFromDatabase();
}

export async function listCatalogCollections(): Promise<CatalogCollection[]> {
  if (!isDatabaseConfigured()) {
    return buildCatalogCollections(await listCatalogIndexRecords());
  }

  return getCachedCatalogCollectionsFromDatabase();
}

export async function getCatalogLearningPathBySlug(
  slug: string,
): Promise<CatalogLearningPath | undefined> {
  const paths = await listCatalogLearningPaths();
  return paths.find((path) => path.slug === slug);
}

export async function getCatalogCollectionBySlug(
  slug: string,
): Promise<CatalogCollection | undefined> {
  const collections = await listCatalogCollections();
  return collections.find((collection) => collection.slug === slug);
}
