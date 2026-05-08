import { createHash, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

const editorialPasswordEnvVarName = "EDITORIAL_QUEUE_PASSWORD";
const editorialSessionCookieName = "algae-editorial-session";
const editorialSessionMaxAgeSeconds = 60 * 60 * 12;
const editorialSessionPath = "/editorial";

export function isEditorialAuthConfigured(): boolean {
  return getEditorialPassword() !== null;
}

export function getEditorialPasswordEnvVarName(): string {
  return editorialPasswordEnvVarName;
}

export function authenticateEditorialPassword(passwordCandidate: string): boolean {
  const password = getEditorialPassword();

  if (!password) {
    return false;
  }

  return safeEqual(passwordCandidate, password);
}

export async function createEditorialSession(): Promise<void> {
  const password = getEditorialPassword();

  if (!password) {
    throw new Error("Editorial auth is not configured.");
  }

  const cookieStore = await cookies();
  cookieStore.set({
    httpOnly: true,
    maxAge: editorialSessionMaxAgeSeconds,
    name: editorialSessionCookieName,
    path: editorialSessionPath,
    priority: "high",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    value: createEditorialSessionToken(password),
  });
}

export async function clearEditorialSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    httpOnly: true,
    maxAge: 0,
    name: editorialSessionCookieName,
    path: editorialSessionPath,
    priority: "high",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    value: "",
  });
}

export async function isEditorialSessionAuthenticated(): Promise<boolean> {
  const password = getEditorialPassword();

  if (!password) {
    return false;
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(editorialSessionCookieName)?.value;

  if (!sessionCookie) {
    return false;
  }

  return safeEqual(sessionCookie, createEditorialSessionToken(password));
}

export async function requireEditorialSession(): Promise<void> {
  if (!(await isEditorialSessionAuthenticated())) {
    throw new Error("Unauthorized");
  }
}

function createEditorialSessionToken(password: string): string {
  return createHash("sha256").update(`algae:editorial:${password}`).digest("hex");
}

function getEditorialPassword(): string | null {
  const value = process.env[editorialPasswordEnvVarName]?.trim();
  return value ? value : null;
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}