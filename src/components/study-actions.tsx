"use client";

import { useSyncExternalStore } from "react";

import {
  getStudyStateServerSnapshot,
  getStudyMarker,
  readStudyState,
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

  return (
    <div className="glass-panel rounded-[24px] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
        Study State
      </p>
      <h2 className="mt-2 text-xl font-semibold">Keep a lightweight review trail</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Version one stores progress locally in the browser so you can revisit saved or completed algorithms without adding accounts yet.
      </p>
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
    </div>
  );
}