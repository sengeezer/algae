import { loadEnvConfig } from "@next/env";

import { importEditorialQueueFromMarkdown } from "../src/lib/editorial-queue";

async function main() {
  loadEnvConfig(process.cwd());

  const { sourceLabel, titles } = await importEditorialQueueFromMarkdown(process.argv[2]);

  console.log(`Imported ${titles.length} queued items for ${sourceLabel}.`);

  for (const [index, title] of titles.entries()) {
    console.log(`${index + 1}. ${title}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});