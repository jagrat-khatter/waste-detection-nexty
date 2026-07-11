// Responsibility: Call backend API with Firebase token for frontend auth transport concern only.
"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL;

function requireApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_BACKEND_API_BASE_URL");
  }

  return API_BASE_URL;
}

async function buildAuthHeader(forceRefresh = false): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user is available for API calls");
  }

  const token = await user.getIdToken(forceRefresh);
  return `Bearer ${token}`;
}

export async function apiFetch<T>(
  input: string,
  init: RequestInit = {},
): Promise<T> {
  const endpoint = `${requireApiBaseUrl()}${input}`;

  const initialHeaders = new Headers(init.headers);
  initialHeaders.set("Authorization", await buildAuthHeader(false));

  const initialResponse = await fetch(endpoint, {
    ...init,
    headers: initialHeaders,
  });

  if (initialResponse.status !== 401) {
    if (!initialResponse.ok) {
      throw new Error(`API request failed: ${initialResponse.status}`);
    }

    return (await initialResponse.json()) as T;
  }

  const retryHeaders = new Headers(init.headers);
  retryHeaders.set("Authorization", await buildAuthHeader(true));

  const retryResponse = await fetch(endpoint, {
    ...init,
    headers: retryHeaders,
  });

  if (!retryResponse.ok) {
    if (retryResponse.status === 401) {
      throw new Error("Authentication failed after token refresh retry");
    }

    throw new Error(`API request failed after retry: ${retryResponse.status}`);
  }

  return (await retryResponse.json()) as T;
}
