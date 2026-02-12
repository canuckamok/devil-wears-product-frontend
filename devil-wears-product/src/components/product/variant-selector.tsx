"use client";

import { cn } from "@/lib/utils";
import { getUniqueColors, getUniqueSizes } from "@/lib/utils";
import type { FWVariant } from "@/lib/fourthwall/types";

interface VariantSelectorProps {
  variants: FWVariant[];
  selectedColor: string | null;
  selectedSize: string | null;
  onColorChange: (color: string) => void;
  onSizeChange: (size: string) => void;
}

export function VariantSelector({
  variants,
  selectedColor,
  selectedSize,
  onColorChange,
  onSizeChange,
}: VariantSelectorProps) {
  const colors = getUniqueColors(variants);
  const sizes = getUniqueSizes(variants, selectedColor ?? undefined);

  return (
    <div className="space-y-6">
      {/* Color selector */}
      {colors.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-charcoal mb-3">
            Color{" "}
            {selectedColor && (
              <span className="text-warm-gray font-normal">— {selectedColor}</span>
            )}
          </label>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => onColorChange(color.name)}
                title={color.name}
                className={cn(
                  "w-9 h-9 rounded-full border-2 transition-all duration-200 relative",
                  selectedColor === color.name
                    ? "border-pink scale-110 ring-2 ring-pink/20"
                    : "border-border hover:border-border-dark hover:scale-105",
                )}
              >
                <span
                  className="absolute inset-[3px] rounded-full"
                  style={{ backgroundColor: color.swatch }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size selector */}
      {sizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-charcoal mb-3">
            Size
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => onSizeChange(size)}
                className={cn(
                  "px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border",
                  selectedSize === size
                    ? "bg-charcoal text-white border-charcoal"
                    : "bg-white text-charcoal border-border hover:border-charcoal",
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
