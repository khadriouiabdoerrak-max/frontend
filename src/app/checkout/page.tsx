'use client';

import { useState, useEffect } from 'react';
import { CheckoutPopup } from '@/components/checkout/CheckoutPopup';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // If the popup is closed, redirect back to home
    if (!isOpen) {
      router.push('/');
    }
  }, [isOpen, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <CheckoutPopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}