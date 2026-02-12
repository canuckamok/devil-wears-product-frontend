import { fourthwallGet, fourthwallPost } from "./api";
import type { FWCart } from "./types";

export async function createCart(): Promise<FWCart> {
  return fourthwallPost<FWCart>("/carts", { items: [] });
}

export async function getCart(cartId: string): Promise<FWCart | null> {
  try {
    return await fourthwallGet<FWCart>(`/carts/${cartId}`, undefined, {
      revalidate: false,
    });
  } catch {
    return null;
  }
}

export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number = 1,
): Promise<FWCart> {
  return fourthwallPost<FWCart>(`/carts/${cartId}/add`, {
    items: [{ variantId, quantity }],
  });
}

export async function updateCartItem(
  cartId: string,
  variantId: string,
  quantity: number,
): Promise<FWCart> {
  return fourthwallPost<FWCart>(`/carts/${cartId}/change`, {
    items: [{ variantId, quantity }],
  });
}

export async function removeFromCart(
  cartId: string,
  variantId: string,
  quantity: number,
): Promise<FWCart> {
  return fourthwallPost<FWCart>(`/carts/${cartId}/remove`, {
    items: [{ variantId, quantity }],
  });
}
