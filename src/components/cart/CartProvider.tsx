'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useCartStore } from '@/lib/store';

const CartDrawer = dynamic(
  () => import('./CartDrawer').then((mod) => mod.CartDrawer),
  { ssr: false },
);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const isOpen = useCartStore((state) => state.isOpen);
  const [loadDrawer, setLoadDrawer] = useState(false);

  useEffect(() => {
    if (isOpen) setLoadDrawer(true);
  }, [isOpen]);

  return (
    <>
      {children}
      {loadDrawer ? <CartDrawer /> : null}
    </>
  );
}
