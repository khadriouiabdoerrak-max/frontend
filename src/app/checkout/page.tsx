'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';

/** Dedicated checkout URL — opens the shared COD form, closes back to home. */
export default function CheckoutPage() {
  const router = useRouter();
  const openCheckout = useCartStore((state) => state.openCheckout);
  const isCheckoutOpen = useCartStore((state) => state.isCheckoutOpen);
  const items = useCartStore((state) => state.items);
  const openedRef = useRef(false);

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/');
      return;
    }
    openCheckout();
    openedRef.current = true;
  }, [items.length, openCheckout, router]);

  useEffect(() => {
    if (openedRef.current && !isCheckoutOpen) {
      router.push('/');
    }
  }, [isCheckoutOpen, router]);

  return <div className="min-h-screen bg-background" aria-hidden />;
}
