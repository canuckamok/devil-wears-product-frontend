import { getProducts } from "@/lib/fourthwall/products";
import { getCollections } from "@/lib/fourthwall/collections";
import { Hero } from "@/components/home/hero";
import { FeaturedProducts } from "@/components/home/featured-products";
import { CollectionsPreview } from "@/components/home/collections-preview";
import { ManifestoSection } from "@/components/home/manifesto-section";

export default async function HomePage() {
  const [{ results: products }, { results: collections }] = await Promise.all([
    getProducts("all", 0, 8),
    getCollections(),
  ]);

  return (
    <>
      <Hero />
      <FeaturedProducts products={products} />
      <CollectionsPreview collections={collections} />
      <ManifestoSection />
    </>
  );
}
