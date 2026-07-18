'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { products, bundleProduct, getListImage, type Product } from '@/lib/products';
import { StarRating } from '@/components/home/StarRating';
import { LazySection } from '@/components/home/LazySection';

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
    title: 'علاش ما ناخدش غير شامبو بـ 199 درهم؟',
    content:
      'الشامبو بوحدو كينظف، ولكن النتيجة كتبقى ناقصة بلا ترطيب وتغذية وحماية. الباك كيعطيك الروتين كامل بـ 599 درهم بدل 796 درهم إلا خذيتيهم فرادى — وتوفري 197 درهم.',
  },
  {
    title: 'واش مناسب لشعري المصبوغ / المتضرر / المنفوش؟',
    content:
      'نعم. الروتين موجه للشعر الجاف، الباهت، المتقصف، والمنفوش، وخصوصا بعد الصباغة أو الحرارة. النتائج تختلف حسب نوع الشعر وطريقة الاستعمال.',
  },
  {
    title: 'واش شعري الدهني من الجذور يقدر يستعملو؟',
    content:
      'نعم، مع طريقة صحيحة: الشامبو على الفروة، البلسم والماسك والسيروم على الأطراف والطول. تجنبي الجذور فالبلسم والسيروم باش ما يبانش الشعر دهني.',
  },
  {
    title: 'كيفاش نستعملو يوم بيوم؟',
    content:
      'بعد كل غسلة: شامبو ثم بلسم. الماسك مرة أو جوج فالأسبوع. السيروم على الأطراف قبل السشوار أو بعده. الترتيب هو اللي كيعطي فرق.',
  },
  {
    title: 'فحال شحال التوصيل؟ واش لجميع المدن؟',
    content:
      'بعد التأكيد بالهاتف، عادة من 2 إلى 4 أيام عمل حسب المدينة والمخزون. الخدمة موجهة للتوصيل داخل المغرب.',
  },
  {
    title: 'واش المنتجات أصلية؟ علاش نثق؟',
    content:
      'كنعرضو صور ومعلومات واضحة، وكنأكدو الطلب بالهاتف قبل الإرسال. كتخلصي غير عند الاستلام — يعني كتشوفي الطلبية قبل ما تخلصي.',
  },
  {
    title: 'شحال غادي يدوم الباك؟',
    content:
      'حسب طول الشعر وعدد الغسلات. غالبا أسابيع للشعر المتوسط. الماسك أسبوعي لذلك كيطول أكثر.',
  },
  {
    title: 'واش غادي نشوف فرق بسرعة؟',
    content:
      'كثير كيحسو بنعومة وسهولة التسريح من أول غسلات. اللمعان وتقليل النفشة كيبانو أوضح مع أسبوع أو أكثر من الاستعمال المنتظم. عناية تجميلية، ليست علاجا طبيا.',
  },
  {
    title: 'إلا وصلات الطلبية ناقصة أو فيها مشكل؟',
    content:
      'تواصلي معنا مباشرة بعد الاستلام. كنعاونوك حسب حالة الطلب. لهذا كنأكدو التفاصيل بالهاتف قبل الإرسال باش نقلّلو الغلط.',
  },
];

const orderFlow = [
  {
    step: '1',
    title: 'تسجلي الطلب',
    desc: 'أضيفي الباك للسلة وكملّي المعلومات.',
  },
  {
    step: '2',
    title: 'نتصلو بيك',
    desc: 'كنأكدو الاسم، المدينة والعنوان بالهاتف.',
  },
  {
    step: '3',
    title: 'كنرسلو الطلبية',
    desc: 'بعد التأكيد، الطلبية كتمشي للتوصيل.',
  },
  {
    step: '4',
    title: 'كتخلصي عند الباب',
    desc: 'تشوفي الطلبية وتخلصي عند الاستلام.',
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

const trustPoints = [
  {
    title: 'دفع عند الاستلام',
    desc: 'كتخلصي غير ملي توصل الطلبية.',
  },
  {
    title: 'تأكيد بالهاتف',
    desc: 'كنأكدو العنوان قبل ما نرسلو.',
  },
  {
    title: 'توصيل المغرب',
    desc: 'خدمة داخل المدن المغربية.',
  },
  {
    title: 'طلب واضح',
    desc: 'باك واحد، ثمن واضح، بلا تعقيد.',
  },
];


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
                خطوة {product.step} — {product.stepLabel}
              </span>
            )}
            <div className="min-w-0 px-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-cocoa leading-snug break-words">
                {product.nameAr}
              </h1>
              <p
                className="text-sm text-muted-brown mt-1 font-sans break-words"
                dir="ltr"
              >
                {product.nameEn}
              </p>
            </div>
            <StarRating rating={product.rating} />
            <p className="text-3xl font-bold text-cocoa">
              {formatPrice(product.price)}
            </p>
            <p className="text-sm text-secondary leading-relaxed break-words px-1">
              {product.descriptionAr}
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
              <p className="text-xs text-muted-brown break-words">
                دفع عند الاستلام · تأكيد بالهاتف قبل الإرسال
              </p>
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
                <div className="relative aspect-[16/10] overflow-hidden rounded-card border border-champagne/30 shadow-card">
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
                <div className="relative aspect-[16/10] overflow-hidden rounded-card border border-champagne/30 shadow-card">
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
          <div className="rounded-card border border-champagne/30 bg-ivory p-5 sm:p-6 mb-6">
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {[
              ['دفع عند الاستلام', 'كتخلصي غير ملي توصل الطلبية'],
              ['تأكيد بالهاتف', 'كنأكدو العنوان قبل الإرسال'],
              ['توصيل المغرب', 'خدمة داخل المدن المغربية'],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="rounded-card border border-champagne/30 bg-ivory p-4 text-center"
              >
                <p className="font-bold text-sm text-cocoa mb-1">{title}</p>
                <p className="text-xs text-muted-brown">{desc}</p>
              </div>
            ))}
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
        <section className="px-4 py-10 bg-ivory">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-xl sm:text-2xl font-bold text-cocoa text-center mb-6">
              منتجات أخرى من المجموعة
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {otherProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.slug}`}
                  className="group bg-background rounded-card border border-champagne/30 overflow-hidden hover:border-gold/60 transition-colors"
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

