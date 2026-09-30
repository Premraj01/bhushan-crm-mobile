import { storage } from "./storage";

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
const TOKEN_KEY = "drb-token";

/** Kept in memory so every request doesn't hit the keychain; persisted in secure storage. */
let token: string | null = null;

export async function loadToken(): Promise<string | null> {
  token = await storage.get(TOKEN_KEY);
  return token;
}

export function getToken(): string | null {
  return token;
}

export async function setToken(next: string | null) {
  token = next;
  if (next) await storage.set(TOKEN_KEY, next);
  else await storage.remove(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Called when the server rejects the token, so the app can return to sign-in. */
let onUnauthorized: (() => void) | undefined;
export function setUnauthorizedHandler(handler: (() => void) | undefined) {
  onUnauthorized = handler;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  // FormData (file uploads) sets its own multipart content type and boundary.
  if (init.body && !(init.body instanceof FormData) && !headers.has("content-type"))
    headers.set("content-type", "application/json");
  if (token) headers.set("authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}/api${path}`, { ...init, headers });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
    if (res.status === 401 && token) onUnauthorized?.();
    throw new ApiError(res.status, message ?? res.statusText);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

/** A message for the user from a failed API call. */
export function errorText(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return "You don’t have permission to do that.";
    return error.message;
  }
  return "Couldn’t reach the clinic server. Check your connection and the server address.";
}
