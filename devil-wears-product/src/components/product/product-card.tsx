"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import type { FWProduct, FWImage } from "@/lib/fourthwall/types";
import { cn, formatPrice, getUniqueColors } from "@/lib/utils";

interface ProductCardProps {
  product: FWProduct;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const colors = getUniqueColors(product.variants);
  const defaultImage = product.images[0];
  const hoverImage = product.images[1];
  const price = product.variants[0]?.unitPrice;
  const compareAtPrice = product.variants[0]?.compareAtPrice;

  // Get the first variant image matching a given color name
  function getVariantImageForColor(colorName: string): FWImage | null {
    const variant = product.variants.find(
      (v) => v.attributes.color?.name === colorName,
    );
    return variant?.images?.[0] ?? null;
  }

  // When a swatch is hovered, show that variant's image; otherwise show default
  const variantImage = hoveredColor
    ? getVariantImageForColor(hoveredColor)
    : null;
  const displayImage = variantImage ?? defaultImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link
        href={`/products/${product.slug}`}
        className="group block"
      >
        {/* Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-cream-dark mb-4">
          {displayImage && (
            <Image
              src={displayImage.url}
              alt={product.name}
              width={displayImage.width}
              height={displayImage.height}
              className={cn(
                "w-full h-full object-cover transition-all duration-500",
                !hoveredColor && hoverImage
                  ? "group-hover:scale-105 group-hover:opacity-0"
                  : !hoveredColor
                    ? "group-hover:scale-105"
                    : "",
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}
          {!hoveredColor && hoverImage && (
            <Image
              src={hoverImage.url}
              alt={product.name}
              width={hoverImage.width}
              height={hoverImage.height}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}

          {/* Sold out badge */}
          {product.state.type === "SOLD_OUT" && (
            <div className="absolute top-3 left-3 bg-charcoal text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
              Sold Out
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1.5">
          <h3 className="font-headline font-semibold text-sm text-charcoal group-hover:text-pink transition-colors line-clamp-1">
            {product.name}
          </h3>

          <div className="flex items-center gap-2">
            {price && (
              <span className="text-sm font-medium text-charcoal">
                {formatPrice(price)}
              </span>
            )}
            {compareAtPrice && (
              <span className="text-sm text-muted line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>

          {/* Color swatches */}
          {colors.length > 1 && (
            <div className="flex items-center gap-1.5 pt-1">
              {colors.slice(0, 6).map((color) => (
                <button
                  key={color.name}
                  type="button"
                  className={cn(
                    "w-3.5 h-3.5 rounded-full border transition-all duration-200",
                    hoveredColor === color.name
                      ? "scale-125 border-charcoal"
                      : "border-border-dark",
                  )}
                  style={{ backgroundColor: color.swatch }}
                  title={color.name}
                  onMouseEnter={() => setHoveredColor(color.name)}
                  onMouseLeave={() => setHoveredColor(null)}
                  onClick={(e) => e.preventDefault()}
                />
              ))}
              {colors.length > 6 && (
                <span className="text-xs text-muted">+{colors.length - 6}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
