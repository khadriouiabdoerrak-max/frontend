'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { bundleProduct, getListImage } from '@/lib/products';
import { formatPrice } from '@/lib/utils';

const CheckoutPopup = dynamic(
  () =>
    import('@/components/checkout/CheckoutPopup').then(
      (mod) => mod.CheckoutPopup,
    ),
  { ssr: false },
);

const bundleCartItem = {
  id: bundleProduct.id,
  slug: bundleProduct.slug,
  nameAr: bundleProduct.nameAr,
  price: bundleProduct.price,
  compareAtPrice: bundleProduct.compareAtPrice,
  image: getListImage(bundleProduct),
  isBundle: true as const,
};

/** Always-visible order CTA — opens COD form so the customer can buy from any page. */
export function StickyOrderBar() {
  const pathname = usePathname();
  const addItem = useCartStore((state) => state.addItem);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Hide on thank-you / checkout — order already placed or in progress
  const hidden =
    !mounted ||
    pathname?.startsWith('/thank-you') ||
    pathname?.startsWith('/checkout');

  if (hidden) return null;

  const startOrder = () => {
    addItem(bundleCartItem, { open: false });
    setCheckoutOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-champagne/50 bg-ivory/95 backdrop-blur px-3 py-2.5 pe-[4.5rem] sm:pe-4 shadow-[0_-4px_20px_rgba(58,36,24,0.12)]">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="min-w-0 flex-1 text-right">
            <p className="text-[11px] text-muted-brown truncate">
              روتين OXIPRIME الكامل · دفع عند الاستلام
            </p>
            <p className="font-bold text-cocoa text-sm sm:text-base">
              {formatPrice(bundleProduct.price)}
              <span className="text-xs text-muted-brown line-through mr-1.5 font-normal">
                {formatPrice(bundleProduct.compareAtPrice!)}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={startOrder}
            className="shrink-0 bg-cocoa text-ivory px-5 sm:px-8 py-3 text-sm sm:text-base font-bold rounded-btn hover:bg-espresso transition-colors"
          >
            اطلبي دابا
          </button>
        </div>
      </div>

      <CheckoutPopup
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}
