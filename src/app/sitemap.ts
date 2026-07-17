import type { MetadataRoute } from 'next';
import { allProducts } from '@/lib/products';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://oxiprime.store';

const guideSlugs = [
  'cheveux-secs-maroc',
  'routine-apres-coloration',
  'comment-utiliser-routine-oxiprime',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/collection',
    '/about',
    '/contact',
    '/faq',
    '/policies',
    '/science',
    '/quiz',
    '/guides',
    '/privacy',
    '/terms',
    '/return-policy',
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/collection' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/collection' ? 0.9 : 0.7,
  }));

  const products: MetadataRoute.Sitemap = allProducts.map((product) => ({
    url: `${siteUrl}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: product.isBundle ? 0.95 : 0.8,
  }));

  const guides: MetadataRoute.Sitemap = guideSlugs.map((slug) => ({
    url: `${siteUrl}/guides/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.65,
  }));

  return [...staticRoutes, ...products, ...guides];
}
