import { fourthwallGet } from "./api";
import type { FWCollection, FWProduct, FWPaginatedResponse } from "./types";

export async function getCollections(): Promise<FWPaginatedResponse<FWCollection>> {
  return fourthwallGet<FWPaginatedResponse<FWCollection>>("/collections");
}

export async function getCollection(slug: string): Promise<FWCollection | null> {
  try {
    return await fourthwallGet<FWCollection>(`/collections/${slug}`);
  } catch (error) {
    if (error instanceof Error && "status" in error && (error as any).status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getCollectionProducts(
  slug: string,
  page: number = 0,
  size: number = 50,
): Promise<FWPaginatedResponse<FWProduct>> {
  return fourthwallGet<FWPaginatedResponse<FWProduct>>(
    `/collections/${slug}/products`,
    {
      page: page.toString(),
      size: size.toString(),
    },
  );
}
