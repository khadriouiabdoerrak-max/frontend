'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useCartStore } from '@/lib/store';
import { getProductBySlug, getListImage } from '@/lib/products';

const BundleProductPage = dynamic(
  () => import('./BundleProductPage').then((mod) => mod.BundleProductPage),
  { loading: () => <div className="min-h-screen bg-background" /> },
);

const SingleProductPage = dynamic(
  () => import('./SingleProductPage').then((mod) => mod.SingleProductPage),
  { loading: () => <div className="min-h-screen bg-background" /> },
);

export function ProductPageClient({ slug }: { slug: string }) {
  const product = getProductBySlug(slug);
  const addItem = useCartStore((state) => state.addItem);
  const [isAdding, setIsAdding] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cocoa font-bold">المنتج غير موجود</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      nameAr: product.nameAr,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      image: product.image ?? getListImage(product),
      isBundle: product.isBundle,
    });
    setIsAdding(true);
    window.setTimeout(() => setIsAdding(false), 1500);
  };

  if (product.isBundle) {
    return (
      <BundleProductPage
        product={product}
        isAdding={isAdding}
        onAddToCart={handleAddToCart}
      />
    );
  }

  return (
    <SingleProductPage
      product={product}
      isAdding={isAdding}
      onAddToCart={handleAddToCart}
    />
  );
}
