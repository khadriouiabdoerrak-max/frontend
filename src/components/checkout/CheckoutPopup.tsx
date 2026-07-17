'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { X, Loader2, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { trackInitiateCheckout, trackPurchase } from '@/lib/tracking';
import { CITY_OPTIONS, calcOrderTotal } from '@/lib/shipping';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/site';
import { cartWhatsAppHref } from '@/lib/whatsapp';

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

  const subtotal = getCartTotal();
  const totals = calcOrderTotal(subtotal);

  useEffect(() => {
    if (!isOpen || items.length === 0) return;
    trackInitiateCheckout({
      value: totals.total,
      currency: 'MAD',
      content_ids: items.map((item) => item.id),
    });
  }, [isOpen, items, totals.total]);

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
      setError('الرجاء اختيار المدينة.');
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
            address: formData.address.trim() || formData.city.trim(),
          },
          items: items.map((item) => ({
            product_slug: item.slug,
            quantity: item.quantity,
          })),
          notes: formData.notes.trim() || undefined,
          source: 'website',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || 'ORDER_FAILED');
      }

      trackPurchase({
        value: data.total_mad ?? totals.total,
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

  const waHref = cartWhatsAppHref(
    items.map((i) => ({
      nameAr: i.nameAr,
      quantity: i.quantity,
      price: i.price,
    })),
    totals.total,
    formData.city || undefined,
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-ivory w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-modal overflow-hidden flex flex-col max-h-[95vh]">
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
              <div className="border-t border-champagne/30 pt-2 space-y-1.5 text-sm">
                <div className="flex justify-between text-secondary">
                  <span>المجموع الفرعي</span>
                  <span>{formatPrice(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>التوصيل</span>
                  <span className={totals.freeShipping ? 'text-success font-medium' : ''}>
                    {totals.freeShipping
                      ? 'مجاني'
                      : formatPrice(totals.shipping)}
                  </span>
                </div>
                {!totals.freeShipping && totals.remainingForFree > 0 && (
                  <p className="text-[11px] text-muted-brown text-right">
                    زيد {formatPrice(totals.remainingForFree)} باش يولي التوصيل
                    مجاني (من {FREE_SHIPPING_THRESHOLD} درهم)
                  </p>
                )}
                <div className="flex justify-between font-bold text-cocoa pt-1">
                  <span>المجموع الكلي</span>
                  <span>{formatPrice(totals.total)}</span>
                </div>
              </div>
              <p className="text-xs text-success mt-2 font-medium">
                دفع عند الاستلام — توصيل داخل المغرب
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-error text-sm rounded-card border border-red-100">
                {error}
              </div>
            )}

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
                <select
                  required
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full p-3 border border-champagne/50 rounded-btn bg-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors text-cocoa"
                >
                  <option value="">اختاري مدينتكِ</option>
                  {CITY_OPTIONS.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
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

              <div>
                <label className="block text-sm font-bold text-cocoa mb-1.5">
                  ملاحظة (اختياري)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full p-3 border border-champagne/50 rounded-btn bg-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors text-cocoa"
                  placeholder="مثال: الاتصال قبل التوصيل"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-card border border-champagne/30 bg-background p-4 text-sm text-secondary leading-relaxed cursor-pointer">
              <input
                type="checkbox"
                checked={formData.commitment}
                onChange={(e) =>
                  setFormData({ ...formData, commitment: e.target.checked })
                }
                className="mt-0.5 accent-gold"
              />
              <span>أؤكد أنني أريد استلام الطلب والدفع عند التوصيل.</span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cocoa text-ivory py-4 font-bold text-base rounded-btn hover:bg-espresso transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                `تأكيد الطلب — ${formatPrice(totals.total)}`
              )}
            </button>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-[#25D366] text-white py-3.5 font-bold rounded-btn hover:bg-[#1ebe59] transition-colors text-sm"
            >
              اطلبي عبر واتساب
            </a>

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
