"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/use-cart";
import { SATIRE } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { FWCartItem } from "@/lib/fourthwall/types";

interface CartItemProps {
  item: FWCartItem;
}

export function CartItem({ item }: CartItemProps) {
  const { updateItem, removeItem, closeCart } = useCart();
  const { variant, quantity } = item;
  const image = variant.images[0];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="border-b border-border last:border-0"
    >
      <div className="flex gap-4 py-4">
        {/* Image */}
        {image && (
          <Link
            href={`/products/${variant.product.slug}`}
            onClick={closeCart}
            className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-cream-dark"
          >
            <Image
              src={image.url}
              alt={variant.product.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </Link>
        )}

        {/* Details */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/products/${variant.product.slug}`}
            onClick={closeCart}
            className="font-medium text-sm text-charcoal hover:text-pink transition-colors line-clamp-1"
          >
            {variant.product.name}
          </Link>
          <p className="text-xs text-muted mt-0.5">
            {variant.attributes.color.name} / {variant.attributes.size.name}
          </p>
          <p className="text-sm font-medium text-charcoal mt-1">
            {formatPrice(variant.unitPrice)}
          </p>

          {/* Quantity & Remove */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center border border-border rounded-md">
              <button
                onClick={() =>
                  quantity > 1
                    ? updateItem(variant.id, quantity - 1)
                    : removeItem(variant.id)
                }
                className="px-2.5 py-1 text-warm-gray hover:text-charcoal transition-colors text-sm"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="px-2 py-1 text-sm font-medium text-charcoal min-w-[28px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => updateItem(variant.id, quantity + 1)}
                className="px-2.5 py-1 text-warm-gray hover:text-charcoal transition-colors text-sm"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeItem(variant.id)}
              className="text-xs text-muted hover:text-pink transition-colors"
            >
              {SATIRE.cart.removeLabel}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
