import { getProducts } from "@/lib/fourthwall/products";
import { Hero } from "@/components/home/hero";
import { FeaturedProducts } from "@/components/home/featured-products";
import { CollectionsPreview } from "@/components/home/collections-preview";
import { ManifestoSection } from "@/components/home/manifesto-section";

export default async function HomePage() {
  const { results: products } = await getProducts("all", 0, 8);

  return (
    <>
      <Hero />
      <FeaturedProducts products={products} />
      <CollectionsPreview />
      <ManifestoSection />
    </>
  );
}
