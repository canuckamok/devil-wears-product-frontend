import Link from "next/link";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { SATIRE } from "@/lib/constants";

export function ManifestoSection() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
      <ScrollReveal>
        <p className="font-mono text-pink text-sm font-medium mb-6 tracking-wider uppercase">
          Our Mission (loosely defined)
        </p>
        <blockquote className="font-headline font-bold text-2xl sm:text-4xl text-charcoal leading-snug mb-8">
          &ldquo;{SATIRE.manifesto.body[0]}&rdquo;
        </blockquote>
        <Link
          href="/about"
          className="inline-flex items-center gap-1.5 text-pink hover:text-pink-hover font-medium text-sm transition-colors group"
        >
          Read the Full Manifesto
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="transition-transform group-hover:translate-x-0.5"
          >
            <path d="M1 7h12M8 2l5 5-5 5" />
          </svg>
        </Link>
      </ScrollReveal>
    </section>
  );
}
