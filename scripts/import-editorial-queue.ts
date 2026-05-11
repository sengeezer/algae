import { loadEnvConfig } from "@next/env";

import { importEditorialQueueFromMarkdown } from "../src/lib/editorial-queue";

async function main() {
  loadEnvConfig(process.cwd());

  const { queues, totalTitles } = await importEditorialQueueFromMarkdown(process.argv[2]);

  console.log(
    `Imported ${totalTitles} queued items across ${queues.length} source queue${queues.length === 1 ? "" : "s"}.`,
  );

  for (const queue of queues) {
    console.log(`\n${queue.sourceLabel}:`);

    for (const [index, title] of queue.titles.entries()) {
      console.log(`${index + 1}. ${title}`);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});