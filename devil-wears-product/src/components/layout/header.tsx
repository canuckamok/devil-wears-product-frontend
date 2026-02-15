"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { CartIcon } from "@/components/cart/cart-icon";
import { MobileNav } from "./mobile-nav";
import type { FWCollection } from "@/lib/fourthwall/types";

interface HeaderProps {
  collections: FWCollection[];
}

export function Header({ collections }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    NAV_LINKS[0], // Shop All
    ...collections.map((c) => ({ label: c.name, href: `/collections/${c.slug}` })),
    NAV_LINKS[1], // About
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-cream/90 backdrop-blur-md border-b border-border shadow-sm"
            : "bg-cream border-b border-transparent",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-charcoal hover:text-pink transition-colors"
              aria-label="Open menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt={SITE.name}
                width={280}
                height={128}
                className="h-10 w-auto sm:h-14"
                priority
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-warm-gray hover:text-charcoal transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Cart icon */}
            <CartIcon />
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && <MobileNav onClose={() => setMobileOpen(false)} collections={collections} />}
      </AnimatePresence>
    </>
  );
}
