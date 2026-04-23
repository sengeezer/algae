export interface StudyMarker {
  bookmarked: boolean;
  completed: boolean;
}

export type StudyState = Record<string, StudyMarker>;

export const studyStateStorageKey = "algae.study-state";
const studyStateEventName = "algae-study-state-change";
const emptyStudyState: StudyState = {};

let cachedRawState: string | null = null;
let cachedStudyState: StudyState = emptyStudyState;

export function getStudyMarker(state: StudyState, slug: string): StudyMarker {
  return state[slug] ?? { bookmarked: false, completed: false };
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
    cachedStudyState = JSON.parse(raw) as StudyState;
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

  window.localStorage.setItem(studyStateStorageKey, JSON.stringify(state));
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
  const nextMarker = {
    ...getStudyMarker(state, slug),
    [flag]: !getStudyMarker(state, slug)[flag],
  };

  return {
    ...state,
    [slug]: nextMarker,
  };
}