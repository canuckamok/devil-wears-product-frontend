"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/use-cart";
import { SATIRE } from "@/lib/constants";
import { formatPrice, getCheckoutUrl } from "@/lib/utils";
import { CartItem } from "./cart-item";

export function CartDrawer() {
  const { cart, isOpen, closeCart, itemCount, subtotal, currency } = useCart();

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  const handleCheckout = () => {
    if (!cart?.id) return;
    window.location.href = getCheckoutUrl(cart.id, currency);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-cream shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="font-headline font-bold text-lg text-charcoal">
                  {SATIRE.cart.title}
                </h2>
                {itemCount > 0 && (
                  <p className="text-sm text-muted mt-0.5">
                    {itemCount} {itemCount === 1 ? SATIRE.cart.itemSingular : SATIRE.cart.itemPlural}
                  </p>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 -mr-2 text-warm-gray hover:text-charcoal transition-colors"
                aria-label="Close cart"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 2l16 16M18 2L2 18" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {(!cart?.items || cart.items.length === 0) ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-cream-dark flex items-center justify-center mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 01-8 0" />
                    </svg>
                  </div>
                  <p className="font-headline font-semibold text-charcoal mb-1">
                    {SATIRE.cart.emptyTitle}
                  </p>
                  <p className="text-sm text-warm-gray max-w-[260px]">
                    {SATIRE.cart.emptySubtitle}
                  </p>
                </div>
              ) : (
                <div className="p-6 space-y-0">
                  <AnimatePresence initial={false}>
                    {cart.items.map((item) => (
                      <CartItem key={item.variant.id} item={item} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {cart?.items && cart.items.length > 0 && (
              <div className="p-6 border-t border-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-charcoal">Subtotal</span>
                  <span className="font-headline font-bold text-lg text-charcoal">
                    {formatPrice({ value: subtotal, currency })}
                  </span>
                </div>
                <p className="text-xs text-muted">
                  Shipping & taxes calculated at checkout.
                </p>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-pink hover:bg-pink-hover text-white font-headline font-bold py-4 rounded-lg transition-colors text-sm uppercase tracking-wider"
                >
                  {SATIRE.cart.checkoutButton} →
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
