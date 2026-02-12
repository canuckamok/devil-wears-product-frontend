import Link from "next/link";
import { NAV_LINKS, SATIRE, SITE } from "@/lib/constants";

export function Footer() {
  const collections = [
    { label: "Tees", href: "/collections/tees" },
    { label: "Sweaters", href: "/collections/sweaters" },
    { label: "Mugs", href: "/collections/mugs" },
    { label: "All Products", href: "/shop" },
  ];

  return (
    <footer className="border-t border-border bg-cream-dark mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-headline font-bold text-xl text-charcoal mb-3">
              {SITE.name}
            </h3>
            <p className="text-warm-gray text-sm leading-relaxed max-w-xs">
              {SITE.tagline}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-headline font-semibold text-sm text-charcoal uppercase tracking-wider mb-4">
              Navigate
            </h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-warm-gray hover:text-pink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-headline font-semibold text-sm text-charcoal uppercase tracking-wider mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5">
              {collections.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-warm-gray hover:text-pink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted">{SATIRE.footer.copyright}</p>
            <p className="text-xs text-muted font-mono">{SATIRE.footer.tagline}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
