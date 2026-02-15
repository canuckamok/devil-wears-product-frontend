"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { SATIRE, HIDDEN_COLLECTIONS, COLLECTION_ORDER } from "@/lib/constants";
import type { FWCollection } from "@/lib/fourthwall/types";

const COLLECTION_EMOJIS: Record<string, string> = {
  "limited-release": "🔥",
  tees: "👕",
  sweaters: "🧥",
  mugs: "☕",
  stickers: "🏷️",
  hoodies: "🧥",
  hats: "🧢",
  bags: "👜",
  posters: "🖼️",
  other: "📦",
};

const DEFAULT_EMOJI = "🛍️";

interface CollectionsPreviewProps {
  collections: FWCollection[];
}

export function CollectionsPreview({ collections }: CollectionsPreviewProps) {
  const visibleCollections = collections
    .filter((c) => !HIDDEN_COLLECTIONS.includes(c.slug))
    .sort((a, b) => {
      const ai = COLLECTION_ORDER.indexOf(a.slug);
      const bi = COLLECTION_ORDER.indexOf(b.slug);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return 0;
    });

  return (
    <section className="bg-cream-dark py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-10">
            <h2 className="font-headline font-bold text-3xl sm:text-4xl text-charcoal mb-2">
              {SATIRE.homepage.collectionsTitle}
            </h2>
            <p className="text-warm-gray text-lg">
              {SATIRE.homepage.collectionsSubtitle}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleCollections.map((collection, index) => (
            <ScrollReveal key={collection.slug} delay={index * 0.1}>
              <Link
                href={`/collections/${collection.slug}`}
                className="group block"
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl p-8 border border-border hover:border-pink/30 transition-all duration-300 hover:shadow-lg hover:shadow-pink/5 h-full"
                >
                  <span className="text-4xl mb-4 block">
                    {COLLECTION_EMOJIS[collection.slug] ?? DEFAULT_EMOJI}
                  </span>
                  <h3 className="font-headline font-bold text-xl text-charcoal mb-2 group-hover:text-pink transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-warm-gray text-sm leading-relaxed">
                    {SATIRE.collections[collection.slug] ?? collection.description}
                  </p>
                  <div className="mt-6 flex items-center gap-1.5 text-pink text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Browse Collection
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 7h12M8 2l5 5-5 5" />
                    </svg>
                  </div>
                </motion.div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
