import { neon } from "@neondatabase/serverless";

const databaseEnvironmentKeys = ["DATABASE_URL", "POSTGRES_URL"] as const;

export function getDatabaseConnectionString(): string | null {
  for (const key of databaseEnvironmentKeys) {
    const value = process.env[key]?.trim();

    if (value) {
      return value;
    }
  }

  return null;
}

export function isDatabaseConfigured(): boolean {
  return getDatabaseConnectionString() !== null;
}

export function getDatabaseClient() {
  const connectionString = getDatabaseConnectionString();

  if (!connectionString) {
    throw new Error(
      "Database is not configured. Set DATABASE_URL or POSTGRES_URL before running catalog database commands.",
    );
  }

  return neon(connectionString);
}
