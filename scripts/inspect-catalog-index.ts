import { loadEnvConfig } from "@next/env";

import { getDatabaseClient } from "../src/lib/database";

type CountRow = {
  count: number;
};

type TopicRow = {
  count: number;
  primary_topic: string;
};

async function main() {
  loadEnvConfig(process.cwd());

  const sql = getDatabaseClient();
  const [catalogCount] = (await sql.query(`
    select count(*)::int as count
    from algorithm_catalog_index
  `)) as CountRow[];
  const topicRows = (await sql.query(`
    select primary_topic, count(*)::int as count
    from algorithm_catalog_index
    group by primary_topic
    order by count desc, primary_topic asc
  `)) as TopicRow[];

  console.log(`Indexed algorithms: ${catalogCount?.count ?? 0}`);

  for (const row of topicRows) {
    console.log(`${row.primary_topic}: ${row.count}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});