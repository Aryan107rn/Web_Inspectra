/**
 * Central HTTP client abstraction.
 *
 * Every service in `src/lib/services` calls through this module instead of
 * calling `fetch` directly. When the real backend is ready, only the
 * `USE_MOCK_DATA` flag and `API_BASE_URL` below need to change — no UI code
 * or component imports need to be touched.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

/** Simulates realistic network latency for mock responses. */
export function simulateNetworkDelay(minMs = 400, maxMs = 900): Promise<void> {
  const delay = Math.floor(minMs + Math.random() * (maxMs - minMs));
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { method: "GET" });
  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function apiPost<T, B = unknown>(path: string, body: B): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}
