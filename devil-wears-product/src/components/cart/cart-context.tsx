"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import type { FWCart, FWCartItem } from "@/lib/fourthwall/types";
import {
  createCart,
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeFromCart as apiRemoveFromCart,
} from "@/lib/fourthwall/cart";

interface CartState {
  cart: FWCart | null;
  isOpen: boolean;
  isLoading: boolean;
}

type CartAction =
  | { type: "SET_CART"; cart: FWCart }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "OPTIMISTIC_ADD"; variantId: string; quantity: number }
  | { type: "OPTIMISTIC_REMOVE"; variantId: string };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_CART":
      return { ...state, cart: action.cart, isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.loading };
    case "OPEN_CART":
      return { ...state, isOpen: true };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    case "OPTIMISTIC_ADD":
      if (!state.cart) return state;
      const existingItem = state.cart.items.find(
        (item) => item.variant.id === action.variantId,
      );
      if (existingItem) {
        return {
          ...state,
          cart: {
            ...state.cart,
            items: state.cart.items.map((item) =>
              item.variant.id === action.variantId
                ? { ...item, quantity: item.quantity + action.quantity }
                : item,
            ),
          },
        };
      }
      return state;
    case "OPTIMISTIC_REMOVE":
      if (!state.cart) return state;
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.filter(
            (item) => item.variant.id !== action.variantId,
          ),
        },
      };
    default:
      return state;
  }
}

interface CartContextType {
  cart: FWCart | null;
  isOpen: boolean;
  isLoading: boolean;
  itemCount: number;
  subtotal: number;
  currency: string;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
}

export const CartContext = createContext<CartContextType | null>(null);

function getCartIdFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )cartId=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function setCartIdCookie(cartId: string) {
  const maxAge = 30 * 24 * 60 * 60; // 30 days
  document.cookie = `cartId=${encodeURIComponent(cartId)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: null,
    isOpen: false,
    isLoading: true,
  });

  // Hydrate cart from cookie on mount
  useEffect(() => {
    async function hydrateCart() {
      const cartId = getCartIdFromCookie();
      if (cartId) {
        const cart = await getCart(cartId);
        if (cart) {
          dispatch({ type: "SET_CART", cart });
          return;
        }
      }
      dispatch({ type: "SET_LOADING", loading: false });
    }
    hydrateCart();
  }, []);

  const ensureCart = useCallback(async (): Promise<string> => {
    if (state.cart?.id) return state.cart.id;
    const newCart = await createCart();
    setCartIdCookie(newCart.id);
    dispatch({ type: "SET_CART", cart: newCart });
    return newCart.id;
  }, [state.cart?.id]);

  const addItem = useCallback(
    async (variantId: string, quantity: number = 1) => {
      const cartId = await ensureCart();
      dispatch({ type: "OPTIMISTIC_ADD", variantId, quantity });
      try {
        const updatedCart = await apiAddToCart(cartId, variantId, quantity);
        dispatch({ type: "SET_CART", cart: updatedCart });
        dispatch({ type: "OPEN_CART" });
      } catch (error) {
        // Revert on error by re-fetching
        const freshCart = await getCart(cartId);
        if (freshCart) dispatch({ type: "SET_CART", cart: freshCart });
        throw error;
      }
    },
    [ensureCart],
  );

  const updateItem = useCallback(
    async (variantId: string, quantity: number) => {
      if (!state.cart?.id) return;
      try {
        const updatedCart = await apiUpdateCartItem(
          state.cart.id,
          variantId,
          quantity,
        );
        dispatch({ type: "SET_CART", cart: updatedCart });
      } catch (error) {
        const freshCart = await getCart(state.cart.id);
        if (freshCart) dispatch({ type: "SET_CART", cart: freshCart });
        throw error;
      }
    },
    [state.cart?.id],
  );

  const removeItem = useCallback(
    async (variantId: string) => {
      if (!state.cart?.id) return;
      const item = state.cart.items.find((i) => i.variant.id === variantId);
      if (!item) return;
      dispatch({ type: "OPTIMISTIC_REMOVE", variantId });
      try {
        const updatedCart = await apiRemoveFromCart(
          state.cart.id,
          variantId,
          item.quantity,
        );
        dispatch({ type: "SET_CART", cart: updatedCart });
      } catch (error) {
        const freshCart = await getCart(state.cart.id);
        if (freshCart) dispatch({ type: "SET_CART", cart: freshCart });
        throw error;
      }
    },
    [state.cart],
  );

  const itemCount = useMemo(
    () => state.cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [state.cart?.items],
  );

  const subtotal = useMemo(
    () =>
      state.cart?.items.reduce(
        (sum, item) => sum + item.variant.unitPrice.value * item.quantity,
        0,
      ) ?? 0,
    [state.cart?.items],
  );

  const currency = state.cart?.items[0]?.variant.unitPrice.currency ?? "USD";

  const value = useMemo(
    () => ({
      cart: state.cart,
      isOpen: state.isOpen,
      isLoading: state.isLoading,
      itemCount,
      subtotal,
      currency,
      openCart: () => dispatch({ type: "OPEN_CART" }),
      closeCart: () => dispatch({ type: "CLOSE_CART" }),
      addItem,
      updateItem,
      removeItem,
    }),
    [state, itemCount, subtotal, currency, addItem, updateItem, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
