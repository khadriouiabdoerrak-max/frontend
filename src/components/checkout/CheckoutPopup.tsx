'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { X, Loader2, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { trackInitiateCheckout, trackPurchase } from '@/lib/tracking';
import { calcOrderTotal } from '@/lib/shipping';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/site';
import { cartWhatsAppHref } from '@/lib/whatsapp';
import { getListImage, getProductBySlug } from '@/lib/products';
import { CitySelect } from '@/components/ui/CitySelect';

function itemImage(slug: string, fallback?: string) {
  const product = getProductBySlug(slug);
  if (product) return getListImage(product);
  return fallback ?? '/images/oxiprime-bundle-clear-products.webp';
}

type FieldErrors = {
  fullName?: string;
  phone?: string;
  city?: string;
};

export function CheckoutPopup() {
  const items = useCartStore((state) => state.items);
  const isCheckoutOpen = useCartStore((state) => state.isCheckoutOpen);
  const getCartTotal = useCartStore((state) => state.getCartTotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const closeCheckout = useCartStore((state) => state.closeCheckout);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    address: '',
  });

  const subtotal = getCartTotal();
  const totals = calcOrderTotal(subtotal);

  useEffect(() => {
    if (!isCheckoutOpen || items.length === 0) return;
    trackInitiateCheckout({
      value: totals.total,
      currency: 'MAD',
      content_ids: items.map((item) => item.id),
    });
  }, [isCheckoutOpen, items, totals.total]);

  useEffect(() => {
    if (isCheckoutOpen) {
      document.body.style.overflow = 'hidden';
      setError('');
      setFieldErrors({});
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCheckoutOpen]);

  const normalizePhone = (phone: string): string => {
    const cleaned = phone.replace(/[\s.\-()]/g, '');
    if (cleaned.startsWith('00212')) return `+212${cleaned.slice(5)}`;
    if (cleaned.startsWith('212')) return `+${cleaned}`;
    if (cleaned.startsWith('0')) return `+212${cleaned.slice(1)}`;
    return cleaned;
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (formData.fullName.trim().length < 3) {
      next.fullName = 'الرجاء إدخال الاسم الكامل.';
    }
    const normalizedPhone = normalizePhone(formData.phone);
    if (!/^\+2126\d{8}$|^\+2127\d{8}$/.test(normalizedPhone)) {
      next.phone = 'الرجاء إدخال رقم هاتف مغربي صحيح (06 أو 07).';
    }
    if (formData.city.trim().length < 2) {
      next.city = 'الرجاء إدخال المدينة.';
    }
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('السلة فارغة. أضيفي منتجا قبل إتمام الطلب.');
      return;
    }

    const nextErrors = validate();
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError('كمّلي المعلومات المطلوبة تحت، من بعد أكدي الطلب.');
      return;
    }

    setIsLoading(true);
    const normalizedPhone = normalizePhone(formData.phone);

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

      const orderNumber = data.order_number as string;
      setFormData({ fullName: '', phone: '', city: '', address: '' });
      clearCart();
      router.push(`/thank-you/${encodeURIComponent(orderNumber)}`);
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

  if (!isCheckoutOpen) return null;

  const waHref = cartWhatsAppHref(
    items.map((i) => ({
      nameAr: i.nameAr,
      quantity: i.quantity,
      price: i.price,
    })),
    totals.total,
    formData.city || undefined,
  );

  const inputClass = (hasError?: string) =>
    `w-full p-3.5 border rounded-btn bg-white focus:outline-none focus:ring-1 transition-colors text-cocoa text-right ${
      hasError
        ? 'border-error focus:border-error focus:ring-error'
        : 'border-champagne/50 focus:border-gold focus:ring-gold'
    }`;

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={closeCheckout}
        aria-hidden
      />

      <div className="relative bg-ivory w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-modal overflow-hidden flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-champagne/30 bg-background">
          <div>
            <h2 className="text-lg font-bold text-cocoa">إتمام الطلب</h2>
            <p className="text-xs text-muted-brown mt-0.5">
              الدفع عند الاستلام · تأكيد بالهاتف قبل الإرسال
            </p>
          </div>
          <button
            type="button"
            onClick={closeCheckout}
            className="p-2 hover:bg-champagne/30 rounded-full transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5 text-cocoa" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="bg-background rounded-card p-4 border border-champagne/30 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-btn bg-[#E4EDE8] border border-champagne/30">
                    <Image
                      src={itemImage(item.slug, item.image)}
                      alt={item.nameAr}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-right">
                    <p className="text-sm font-bold text-cocoa line-clamp-2 leading-snug break-words">
                      {item.nameAr}
                    </p>
                    <p className="text-xs text-muted-brown mt-0.5">
                      الكمية: {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-cocoa">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}

              <div className="border-t border-champagne/30 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-secondary">
                  <span>المجموع الفرعي</span>
                  <span>{formatPrice(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>التوصيل</span>
                  <span
                    className={
                      totals.freeShipping ? 'text-success font-medium' : ''
                    }
                  >
                    {totals.freeShipping
                      ? 'مجاني'
                      : formatPrice(totals.shipping)}
                  </span>
                </div>
                {!totals.freeShipping && totals.remainingForFree > 0 && (
                  <p className="text-[11px] text-muted-brown text-right">
                    زيد {formatPrice(totals.remainingForFree)} باش التوصيل يولي
                    مجاني (من {FREE_SHIPPING_THRESHOLD} درهم)
                  </p>
                )}
                <div className="flex justify-between font-bold text-cocoa text-base pt-1">
                  <span>المجموع</span>
                  <span>{formatPrice(totals.total)}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-error text-sm rounded-card border border-red-100 text-right">
                {error}
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <label className="block text-sm font-bold text-cocoa mb-1.5 text-right">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (fieldErrors.fullName) {
                      setFieldErrors({ ...fieldErrors, fullName: undefined });
                    }
                  }}
                  className={inputClass(fieldErrors.fullName)}
                  placeholder="الاسم والنسب"
                  autoComplete="name"
                />
                {fieldErrors.fullName && (
                  <p className="text-xs text-error mt-1 text-right">
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-cocoa mb-1.5 text-right">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (fieldErrors.phone) {
                      setFieldErrors({ ...fieldErrors, phone: undefined });
                    }
                  }}
                  className={`${inputClass(fieldErrors.phone)} font-sans`}
                  style={{ textAlign: 'right' }}
                  placeholder="06XXXXXXXX"
                  autoComplete="tel"
                  inputMode="numeric"
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-error mt-1 text-right">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-cocoa mb-1.5 text-right">
                  المدينة / الحي
                </label>
                <CitySelect
                  value={formData.city}
                  onChange={(city) => {
                    setFormData({ ...formData, city });
                    if (fieldErrors.city) {
                      setFieldErrors({ ...fieldErrors, city: undefined });
                    }
                  }}
                />
                {fieldErrors.city && (
                  <p className="text-xs text-error mt-1 text-right">
                    {fieldErrors.city}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-cocoa mb-1.5 text-right">
                  العنوان
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className={`${inputClass()} resize-none`}
                  placeholder="الحي، الشارع، رقم المنزل..."
                  autoComplete="street-address"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cocoa text-ivory py-4 font-bold text-base rounded-btn hover:bg-espresso transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                `أكدي الطلب — ${formatPrice(totals.total)}`
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

            <div className="flex items-center justify-center gap-2 text-xs text-muted-brown pb-1">
              <ShieldCheck className="w-4 h-4 text-success shrink-0" />
              <span>كنأكدو الطلب بالهاتف قبل الإرسال · دفع عند الاستلام</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
