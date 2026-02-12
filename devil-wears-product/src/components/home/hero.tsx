"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SATIRE } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e5dc_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <p className="font-mono text-pink text-sm font-medium mb-6 tracking-wider uppercase">
            Now shipping faster than your team ships features
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.15,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
          className="font-headline font-black text-5xl sm:text-7xl lg:text-8xl text-charcoal leading-[0.95] tracking-tight mb-6"
        >
          {SATIRE.homepage.heroHeadline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.3,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
          className="text-xl sm:text-2xl text-warm-gray max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {SATIRE.homepage.heroSubheadline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.45,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
        >
          <Link
            href="/shop"
            className="inline-block bg-pink hover:bg-pink-hover text-white font-headline font-bold py-4 px-10 rounded-lg transition-all duration-200 text-sm uppercase tracking-wider hover:shadow-lg hover:shadow-pink/20 hover:-translate-y-0.5"
          >
            {SATIRE.homepage.heroCta} →
          </Link>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream to-transparent" />
    </section>
  );
}
