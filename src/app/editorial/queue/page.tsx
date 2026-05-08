import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";

import {
  getEditorialPasswordEnvVarName,
  isEditorialAuthConfigured,
  isEditorialSessionAuthenticated,
} from "@/lib/editorial-auth";
import { lockEditorialQueueAction } from "@/app/editorial/queue/actions";
import {
  EditorialQueueEntryForm,
  EditorialQueueImportForm,
  EditorialQueueUnlockForm,
} from "@/components/editorial-queue-controls";
import {
  listEditorialQueueEntries,
  type EditorialQueueEntry,
  type EditorialQueueStatus,
} from "@/lib/editorial-queue";

export const metadata: Metadata = {
  title: "Editorial Queue",
  description:
    "Review and mutate the database-backed editorial queue without dropping to CLI commands.",
};

const queueStatuses: EditorialQueueStatus[] = [
  "queued",
  "drafted",
  "published",
  "duplicate",
];

type QueueGroup = {
  entries: EditorialQueueEntry[];
  sourceLabel: string;
  sourceUrl: string | null;
};

export default async function EditorialQueuePage() {
  await connection();

  if (!isEditorialAuthConfigured()) {
    return (
      <main className="shell-grid min-h-screen px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-4 sm:py-8">
          <section className="glass-panel rounded-[36px] px-5 py-6 sm:px-8 sm:py-8">
            <Link
              href="/"
              className="inline-flex rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
            >
              Back to catalog
            </Link>
            <p className="mt-6 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Editorial Queue Locked
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Configure a route password before using the editorial workflow
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              The queue now requires a single-operator password gate. Set the environment variable
              {" "}
              <span className="font-semibold text-[var(--foreground)]">
                {getEditorialPasswordEnvVarName()}
              </span>
              {" "}
              locally and in Vercel before opening this route.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const isAuthenticated = await isEditorialSessionAuthenticated();

  if (!isAuthenticated) {
    return (
      <main className="shell-grid min-h-screen px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-4 sm:py-8">
          <section className="glass-panel rounded-[36px] px-5 py-6 sm:px-8 sm:py-8">
            <Link
              href="/"
              className="inline-flex rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
            >
              Back to catalog
            </Link>
            <p className="mt-6 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Editorial Queue Locked
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Sign in to review the queue
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              This route now uses a small cookie-backed password gate so queue reads and mutations stay limited to the operator who knows the editorial secret.
            </p>
            <EditorialQueueUnlockForm className="mt-8 max-w-md" />
          </section>
        </div>
      </main>
    );
  }

  const entries = await listEditorialQueueEntries();
  const queueGroups = groupEditorialQueueEntries(entries);
  const statusCounts = queueStatuses.map((status) => ({
    count: entries.filter((entry) => entry.status === status).length,
    status,
  }));

  return (
    <main className="shell-grid min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4 sm:py-8">
        <section className="glass-panel rounded-[36px] px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
                >
                  Back to catalog
                </Link>
                <form action={lockEditorialQueueAction}>
                  <button
                    type="submit"
                    className="inline-flex rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
                  >
                    Lock queue
                  </button>
                </form>
              </div>
              <p className="mt-6 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Editorial Queue
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Review, publish, and dedupe queued additions
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
                This route uses the same Postgres workflow as the queue CLI, but keeps import and row mutations available inside the app for faster editorial review.
              </p>
            </div>
            <EditorialQueueImportForm />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {statusCounts.map(({ count, status }) => (
              <div key={status} className="rounded-[24px] bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">{status}</p>
                <p className="mt-2 text-3xl font-semibold">{count}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-5">
          {queueGroups.length === 0 ? (
            <div className="glass-panel rounded-[28px] p-6 text-sm text-[var(--muted)]">
              The editorial queue is empty.
            </div>
          ) : (
            queueGroups.map((group) => (
              <section key={group.sourceLabel} className="glass-panel rounded-[28px] p-5 sm:p-6">
                <div className="flex flex-col gap-3 border-b border-black/8 pb-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Source</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{group.sourceLabel}</h2>
                  </div>
                  {group.sourceUrl ? (
                    <a
                      href={group.sourceUrl}
                      className="text-sm font-medium text-[var(--accent-strong)] transition hover:text-[var(--foreground)]"
                    >
                      Open source
                    </a>
                  ) : null}
                </div>
                <div className="mt-5 grid gap-4">
                  {group.entries.map((entry) => (
                    <article key={entry.id} className="rounded-[24px] bg-white/70 p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-2xl">
                          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                            Queue row #{entry.id} · {entry.sourceOrder}
                          </p>
                          <h3 className="mt-2 text-xl font-semibold">{entry.title}</h3>
                          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                            Current status: <span className="font-medium text-[var(--foreground)]">{entry.status}</span>
                            {entry.duplicateOfSlug ? ` · duplicate of ${entry.duplicateOfSlug}` : ""}
                          </p>
                        </div>
                        <p className="text-sm text-[var(--muted)]">
                          Updated {formatTimestamp(entry.updatedAt)}
                        </p>
                      </div>
                      <EditorialQueueEntryForm entry={entry} />
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function groupEditorialQueueEntries(entries: EditorialQueueEntry[]): QueueGroup[] {
  const groups = new Map<string, QueueGroup>();

  for (const entry of entries) {
    const existingGroup = groups.get(entry.sourceLabel);

    if (existingGroup) {
      existingGroup.entries.push(entry);
      continue;
    }

    groups.set(entry.sourceLabel, {
      entries: [entry],
      sourceLabel: entry.sourceLabel,
      sourceUrl: entry.sourceUrl,
    });
  }

  return Array.from(groups.values());
}