"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { NAV_LINKS, SITE } from "@/lib/constants";

interface MobileNavProps {
  onClose: () => void;
}

export function MobileNav({ onClose }: MobileNavProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] lg:hidden"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute left-0 top-0 bottom-0 w-[300px] bg-cream shadow-2xl"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <span className="font-headline font-bold text-xl text-charcoal">
              {SITE.name}
            </span>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-warm-gray hover:text-charcoal transition-colors"
              aria-label="Close menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2l16 16M18 2L2 18" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 + 0.1 }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block py-3 px-4 text-lg font-medium text-charcoal hover:text-pink hover:bg-pink-muted rounded-lg transition-all"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>
      </motion.div>
    </motion.div>
  );
}
