import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guides, getGuideBySlug } from '@/lib/guides';
import { JsonLd } from '@/components/seo/JsonLd';
import { formatPrice } from '@/lib/utils';
import { bundleProduct } from '@/lib/products';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: 'دليل | تاجكِ' };
  return {
    title: `${guide.title} | تاجكِ`,
    description: guide.description,
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://oxiprime.store';

  return (
    <article className="min-h-screen bg-background px-4 py-12">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: guide.title,
          description: guide.description,
          inLanguage: 'ar-MA',
          author: { '@type': 'Organization', name: 'تاجكِ' },
          mainEntityOfPage: `${siteUrl}/guides/${guide.slug}`,
        }}
      />
      <div className="container mx-auto max-w-2xl">
        <Link
          href="/guides"
          className="text-sm text-muted-brown hover:text-cocoa"
        >
          ← كل المقالات
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-cocoa mt-4 mb-3 leading-tight">
          {guide.title}
        </h1>
        <p className="text-sm text-secondary mb-10">{guide.description}</p>

        <div className="space-y-8">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-bold text-cocoa mb-2">
                {section.heading}
              </h2>
              <p className="text-secondary leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-card border border-gold/40 bg-ivory p-6 text-center space-y-3">
          <p className="font-bold text-cocoa">جاهزة للروتين الكامل؟</p>
          <p className="text-sm text-secondary">
            شامبو + بلسم + ماسك + سيروم — {formatPrice(bundleProduct.price)} مع
            دفع عند الاستلام.
          </p>
          <Link
            href={`/products/${bundleProduct.slug}`}
            className="inline-block bg-cocoa text-ivory px-6 py-3 font-bold rounded-btn text-sm"
          >
            شوفي العرض
          </Link>
        </div>
      </div>
    </article>
  );
}
