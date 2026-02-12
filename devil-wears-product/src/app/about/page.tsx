import type { Metadata } from "next";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { SATIRE, SITE } from "@/lib/constants";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: `The story behind ${SITE.name}. Born in a sprint retrospective that went 45 minutes over time.`,
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <ScrollReveal>
        <p className="font-mono text-pink text-sm font-medium mb-4 tracking-wider uppercase">
          The Manifesto
        </p>
        <h1 className="font-headline font-bold text-4xl sm:text-6xl text-charcoal mb-4 leading-tight">
          {SATIRE.manifesto.headline}
        </h1>
        <p className="font-headline text-2xl sm:text-3xl text-warm-gray mb-12">
          {SATIRE.manifesto.subheadline}
        </p>
      </ScrollReveal>

      <div className="space-y-6">
        {SATIRE.manifesto.body.map((paragraph, index) => (
          <ScrollReveal key={index} delay={index * 0.1}>
            <p className="text-lg leading-relaxed text-charcoal-light">
              {paragraph}
            </p>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delay={0.4}>
        <div className="mt-16 pt-12 border-t border-border">
          <p className="text-warm-gray text-sm mb-6">
            Ready to express your quiet professional despair?
          </p>
          <Link
            href="/shop"
            className="inline-block bg-pink hover:bg-pink-hover text-white font-headline font-bold py-3.5 px-8 rounded-lg transition-colors text-sm uppercase tracking-wider"
          >
            Browse the Collection
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
