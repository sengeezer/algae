export type EditorialQueueFormState = {
  kind: "idle" | "success" | "error";
  message: string | null;
};

export const initialEditorialQueueFormState: EditorialQueueFormState = {
  kind: "idle",
  message: null,
};