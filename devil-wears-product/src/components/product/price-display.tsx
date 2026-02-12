import type { FWPrice } from "@/lib/fourthwall/types";
import { formatPrice } from "@/lib/utils";

interface PriceDisplayProps {
  price: FWPrice;
  compareAtPrice?: FWPrice | null;
  size?: "sm" | "md" | "lg";
}

export function PriceDisplay({
  price,
  compareAtPrice,
  size = "md",
}: PriceDisplayProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`font-headline font-bold text-charcoal ${sizeClasses[size]}`}
      >
        {formatPrice(price)}
      </span>
      {compareAtPrice && compareAtPrice.value > price.value && (
        <span className={`text-muted line-through ${sizeClasses[size]}`}>
          {formatPrice(compareAtPrice)}
        </span>
      )}
    </div>
  );
}
