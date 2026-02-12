// Core Fourthwall API client

const API_BASE = process.env.NEXT_PUBLIC_STOREFRONT_API_URL!;
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_STOREFRONT_TOKEN!;

export class FourthwallApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "FourthwallApiError";
  }
}

export async function fourthwallGet<T>(
  path: string,
  params?: Record<string, string>,
  options?: { revalidate?: number | false },
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set("storefront_token", STOREFRONT_TOKEN);

  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    next: {
      revalidate: options?.revalidate ?? 60,
    },
  });

  if (!res.ok) {
    throw new FourthwallApiError(
      res.status,
      `Fourthwall API error: ${res.status} ${res.statusText}`,
    );
  }

  return res.json();
}

export async function fourthwallPost<T>(
  path: string,
  body: unknown,
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set("storefront_token", STOREFRONT_TOKEN);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new FourthwallApiError(
      res.status,
      `Fourthwall API error: ${res.status} ${res.statusText}`,
    );
  }

  return res.json();
}
