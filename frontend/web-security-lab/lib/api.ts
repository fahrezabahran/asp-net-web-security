export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:7254";

export type Mode = "vulnerable" | "secure";

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

// Always sends the auth cookie cross-origin (credentials: "include"), which
// is exactly what makes the CSRF module's vulnerable endpoint exploitable
// and the secure endpoint's defenses meaningful to demonstrate.
export async function apiFetch(path: string, options: ApiRequestOptions = {}) {
  const { body, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text();

  return { ok: response.ok, status: response.status, data, headers: response.headers };
}

export function moduleBasePath(module: string, mode: Mode) {
  return `/api/${module}/${mode}`;
}
