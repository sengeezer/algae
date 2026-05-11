import fs from "node:fs";
import path from "node:path";

import { getDatabaseClient } from "@/lib/database";

export type EditorialQueueStatus = "queued" | "drafted" | "published" | "duplicate";

export type EditorialQueueEntry = {
  candidateSlug: string | null;
  createdAt: string;
  duplicateOfSlug: string | null;
  id: number;
  notes: string | null;
  sourceLabel: string;
  sourceOrder: number;
  sourceUrl: string | null;
  status: EditorialQueueStatus;
  title: string;
  updatedAt: string;
};

export type UpdateEditorialQueueEntryInput = {
  candidateSlug?: string | null;
  duplicateOfSlug?: string | null;
  id: number;
  notes?: string | null;
  status: EditorialQueueStatus;
};

type EditorialQueueRow = {
  candidate_slug: string | null;
  created_at: string;
  duplicate_of_slug: string | null;
  id: number;
  notes: string | null;
  source_label: string;
  source_order: number;
  source_url: string | null;
  status: EditorialQueueStatus;
  title: string;
  updated_at: string;
};

type ExtractedQueue = {
  sourceLabel: string;
  titles: string[];
};

type ImportedQueues = {
  queues: ExtractedQueue[];
  totalTitles: number;
};

export const importedQueueNote =
  "Imported from catalog-expansion.md latest next clean queue.";

