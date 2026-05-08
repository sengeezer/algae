import { readFile } from "node:fs/promises";
import path from "node:path";

import { loadEnvConfig } from "@next/env";

import { getDatabaseClient } from "../src/lib/database";

function splitSqlStatements(source: string): string[] {
  return source
    .split(/;\s*(?:\n|$)/g)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function main() {
  loadEnvConfig(process.cwd());

  const [relativeFilePath] = process.argv.slice(2);

  if (!relativeFilePath) {
    throw new Error("Usage: tsx ./scripts/run-sql-file.ts ./db/migrations/001_catalog_index.sql");
  }

  const absoluteFilePath = path.resolve(process.cwd(), relativeFilePath);
  const sqlFile = await readFile(absoluteFilePath, "utf8");
  const statements = splitSqlStatements(sqlFile);
  const sql = getDatabaseClient();

  for (const statement of statements) {
    await sql.query(statement);
  }

  console.log(`Applied ${statements.length} SQL statements from ${relativeFilePath}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
