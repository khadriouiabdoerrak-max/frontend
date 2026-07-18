import type { Metadata } from "next";
import dynamic from "next/dynamic";
import "./globals.css";
import { brand } from "@/lib/brand";
import { arabicFont } from "@/lib/fonts";
import { CartProvider } from '@/components/cart/CartProvider';
import { Navbar } from '@/components/layout/Navbar';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { DeferredChrome } from '@/components/layout/DeferredChrome';
import { OrganizationJsonLd } from '@/components/seo/JsonLd';

const Footer = dynamic(
  () => import('@/components/layout/Footer').then((mod) => mod.Footer),
  { loading: () => null },
);

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://oxiprime.store",
  ),
  other: {
    "oxiprime-build": process.env.NEXT_PUBLIC_BUILD_ID ?? "ops-login-v1",
  },
  title: brand.metaTitle,
  description: brand.metaDescription,
  openGraph: {
    title: brand.metaTitle,
    description: brand.shortDescription,
    type: "website",
    locale: "ar_MA",
    siteName: brand.name,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: `${brand.name} — ${brand.productLine}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: brand.metaTitle,
    description: brand.shortDescription,
    images: ["/og-image.svg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${arabicFont.variable} font-arabic antialiased bg-background text-primary min-h-screen flex flex-col`}
      >
        <CartProvider>
          <OrganizationJsonLd />
          <AnnouncementBar />
          <Navbar />
          <main className="flex-grow pb-20">{children}</main>
          <Footer />
          <DeferredChrome />
        </CartProvider>
      </body>
    </html>
  );
}
