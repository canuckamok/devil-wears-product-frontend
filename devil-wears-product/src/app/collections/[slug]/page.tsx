import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCollection, getCollectionProducts } from "@/lib/fourthwall/collections";
import { ProductGrid } from "@/components/product/product-grid";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { SATIRE, SITE } from "@/lib/constants";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) return {};

  return {
    title: collection.name,
    description:
      SATIRE.collections[slug] ||
      collection.description ||
      `${collection.name} collection from ${SITE.name}`,
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const [collection, { results: products }] = await Promise.all([
    getCollection(slug),
    getCollectionProducts(slug),
  ]);

  if (!collection) {
    notFound();
  }

  const satiricalDescription = SATIRE.collections[slug] || collection.description;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <ScrollReveal>
        <div className="mb-12">
          <h1 className="font-headline font-bold text-4xl sm:text-5xl text-charcoal mb-3">
            {collection.name}
          </h1>
          {satiricalDescription && (
            <p className="text-warm-gray text-lg max-w-2xl">
              {satiricalDescription}
            </p>
          )}
        </div>
      </ScrollReveal>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="text-center py-20">
          <p className="font-headline font-semibold text-xl text-charcoal mb-2">
            Nothing here yet.
          </p>
          <p className="text-warm-gray">
            This collection was approved in concept but never made it to production. Classic.
          </p>
        </div>
      )}
    </div>
  );
}
