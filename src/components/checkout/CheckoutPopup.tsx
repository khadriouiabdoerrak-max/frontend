'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { X, Loader2, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { trackInitiateCheckout, trackPurchase } from '@/lib/tracking';

export function CheckoutPopup({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { items, getCartTotal, clearCart } = useCartStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    address: '',
    notes: '',
    commitment: false,
  });

  const total = getCartTotal();

  useEffect(() => {
    if (!isOpen || items.length === 0) return;
    trackInitiateCheckout({
      value: total,
      currency: 'MAD',
      content_ids: items.map((item) => item.id),
    });
  }, [isOpen, items, total]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const normalizePhone = (phone: string): string => {
    const cleaned = phone.replace(/[\s.\-()]/g, '');
    if (cleaned.startsWith('00212')) return `+212${cleaned.slice(5)}`;
    if (cleaned.startsWith('212')) return `+${cleaned}`;
    if (cleaned.startsWith('0')) return `+212${cleaned.slice(1)}`;
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (items.length === 0) {
      setError('السلة فارغة. أضيفي منتجا قبل إتمام الطلب.');
      setIsLoading(false);
      return;
    }

    if (formData.fullName.trim().length < 3) {
      setError('الرجاء إدخال الاسم الكامل.');
      setIsLoading(false);
      return;
    }

    const normalizedPhone = normalizePhone(formData.phone);
    const phoneRegex = /^\+2126\d{8}$|^\+2127\d{8}$/;
    if (!phoneRegex.test(normalizedPhone)) {
      setError('الرجاء إدخال رقم هاتف مغربي صحيح (06 أو 07).');
      setIsLoading(false);
      return;
    }

    if (formData.city.trim().length < 2) {
      setError('الرجاء إدخال اسم المدينة.');
      setIsLoading(false);
      return;
    }

    if (!formData.commitment) {
      setError('يجب تأكيد رغبتكِ في استلام الطلب والدفع عند التوصيل.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            full_name: formData.fullName.trim(),
            phone: normalizedPhone,
            city: formData.city.trim(),
            address: formData.address.trim(),
          },
          items: items.map((item) => ({
            product_slug: item.slug,
            quantity: item.quantity,
          })),
          source: 'website',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || 'ORDER_FAILED');
      }

      trackPurchase({
        value: data.total_mad ?? total,
        currency: 'MAD',
        content_ids: items.map((item) => item.id),
        order_id: data.order_number,
      });

      clearCart();
      onClose();
      router.push(`/thank-you/${encodeURIComponent(data.order_number)}`);
    } catch (err) {
      setError(
        err instanceof Error && err.message !== 'ORDER_FAILED'
          ? err.message
          : 'حدث خطأ أثناء إرسال الطلب. الرجاء المحاولة مرة أخرى.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-ivory w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-modal overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-champagne/30 bg-background">
          <div>
            <h2 className="text-lg font-bold text-cocoa">إتمام الطلب</h2>
            <p className="text-xs text-muted-brown mt-0.5">
              الدفع عند الاستلام. لا حاجة لبطاقة بنكية.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-champagne/30 rounded-full transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5 text-cocoa" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Order summary */}
            <div className="bg-background rounded-card p-4 border border-champagne/30">
              <div className="space-y-2 mb-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-secondary">
                      {item.nameAr} × {item.quantity}
                    </span>
                    <span className="font-medium text-cocoa">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-champagne/30 pt-2 flex justify-between font-bold text-cocoa">
                <span>المجموع</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-success mt-1 font-medium">
                دفع عند الاستلام — توصيل داخل المغرب
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-error text-sm rounded-card border border-red-100">
                {error}
              </div>
            )}

            {/* Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-cocoa mb-1.5">
                  الاسم الكامل <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full p-3 border border-champagne/50 rounded-btn bg-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors text-cocoa"
                  placeholder="الاسم والنسب"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-cocoa mb-1.5">
                  رقم الهاتف <span className="text-error">*</span>
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full p-3 border border-champagne/50 rounded-btn bg-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors text-left text-cocoa font-sans"
                  placeholder="06 XX XX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-cocoa mb-1.5">
                  المدينة <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full p-3 border border-champagne/50 rounded-btn bg-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors text-cocoa"
                  placeholder="مثال: الدار البيضاء، مراكش..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-cocoa mb-1.5">
                  العنوان
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full p-3 border border-champagne/50 rounded-btn bg-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors resize-none text-cocoa"
                  placeholder="الحي، الشارع، رقم المنزل..."
                />
              </div>
            </div>

            {/* Commitment checkbox */}
            <label className="flex items-start gap-3 rounded-card border border-champagne/30 bg-background p-4 text-sm text-secondary leading-relaxed cursor-pointer">
              <input
                type="checkbox"
                checked={formData.commitment}
                onChange={(e) =>
                  setFormData({ ...formData, commitment: e.target.checked })
                }
                className="mt-0.5 accent-gold"
              />
              <span>
                أؤكد أنني أريد استلام الطلب والدفع عند التوصيل.
              </span>
            </label>

            {/* CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cocoa text-ivory py-4 font-bold text-base rounded-btn hover:bg-espresso transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'تأكيد الطلب'
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-brown pb-2">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>سيتواصل معكِ فريقنا لتأكيد الطلب قبل الإرسال.</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
