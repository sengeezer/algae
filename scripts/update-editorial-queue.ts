import { loadEnvConfig } from "@next/env";

import {
  type EditorialQueueStatus,
  updateEditorialQueueEntry,
} from "../src/lib/editorial-queue";

type ParsedArguments = {
  candidateSlug?: string;
  duplicateOfSlug?: string;
  id: number;
  notes?: string;
  status: EditorialQueueStatus;
};

const allowedStatuses = new Set<EditorialQueueStatus>([
  "queued",
  "drafted",
  "published",
  "duplicate",
]);

function parseArguments(argv: string[]): ParsedArguments {
  const [statusArgument, ...rest] = argv;

  if (!statusArgument || !allowedStatuses.has(statusArgument as EditorialQueueStatus)) {
    throw new Error(
      "Usage: tsx ./scripts/update-editorial-queue.ts <queued|drafted|published|duplicate> --id <row-id> [--candidate-slug <slug>] [--duplicate-of <slug>] [--notes <text>]",
    );
  }

  const parsedArguments: Partial<ParsedArguments> = {
    status: statusArgument as EditorialQueueStatus,
  };

  for (let index = 0; index < rest.length; index += 2) {
    const flag = rest[index];
    const value = rest[index + 1];

    if (!flag.startsWith("--")) {
      throw new Error(`Unexpected argument: ${flag}`);
    }

    if (!value) {
      throw new Error(`Missing value for ${flag}`);
    }

    switch (flag) {
      case "--id": {
        const numericId = Number.parseInt(value, 10);

        if (!Number.isInteger(numericId) || numericId <= 0) {
          throw new Error(`Invalid queue row id: ${value}`);
        }

        parsedArguments.id = numericId;
        break;
      }
      case "--candidate-slug":
        parsedArguments.candidateSlug = value.trim() || undefined;
        break;
      case "--duplicate-of":
        parsedArguments.duplicateOfSlug = value.trim() || undefined;
        break;
      case "--notes":
        parsedArguments.notes = value;
        break;
      default:
        throw new Error(`Unsupported flag: ${flag}`);
    }
  }

  if (!parsedArguments.id) {
    throw new Error("The queue row id is required. Pass --id <row-id>.");
  }

  if (parsedArguments.status === "duplicate" && !parsedArguments.duplicateOfSlug) {
    throw new Error("Duplicate queue entries require --duplicate-of <published-slug>.");
  }

  return parsedArguments as ParsedArguments;
}

async function main() {
  loadEnvConfig(process.cwd());

  const { candidateSlug, duplicateOfSlug, id, notes, status } = parseArguments(process.argv.slice(2));
  const updatedRow = await updateEditorialQueueEntry({
    candidateSlug,
    duplicateOfSlug,
    id,
    notes,
    status,
  });

  console.log(
    `Updated queue row #${updatedRow.id}: ${updatedRow.title} (${updatedRow.status} saved).`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});