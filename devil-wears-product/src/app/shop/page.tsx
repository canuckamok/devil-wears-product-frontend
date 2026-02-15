import type { Metadata } from "next";
import { getAllProducts } from "@/lib/fourthwall/products";
import { ProductGrid } from "@/components/product/product-grid";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { SATIRE, SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Shop All",
  description: `Browse the full catalog of ${SITE.name} satirical PM merch.`,
};

export default async function ShopPage() {
  const products = await getAllProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <ScrollReveal>
        <div className="mb-12">
          <h1 className="font-headline font-bold text-4xl sm:text-5xl text-charcoal mb-3">
            The Full Catalog
          </h1>
          <p className="text-warm-gray text-lg max-w-2xl">
            {SATIRE.collections.all}
          </p>
        </div>
      </ScrollReveal>

      <ProductGrid products={products} />
    </div>
  );
}
