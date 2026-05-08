'use server'

import { revalidatePath } from "next/cache";

import {
  authenticateEditorialPassword,
  clearEditorialSession,
  createEditorialSession,
  getEditorialPasswordEnvVarName,
  isEditorialAuthConfigured,
  requireEditorialSession,
} from "@/lib/editorial-auth";
import {
  importEditorialQueueFromMarkdown,
  type EditorialQueueStatus,
  updateEditorialQueueEntry,
} from "@/lib/editorial-queue";

import {
  initialEditorialQueueFormState,
  type EditorialQueueFormState,
} from "./form-state";

const editorialQueuePath = "/editorial/queue";

const queueStatuses = new Set<EditorialQueueStatus>([
  "queued",
  "drafted",
  "published",
  "duplicate",
]);

export async function unlockEditorialQueueAction(
  _previousState: EditorialQueueFormState,
  formData: FormData,
): Promise<EditorialQueueFormState> {
  if (!isEditorialAuthConfigured()) {
    return errorState(
      `Set ${getEditorialPasswordEnvVarName()} before using the editorial queue.`,
    );
  }

  const password = formData.get("password");

  if (typeof password !== "string" || password.length === 0) {
    return errorState("Enter the editorial password.");
  }

  if (!authenticateEditorialPassword(password)) {
    return errorState("The editorial password was incorrect.");
  }

  await createEditorialSession();
  revalidatePath(editorialQueuePath);

  return successState("Queue unlocked.");
}

export async function lockEditorialQueueAction(): Promise<void> {
  await clearEditorialSession();
  revalidatePath(editorialQueuePath);
}

export async function importEditorialQueueAction(
  _state: EditorialQueueFormState,
  _submission: FormData,
): Promise<EditorialQueueFormState> {
  void _state;
  void _submission;
  const authError = await requireEditorialAccessState();

  if (authError) {
    return authError;
  }

  try {
    const { sourceLabel, titles } = await importEditorialQueueFromMarkdown();
    revalidatePath(editorialQueuePath);

    return successState(`Imported ${titles.length} queued items for ${sourceLabel}.`);
  } catch (error) {
    return errorState(toErrorMessage(error, "Unable to import the latest queue."));
  }
}

export async function updateEditorialQueueEntryAction(
  _previousState: EditorialQueueFormState,
  formData: FormData,
): Promise<EditorialQueueFormState> {
  const authError = await requireEditorialAccessState();

  if (authError) {
    return authError;
  }

  const idValue = formData.get("id");
  const statusValue = formData.get("status");

  if (typeof idValue !== "string" || typeof statusValue !== "string") {
    return errorState("Queue updates require an id and status.");
  }

  const id = Number.parseInt(idValue, 10);

  if (!Number.isInteger(id) || id <= 0) {
    return errorState(`Invalid queue row id: ${idValue}`);
  }

  if (!isEditorialQueueStatus(statusValue)) {
    return errorState(`Unsupported queue status: ${statusValue}`);
  }

  try {
    const updatedRow = await updateEditorialQueueEntry({
      candidateSlug: readOptionalFormValue(formData, "candidateSlug"),
      duplicateOfSlug: readOptionalFormValue(formData, "duplicateOfSlug"),
      id,
      notes: readOptionalFormValue(formData, "notes"),
      status: statusValue,
    });

    revalidatePath(editorialQueuePath);

    return successState(`Saved queue row #${updatedRow.id} as ${updatedRow.status}.`);
  } catch (error) {
    return errorState(toErrorMessage(error, "Unable to save queue row."));
  }
}

function errorState(message: string): EditorialQueueFormState {
  return {
    kind: "error",
    message,
  };
}

function successState(message: string): EditorialQueueFormState {
  return {
    kind: "success",
    message,
  };
}

function isEditorialQueueStatus(value: string): value is EditorialQueueStatus {
  return queueStatuses.has(value as EditorialQueueStatus);
}

function readOptionalFormValue(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

async function requireEditorialAccessState(): Promise<EditorialQueueFormState | null> {
  try {
    await requireEditorialSession();
    return null;
  } catch {
    return errorState("The editorial session expired. Unlock the queue again.");
  }
}

function toErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

void initialEditorialQueueFormState;