# CLAUDE.md

## Project: Devil Wears Product

A satirical e-commerce storefront for product management merch ("Merch for people who manage products, not expectations"). Built as a headless Next.js frontend consuming the Fourthwall Storefront API.

Live site: https://devilwearsproduct.shop

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (with `@tailwindcss/postcss` plugin, `@tailwindcss/typography`)
- **Animations**: Framer Motion
- **Utilities**: clsx + tailwind-merge (via `cn()` helper in `src/lib/utils.ts`)
- **API**: Fourthwall Storefront API v1 (REST, server-side fetching with Next.js revalidation)
- **Package manager**: npm

## Environment Variables

Defined in `.env.local` (see `.env.example`):
- `NEXT_PUBLIC_STOREFRONT_TOKEN` — Fourthwall storefront token
- `NEXT_PUBLIC_STOREFRONT_API_URL` — API base URL (`https://storefront-api.fourthwall.com/v1`)
- `NEXT_PUBLIC_CHECKOUT_DOMAIN` — Shop's Fourthwall checkout domain
- `NEXT_PUBLIC_SITE_URL` — Canonical site URL

## Project Structure

All source code lives under `devil-wears-product/`:

```
src/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (CartProvider, Header, Footer, CartDrawer)
│   ├── page.tsx                # Homepage (Hero, FeaturedProducts, CollectionsPreview, Manifesto)
│   ├── shop/page.tsx           # Shop All page
│   ├── products/[slug]/page.tsx # Product detail page (with related products)
│   ├── collections/[slug]/page.tsx # Collection page
│   ├── about/page.tsx          # About / Manifesto page
│   ├── loading.tsx             # Loading state (with satirical loading messages)
│   ├── error.tsx               # Error boundary
│   ├── not-found.tsx           # 404 page
│   └── globals.css             # Tailwind theme config, custom fonts, base styles
├── components/
│   ├── layout/                 # AnnouncementBar, Header, MobileNav, Footer
│   ├── cart/                   # CartContext, CartDrawer, CartIcon, CartItem, AddToCartButton
│   ├── product/                # ProductCard, ProductGrid, ProductImages, VariantSelector, PriceDisplay, ProductDescription, ProductDetail
│   ├── home/                   # Hero, FeaturedProducts, CollectionsPreview, ManifestoSection
│   └── shared/                 # ScrollReveal, LoadingMessages
├── hooks/
│   └── use-cart.ts             # useCart hook (wraps CartContext)
└── lib/
    ├── constants.ts            # SITE config, NAV_LINKS, SATIRE copy (brand voice for all UI text)
    ├── utils.ts                # cn(), formatPrice(), getCheckoutUrl(), variant helpers
    └── fourthwall/
        ├── api.ts              # Core API client (fourthwallGet, fourthwallPost) with token auth
        ├── types.ts            # FW* TypeScript interfaces (FWProduct, FWVariant, FWCart, etc.)
        ├── products.ts         # getProducts(), getProduct(), getAllProducts()
        ├── collections.ts      # getCollections(), getCollection(), getCollectionProducts()
        ├── cart.ts             # createCart(), getCart(), addToCart(), updateCartItem(), removeFromCart()
        └── shop.ts             # getShop()
```

## Development

```bash
cd devil-wears-product
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint
```

## Key Architecture Patterns

### Fourthwall API Layer (`src/lib/fourthwall/`)
- All API calls go through `fourthwallGet()` / `fourthwallPost()` which auto-append the `storefront_token` param
- Server-side data fetching uses Next.js `fetch` with `revalidate: 60` (1 min) by default
- Cart operations use `cache: "no-store"` for real-time accuracy
- Types are prefixed with `FW` (e.g., `FWProduct`, `FWVariant`, `FWCart`)

### Cart State Management
- React Context + `useReducer` pattern in `CartProvider` (client component)
- Cart ID persisted in a browser cookie (`cartId`, 30-day expiry)
- Optimistic updates for add/remove, with server re-fetch rollback on error
- Cart drawer opens automatically after adding an item

### Brand Voice / Satirical Copy
- ALL user-facing text lives in `SATIRE` constant in `src/lib/constants.ts`
- Cart = "Sprint Backlog", Add to Cart = "Add to Sprint", Checkout = "Ship It", Remove = "Deprioritize"
- Loading messages rotate through PM-themed satirical phrases
- Always keep the satirical PM/product-management theme when adding or modifying copy

### Styling
- Design tokens defined as CSS custom properties in `globals.css` using Tailwind v4's `@theme inline`
- Color palette: cream backgrounds, charcoal text, shocking pink (`#FF2D6F`) accent
- Fonts: Satoshi (headlines), Inter (body), JetBrains Mono (monospace accents) — loaded via `@font-face` from `/public/fonts/`
- Use `cn()` (from `src/lib/utils.ts`) for conditional/merged Tailwind classes
- Use `font-headline` / `font-body` / `font-mono` Tailwind classes for typography

### Component Patterns
- Pages are server components (async, data-fetched at the top)
- Interactive components (cart, animations, variant selectors) use `"use client"`
- `ScrollReveal` wraps sections for scroll-triggered fade-in animations (Framer Motion)
- Path alias: `@/*` maps to `./src/*`

## Conventions

- TypeScript strict mode — no `any` unless interfacing with external untyped data
- Fourthwall types prefixed with `FW` (e.g., `FWProduct`, `FWVariant`)
- Components organized by domain: `layout/`, `cart/`, `product/`, `home/`, `shared/`
- Pages export `metadata` for SEO (using Next.js Metadata API)
- Images served from `cdn.fourthwall.com` (configured in `next.config.ts` remotePatterns)
