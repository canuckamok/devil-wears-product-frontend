import type { FWProduct } from "@/lib/fourthwall/types";
import { ProductGrid } from "@/components/product/product-grid";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { SATIRE } from "@/lib/constants";

interface FeaturedProductsProps {
  products: FWProduct[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <ScrollReveal>
        <div className="mb-10">
          <h2 className="font-headline font-bold text-3xl sm:text-4xl text-charcoal mb-2">
            {SATIRE.homepage.featuredTitle}
          </h2>
          <p className="text-warm-gray text-lg">
            {SATIRE.homepage.featuredSubtitle}
          </p>
        </div>
      </ScrollReveal>

      <ProductGrid products={products} />
    </section>
  );
}
