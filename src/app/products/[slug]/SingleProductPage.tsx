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
  ResultPromiseSection,
  WhatsAppAskLink,
} from '@/components/product/ProductTrustBits';

const bundleSaving =
  (bundleProduct.compareAtPrice ?? bundleProduct.price) - bundleProduct.price;

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
  const usageSteps = product.usageSteps ?? [product.howToUse];

  const productFaqs = [
    {
      title: 'واش غادي نخلص قبل ما نوصلني؟',
      content:
        'لا. الدفع عند الاستلام فقط. كتخلصي ملي توصل الطلبية لباب الدار. ما كاينش بطاقة بنكية ولا تحويل مسبقا.',
    },
    {
      title: 'واش غادي يتصلو بيا؟ واش نقدر نلغي؟',
      content:
        'نعم، كيتواصل معك الفريق بالهاتف لتأكيد الاسم، المدينة، العنوان والمنتجات. إلا ما ردّيتيش، أو بغيتي تعدّلي أو تلغي قبل الإرسال، الطلب ما كيمشيش.',
    },
    {
      title: 'كيفاش نستعمل هاد المنتج؟',
      content: product.howToUse,
    },
    {
      title: 'واش أحسن ناخذو بوحدو ولا فالروتين الكامل؟',
      content: `تقدري تاخدي ${product.nameAr} بوحدو. ولكن النتيجة كتكون أوضح ملي كتستعملي الروتين كامل: شامبو + بلسم + ماسك + سيروم — وتوفري ${bundleSaving} درهم.`,
    },
    {
      title: 'واش مناسب لشعري المصبوغ / المتضرر / المنفوش؟',
      content:
        'نعم. المجموعة موجهة للشعر الجاف، الباهت، المتقصف، والمنفوش، وخصوصا بعد الصباغة أو الحرارة. النتائج تختلف حسب نوع الشعر وطريقة الاستعمال.',
    },
    {
      title: 'فحال شحال التوصيل؟',
      content:
        'بعد التأكيد بالهاتف، عادة من 2 إلى 4 أيام عمل حسب المدينة والمخزون. الخدمة موجهة للتوصيل داخل المغرب.',
    },
    {
      title: 'إلا وصلات الطلبية وفيها مشكل؟',
      content:
        'تواصلي معنا مباشرة بعد الاستلام. كنعاونوك حسب حالة الطلب. لهذا كنأكدو التفاصيل بالهاتف قبل الإرسال.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — same shell as bundle */}
      <section className="px-4 py-8 sm:py-12 bg-gradient-to-b from-[#EFE6D6] to-background">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative overflow-hidden rounded-card border border-champagne/40 shadow-card aspect-[4/5] bg-gradient-to-b from-background to-champagne/20">
            <Image
              src={product.image ?? getListImage(product)}
              alt={product.nameAr}
              fill
              priority
              quality={72}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 520px"
              className="object-cover"
            />
          </div>

          <div className="space-y-5 text-center lg:text-right lg:sticky lg:top-24 min-w-0 w-full">
            <p className="text-xs font-bold tracking-wide text-gold">
              {product.step
                ? `تاجكِ · خطوة ${product.step} من الروتين — ${product.stepLabel}`
                : 'تاجكِ · مجموعة OXIPRIME'}
            </p>
            <div className="min-w-0 px-1 space-y-2">
              <h1 className="text-2xl sm:text-4xl font-bold text-cocoa leading-snug break-words">
                {product.nameAr}
              </h1>
              <p className="text-sm sm:text-base text-cocoa/90 font-medium leading-relaxed">
                {forWhom
                  ? `مناسب لـ ${forWhom}`
                  : product.shortDescriptionAr}
              </p>
              <p className="text-sm text-muted-brown break-words">
                {promise
                  ? `النتيجة المتوقعة: ${promise}`
                  : 'خلّصي عند الباب · تأكيد بالهاتف'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <StarRating rating={product.rating} />
              <span className="text-xs text-muted-brown">
                تقييم العميلات · دفع عند الاستلام
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                [
                  product.step ? `خطوة ${product.step}` : 'منتج',
                  product.stepLabel ?? 'من المجموعة',
                ],
                ['199 د.م.', 'ثمن واضح'],
                ['0 درهم', 'قبل الاستلام'],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-card border border-champagne/40 bg-ivory p-3"
                >
                  <p className="text-base sm:text-lg font-bold text-cocoa">
                    {value}
                  </p>
                  <p className="text-[11px] text-muted-brown">{label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-card border border-gold/40 bg-ivory p-5 shadow-card space-y-4">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <span className="text-4xl font-bold text-cocoa">
                  {formatPrice(product.price)}
                </span>
              </div>
              <ul className="space-y-1.5 text-sm text-secondary text-right">
                {product.benefits.slice(0, 3).map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 min-w-0">
                    <span className="text-success font-bold shrink-0">✓</span>
                    <span className="min-w-0 flex-1 break-words">{benefit}</span>
                  </li>
                ))}
              </ul>
              <CodTrustList />
              <button
                type="button"
                onClick={onAddToCart}
                disabled={isAdding}
                className="w-full bg-cocoa text-ivory py-4 text-base font-bold rounded-btn hover:bg-espresso transition-colors disabled:opacity-70"
              >
                {isAdding
                  ? 'تمت الإضافة للسلة ✓'
                  : `اطلبي دابا — ${formatPrice(product.price)} · خلّصي عند الاستلام`}
              </button>
              <WhatsAppAskLink productName={product.nameAr} />
              <Link
                href={`/products/${bundleProduct.slug}`}
                className="block w-full border border-cocoa text-cocoa py-3 font-bold rounded-btn text-sm text-center hover:bg-cocoa/5 transition-colors break-words"
              >
                الأفضل: الروتين الكامل — {formatPrice(bundleProduct.price)}
              </Link>
              <p className="text-xs text-muted-brown">
                بعد الطلب: اتصال للتأكيد ← توصيل ← الدفع عند الباب
              </p>
            </div>
          </div>
        </div>
      </section>

      <CompactOrderFlow />

      {/* Alone vs full routine — same pattern as bundle */}
      <section className="px-4 py-12 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-cocoa mb-3">
              شنو كيعطي هاد المنتج… وشنو كيكمل الباك؟
            </h2>
            <p className="text-sm text-secondary leading-relaxed">
              {product.routineNote ??
                'هاد المنتج خطوة مهمة — والروتين الكامل كيكمل النتيجة.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            <div className="rounded-card border border-champagne/40 bg-ivory p-5 sm:p-6">
              <p className="text-xs font-bold text-muted-brown mb-3">
                إلا خذيتي غير هاد المنتج
              </p>
              <ul className="space-y-3 text-sm text-secondary">
                {(product.benefits.slice(0, 3).length
                  ? product.benefits.slice(0, 3)
                  : [product.shortDescriptionAr]
                ).map((item) => (
                  <li key={item} className="flex items-start gap-2 min-w-0">
                    <span className="text-success font-bold shrink-0">✓</span>
                    <span className="min-w-0 flex-1 break-words">{item}</span>
                  </li>
                ))}
                <li className="flex items-start gap-2 min-w-0">
                  <span className="text-muted-brown shrink-0">–</span>
                  <span className="min-w-0 flex-1 break-words">
                    باقي خطوات العناية (تنظيف / ترطيب / تغذية / حماية) كتقدر
                    تكون ناقصة
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-card border border-gold/50 bg-gold/10 p-5 sm:p-6 shadow-card">
              <p className="text-xs font-bold text-gold mb-3">
                ملي كتخذي الروتين الكامل
              </p>
              <ul className="space-y-3 text-sm text-secondary">
                {[
                  'تنظفي بلطف بلا ما تنشف الشعر',
                  'ترطبي وتسهّلي التسريح بعد كل غسلة',
                  'تغذّي بعمق مرة أو جوج فالأسبوع',
                  'تحمي وتزيدي اللمعان قبل/بعد السشوار',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 min-w-0">
                    <span className="text-success font-bold shrink-0">✓</span>
                    <span className="min-w-0 flex-1 break-words">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm font-bold text-cocoa leading-relaxed">
                توفري {bundleSaving} درهم على 4 منتجات — دفع عند الاستلام.
              </p>
              <Link
                href={`/products/${bundleProduct.slug}`}
                className="mt-4 inline-block text-sm font-bold text-cocoa underline underline-offset-2"
              >
                شوفي الباك الكامل
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LazySection minHeight="420px">
        <ResultPromiseSection />
      </LazySection>

      {/* Pain + fit */}
      <section className="px-4 py-12 bg-ivory">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-card border border-champagne/30 bg-background p-6 shadow-card">
            <h2 className="text-xl sm:text-2xl font-bold text-cocoa mb-4">
              إلا كنتي كتعيشي هاد المشاكل…
            </h2>
            <ul className="space-y-3 text-sm text-secondary">
              {[
                'شعري كينشف بسرعة بعد الغسيل',
                'التسريح صعيب والنفشة كتكثر',
                'الصباغة أو السشوار خرّبو الملمس',
                'كنشتري منتجات وكنبدل بلا ما نشوف فرق',
                'ما عنديش خطوة واضحة فالعناية',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 min-w-0">
                  <span className="text-gold font-bold shrink-0">•</span>
                  <span className="min-w-0 flex-1 break-words">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-card border border-gold/40 bg-background p-6 shadow-card">
            <h2 className="text-xl sm:text-2xl font-bold text-cocoa mb-4">
              هاد المنتج معمول ليك إلا…
            </h2>
            <ul className="space-y-3 text-sm text-secondary">
              {(product.suitableFor ?? product.benefits).map((item) => (
                <li key={item} className="flex items-start gap-2 min-w-0">
                  <span className="text-success font-bold shrink-0">✓</span>
                  <span className="min-w-0 flex-1 break-words">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How to use — mirror bundle “كيفاش يخدم” */}
      <LazySection minHeight="520px">
        <section className="px-4 py-12 bg-background">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-cocoa mb-3">
                كيفاش تستعملي {product.nameAr}؟
              </h2>
              <p className="text-sm text-secondary leading-relaxed">
                خطوات بسيطة — وصورة توضيحية خفيفة.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
              {product.usageImage && (
                <figure className="overflow-hidden rounded-card border border-champagne/30 bg-ivory shadow-card">
                  <div className="relative aspect-[16/11]">
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
              {product.resultImage && (
                <figure className="overflow-hidden rounded-card border border-gold/40 bg-ivory shadow-card">
                  <div className="relative aspect-[16/11]">
                    <Image
                      src={product.resultImage}
                      alt="نتيجة شعر أنعم مع الاستمرار"
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {usageSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex gap-3 rounded-card border border-champagne/30 bg-ivory p-4"
                >
                  <div className="w-9 h-9 rounded-full bg-cocoa text-ivory flex items-center justify-center font-bold shrink-0 font-sans text-sm">
                    {index + 1}
                  </div>
                  <p className="text-sm text-secondary leading-relaxed pt-1 min-w-0 flex-1 break-words">
                    {step}
                  </p>
                </div>
              ))}
            </div>

            {(product.proTips?.length ?? 0) > 0 && (
              <div className="rounded-card border border-champagne/30 bg-ivory p-5 sm:p-6 mb-8 max-w-3xl mx-auto">
                <h3 className="font-bold text-cocoa mb-3 text-center">
                  نصائح باش يعطي نتيجة أحسن
                </h3>
                <ul className="space-y-2">
                  {product.proTips!.map((tip) => (
                    <li
                      key={tip}
                      className="flex items-start gap-2 text-sm text-secondary min-w-0"
                    >
                      <span className="text-success font-bold shrink-0">✓</span>
                      <span className="min-w-0 flex-1 break-words">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-card border border-champagne/40 bg-ivory p-5 text-center max-w-2xl mx-auto">
              <p className="text-sm text-secondary leading-relaxed mb-2">
                المكونات البارزة
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {product.ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="rounded-badge border border-champagne/40 bg-background px-3 py-1 text-xs font-bold text-cocoa"
                  >
                    {ing}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-muted-brown leading-relaxed">
                عناية تجميلية بالشعر، ليست علاجا طبيا.
              </p>
            </div>
          </div>
        </section>
      </LazySection>

      <LazySection minHeight="280px">
        <ProductReviewsSection
          title="علاش العميلات كيطمّنو قبل ما يخلصو؟"
          subtitle="الدفع عند الاستلام + التأكيد بالهاتف + روتين واضح"
        />
      </LazySection>

      {/* FAQ — same shell as bundle */}
      <section className="px-4 py-12 bg-background">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-cocoa text-center mb-3">
            أسئلة قبل ما تطلبي
          </h2>
          <p className="text-sm text-secondary text-center mb-8 leading-relaxed">
            الدفع، الهاتف، الاستعمال، والتوصيل — باختصار.
          </p>
          <div className="rounded-card border border-champagne/30 bg-ivory divide-y divide-champagne/30">
            {productFaqs.map((faq, i) => (
              <div key={faq.title} className="p-4 sm:p-5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-3 text-right font-bold text-sm sm:text-base text-cocoa min-w-0"
                >
                  <span className="min-w-0 flex-1 break-words leading-snug">
                    {faq.title}
                  </span>
                  <span className="text-gold shrink-0 text-lg">
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                {openFaq === i && (
                  <p className="mt-3 text-sm text-secondary leading-relaxed break-words">
                    {faq.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — same shell as bundle */}
      <section className="px-4 py-12 bg-ivory">
        <div className="container mx-auto max-w-2xl text-center space-y-5 rounded-card border border-gold/40 bg-background p-6 sm:p-8 shadow-card">
          <h2 className="text-2xl sm:text-3xl font-bold text-cocoa">
            ابدئي بهاد الخطوة · أو خذي الروتين كامل
          </h2>
          <p className="text-sm text-muted-brown leading-relaxed">
            {product.nameAr} بـ {formatPrice(product.price)} — ما كتخلصيش دابا.
            كنأكدو بالهاتف، وكتخلصي عند الباب.
          </p>
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAdding}
            className="w-full sm:w-auto bg-cocoa text-ivory px-10 py-4 font-bold rounded-btn hover:bg-espresso transition-colors disabled:opacity-70"
          >
            {isAdding
              ? 'تمت الإضافة ✓'
              : `أضيفي للسلة — ${formatPrice(product.price)}`}
          </button>
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
            className="w-full sm:w-auto border border-cocoa text-cocoa px-8 py-3.5 font-bold rounded-btn hover:bg-cocoa/5 transition-colors"
          >
            أضيفي الروتين الكامل — {formatPrice(bundleProduct.price)}
          </button>
          <WhatsAppAskLink productName={product.nameAr} />
          <p className="text-xs text-muted-brown">
            إلغاء أو تعديل ممكن قبل الإرسال · توصيل داخل المغرب
          </p>
        </div>
      </section>

      <LazySection minHeight="240px">
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
                      quality={65}
                      loading="lazy"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 text-center min-w-0">
                    {item.step && (
                      <p className="text-[11px] font-bold text-gold mb-1">
                        خطوة {item.step}
                      </p>
                    )}
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
          </div>
        </section>
      </LazySection>
    </div>
  );
}
