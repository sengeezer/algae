"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  importEditorialQueueAction,
  unlockEditorialQueueAction,
  updateEditorialQueueEntryAction,
} from "@/app/editorial/queue/actions";
import {
  initialEditorialQueueFormState,
  type EditorialQueueFormState,
} from "@/app/editorial/queue/form-state";
import type {
  EditorialQueueEntry,
  EditorialQueueStatus,
} from "@/lib/editorial-queue";

const queueStatuses: EditorialQueueStatus[] = [
  "queued",
  "drafted",
  "published",
  "duplicate",
];

type EditorialQueueUnlockFormProps = {
  className?: string;
};

export function EditorialQueueUnlockForm({ className }: EditorialQueueUnlockFormProps) {
  const [state, formAction] = useActionState(
    unlockEditorialQueueAction,
    initialEditorialQueueFormState,
  );

  return (
    <form action={formAction} className={className}>
      <div className="space-y-4">
        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
            Editorial password
          </span>
          <input
            type="password"
            name="password"
            required
            className="rounded-[18px] border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
          />
        </label>
        <FormStateMessage state={state} />
        <PendingButton
          idleLabel="Unlock queue"
          pendingLabel="Unlocking..."
          className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
        />
      </div>
    </form>
  );
}

export function EditorialQueueImportForm() {
  const [state, formAction] = useActionState(
    importEditorialQueueAction,
    initialEditorialQueueFormState,
  );

  return (
    <form action={formAction} className="lg:min-w-[260px]">
      <div className="space-y-3">
        <PendingButton
          idleLabel="Refresh from catalog-expansion.md"
          pendingLabel="Refreshing queue..."
          className="w-full rounded-[24px] bg-[var(--foreground)] px-5 py-4 text-left text-white transition hover:bg-[var(--accent-strong)]"
          description="Re-import the latest markdown-defined next clean queue into Postgres."
          eyebrow="Import"
          titleClassName="mt-2 block text-lg font-semibold"
          descriptionClassName="mt-2 block text-sm leading-6 text-white/80"
          eyebrowClassName="block text-xs uppercase tracking-[0.25em] text-white/70"
        />
        <FormStateMessage state={state} />
      </div>
    </form>
  );
}

type EditorialQueueEntryFormProps = {
  entry: EditorialQueueEntry;
};

export function EditorialQueueEntryForm({ entry }: EditorialQueueEntryFormProps) {
  const [state, formAction] = useActionState(
    updateEditorialQueueEntryAction,
    initialEditorialQueueFormState,
  );

  return (
    <form action={formAction} className="mt-5 grid gap-4 xl:grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)]">
      <input type="hidden" name="id" value={entry.id} />
      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Status</span>
        <select
          name="status"
          defaultValue={entry.status}
          className="rounded-[18px] border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
        >
          {queueStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Candidate slug</span>
        <input
          name="candidateSlug"
          defaultValue={entry.candidateSlug ?? ""}
          placeholder="candidate-algorithm-slug"
          className="rounded-[18px] border border-black/10 bg-white px-4 py-3 outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Duplicate of</span>
        <input
          name="duplicateOfSlug"
          defaultValue={entry.duplicateOfSlug ?? ""}
          placeholder="existing-published-slug"
          className="rounded-[18px] border border-black/10 bg-white px-4 py-3 outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />
      </label>
      <label className="flex flex-col gap-2 xl:col-span-2">
        <span className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Notes</span>
        <textarea
          name="notes"
          defaultValue={entry.notes ?? ""}
          rows={3}
          placeholder="Reasoning, duplicate rationale, or publication note"
          className="rounded-[18px] border border-black/10 bg-white px-4 py-3 outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />
      </label>
      <div className="xl:col-span-3">
        <FormStateMessage state={state} />
      </div>
      <div className="flex items-end xl:col-span-3 xl:justify-end">
        <PendingButton
          idleLabel="Save queue row"
          pendingLabel="Saving queue row..."
          className="w-full rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)] xl:w-auto"
        />
      </div>
    </form>
  );
}

type PendingButtonProps = {
  className: string;
  description?: string;
  descriptionClassName?: string;
  eyebrow?: string;
  eyebrowClassName?: string;
  idleLabel: string;
  pendingLabel: string;
  titleClassName?: string;
};

function PendingButton({
  className,
  description,
  descriptionClassName,
  eyebrow,
  eyebrowClassName,
  idleLabel,
  pendingLabel,
  titleClassName,
}: PendingButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={`${className} disabled:cursor-wait disabled:opacity-75`}>
      {eyebrow ? <span className={eyebrowClassName}>{eyebrow}</span> : null}
      <span className={titleClassName}>{pending ? pendingLabel : idleLabel}</span>
      {description ? <span className={descriptionClassName}>{description}</span> : null}
    </button>
  );
}

type FormStateMessageProps = {
  state: EditorialQueueFormState;
};

function FormStateMessage({ state }: FormStateMessageProps) {
  if (state.kind === "idle" || !state.message) {
    return null;
  }

  const toneClassName =
    state.kind === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <p className={`rounded-[18px] border px-4 py-3 text-sm ${toneClassName}`}>
      {state.message}
    </p>
  );
}