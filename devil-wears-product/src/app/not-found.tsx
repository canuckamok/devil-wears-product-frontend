import Link from "next/link";
import { SATIRE } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <p className="font-mono text-pink text-sm font-medium mb-4 tracking-wider uppercase">
          Error 404
        </p>
        <h1 className="font-headline font-bold text-6xl sm:text-8xl text-charcoal mb-6">
          {SATIRE.notFound.title}
        </h1>
        <p className="font-headline font-semibold text-xl text-charcoal mb-3">
          {SATIRE.notFound.subtitle}
        </p>
        <p className="text-warm-gray mb-10 leading-relaxed">
          {SATIRE.notFound.body}
        </p>
        <Link
          href="/"
          className="inline-block bg-pink hover:bg-pink-hover text-white font-headline font-bold py-3.5 px-8 rounded-lg transition-colors text-sm uppercase tracking-wider"
        >
          {SATIRE.notFound.cta}
        </Link>
      </div>
    </div>
  );
}
