import type { Metadata } from "next";
import "./globals.css";
import { SITE } from "@/lib/constants";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { getCollections } from "@/lib/fourthwall/collections";

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} | PM Merch for the Quietly Suffering`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  openGraph: {
    siteName: SITE.name,
    type: "website",
    locale: "en_US",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { results: collections } = await getCollections();

  return (
    <html lang="en">
      <body className="font-body antialiased min-h-screen flex flex-col">
        <CartProvider>
          <AnnouncementBar />
          <Header collections={collections} />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
