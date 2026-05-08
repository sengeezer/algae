create table if not exists algorithm_catalog_index (
  slug text primary key,
  title text not null,
  category text not null,
  primary_topic text not null,
  summary text not null,
  description text not null,
  difficulty text not null,
  interview_frequency text not null,
  data_structures jsonb not null default '[]'::jsonb,
  techniques jsonb not null default '[]'::jsonb,
  technique_families jsonb not null default '[]'::jsonb,
  aliases jsonb not null default '[]'::jsonb,
  use_cases jsonb not null default '[]'::jsonb,
  interview_signals jsonb not null default '[]'::jsonb,
  related_slugs jsonb not null default '[]'::jsonb,
  complexity_time text not null,
  complexity_space text not null,
  complexity_notes text not null,
  search_text text not null,
  search_document tsvector generated always as (to_tsvector('simple', coalesce(search_text, ''))) stored,
  indexed_at timestamptz not null default now()
);

create index if not exists algorithm_catalog_index_primary_topic_idx
  on algorithm_catalog_index (primary_topic);

create index if not exists algorithm_catalog_index_difficulty_idx
  on algorithm_catalog_index (difficulty);

create index if not exists algorithm_catalog_index_interview_frequency_idx
  on algorithm_catalog_index (interview_frequency);

create index if not exists algorithm_catalog_index_search_document_idx
  on algorithm_catalog_index using gin (search_document);

create table if not exists catalog_learning_paths (
  slug text primary key,
  title text not null,
  summary text not null,
  primary_topic text not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists catalog_learning_path_entries (
  path_slug text not null references catalog_learning_paths(slug) on delete cascade,
  algorithm_slug text not null references algorithm_catalog_index(slug) on delete cascade,
  position integer not null,
  primary key (path_slug, algorithm_slug)
);

create index if not exists catalog_learning_path_entries_path_position_idx
  on catalog_learning_path_entries (path_slug, position);

create table if not exists catalog_collections (
  slug text primary key,
  title text not null,
  summary text not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists catalog_collection_entries (
  collection_slug text not null references catalog_collections(slug) on delete cascade,
  algorithm_slug text not null references algorithm_catalog_index(slug) on delete cascade,
  position integer not null,
  primary key (collection_slug, algorithm_slug)
);

create index if not exists catalog_collection_entries_collection_position_idx
  on catalog_collection_entries (collection_slug, position);

create table if not exists editorial_source_queue (
  id bigserial primary key,
  source_label text not null,
  source_url text,
  source_order integer not null,
  title text not null,
  candidate_slug text,
  status text not null,
  duplicate_of_slug text,
  notes text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists editorial_source_queue_status_source_idx
  on editorial_source_queue (status, source_label, source_order);
