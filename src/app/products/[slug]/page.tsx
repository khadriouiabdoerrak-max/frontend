import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getProductBySlug, allProducts, getListImage } from '@/lib/products';
import { JsonLd } from '@/components/seo/JsonLd';

const ProductPageClient = dynamic(
  () =>
    import('./ProductPageClient').then((mod) => mod.ProductPageClient),
  { loading: () => <div className="min-h-screen bg-background" /> },
);

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://oxiprime.store';

export async function generateStaticParams() {
  return allProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'تاجكِ | منتج غير موجود' };

  const image = product.image ?? getListImage(product);

  return {
    title: `${product.nameAr} | تاجكِ`,
    description: product.shortDescriptionAr,
    openGraph: {
      title: `${product.nameAr} | تاجكِ`,
      description: product.shortDescriptionAr,
      type: 'website',
      locale: 'ar_MA',
      images: [
        {
          url: image,
          width: 1200,
          height: 1200,
          alt: product.nameAr,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.nameAr} | تاجكِ`,
      description: product.shortDescriptionAr,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  const image = product
    ? `${siteUrl}${product.image ?? getListImage(product)}`
    : undefined;

  return (
    <>
      {product && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.nameAr,
            description: product.shortDescriptionAr,
            image,
            sku: product.slug,
            brand: { '@type': 'Brand', name: 'OXIPRIME' },
            offers: {
              '@type': 'Offer',
              url: `${siteUrl}/products/${product.slug}`,
              priceCurrency: 'MAD',
              price: product.price,
              availability: 'https://schema.org/InStock',
              itemCondition: 'https://schema.org/NewCondition',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: product.rating,
              reviewCount: 24,
            },
          }}
        />
      )}
      <ProductPageClient slug={slug} />
    </>
  );
}
