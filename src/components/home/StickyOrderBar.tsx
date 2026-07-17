'use client';

import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { bundleProduct } from '@/lib/products';
import { formatPrice } from '@/lib/utils';

const bundleCartItem = {
  id: bundleProduct.id,
  slug: bundleProduct.slug,
  nameAr: bundleProduct.nameAr,
  price: bundleProduct.price,
  compareAtPrice: bundleProduct.compareAtPrice,
  isBundle: true as const,
};

export function StickyOrderBar() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-ivory/95 backdrop-blur border-t border-champagne/50 px-3 py-2.5 pe-20 shadow-[0_-4px_20px_rgba(58,36,24,0.12)]">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-brown truncate">الروتين الكامل</p>
          <p className="font-bold text-cocoa text-sm">
            {formatPrice(bundleProduct.price)}
            <span className="text-xs text-muted-brown line-through mr-1.5">
              {formatPrice(bundleProduct.compareAtPrice!)}
            </span>
          </p>
        </div>
        <AddToCartButton
          product={bundleCartItem}
          className="shrink-0 bg-cocoa text-ivory px-5 py-2.5 text-sm font-bold rounded-btn"
        >
          اطلبي دابا
        </AddToCartButton>
      </div>
    </div>
  );
}
