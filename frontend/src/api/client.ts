// Requests are relative ("/api/...") so Vite's dev proxy forwards them to the
// backend. In production the SPA is served from the same origin as the API.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
