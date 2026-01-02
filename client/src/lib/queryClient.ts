import { QueryClient } from "@tanstack/react-query";

async function ensureOk(res: Response): Promise<void> {
  if (!res.ok) {
    let text = "";
    try {
      text = await res.text();
    } catch {}
    throw new Error(text || res.statusText || "API Error");
  }
}

export async function apiRequest<T>(
  method: string,
  url: string,
  data?: unknown
): Promise<T> {
  const opts: RequestInit = {
    method,
    credentials: "include",
  };

  if (data !== undefined) {
    opts.headers = { "Content-Type": "application/json" };
    opts.body = JSON.stringify(data);
  }

  const res = await fetch(url, opts);
  await ensureOk(res);

  const contentType = res.headers.get("content-type") ?? "";
  return contentType.includes("application/json")
    ? ((await res.json()) as T)
    : ((await res.text()) as T);
}

export function apiGetJson<T>(url: string): Promise<T> {
  return apiRequest<T>("GET", url);
}

export function apiPostJson<T>(url: string, body: unknown): Promise<T> {
  return apiRequest<T>("POST", url, body);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
    mutations: { retry: false },
  },
});
