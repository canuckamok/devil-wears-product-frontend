"use client";

import { useState, useMemo } from "react";
import type { FWProduct } from "@/lib/fourthwall/types";
import { findVariant } from "@/lib/utils";
import { ProductImages } from "./product-images";
import { VariantSelector } from "./variant-selector";
import { PriceDisplay } from "./price-display";
import { ProductDescription } from "./product-description";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

interface ProductDetailProps {
  product: FWProduct;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.variants[0]?.attributes.color?.name ?? null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Get images for the selected color variant
  const displayImages = useMemo(() => {
    if (selectedColor) {
      const colorVariants = product.variants.filter(
        (v) => v.attributes.color?.name === selectedColor,
      );
      const variantImages = colorVariants.flatMap((v) => v.images);
      if (variantImages.length > 0) {
        // Deduplicate by id
        const seen = new Set<string>();
        return variantImages.filter((img) => {
          if (seen.has(img.id)) return false;
          seen.add(img.id);
          return true;
        });
      }
    }
    return product.images;
  }, [product, selectedColor]);

  // Find the selected variant
  const selectedVariant = useMemo(() => {
    if (selectedColor && selectedSize) {
      return findVariant(product.variants, selectedColor, selectedSize) ?? null;
    }
    return null;
  }, [product.variants, selectedColor, selectedSize]);

  // Check if this product has color/size options at all
  const hasColorOptions = product.variants.some((v) => v.attributes.color !== null);
  const hasSizeOptions = product.variants.some((v) => v.attributes.size !== null);

  // For products with no variant options (bundles, etc.), use the first variant directly
  const cartVariantId = selectedVariant?.id
    ?? (!hasColorOptions && !hasSizeOptions ? product.variants[0]?.id : null)
    ?? null;

  // Get price to display (selected variant or first variant)
  const displayPrice =
    selectedVariant?.unitPrice ?? product.variants[0]?.unitPrice;
  const displayComparePrice =
    selectedVariant?.compareAtPrice ?? product.variants[0]?.compareAtPrice;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      {/* Images */}
      <ProductImages images={displayImages} productName={product.name} />

      {/* Details */}
      <div className="space-y-8">
        {/* Title & Price */}
        <div>
          <h1 className="font-headline font-bold text-3xl sm:text-4xl text-charcoal mb-4">
            {product.name}
          </h1>
          {displayPrice && (
            <PriceDisplay
              price={displayPrice}
              compareAtPrice={displayComparePrice}
              size="lg"
            />
          )}
        </div>

        {/* Variant Selector */}
        <VariantSelector
          variants={product.variants}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          onColorChange={(color) => {
            setSelectedColor(color);
            setSelectedSize(null); // Reset size when color changes
          }}
          onSizeChange={setSelectedSize}
        />

        {/* Add to Cart */}
        <AddToCartButton variantId={cartVariantId} />

        {/* Description */}
        {product.description && (
          <div className="pt-4 border-t border-border">
            <ProductDescription html={product.description} />
          </div>
        )}
      </div>
    </div>
  );
}
