'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import {
  CheckCircle2,
  ChevronDown,
  Package,
  ShieldCheck,
  Phone,
  Star,
  Sparkles,
  Truck,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getProductBySlug, products, bundleProduct, type Product } from '@/lib/products';

const bundleFaqs = [
  {
    title: 'واش الباك مناسب للشعر المصبوغ والمتضرر؟',
    content:
      'نعم، الروتين موجه للشعر الجاف، المتقصف، الباهت، والمتضرر من الصباغة أو الحرارة. النتائج تختلف حسب نوع الشعر وطريقة الاستعمال.',
  },
  {
    title: 'علاش ناخذ الباك كامل بدل منتج واحد؟',
    content:
      'لأن كل خطوة كتكمّل اللي قبلها: الشامبو ينظف، البلسم يرطب، الماسك يغذي بعمق، والسيروم يحمي ويعطي اللمعان. هكذا كتكون العناية متكاملة.',
  },
  {
    title: 'كيفاش غادي نخلص؟',
    content:
      'الدفع عند الاستلام داخل المغرب. بعد ما تسجلي الطلب، كيتواصل معك الفريق عبر الهاتف لتأكيد المدينة والعنوان قبل الإرسال.',
  },
];

function BundleProductPage({
  product,
  isAdding,
  onAddToCart,
}: {
  product: Product;
  isAdding: boolean;
  onAddToCart: () => void;
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const saving =
    product.compareAtPrice !== undefined ? product.compareAtPrice - product.price : 0;

  return (
    <div className="pb-20 min-h-screen bg-background">
      <div className="bg-ivory border-b border-champagne/20 py-3 px-6">
        <div className="container mx-auto max-w-6xl text-xs text-muted-brown flex items-center gap-2">
          <Link href="/" className="hover:text-cocoa transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-cocoa font-medium">{product.nameAr}</span>
        </div>
      </div>

      <section className="px-6 py-10 sm:py-14 bg-gradient-to-b from-[#EFE5D6] to-background">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div
            className="space-y-4"
          >
            <div className="relative overflow-hidden rounded-card border border-champagne/40 bg-ivory shadow-card">
              <img
                src="/images/oxiprime-complete-bundle-realistic.png"
                alt="باك OXIPRIME الكامل لإصلاح وترطيب الشعر"
                className="h-full min-h-[380px] w-full object-cover"
              />
              <div className="absolute right-5 top-5 rounded-full bg-cocoa px-4 py-2 text-xs font-bold text-ivory shadow-card">
                الباك الكامل
              </div>
              <div className="absolute inset-x-5 bottom-5 rounded-card bg-cocoa/85 p-4 text-center text-ivory shadow-card">
                <p className="text-sm font-bold">روتين واحد واضح من أول غسلة حتى اللمعان</p>
                <p className="mt-1 text-xs text-champagne">
                  تنظيف + ترطيب + تغذية + حماية
                </p>
              </div>
            </div>
          </div>

          <div
            className="space-y-6"
          >
            <span className="inline-block bg-gold/15 text-gold text-xs font-bold px-3 py-1 rounded-badge">
              العرض الأفضل والروتين الأكثر توفيرا
            </span>

            <div>
              <h1 className="text-3xl sm:text-5xl font-bold text-cocoa leading-tight">
                روتين OXIPRIME الكامل لإصلاح وترطيب الشعر
              </h1>
              <p className="text-sm text-muted-brown mt-2 font-sans">
                {product.nameEn}
              </p>
            </div>

            <p className="text-secondary leading-relaxed">
              4 منتجات احترافية فباك واحد: شامبو + بلسم + ماسك + سيروم
              كيراتين. روتين مرتب باش يعطي شعرك تنظيف، ترطيب، تغذية، حماية
              ولمعان من أول خطوة حتى اللمسة النهائية.
            </p>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ['4 منتجات', 'روتين كامل'],
                [`${saving} درهم`, 'توفير'],
                ['COD', 'الدفع عند الاستلام'],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="bg-ivory border border-champagne/40 rounded-card p-3"
                >
                  <p className="text-lg font-bold text-cocoa">{value}</p>
                  <p className="text-[11px] text-muted-brown">{label}</p>
                </div>
              ))}
            </div>

            <div className="bg-ivory border border-gold/40 rounded-card p-5 shadow-card">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-brown">ثمن الباك الكامل</p>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold text-cocoa">
                      {formatPrice(product.price)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-lg text-muted-brown line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                </div>
                <span className="bg-success/10 text-success text-xs font-bold px-3 py-2 rounded-badge">
                  توفري {saving} درهم
                </span>
              </div>

              <button
                onClick={onAddToCart}
                disabled={isAdding}
                className="w-full bg-cocoa text-ivory py-4 text-base font-bold rounded-btn hover:bg-espresso transition-colors disabled:opacity-70"
              >
                {isAdding
                  ? 'تمت الإضافة للسلة ✓'
                  : 'اطلبي الباك الكامل بالدفع عند الاستلام'}
              </button>

              <div className="grid grid-cols-3 gap-2 mt-4 text-[11px] text-muted-brown text-center">
                <span>منتجات أصلية</span>
                <span>تأكيد عبر الهاتف</span>
                <span>توصيل داخل المغرب</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-block bg-gold/10 text-gold text-xs font-bold px-3 py-1 rounded-badge mb-3">
              روتين واحد بلا تشتيت
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-cocoa mb-3">
              علاش هاد الباك هو الاختيار الأسهل؟
            </h2>
            <p className="text-sm text-secondary leading-relaxed">
              بدل ما تحتاري شنو تاخذي، هاد الباك جامع الروتين كامل بترتيب واضح:
              تنظفي، ترطبي، تغذي، وتحمي الشعر فالآخر.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              ['روتين كامل', 'كل خطوة كتكمّل اللي قبلها باش النتيجة تبان أوضح.'],
              ['ثمن أفضل', `الباك كامل بـ ${formatPrice(product.price)} بدل ${formatPrice(product.compareAtPrice ?? product.price)}.`],
              ['طلب بسيط', 'زر واحد، دفع عند الاستلام، وتأكيد الطلب عبر الهاتف.'],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="bg-ivory border border-champagne/30 rounded-card p-6 text-center shadow-card"
              >
                <div className="w-11 h-11 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-cocoa mb-2">{title}</h3>
                <p className="text-sm text-muted-brown leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-ivory">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-cocoa mb-3">
              من شعر جاف لروتين واضح ونتيجة أنعم
            </h2>
            <p className="text-sm text-secondary leading-relaxed">
              الزبونة خاصها تفهم بسرعة علاش تحتاج الباك كامل: المشكل، الحل
              المرتب، والنتيجة اللي كتقلب عليها.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: 'المشكل',
                desc: 'جفاف، نفشة، تقصف، وصعوبة فالتسريح بسبب الحرارة أو الصباغة.',
                image: '/images/oxiprime-hair-lifestyle-hero.png',
              },
              {
                title: 'الحل',
                desc: 'باك واحد فيه الخطوات كاملة بترتيب واضح بلا ما تحتاري.',
                image: '/images/oxiprime-complete-bundle-realistic.png',
              },
              {
                title: 'النتيجة',
                desc: 'مظهر أكثر نعومة، لمعان، وسهولة فالتسريح مع الاستعمال المنتظم.',
                image: '/images/oxiprime-smooth-hair-result.png',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="overflow-hidden rounded-card border border-champagne/30 bg-background shadow-card"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-56 w-full object-cover"
                />
                <div className="p-5">
                  <p className="text-xs font-bold text-gold mb-1">{item.title}</p>
                  <p className="text-sm text-muted-brown leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-background">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="overflow-hidden rounded-card border border-champagne/30 shadow-card">
            <img
              src="/images/oxiprime-smooth-hair-result.png"
              alt="نتيجة شعر ناعم ولامع مع روتين OXIPRIME الكامل"
              className="h-full min-h-[360px] w-full object-cover"
            />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-cocoa mb-4">
              كيفاش يخدم الروتين؟
            </h2>
            <p className="text-sm text-secondary leading-relaxed mb-6">
              الصفحة ديال الباك كتشرح لك الروتين كامل فقط. ما كاين حتى رابط
              يخرجك لمنتج آخر، باش يبقى القرار واضح: تاخذي العرض الكامل.
            </p>
            <div className="space-y-4">
              {[
                ['1', 'تنظيف لطيف', 'الشامبو كينقي الشعر بلا إحساس بالقساوة.'],
                ['2', 'ترطيب وسهولة التسريح', 'البلسم كيرطب الأطراف وكيعاون يفك التشابك.'],
                ['3', 'تغذية مكثفة', 'الماسك كيعطي عناية أسبوعية للشعر الجاف والمتضرر.'],
                ['4', 'حماية ولمعان', 'السيروم كيكمل الروتين ويحمي من الحرارة ويقلل النفشة.'],
              ].map(([number, title, desc]) => (
                <div
                  key={number}
                  className="flex gap-4 bg-background rounded-card border border-champagne/30 p-4"
                >
                  <div className="w-10 h-10 bg-cocoa text-ivory rounded-full flex items-center justify-center font-bold shrink-0 font-sans">
                    {number}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-cocoa">{title}</p>
                    <p className="text-xs text-muted-brown leading-relaxed mt-1">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onAddToCart}
              disabled={isAdding}
              className="mt-6 w-full bg-cocoa text-ivory py-4 text-base font-bold rounded-btn hover:bg-espresso transition-colors disabled:opacity-70"
            >
              {isAdding ? 'تمت الإضافة للسلة ✓' : 'أضيفي الباك الكامل للسلة'}
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-ivory">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-cocoa mb-3">
              صور كتشرح طريقة الاستعمال
            </h2>
            <p className="text-sm text-secondary leading-relaxed">
              الصور هنا غير للشرح، ما فيها حتى كليك يخرج الزبونة من صفحة الباك.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              ['1', 'الشامبو', 'نظفي فروة الرأس والشعر بلطف.', '/images/oxiprime-shampoo-use-realistic.png'],
              ['2', 'البلسم', 'رطبي الأطراف وفكي التشابك.', '/images/oxiprime-conditioner-use-realistic.png'],
              ['3', 'الماسك', 'عناية مكثفة مرة أو جوج فالاسبوع.', '/images/oxiprime-mask-use-realistic.png'],
              ['4', 'السيروم', 'حماية ولمعان قبل أو بعد السشوار.', '/images/oxiprime-serum-use-realistic.png'],
            ].map(([step, title, desc, image]) => (
              <div
                key={step}
                className="overflow-hidden rounded-card border border-champagne/30 bg-background shadow-card"
              >
                <div className="relative">
                  <img
                    src={image}
                    alt={`${title} ضمن روتين OXIPRIME الكامل`}
                    className="h-48 w-full object-cover"
                  />
                  <span className="absolute right-3 top-3 w-9 h-9 rounded-full bg-cocoa text-ivory flex items-center justify-center font-bold font-sans text-sm">
                    {step}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-bold text-cocoa text-sm mb-1">{title}</p>
                  <p className="text-xs text-muted-brown leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-ivory border border-gold/30 rounded-card p-6 sm:p-8 shadow-card">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-cocoa mb-4">
                  واش مناسب ليك؟
                </h2>
                <div className="space-y-3">
                  {[
                    'شعرك جاف، باهت أو منفوش',
                    'شعرك متضرر من السشوار، البلاكة أو الصباغة',
                    'كتحتاجي روتين واضح فالدار بلا تعقيد',
                    'بغيتي عرض واحد بثمن أفضل من شراء كل منتج بوحدو',
                  ].map((text) => (
                    <div key={text} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                      <span className="text-sm text-secondary">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-background rounded-card p-5 text-center">
                <Sparkles className="w-8 h-8 text-gold mx-auto mb-3" />
                <p className="text-sm font-bold text-cocoa mb-2">
                  خلاصة الصفحة
                </p>
                <p className="text-sm text-muted-brown leading-relaxed mb-5">
                  هاد الباك معمول باش يعطيك روتين كامل وسهل: ما تحتاجيش تختاري
                  بين المنتجات، خدي المجموعة كاملة واستعمليها بالترتيب.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-bold text-cocoa">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-lg line-through text-muted-brown">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs font-bold text-success">
                  توفري {saving} درهم
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-cocoa text-ivory">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
            ثقة قبل الشراء
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              [Package, 'الدفع عند الاستلام', 'لا حاجة لبطاقة بنكية.'],
              [Phone, 'تأكيد عبر الهاتف', 'نتأكدو من الطلب قبل الإرسال.'],
              [Truck, 'توصيل داخل المغرب', 'حسب المدينة وتوفر المخزون.'],
              [ShieldCheck, 'منتجات أصلية', 'معلومات واضحة وصور حقيقية.'],
            ].map(([Icon, title, desc]) => {
              const TrustIcon = Icon as typeof Package;
              return (
                <div
                  key={title as string}
                  className="bg-white/5 border border-white/10 rounded-card p-5 text-center"
                >
                  <TrustIcon className="w-7 h-7 text-gold mx-auto mb-3" />
                  <p className="font-bold text-sm mb-1">{title as string}</p>
                  <p className="text-xs text-champagne/70">{desc as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-background">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-cocoa text-center mb-8">
            أسئلة شائعة على الباك الكامل
          </h2>
          <div className="bg-ivory border border-champagne/30 rounded-card divide-y divide-champagne/30">
            {bundleFaqs.map((faq, index) => (
              <div key={faq.title} className="p-5">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex items-center justify-between w-full text-right font-bold text-cocoa"
                >
                  {faq.title}
                  <ChevronDown
                    className={`w-5 h-5 text-gold transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <p className="text-sm text-secondary leading-relaxed mt-3">
                    {faq.content}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 bg-gold/10 border border-gold/30 rounded-card p-6 text-center">
            <Sparkles className="w-8 h-8 text-gold mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-cocoa mb-2">
              ابدئي الروتين الكامل اليوم
            </h2>
            <p className="text-sm text-muted-brown mb-5">
              4 منتجات بثمن خاص: {formatPrice(product.price)} بدل{' '}
              {formatPrice(product.compareAtPrice ?? product.price)}.
            </p>
            <button
              onClick={onAddToCart}
              disabled={isAdding}
              className="w-full sm:w-auto bg-cocoa text-ivory px-10 py-4 font-bold rounded-btn hover:bg-espresso transition-colors disabled:opacity-70"
            >
              {isAdding ? 'تمت الإضافة ✓' : 'أضيفي الباك للسلة'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export function ProductPageClient({ slug }: { slug: string }) {
  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  const product = getProductBySlug(slug) ?? products[0];

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      id: product.id,
      slug: product.slug,
      nameAr: product.nameAr,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      isBundle: product.isBundle,
    });
    setTimeout(() => setIsAdding(false), 600);
  };

  const accordions = [
    {
      title: 'طريقة الاستعمال',
      content: product.howToUse,
    },
    {
      title: 'المكونات البارزة',
      content: product.ingredients.join('، ') + '.',
    },
    {
      title: 'الأسئلة الشائعة',
      content:
        'الدفع عند الاستلام متوفر داخل المغرب. بعد الطلب، نتصل بكِ لتأكيد العنوان والمنتجات قبل إرسال الشحنة. التوصيل يستغرق من 2 إلى 4 أيام عمل.',
    },
  ];

  const relatedProducts = products
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  if (product.isBundle) {
    return (
      <BundleProductPage
        product={product}
        isAdding={isAdding}
        onAddToCart={handleAddToCart}
      />
    );
  }

  return (
    <div className="pb-20 min-h-screen bg-background">

      {/* Breadcrumb */}
      <div className="bg-ivory border-b border-champagne/20 py-3 px-6">
        <div className="container mx-auto max-w-5xl text-xs text-muted-brown flex items-center gap-2">
          <Link href="/" className="hover:text-cocoa transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/collection" className="hover:text-cocoa transition-colors">
            المجموعة
          </Link>
          <span>/</span>
          <span className="text-cocoa font-medium line-clamp-1">
            {product.nameAr}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-5xl pt-8">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

          {/* Product Image */}
          <div className="w-full lg:w-5/12">
            <div
              className="aspect-[4/5] bg-ivory rounded-card border border-champagne/30 overflow-hidden sticky top-24 shadow-card"
            >
              <img
                src={product.image}
                alt={product.nameAr}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[product.usageImage, product.resultImage]
                .filter(Boolean)
                .map((image, index) => (
                  <div
                    key={image}
                    className="aspect-square overflow-hidden rounded-card border border-champagne/30 bg-ivory shadow-card"
                  >
                    <img
                      src={image}
                      alt={
                        index === 0
                          ? `صورة استعمال ${product.nameAr}`
                          : 'نتيجة شعر ناعم ولامع'
                      }
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-7/12">
            <div
              className="space-y-6"
            >
              {/* Step badge */}
              {product.step && (
                <span className="inline-block bg-gold/10 text-gold text-xs font-bold px-3 py-1 rounded-badge font-sans">
                  خطوة {product.step} — {product.stepLabel}
                </span>
              )}

              {/* Name */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-cocoa leading-snug">
                  {product.nameAr}
                </h1>
                <p className="text-sm text-muted-brown mt-1 font-sans">
                  {product.nameEn}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className={`w-4 h-4 ${j < Math.floor(product.rating) ? 'text-gold fill-gold' : 'text-champagne'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-brown">{product.rating} / 5</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-cocoa">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <div>
                    <span className="block text-lg text-muted-brown line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                    <span className="block text-xs text-success font-bold">
                      توفيري 197 درهم
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-secondary text-sm leading-relaxed">
                {product.descriptionAr}
              </p>

              {/* Benefits */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-cocoa">لماذا ستحبينه؟</h3>
                {product.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                    <span className="text-sm text-secondary">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="w-full bg-cocoa text-ivory py-4 text-base font-bold rounded-btn hover:bg-espresso transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isAdding ? 'تمت الإضافة ✓' : 'أضيفي للسلة'}
                </button>

                {!product.isBundle && (
                  <div className="bg-gold/10 border border-gold/30 rounded-card p-4 text-center">
                    <p className="text-xs text-cocoa font-bold mb-1">
                      الأفضل ضمن الروتين الكامل
                    </p>
                    <p className="text-xs text-muted-brown mb-3">
                      أضيفي الروتين الكامل ووفرّي 197 درهم
                    </p>
                    <button
                      onClick={() =>
                        addItem({
                          id: bundleProduct.id,
                          slug: bundleProduct.slug,
                          nameAr: bundleProduct.nameAr,
                          price: bundleProduct.price,
                          compareAtPrice: bundleProduct.compareAtPrice,
                          isBundle: true,
                        })
                      }
                      className="w-full bg-cocoa text-ivory py-2.5 text-sm font-bold rounded-btn hover:bg-espresso transition-colors"
                    >
                      أضيفي الروتين الكامل — {formatPrice(bundleProduct.price)}
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-center gap-4 text-xs text-muted-brown pt-1">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-success" />
                    <span>منتجات أصلية</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4 text-gold" />
                    <span>تأكيد عبر الهاتف</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4 text-cocoa" />
                    <span>دفع عند الاستلام</span>
                  </div>
                </div>
              </div>

              {/* Accordion */}
              <div className="border-t border-champagne/30 divide-y divide-champagne/30 mt-4">
                {accordions.map((item, i) => (
                  <div key={i} className="py-4">
                    <button
                      onClick={() =>
                        setOpenAccordion(openAccordion === i ? null : i)
                      }
                      className="flex items-center justify-between w-full text-right font-bold text-sm text-cocoa focus:outline-none"
                    >
                      {item.title}
                      <ChevronDown
                        className={`w-4 h-4 text-gold transition-transform duration-300 ${openAccordion === i ? 'rotate-180' : ''}`}
                      />
                    </button>
                                          {openAccordion === i && (
                        <div
                          className="overflow-hidden"
                        >
                          <p className="pt-3 text-sm text-secondary leading-relaxed">
                            {item.content}
                          </p>
                        </div>
                      )}
                                      </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-ivory border border-champagne/30 rounded-card p-6 sm:p-8 shadow-card">
            <span className="inline-block bg-gold/10 text-gold text-xs font-bold px-3 py-1 rounded-badge mb-4">
              شرح المنتج
            </span>
            <h2 className="text-2xl font-bold text-cocoa mb-3">
              شنو كيدير {product.nameAr}؟
            </h2>
            <p className="text-sm text-secondary leading-relaxed mb-6">
              {product.descriptionAr}
            </p>
            {product.routineNote && (
              <div className="bg-background border border-gold/25 rounded-card p-4">
                <p className="text-sm font-bold text-cocoa mb-1">
                  الدور ديالو فالروتين
                </p>
                <p className="text-sm text-muted-brown leading-relaxed">
                  {product.routineNote}
                </p>
              </div>
            )}
          </div>

          <div className="bg-cocoa text-ivory rounded-card p-6 sm:p-8 shadow-card">
            <Sparkles className="w-8 h-8 text-gold mb-4" />
            <h2 className="text-xl font-bold mb-4">مناسب لمن؟</h2>
            <div className="space-y-3">
              {(product.suitableFor ?? []).map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                  <span className="text-sm text-champagne/90 leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-background border border-champagne/30 rounded-card p-6 sm:p-8">
            {product.usageImage && (
              <div className="mb-6 overflow-hidden rounded-card border border-champagne/30 shadow-card">
                <img
                  src={product.usageImage}
                  alt={`طريقة استعمال ${product.nameAr}`}
                  className="h-64 w-full object-cover"
                />
              </div>
            )}
            <h2 className="text-2xl font-bold text-cocoa mb-5">
              طريقة الاستعمال خطوة بخطوة
            </h2>
            <div className="space-y-4">
              {(product.usageSteps ?? [product.howToUse]).map((step, index) => (
                <div key={step} className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-gold/15 text-gold flex items-center justify-center font-bold shrink-0 font-sans">
                    {index + 1}
                  </div>
                  <p className="text-sm text-secondary leading-relaxed pt-1">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-ivory border border-champagne/30 rounded-card p-6 sm:p-8 shadow-card">
            {product.resultImage && (
              <div className="mb-6 overflow-hidden rounded-card border border-champagne/30">
                <img
                  src={product.resultImage}
                  alt="نتيجة شعر ناعم ولامع مع روتين OXIPRIME"
                  className="h-64 w-full object-cover"
                />
              </div>
            )}
            <h2 className="text-2xl font-bold text-cocoa mb-5">
              نصائح باش يعطي نتيجة أحسن
            </h2>
            <div className="space-y-3 mb-6">
              {(product.proTips ?? []).map((tip) => (
                <div key={tip} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <span className="text-sm text-secondary leading-relaxed">
                    {tip}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-champagne/30 pt-5">
              <p className="font-bold text-cocoa mb-3">النتيجة اللي تقدري تحسي بها</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(product.expectedResults ?? product.benefits).map((result) => (
                  <div key={result} className="bg-background rounded-card p-3">
                    <p className="text-xs text-muted-brown leading-relaxed">
                      {result}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 bg-ivory border border-champagne/30 rounded-card p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-cocoa mb-2">
                المكونات البارزة
              </h2>
              <p className="text-sm text-muted-brown leading-relaxed">
                ركزنا على مكونات معروفة فالعناية بالشعر باش تعطي مظهر أكثر
                نعومة، ترطيب ولمعان.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:min-w-[420px]">
              {product.ingredients.map((ingredient) => (
                <div
                  key={ingredient}
                  className="rounded-card border border-champagne/30 bg-background p-3 text-center"
                >
                  <p className="text-sm font-bold text-cocoa">{ingredient}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 bg-gold/10 border border-gold/30 rounded-card p-6 sm:p-8 text-center">
          <h2 className="text-2xl font-bold text-cocoa mb-2">
            بغيتي نتيجة أوضح؟
          </h2>
          <p className="text-sm text-muted-brown leading-relaxed mb-5">
            أفضل استعمال هو مع الروتين الكامل: الشامبو للتنظيف، البلسم للنعومة،
            الماسك للتغذية، والسيروم للحماية واللمعان.
          </p>
          <button
            onClick={() =>
              addItem({
                id: bundleProduct.id,
                slug: bundleProduct.slug,
                nameAr: bundleProduct.nameAr,
                price: bundleProduct.price,
                compareAtPrice: bundleProduct.compareAtPrice,
                isBundle: true,
              })
            }
            className="w-full sm:w-auto bg-cocoa text-ivory px-8 py-4 font-bold rounded-btn hover:bg-espresso transition-colors"
          >
            أضيفي الروتين الكامل — {formatPrice(bundleProduct.price)}
          </button>
        </section>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-xl font-bold text-cocoa mb-6">
              الأفضل مع هذا المنتج
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedProducts.map((related) => (
                <Link
                  key={related.id}
                  href={`/products/${related.slug}`}
                  className="bg-ivory rounded-card border border-champagne/30 p-4 flex gap-4 hover:border-gold/50 transition-colors"
                >
                  <div className="w-16 h-16 bg-background rounded-card overflow-hidden shrink-0">
                    <img
                      src={related.image}
                      alt={related.nameAr}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-cocoa leading-snug line-clamp-2">
                      {related.nameAr}
                    </p>
                    <p className="text-xs text-muted-brown mt-1">
                      {formatPrice(related.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