const latestQueuePattern =
  /- .*?\bthe next clean ([^.\n]+?) queue(?: after[^\n]*?)? is ((?:\`[^\`]+\`(?:, |, and | and )?)+)\./gi;
const queueTitlePattern = /\`([^\`]+)\`/g;

export async function listEditorialQueueEntries(): Promise<EditorialQueueEntry[]> {
  const sql = getDatabaseClient();
  const rows = (await sql`
    select
      id,
      source_label,
      source_url,
      source_order,
      title,
      candidate_slug,
      status,
      duplicate_of_slug,
      notes,
      updated_at,
      created_at
    from editorial_source_queue
    order by
      case status
        when 'queued' then 0
        when 'drafted' then 1
        when 'published' then 2
        when 'duplicate' then 3
        else 4
      end,
      source_label asc,
      source_order asc,
      title asc
  `) as EditorialQueueRow[];

  return rows.map(mapEditorialQueueRow);
}

export async function updateEditorialQueueEntry({
  candidateSlug,
  duplicateOfSlug,
  id,
  notes,
  status,
}: UpdateEditorialQueueEntryInput): Promise<EditorialQueueEntry> {
  const sql = getDatabaseClient();
  const [existingRow] = (await sql`
    select
      id,
      source_label,
      source_url,
      source_order,
      title,
      candidate_slug,
      status,
      duplicate_of_slug,
      notes,
      updated_at,
      created_at
    from editorial_source_queue
    where id = ${id}
    limit 1
  `) as EditorialQueueRow[];

  if (!existingRow) {
    throw new Error(`Queue row ${id} was not found.`);
  }

  const nextCandidateSlug =
    candidateSlug === undefined ? existingRow.candidate_slug : normalizeOptionalText(candidateSlug);
  const nextNotes = notes === undefined ? existingRow.notes : normalizeOptionalText(notes);
  const nextDuplicateOfSlug =
    status === "duplicate"
      ? duplicateOfSlug === undefined
        ? existingRow.duplicate_of_slug
        : normalizeOptionalText(duplicateOfSlug)
      : null;

  if (status === "duplicate" && !nextDuplicateOfSlug) {
    throw new Error("Duplicate queue entries require a published slug target.");
  }

  const [updatedRow] = (await sql`
    update editorial_source_queue
    set
      status = ${status},
      candidate_slug = ${nextCandidateSlug},
      duplicate_of_slug = ${nextDuplicateOfSlug},
      notes = ${nextNotes},
      updated_at = now()
    where id = ${id}
    returning
      id,
      source_label,
      source_url,
      source_order,
      title,
      candidate_slug,
      status,
      duplicate_of_slug,
      notes,
      updated_at,
      created_at
  `) as EditorialQueueRow[];

  return mapEditorialQueueRow(updatedRow);
}

export async function importEditorialQueueFromMarkdown(
  markdownRelativePath = "catalog-expansion.md",
): Promise<ImportedQueues> {
  const markdownPath = path.resolve(process.cwd(), markdownRelativePath);
  const markdown = fs.readFileSync(markdownPath, "utf8");
  const extractedQueues = extractLatestQueues(markdown);
  const sql = getDatabaseClient();

  const sourceLabels = new Set<string>();

  for (const { sourceLabel } of extractedQueues) {
    if (sourceLabels.has(sourceLabel)) {
      throw new Error(
        `The latest source-order note declares multiple queues for ${sourceLabel}.`,
      );
    }

    sourceLabels.add(sourceLabel);
  }

  await sql.transaction([
    ...extractedQueues.flatMap((queue) => [
      sql`
        delete from editorial_source_queue
        where source_label = ${queue.sourceLabel}
          and status = ${"queued" satisfies EditorialQueueStatus}
          and notes = ${importedQueueNote}
      `,
      ...queue.titles.map((title, index) =>
        sql`
          insert into editorial_source_queue (
            source_label,
            source_order,
            title,
            candidate_slug,
            status,
            notes,
            updated_at
          ) values (
            ${queue.sourceLabel},
            ${index + 1},
            ${title},
            ${buildCandidateSlug(title)},
            ${"queued" satisfies EditorialQueueStatus},
            ${importedQueueNote},
            now()
          )
        `,
      ),
    ]),
  ]);

  return {
    queues: extractedQueues,
    totalTitles: extractedQueues.reduce((count, queue) => count + queue.titles.length, 0),
  };
}

export function buildCandidateSlug(title: string): string | null {
  const candidateSlug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return candidateSlug.length > 0 ? candidateSlug : null;
}

function extractLatestQueues(markdown: string): ExtractedQueue[] {
  const latestNoteBlock = extractLatestSourceOrderNoteBlock(markdown);
  const matches = Array.from(latestNoteBlock.matchAll(latestQueuePattern));

  if (matches.length === 0) {
    throw new Error(
      "Could not find a 'next clean ... queue' entry in the latest 'Current source-order note' block.",
    );
  }

  return matches.map((match) => {
    const sourceLabel = match[1].trim();
    const titles = Array.from(match[2].matchAll(queueTitlePattern), (titleMatch) =>
      titleMatch[1].trim(),
    );

    if (titles.length === 0) {
      throw new Error(`The latest markdown queue for ${sourceLabel} did not contain any queued titles.`);
    }

    return {
      sourceLabel,
      titles,
    };
  });
}

function extractLatestSourceOrderNoteBlock(markdown: string): string {
  const noteHeader = "## Current source-order note";
  const noteStart = markdown.lastIndexOf(noteHeader);

  if (noteStart === -1) {
    throw new Error("Could not find a 'Current source-order note' block in catalog-expansion.md.");
  }

  const nextTopLevelHeader = markdown.indexOf("\n## ", noteStart + noteHeader.length);

  return markdown.slice(noteStart, nextTopLevelHeader === -1 ? undefined : nextTopLevelHeader);
}

function mapEditorialQueueRow(row: EditorialQueueRow): EditorialQueueEntry {
  return {
    candidateSlug: row.candidate_slug,
    createdAt: row.created_at,
    duplicateOfSlug: row.duplicate_of_slug,
    id: row.id,
    notes: row.notes,
    sourceLabel: row.source_label,
    sourceOrder: row.source_order,
    sourceUrl: row.source_url,
    status: row.status,
    title: row.title,
    updatedAt: row.updated_at,
  };
}

function normalizeOptionalText(value: string | null): string | null {
  return value?.trim() ? value.trim() : null;
}