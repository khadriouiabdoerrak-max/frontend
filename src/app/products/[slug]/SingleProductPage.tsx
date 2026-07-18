'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { products, bundleProduct, getListImage, type Product } from '@/lib/products';
import { StarRating } from '@/components/home/StarRating';
import { LazySection } from '@/components/home/LazySection';
import {
  CodTrustList,
  CompactOrderFlow,
  ProductReviewsSection,
  WhatsAppAskLink,
} from '@/components/product/ProductTrustBits';

function ProductImage({ product }: { product: Product }) {
  return (
    <div className="relative w-full aspect-[4/5] rounded-card border border-champagne/40 overflow-hidden shadow-card bg-gradient-to-b from-background to-champagne/20">
      <Image
        src={product.image ?? getListImage(product)}
        alt={product.nameAr}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 520px"
        quality={75}
        className="object-cover"
        priority
      />
    </div>
  );
}

export function SingleProductPage({
  product,
  isAdding,
  onAddToCart,
}: {
  product: Product;
  isAdding: boolean;
  onAddToCart: () => void;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const otherProducts = products.filter((item) => item.id !== product.id);
  const forWhom = product.suitableFor?.[0];
  const promise = product.expectedResults?.[0] ?? product.benefits[0];

  const productFaqs = [
    {
      title: 'واش الدفع عند الاستلام؟',
      content:
        'نعم. كتخلصي غير ملي توصل الطلبية لباب الدار. ما كاينش دفع مسبق.',
    },
    {
      title: 'واش غادي يتصلو بيا قبل الإرسال؟',
      content:
        'نعم. كنأكدو الاسم، المدينة والعنوان بالهاتف. تقدري تعدّلي أو تلغي قبل ما نرسلو.',
    },
    {
      title: 'كيفاش نستعمل هاد المنتج؟',
      content: product.howToUse,
    },
    {
      title: 'واش أحسن ناخذو بوحدو ولا فالروتين الكامل؟',
      content:
        'تقدري تاخديه بوحدو. ولكن النتيجة كتكون أوضح ملي كتستعملي الروتين كامل: شامبو + بلسم + ماسك + سيروم.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="px-3 sm:px-4 py-6 sm:py-10 bg-gradient-to-b from-[#EFE6D6] to-background">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 lg:gap-10 items-start">
          <div className="w-full lg:sticky lg:top-20">
            <ProductImage product={product} />
          </div>

          <div className="space-y-5 text-center lg:text-right min-w-0 w-full overflow-visible">
            {product.step && (
              <span className="inline-block bg-gold/10 text-gold text-xs font-bold px-3 py-1 rounded-badge">
                خطوة {product.step} من الروتين — {product.stepLabel}
              </span>
            )}
            <div className="min-w-0 px-1 space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-cocoa leading-snug break-words">
                {product.nameAr}
              </h1>
              {forWhom && (
                <p className="text-sm text-cocoa/90 font-medium leading-relaxed">
                  مناسب لـ {forWhom}
                </p>
              )}
              {promise && (
                <p className="text-sm text-muted-brown leading-relaxed">
                  النتيجة المتوقعة: {promise}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <StarRating rating={product.rating} />
              <span className="text-xs text-muted-brown">دفع عند الاستلام</span>
            </div>
            <p className="text-3xl font-bold text-cocoa">
              {formatPrice(product.price)}
            </p>

            <ul className="space-y-2.5 text-sm text-secondary text-right w-full min-w-0">
              {product.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2 w-full min-w-0"
                >
                  <span className="text-success font-bold shrink-0 leading-5">
                    ✓
                  </span>
                  <span className="min-w-0 flex-1 break-words leading-relaxed">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>

            <div className="rounded-card border border-gold/40 bg-ivory p-4 space-y-3 shadow-card">
              <CodTrustList />
              <button
                type="button"
                onClick={onAddToCart}
                disabled={isAdding}
                className="w-full bg-cocoa text-ivory py-4 font-bold rounded-btn hover:bg-espresso transition-colors disabled:opacity-70"
              >
                {isAdding
                  ? 'تمت الإضافة ✓'
                  : `أضيفي للسلة — ${formatPrice(product.price)}`}
              </button>
              <WhatsAppAskLink productName={product.nameAr} />
              <Link
                href={`/products/${bundleProduct.slug}`}
                className="block w-full border border-cocoa text-cocoa py-3 font-bold rounded-btn text-sm text-center hover:bg-cocoa/5 transition-colors break-words"
              >
                الأفضل: الروتين الكامل — {formatPrice(bundleProduct.price)}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CompactOrderFlow />

      <section className="px-4 py-10 bg-background">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-card border border-champagne/30 bg-ivory p-5 sm:p-6 shadow-card">
            <h2 className="text-xl font-bold text-cocoa mb-2">
              شنو كيدير هاد المنتج؟
            </h2>
            {product.routineNote && (
              <p className="text-sm text-secondary leading-relaxed mb-4">
                {product.routineNote}
              </p>
            )}
            <p className="text-sm text-muted-brown leading-relaxed">
              {product.shortDescriptionAr}
            </p>
          </div>
          <div className="rounded-card border border-champagne/30 bg-cocoa text-ivory p-5 sm:p-6">
            <h2 className="text-xl font-bold mb-4">مناسب لمن؟</h2>
            <ul className="space-y-3 text-sm text-champagne/90">
              {(product.suitableFor ?? []).map((item) => (
                <li key={item} className="flex items-start gap-2 min-w-0">
                  <span className="text-gold font-bold shrink-0">✓</span>
                  <span className="min-w-0 flex-1 break-words">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <LazySection minHeight="420px">
        <section className="px-4 py-10 bg-ivory">
          <div className="container mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              {product.usageImage && (
                <figure className="overflow-hidden rounded-card border border-champagne/30 shadow-card bg-background">
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={product.usageImage}
                      alt={`طريقة استعمال ${product.nameAr}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 480px"
                      quality={60}
                      loading="lazy"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="p-3 text-center text-xs font-bold text-muted-brown">
                    طريقة الاستعمال
                  </figcaption>
                </figure>
              )}
              <div className="rounded-card border border-champagne/30 bg-background p-5 sm:p-6">
                <h2 className="text-xl font-bold text-cocoa mb-4">
                  طريقة الاستعمال خطوة بخطوة
                </h2>
                <div className="space-y-3">
                  {(product.usageSteps ?? [product.howToUse]).map(
                    (step, index) => (
                      <div key={step} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold/15 text-gold flex items-center justify-center font-bold shrink-0 font-sans text-sm">
                          {index + 1}
                        </div>
                        <p className="text-sm text-secondary leading-relaxed pt-1 min-w-0 flex-1 break-words">
                          {step}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {product.resultImage && (
                <figure className="overflow-hidden rounded-card border border-gold/40 shadow-card bg-background">
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={product.resultImage}
                      alt="نتيجة شعر ناعم ولامع"
                      fill
                      sizes="(max-width: 1024px) 100vw, 480px"
                      quality={60}
                      loading="lazy"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="p-3 text-center text-xs font-bold text-cocoa">
                    مع الاستمرار · نعومة ولمعان أوضح
                  </figcaption>
                </figure>
              )}
              <div className="rounded-card border border-champagne/30 bg-background p-5 sm:p-6">
                <h2 className="text-xl font-bold text-cocoa mb-4">
                  نصائح باش يعطي نتيجة أحسن
                </h2>
                <ul className="space-y-3 mb-5">
                  {(product.proTips ?? []).map((tip) => (
                    <li
                      key={tip}
                      className="flex items-start gap-2 text-sm text-secondary min-w-0"
                    >
                      <span className="text-success font-bold shrink-0">✓</span>
                      <span className="min-w-0 flex-1 break-words">{tip}</span>
                    </li>
                  ))}
                </ul>
                <p className="font-bold text-cocoa text-sm mb-2">
                  النتيجة المتوقعة
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {(product.expectedResults ?? product.benefits).map(
                    (result) => (
                      <div
                        key={result}
                        className="rounded-card bg-ivory border border-champagne/30 p-3 text-xs text-muted-brown leading-relaxed"
                      >
                        {result}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </LazySection>

      <section className="px-4 py-10 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-card border border-champagne/30 bg-ivory p-5 sm:p-6 mb-8">
            <h2 className="text-xl font-bold text-cocoa mb-3">
              المكونات البارزة
            </h2>
            <div className="flex flex-wrap gap-2">
              {product.ingredients.map((ing) => (
                <span
                  key={ing}
                  className="rounded-badge border border-champagne/40 bg-background px-3 py-1.5 text-xs font-bold text-cocoa"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-card border border-gold/40 bg-gold/10 p-5 sm:p-6 text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-cocoa mb-2">
              بغيتي نتيجة أوضح؟
            </h2>
            <p className="text-sm text-muted-brown leading-relaxed mb-4">
              هاد المنتج قوي بوحدو، ولكن الروتين الكامل كيكمل العناية: تنظيف +
              ترطيب + تغذية + حماية.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() =>
                  addItem({
                    id: bundleProduct.id,
                    slug: bundleProduct.slug,
                    nameAr: bundleProduct.nameAr,
                    price: bundleProduct.price,
                    compareAtPrice: bundleProduct.compareAtPrice,
                    image: bundleProduct.image,
                    isBundle: true,
                  })
                }
                className="bg-cocoa text-ivory px-6 py-3.5 font-bold rounded-btn hover:bg-espresso transition-colors"
              >
                أضيفي الروتين الكامل — {formatPrice(bundleProduct.price)}
              </button>
              <Link
                href={`/products/${bundleProduct.slug}`}
                className="border border-cocoa text-cocoa px-6 py-3.5 font-bold rounded-btn text-center hover:bg-cocoa/5 transition-colors"
              >
                شوفي تفاصيل الباك
              </Link>
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-cocoa text-center mb-5">
              أسئلة قبل الطلب
            </h2>
            <div className="rounded-card border border-champagne/30 bg-ivory divide-y divide-champagne/30">
              {productFaqs.map((faq, i) => (
                <div key={faq.title} className="p-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-3 text-right font-bold text-sm text-cocoa min-w-0"
                  >
                    <span className="min-w-0 flex-1 break-words leading-snug">
                      {faq.title}
                    </span>
                    <span className="text-gold shrink-0">
                      {openFaq === i ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === i && (
                    <p className="mt-2 text-sm text-secondary leading-relaxed break-words">
                      {faq.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <LazySection minHeight="280px">
        <ProductReviewsSection />
      </LazySection>

      <LazySection minHeight="280px">
        <section className="px-4 py-10 bg-background">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-xl sm:text-2xl font-bold text-cocoa text-center mb-6">
              منتجات أخرى من المجموعة
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {otherProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.slug}`}
                  className="group bg-ivory rounded-card border border-champagne/30 overflow-hidden hover:border-gold/60 transition-colors"
                >
                  <div className="relative aspect-[3/4] bg-gradient-to-b from-background to-champagne/20">
                    <Image
                      src={item.image ?? getListImage(item)}
                      alt={item.nameAr}
                      fill
                      sizes="(max-width: 640px) 92vw, 30vw"
                      quality={75}
                      loading="lazy"
                      className="object-cover md:transition-transform md:duration-300 md:group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 text-center min-w-0">
                    <p className="font-bold text-sm text-cocoa break-words leading-snug">
                      {item.nameAr}
                    </p>
                    <p className="text-xs text-muted-brown mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href={`/products/${bundleProduct.slug}`}
                className="inline-block bg-cocoa text-ivory px-6 py-3 font-bold rounded-btn text-sm hover:bg-espresso transition-colors"
              >
                شوفي الروتين الكامل — {formatPrice(bundleProduct.price)}
              </Link>
            </div>
          </div>
        </section>
      </LazySection>
    </div>
  );
}
