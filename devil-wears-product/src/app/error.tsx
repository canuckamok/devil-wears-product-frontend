"use client";

import { SATIRE } from "@/lib/constants";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <p className="font-mono text-pink text-sm font-medium mb-4 tracking-wider uppercase">
          Incident Report
        </p>
        <h1 className="font-headline font-bold text-4xl sm:text-5xl text-charcoal mb-4">
          {SATIRE.error.title}
        </h1>
        <p className="text-warm-gray mb-8 leading-relaxed">
          {SATIRE.error.subtitle}
        </p>
        <button
          onClick={reset}
          className="inline-block bg-pink hover:bg-pink-hover text-white font-headline font-bold py-3.5 px-8 rounded-lg transition-colors text-sm uppercase tracking-wider"
        >
          {SATIRE.error.cta}
        </button>
      </div>
    </div>
  );
}
