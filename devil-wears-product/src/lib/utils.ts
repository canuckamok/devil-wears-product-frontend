import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: { value: number; currency: string }): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price.value);
}

export function getCheckoutUrl(cartId: string, currency: string = "USD"): string {
  const domain = process.env.NEXT_PUBLIC_CHECKOUT_DOMAIN;
  return `https://${domain}/checkout/?cartCurrency=${currency}&cartId=${cartId}`;
}

export function getUniqueColors(
  variants: { attributes: { color: { name: string; swatch: string } | null } }[],
): { name: string; swatch: string }[] {
  const seen = new Set<string>();
  return variants.reduce<{ name: string; swatch: string }[]>((acc, variant) => {
    const color = variant.attributes.color;
    if (color && !seen.has(color.name)) {
      seen.add(color.name);
      acc.push(color);
    }
    return acc;
  }, []);
}

export function getUniqueSizes(
  variants: { attributes: { size: { name: string } | null; color: { name: string } | null } }[],
  selectedColor?: string,
): string[] {
  const filtered = selectedColor
    ? variants.filter((v) => v.attributes.color?.name === selectedColor)
    : variants;

  const seen = new Set<string>();
  return filtered.reduce<string[]>((acc, variant) => {
    const size = variant.attributes.size;
    if (size && !seen.has(size.name)) {
      seen.add(size.name);
      acc.push(size.name);
    }
    return acc;
  }, []);
}

export function findVariant<
  T extends { id: string; attributes: { color: { name: string } | null; size: { name: string } | null } },
>(variants: T[], color: string, size: string): T | undefined {
  return variants.find(
    (v) => v.attributes.color?.name === color && v.attributes.size?.name === size,
  );
}
