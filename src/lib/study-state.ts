export interface StudyMarker {
  bookmarked: boolean;
  completed: boolean;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  reviewCount: number;
}

export type StudyState = Record<string, StudyMarker>;

export const studyStateStorageKey = "algae.study-state";
const studyStateEventName = "algae-study-state-change";
const emptyStudyState: StudyState = {};
const reviewIntervalsInDays = [1, 3, 7, 14, 30];

let cachedRawState: string | null = null;
let cachedStudyState: StudyState = emptyStudyState;

function normalizeStudyMarker(marker?: Partial<StudyMarker>): StudyMarker {
  return {
    bookmarked: Boolean(marker?.bookmarked),
    completed: Boolean(marker?.completed),
    lastReviewedAt:
      typeof marker?.lastReviewedAt === "string" ? marker.lastReviewedAt : null,
    nextReviewAt:
      typeof marker?.nextReviewAt === "string" ? marker.nextReviewAt : null,
    reviewCount:
      typeof marker?.reviewCount === "number" && Number.isFinite(marker.reviewCount)
        ? marker.reviewCount
        : 0,
  };
}

function normalizeStudyState(state: unknown): StudyState {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return emptyStudyState;
  }

  return Object.fromEntries(
    Object.entries(state as Record<string, Partial<StudyMarker>>).map(([slug, marker]) => [
      slug,
      normalizeStudyMarker(marker),
    ]),
  );
}

function scheduleNextReview(reviewCount: number, reviewedAtIso: string): string {
  const reviewDate = new Date(reviewedAtIso);
  const interval = reviewIntervalsInDays[Math.min(reviewCount - 1, reviewIntervalsInDays.length - 1)];
  reviewDate.setDate(reviewDate.getDate() + interval);
  return reviewDate.toISOString();
}

export function getStudyMarker(state: StudyState, slug: string): StudyMarker {
  return normalizeStudyMarker(state[slug]);
}

export function readStudyState(): StudyState {
  if (typeof window === "undefined") {
    return emptyStudyState;
  }

  const raw = window.localStorage.getItem(studyStateStorageKey);

  if (!raw) {
    cachedRawState = null;
    cachedStudyState = emptyStudyState;
    return emptyStudyState;
  }

  if (raw === cachedRawState) {
    return cachedStudyState;
  }

  try {
    cachedRawState = raw;
    cachedStudyState = normalizeStudyState(JSON.parse(raw));
    return cachedStudyState;
  } catch {
    cachedRawState = null;
    cachedStudyState = emptyStudyState;
    return emptyStudyState;
  }
}

export function getStudyStateServerSnapshot(): StudyState {
  return emptyStudyState;
}

export function writeStudyState(state: StudyState): void {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedState = normalizeStudyState(state);
  const serializedState = JSON.stringify(normalizedState);

  cachedRawState = serializedState;
  cachedStudyState = normalizedState;
  window.localStorage.setItem(studyStateStorageKey, serializedState);
  window.dispatchEvent(new Event(studyStateEventName));
}

export function subscribeToStudyState(onChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => onChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener(studyStateEventName, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(studyStateEventName, handleChange);
  };
}

export function toggleStudyFlag(
  state: StudyState,
  slug: string,
  flag: keyof StudyMarker,
): StudyState {
  if (flag === "lastReviewedAt" || flag === "nextReviewAt" || flag === "reviewCount") {
    return state;
  }

  const currentMarker = getStudyMarker(state, slug);
  const nextMarker = {
    ...currentMarker,
    [flag]: !currentMarker[flag],
  };

  return {
    ...state,
    [slug]: nextMarker,
  };
}

export function recordStudyReview(state: StudyState, slug: string): StudyState {
  const currentMarker = getStudyMarker(state, slug);
  const reviewedAt = new Date().toISOString();
  const reviewCount = currentMarker.reviewCount + 1;

  return {
    ...state,
    [slug]: {
      ...currentMarker,
      bookmarked: true,
      lastReviewedAt: reviewedAt,
      nextReviewAt: scheduleNextReview(reviewCount, reviewedAt),
      reviewCount,
    },
  };
}

export function isReviewDue(marker: StudyMarker, now = new Date()): boolean {
  if (!marker.nextReviewAt) {
    return false;
  }

  return new Date(marker.nextReviewAt).getTime() <= now.getTime();
}