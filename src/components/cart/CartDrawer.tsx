'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useCartStore } from '@/lib/store';
import { ShoppingBag, X, Plus, Minus, ShieldCheck, Phone, Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { bundleProduct } from '@/lib/products';
import { calcOrderTotal } from '@/lib/shipping';
import { cartWhatsAppHref } from '@/lib/whatsapp';

const CheckoutPopup = dynamic(
  () =>
    import('@/components/checkout/CheckoutPopup').then((mod) => mod.CheckoutPopup),
  { ssr: false },
);

function CartUpsell({
  individualCount,
  hasBundle,
  onAddBundle,
}: {
  individualCount: number;
  hasBundle: boolean;
  onAddBundle: () => void;
}) {
  if (hasBundle) {
    return (
      <div className="bg-cocoa/5 border border-gold/30 rounded-card p-4">
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-4 h-4 text-gold fill-gold" />
          <span className="font-bold text-sm text-cocoa">اختيار ممتاز</span>
        </div>
        <p className="text-xs text-muted-brown leading-relaxed">
          طلبكِ يحتوي على الروتين الكامل بثمن خاص. سيتم التواصل معكِ لتأكيد
          الطلب قبل الإرسال.
        </p>
      </div>
    );
  }

  if (individualCount === 1) {
    return (
      <div className="bg-gold/10 border border-gold/30 rounded-card p-4">
        <p className="font-bold text-sm text-cocoa mb-1">
          وفّري أكثر مع الروتين الكامل
        </p>
        <p className="text-xs text-muted-brown mb-3 leading-relaxed">
          أضيفي الشامبو، البلسم، الماسك والسيروم في باك واحد بـ 599 درهم بدل
          796 درهم.
        </p>
        <button
          onClick={onAddBundle}
          className="w-full bg-cocoa text-ivory text-xs font-bold py-2.5 rounded-btn hover:bg-espresso transition-colors"
        >
          استبدلي بالروتين الكامل — 599 درهم
        </button>
      </div>
    );
  }

  if (individualCount === 2 || individualCount === 3) {
    return (
      <div className="bg-gold/10 border border-gold/30 rounded-card p-4">
        <p className="font-bold text-sm text-cocoa mb-1">
          قريبة من الروتين الكامل
        </p>
        <p className="text-xs text-muted-brown mb-3 leading-relaxed">
          المنتجات تعمل بشكل أفضل كروتين متكامل. اختاري الباك الكامل ووفرّي
          197 درهم.
        </p>
        <button
          onClick={onAddBundle}
          className="w-full bg-cocoa text-ivory text-xs font-bold py-2.5 rounded-btn hover:bg-espresso transition-colors"
        >
          اختاري الباك الكامل — 599 درهم
        </button>
      </div>
    );
  }

  return null;
}

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    updateQuantity,
    removeItem,
    getCartTotal,
    getIndividualCount,
    hasBundle,
    clearCart,
    addItem,
  } = useCartStore();

  const [isMounted, setIsMounted] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const total = getCartTotal();
  const individualCount = getIndividualCount();
  const bundleInCart = hasBundle();

  const handleAddBundle = () => {
    // Remove individual products, add bundle
    clearCart();
    addItem({
      id: bundleProduct.id,
      slug: bundleProduct.slug,
      nameAr: bundleProduct.nameAr,
      price: bundleProduct.price,
      compareAtPrice: bundleProduct.compareAtPrice,
      image: bundleProduct.image,
      isBundle: true,
    });
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer — slides from right in RTL */}
      <div
        className={`fixed top-0 bottom-0 right-0 w-full sm:w-[420px] bg-ivory z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-modal ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-champagne/30 bg-background">
          <h2 className="text-lg font-bold text-cocoa">سلة التسوق</h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-champagne/30 rounded-full transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5 text-cocoa" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-secondary py-20">
              <ShoppingBag className="w-12 h-12 opacity-20 text-cocoa" />
              <p className="font-medium text-muted-brown">السلة فارغة</p>
              <button
                onClick={closeCart}
                className="text-gold underline underline-offset-4 hover:text-cocoa text-sm transition-colors"
              >
                تصفحي المنتجات
              </button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-background rounded-card p-3 border border-champagne/20"
                >
                  {/* Image placeholder */}
                  <div className="w-16 h-16 bg-champagne/20 rounded-card flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5 text-champagne" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-sm text-cocoa leading-snug line-clamp-2">
                        {item.nameAr}
                      </h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-brown hover:text-error transition-colors shrink-0"
                        aria-label="حذف"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity */}
                      <div className="flex items-center border border-champagne/50 rounded-btn overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, Math.max(1, item.quantity - 1))
                          }
                          className="px-2 py-1 hover:bg-champagne/20 text-cocoa transition-colors"
                          aria-label="نقصان"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-bold text-cocoa">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-2 py-1 hover:bg-champagne/20 text-cocoa transition-colors"
                          aria-label="زيادة"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-left">
                        <span className="font-bold text-sm text-cocoa">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        {item.compareAtPrice && (
                          <span className="block text-xs text-muted-brown line-through text-left">
                            {formatPrice(item.compareAtPrice * item.quantity)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Upsell block */}
              <CartUpsell
                individualCount={individualCount}
                hasBundle={bundleInCart}
                onAddBundle={handleAddBundle}
              />
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-champagne/30 bg-background space-y-3">
            {/* Trust row */}
            <div className="grid grid-cols-3 gap-1 text-center">
              {[
                { icon: ShieldCheck, label: 'منتجات أصلية' },
                { icon: Phone, label: 'تأكيد عبر الهاتف' },
                { icon: ShoppingBag, label: 'دفع عند الاستلام' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 py-2"
                >
                  <Icon className="w-4 h-4 text-gold" />
                  <span className="text-[10px] text-muted-brown leading-tight text-center">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Total + shipping preview */}
            {(() => {
              const totals = calcOrderTotal(total);
              return (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm text-secondary">
                    <span>المنتجات</span>
                    <span>{formatPrice(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-secondary">
                    <span>التوصيل</span>
                    <span>
                      {totals.freeShipping
                        ? 'مجاني'
                        : formatPrice(totals.shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary">المجموع</span>
                    <div className="text-left">
                      <span className="text-xl font-bold text-cocoa">
                        {formatPrice(totals.total)}
                      </span>
                      {bundleInCart && (
                        <span className="block text-xs text-success font-medium text-left">
                          وفّرتِ 197 درهم
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            <p className="text-xs text-center text-muted-brown">
              توصيل مجاني فوق 500 درهم · تأكيد عبر الهاتف
            </p>

            <button
              onClick={() => {
                closeCart();
                setCheckoutOpen(true);
              }}
              className="w-full bg-cocoa text-ivory py-4 font-bold text-base rounded-btn hover:bg-espresso transition-colors"
            >
              إتمام الطلب
            </button>

            <a
              href={cartWhatsAppHref(
                items.map((i) => ({
                  nameAr: i.nameAr,
                  quantity: i.quantity,
                  price: i.price,
                })),
                calcOrderTotal(total).total,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-[#25D366] text-white py-3 font-bold rounded-btn hover:bg-[#1ebe59] transition-colors text-sm"
            >
              اطلبي عبر واتساب
            </a>
          </div>
        )}
      </div>

      {/* Checkout Popup */}
      <CheckoutPopup
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}
