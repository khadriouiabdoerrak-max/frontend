'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useCartStore } from '@/lib/store';

const CartDrawer = dynamic(
  () => import('./CartDrawer').then((mod) => mod.CartDrawer),
  { ssr: false },
);

const CheckoutPopup = dynamic(
  () =>
    import('@/components/checkout/CheckoutPopup').then(
      (mod) => mod.CheckoutPopup,
    ),
  { ssr: false },
);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const isOpen = useCartStore((state) => state.isOpen);
  const isCheckoutOpen = useCartStore((state) => state.isCheckoutOpen);
  const [loadDrawer, setLoadDrawer] = useState(false);
  const [loadCheckout, setLoadCheckout] = useState(false);

  useEffect(() => {
    if (isOpen) setLoadDrawer(true);
  }, [isOpen]);

  useEffect(() => {
    if (isCheckoutOpen) setLoadCheckout(true);
  }, [isCheckoutOpen]);

  return (
    <>
      {children}
      {loadDrawer ? <CartDrawer /> : null}
      {loadCheckout ? <CheckoutPopup /> : null}
    </>
  );
}
