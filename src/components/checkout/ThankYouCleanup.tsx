'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/store';

/** Ensures cart drawer + checkout are fully closed on the thank-you screen. */
export function ThankYouCleanup() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
