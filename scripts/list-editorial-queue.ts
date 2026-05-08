import { loadEnvConfig } from "@next/env";

import { listEditorialQueueEntries } from "../src/lib/editorial-queue";

async function main() {
  loadEnvConfig(process.cwd());

  const rows = await listEditorialQueueEntries();

  if (rows.length === 0) {
    console.log("Editorial source queue is empty.");
    return;
  }

  let currentSourceLabel = "";

  for (const row of rows) {
    if (row.sourceLabel !== currentSourceLabel) {
      currentSourceLabel = row.sourceLabel;
      console.log(`\n${currentSourceLabel}`);
    }

    const duplicateSuffix = row.duplicateOfSlug ? ` duplicate of ${row.duplicateOfSlug}` : "";
    const slugSuffix = row.candidateSlug ? ` [${row.candidateSlug}]` : "";
    console.log(
      `- #${row.id} · ${row.sourceOrder}. [${row.status}] ${row.title}${slugSuffix}${duplicateSuffix}`,
    );

    if (row.notes) {
      console.log(`  note: ${row.notes}`);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});