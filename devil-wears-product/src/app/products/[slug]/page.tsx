import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getProducts } from "@/lib/fourthwall/products";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductGrid } from "@/components/product/product-grid";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { SITE } from "@/lib/constants";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  const description = product.description
    ?.replace(/<[^>]*>/g, "")
    .slice(0, 160);

  return {
    title: product.name,
    description: description || `${product.name} from ${SITE.name}`,
    openGraph: {
      title: product.name,
      description: description || `${product.name} from ${SITE.name}`,
      images: product.images[0] ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Get related products (other products from the same store)
  const { results: allProducts } = await getProducts("all", 0, 8);
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <ProductDetail product={product} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <ScrollReveal className="mt-20 sm:mt-28">
          <div className="border-t border-border pt-12">
            <h2 className="font-headline font-bold text-2xl text-charcoal mb-2">
              You Might Also Regret
            </h2>
            <p className="text-warm-gray text-sm mb-8">
              More merch to validate your career choices.
            </p>
            <ProductGrid products={relatedProducts} />
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
