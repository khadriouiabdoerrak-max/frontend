import type { Metadata } from "next";
import "./globals.css";
import { arabicFont } from "@/lib/fonts";
import { CartProvider } from '@/components/cart/CartProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { StickyOrderBar } from '@/components/home/StickyOrderBar';
import { TrackingScripts } from '@/components/tracking/TrackingScripts';
import { OrganizationJsonLd } from '@/components/seo/JsonLd';
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://oxiprime.store",
  ),
  other: {
    "oxiprime-build": process.env.NEXT_PUBLIC_BUILD_ID ?? "ops-simple-v1",
  },
  title: "تاجكِ | روتين OXIPRIME الاحترافي للعناية بالشعر",
  description:
    "تاجكِ — متجر مغربي متخصص في منتجات OXIPRIME للعناية الاحترافية بالشعر. شامبو، بلسم، ماسك وسيروم كيراتين. دفع عند الاستلام داخل المغرب.",
  openGraph: {
    title: "تاجكِ | روتين OXIPRIME الاحترافي للعناية بالشعر",
    description:
      "روتين احترافي لشعر أكثر نعومة ولمعانا. دفع عند الاستلام داخل المغرب.",
    type: "website",
    locale: "ar_MA",
    siteName: "تاجكِ",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "تاجكِ — OXIPRIME",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "تاجكِ | روتين OXIPRIME الاحترافي للعناية بالشعر",
    description:
      "روتين احترافي لشعر أكثر نعومة ولمعانا. دفع عند الاستلام داخل المغرب.",
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
          <TrackingScripts />
          <AnnouncementBar />
          <Navbar />
          <main className="flex-grow pb-20">{children}</main>
          <Footer />
          <StickyOrderBar />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
