'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { bundleProduct, type Product } from '@/lib/products';
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

const bundleFaqs = [
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
    title: 'علاش الباك أحسن من منتج واحد؟',
    content:
      'الشامبو بوحدو كينظف، ولكن النتيجة كتبقى ناقصة بلا ترطيب وتغذية وحماية. الباك كيعطيك الروتين كامل بـ 599 درهم بدل 796 درهم إلا خذيتيهم فرادى — وتوفري 197 درهم.',
  },
  {
    title: 'واش مناسب لشعري المصبوغ / المتضرر / المنفوش؟',
    content:
      'نعم. الروتين موجه للشعر الجاف، الباهت، المتقصف، والمنفوش، وخصوصا بعد الصباغة أو الحرارة. النتائج تختلف حسب نوع الشعر وطريقة الاستعمال.',
  },
  {
    title: 'كيفاش نستعملو يوم بيوم؟',
    content:
      'بعد كل غسلة: شامبو ثم بلسم. الماسك مرة أو جوج فالأسبوع. السيروم على الأطراف قبل السشوار أو بعده. الترتيب هو اللي كيعطي فرق.',
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

const usageVisuals = [
  {
    src: '/images/oxiprime-shampoo-use-realistic.webp',
    label: '1 · تنظيف',
  },
  {
    src: '/images/oxiprime-conditioner-use-realistic.webp',
    label: '2 · ترطيب',
  },
  {
    src: '/images/oxiprime-mask-use-realistic.webp',
    label: '3 · تغذية',
  },
  {
    src: '/images/oxiprime-serum-use-realistic.webp',
    label: '4 · حماية',
  },
];

const bundleSteps = [
  {
    step: '1',
    title: 'تنظيف لطيف',
    desc: 'الشامبو كينقي الشعر والفروة بلا إحساس بالقساوة.',
  },
  {
    step: '2',
    title: 'ترطيب وتسريح',
    desc: 'البلسم كيرطب الأطراف وكيعاون يفك التشابك.',
  },
  {
    step: '3',
    title: 'تغذية أسبوعية',
    desc: 'الماسك كيعطي عناية مركزة للشعر الجاف والمتضرر.',
  },
  {
    step: '4',
    title: 'حماية ولمعان',
    desc: 'السيروم كيحمي من الحرارة وكيزيد اللمعان بلا مظهر دهني.',
  },
];

export function BundleProductPage({
  product,
  isAdding,
  onAddToCart,
}: {
  product: Product;
  isAdding: boolean;
  onAddToCart: () => void;
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background">
      <section className="px-4 py-8 sm:py-12 bg-gradient-to-b from-[#EFE6D6] to-background">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative overflow-hidden rounded-card border border-champagne/40 shadow-card aspect-[4/5] bg-gradient-to-b from-background to-champagne/20">
            <Image
              src="/images/oxiprime-bundle-clear-products.webp"
              alt="باك OXIPRIME الكامل: شامبو، بلسم، ماسك وسيروم"
              fill
              priority
              quality={75}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 520px"
              className="object-cover"
            />
          </div>

          <div className="space-y-5 text-center lg:text-right lg:sticky lg:top-24 min-w-0 w-full">
            <p className="text-xs font-bold tracking-wide text-gold">
              تاجكِ · روتين إصلاح كامل
            </p>
            <div className="min-w-0 px-1 space-y-2">
              <h1 className="text-2xl sm:text-4xl font-bold text-cocoa leading-snug break-words">
                روتين OXIPRIME الكامل
              </h1>
              <p className="text-sm sm:text-base text-cocoa/90 font-medium leading-relaxed">
                للشعر الجاف، المصبوغ والمنفوش — نعومة وتسريح أسهل مع الاستمرار.
              </p>
              <p className="text-sm text-muted-brown break-words">
                شامبو + بلسم + ماسك + سيروم · باك واحد · خلّصي عند الباب
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
                ['4 منتجات', 'روتين كامل'],
                [`${bundleSaving} د.م.`, 'توفير فوري'],
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
                <span className="text-lg line-through text-muted-brown">
                  {formatPrice(product.compareAtPrice!)}
                </span>
                <span className="rounded-badge bg-success/10 px-3 py-1 text-sm font-bold text-success">
                  توفري {bundleSaving} درهم
                </span>
              </div>
              <CodTrustList />
              <button
                type="button"
                onClick={onAddToCart}
                disabled={isAdding}
                className="w-full bg-cocoa text-ivory py-4 text-base font-bold rounded-btn hover:bg-espresso transition-colors disabled:opacity-70"
              >
                {isAdding
                  ? 'تمت الإضافة للسلة ✓'
                  : 'اطلبي الباك دابا — خلّصي عند الاستلام'}
              </button>
              <WhatsAppAskLink productName={product.nameAr} />
              <p className="text-xs text-muted-brown">
                بعد الطلب: اتصال للتأكيد ← توصيل ← الدفع عند الباب
              </p>
            </div>
          </div>
        </div>
      </section>

      <CompactOrderFlow />

      <section className="px-4 py-12 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-cocoa mb-3">
              علاش منتج واحد كيبقا ناقص؟
            </h2>
            <p className="text-sm text-secondary leading-relaxed">
              الشعر خاصو سلسلة عناية كاملة — كل خطوة كتكمّل اللي قبلها.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            <div className="rounded-card border border-champagne/40 bg-ivory p-5 sm:p-6">
              <p className="text-xs font-bold text-muted-brown mb-3">
                إلا خذيتي غير حاجة وحدة
              </p>
              <ul className="space-y-3 text-sm text-secondary">
                {[
                  'الشامبو بوحدو: كينظف… ولكن الترطيب كيبقا ضعيف',
                  'البلسم بوحدو: كيرطب… ولكن التغذية العميقة ناقصة',
                  'الماسك بوحدو: كيغذي… ولكن الحماية من الحرارة ما كايناش',
                  'السيروم بوحدو: كيلمّع… ولكن الأساس ما تبنىش مزيان',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 min-w-0">
                    <span className="text-muted-brown shrink-0">–</span>
                    <span className="min-w-0 flex-1 break-words">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-card border border-gold/50 bg-gold/10 p-5 sm:p-6 shadow-card">
              <p className="text-xs font-bold text-gold mb-3">
                ملي كتخذي الباك الكامل
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
                النتيجة: روتين صالون مرتب فالدار — مشي تجارب متفرقة كل شهر.
              </p>
            </div>
          </div>
        </div>
      </section>

      <LazySection minHeight="420px">
        <ResultPromiseSection />
      </LazySection>

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
                'كنشتري شامبو وكنبدل بلا ما نشوف فرق',
                'ما عنديش روتين واضح فالدار',
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
              هاد الباك معمول ليك إلا…
            </h2>
            <ul className="space-y-3 text-sm text-secondary">
              {[
                'بغيتي نتيجة أوضح من منتج واحد',
                'بغيتي توفير واضح على الروتين كامل',
                'بغيتي تخلصي غير ملي توصل الطلبية',
                'بغيتي واحد يتصل بيك قبل الإرسال',
                'بغيتي خطوات بسيطة: 1 ثم 2 ثم 3 ثم 4',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 min-w-0">
                  <span className="text-success font-bold shrink-0">✓</span>
                  <span className="min-w-0 flex-1 break-words">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <LazySection minHeight="520px">
        <section className="px-4 py-12 bg-background">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-cocoa mb-3">
                كيفاش يخدم الروتين؟
              </h2>
              <p className="text-sm text-secondary leading-relaxed">
                4 خطوات مرتبة — كل صورة كتوضح مرحلة الاستعمال.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {usageVisuals.map((visual) => (
                <div
                  key={visual.label}
                  className="overflow-hidden rounded-card border border-champagne/30 bg-ivory shadow-card"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={visual.src}
                      alt={visual.label}
                      fill
                      sizes="(max-width: 640px) 45vw, 220px"
                      quality={60}
                      loading="lazy"
                      className="object-cover"
                    />
                  </div>
                  <p className="p-2 text-center text-xs font-bold text-cocoa">
                    {visual.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bundleSteps.map((item) => (
                <div
                  key={item.step}
                  className="flex gap-3 rounded-card border border-champagne/30 bg-ivory p-4"
                >
                  <div className="w-9 h-9 rounded-full bg-cocoa text-ivory flex items-center justify-center font-bold shrink-0 font-sans text-sm">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-cocoa">{item.title}</p>
                    <p className="text-xs text-muted-brown leading-relaxed mt-1">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-card border border-champagne/40 bg-ivory p-5 text-center max-w-2xl mx-auto">
              <p className="text-sm text-secondary leading-relaxed mb-2">
                المكونات البارزة فالمجموعة
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

      <section className="px-4 py-12 bg-background">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-cocoa text-center mb-3">
            أسئلة قبل ما تطلبي
          </h2>
          <p className="text-sm text-secondary text-center mb-8 leading-relaxed">
            الدفع، الهاتف، الاستعمال، والتوصيل — باختصار.
          </p>
          <div className="rounded-card border border-champagne/30 bg-ivory divide-y divide-champagne/30">
            {bundleFaqs.map((faq, i) => (
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

      <section className="px-4 py-12 bg-ivory">
        <div className="container mx-auto max-w-2xl text-center space-y-5 rounded-card border border-gold/40 bg-background p-6 sm:p-8 shadow-card">
          <h2 className="text-2xl sm:text-3xl font-bold text-cocoa">
            باك واحد · ثقة أوضح
          </h2>
          <p className="text-sm text-muted-brown leading-relaxed">
            {formatPrice(product.price)} بدل {formatPrice(product.compareAtPrice!)}{' '}
            — توفري {bundleSaving} درهم. ما كتخلصيش دابا. كنأكدو بالهاتف، وكتخلصي
            عند الباب.
          </p>
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAdding}
            className="w-full sm:w-auto bg-cocoa text-ivory px-10 py-4 font-bold rounded-btn hover:bg-espresso transition-colors disabled:opacity-70"
          >
            {isAdding ? 'تمت الإضافة ✓' : 'أضيفي الباك الكامل للسلة'}
          </button>
          <WhatsAppAskLink productName={product.nameAr} />
          <p className="text-xs text-muted-brown">
            إلغاء أو تعديل ممكن قبل الإرسال · توصيل داخل المغرب
          </p>
        </div>
      </section>
    </div>
  );
}
