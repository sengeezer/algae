"use client";

import { useSyncExternalStore } from "react";

import {
  getStudyStateServerSnapshot,
  getStudyMarker,
  isReviewDue,
  readStudyState,
  recordStudyReview,
  subscribeToStudyState,
  toggleStudyFlag,
  writeStudyState,
} from "@/lib/study-state";

type StudyActionsProps = {
  slug: string;
};

export function StudyActions({ slug }: StudyActionsProps) {
  const studyState = useSyncExternalStore(
    subscribeToStudyState,
    readStudyState,
    getStudyStateServerSnapshot,
  );

  const marker = getStudyMarker(studyState, slug);
  const dueNow = isReviewDue(marker);

  return (
    <div className="glass-panel rounded-[24px] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
        Study State
      </p>
      <h2 className="mt-2 text-xl font-semibold">Keep a lightweight review trail</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Version one stores progress locally in the browser so you can revisit saved or completed algorithms without adding accounts yet.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StudyMetric label="Queue" value={marker.bookmarked ? "Saved" : "Not saved"} />
        <StudyMetric label="Reviews logged" value={String(marker.reviewCount)} />
        <StudyMetric label="Next review" value={getNextReviewLabel(marker)} tone={dueNow ? "due" : "default"} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            writeStudyState(toggleStudyFlag(readStudyState(), slug, "bookmarked"))
          }
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            marker.bookmarked
              ? "bg-[var(--accent)] text-white"
              : "pill hover:border-[var(--accent)]"
          }`}
        >
          {marker.bookmarked ? "Saved" : "Save for review"}
        </button>
        <button
          type="button"
          onClick={() => writeStudyState(recordStudyReview(readStudyState(), slug))}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            dueNow
              ? "bg-[var(--accent-strong)] text-white"
              : "bg-[var(--accent-soft)] text-[var(--accent-strong)] hover:bg-[var(--accent)] hover:text-white"
          }`}
        >
          Record review
        </button>
        <button
          type="button"
          onClick={() =>
            writeStudyState(toggleStudyFlag(readStudyState(), slug, "completed"))
          }
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            marker.completed
              ? "bg-[var(--accent-strong)] text-white"
              : "pill hover:border-[var(--accent)]"
          }`}
        >
          {marker.completed ? "Completed" : "Mark complete"}
        </button>
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
        {marker.lastReviewedAt
          ? `Last reviewed ${formatStudyDate(marker.lastReviewedAt)}.`
          : "No review logged yet."}{" "}
        {marker.completed
          ? "This reference is marked complete and can stay in rotation as a lighter review."
          : "Saved references stay in the active queue until you decide they are complete."}
      </p>
    </div>
  );
}

type StudyMetricProps = {
  label: string;
  tone?: "default" | "due";
  value: string;
};

function StudyMetric({ label, tone = "default", value }: StudyMetricProps) {
  return (
    <div
      className={`rounded-[18px] border px-3 py-3 ${
        tone === "due"
          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
          : "border-black/8 bg-white/65"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function formatStudyDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getNextReviewLabel(marker: ReturnType<typeof getStudyMarker>): string {
  if (isReviewDue(marker)) {
    return "Due now";
  }

  if (marker.nextReviewAt) {
    return formatStudyDate(marker.nextReviewAt);
  }

  return "Start with one review";
}