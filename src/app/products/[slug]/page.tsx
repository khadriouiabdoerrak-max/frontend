import type { Metadata } from 'next';
import { ProductPageClient } from './ProductPageClient';
import { getProductBySlug, allProducts } from '@/lib/products';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return allProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'تاجكِ | منتج غير موجود' };

  return {
    title: `${product.nameAr} | تاجكِ`,
    description: product.shortDescriptionAr,
    openGraph: {
      title: `${product.nameAr} | تاجكِ`,
      description: product.shortDescriptionAr,
      type: 'website',
      images: ['/og-image.svg'],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  return <ProductPageClient slug={slug} />;
}
