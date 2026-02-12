import { fourthwallGet } from "./api";
import type { FWProduct, FWPaginatedResponse } from "./types";

export async function getProducts(
  collectionSlug: string = "all",
  page: number = 0,
  size: number = 50,
): Promise<FWPaginatedResponse<FWProduct>> {
  return fourthwallGet<FWPaginatedResponse<FWProduct>>(
    `/collections/${collectionSlug}/products`,
    {
      page: page.toString(),
      size: size.toString(),
    },
  );
}

export async function getProduct(slug: string): Promise<FWProduct | null> {
  try {
    return await fourthwallGet<FWProduct>(`/products/${slug}`);
  } catch (error) {
    if (error instanceof Error && "status" in error && (error as any).status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getAllProducts(): Promise<FWProduct[]> {
  const allProducts: FWProduct[] = [];
  let page = 0;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await getProducts("all", page, 50);
    allProducts.push(...response.results);
    hasNextPage = response.paging.hasNextPage;
    page++;
  }

  return allProducts;
}
