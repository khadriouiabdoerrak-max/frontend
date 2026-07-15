'use client';

import { useCartStore, type CartProduct } from '@/lib/store';

type AddToCartButtonProps = {
  product: CartProduct;
  className?: string;
  children: React.ReactNode;
};

export function AddToCartButton({
  product,
  className,
  children,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <button
      type="button"
      onClick={() => addItem(product)}
      className={className}
    >
      {children}
    </button>
  );
}
