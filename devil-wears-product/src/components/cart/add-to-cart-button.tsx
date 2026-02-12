"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/use-cart";
import { SATIRE } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  variantId: string | null;
  className?: string;
}

export function AddToCartButton({ variantId, className }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleClick = async () => {
    if (!variantId || status !== "idle") return;
    setStatus("loading");
    try {
      await addItem(variantId);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      setStatus("idle");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!variantId || status === "loading"}
      className={cn(
        "w-full py-4 rounded-lg font-headline font-bold text-sm uppercase tracking-wider transition-all duration-200",
        status === "success"
          ? "bg-green-600 text-white"
          : "bg-pink hover:bg-pink-hover text-white",
        (!variantId || status === "loading") && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {SATIRE.cart.addButton}
          </motion.span>
        )}
        {status === "loading" && (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2"
          >
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
            </svg>
            {SATIRE.cart.addingButton}
          </motion.span>
        )}
        {status === "success" && (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 8l4 4 8-8" />
            </svg>
            {SATIRE.cart.addedButton}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
