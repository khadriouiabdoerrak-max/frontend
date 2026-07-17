'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import {
  getProductBySlug,
  products,
  bundleProduct,
  getListImage,
  type Product,
} from '@/lib/products';
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
        sizes="(max-width: 1024px) 100vw, 700px"
        className="object-cover"
        priority
      />
    </div>
  );
}

function BundlePage({
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
      {/* Hero */}
      <section className="px-4 py-8 sm:py-12 bg-gradient-to-b from-[#EFE5D6] to-background">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative overflow-hidden rounded-card border border-champagne/40 shadow-card aspect-[4/5] bg-gradient-to-b from-background to-champagne/20">
            <Image
              src="/images/oxiprime-bundle-clear-products.webp"
              alt="باك OXIPRIME الكامل: شامبو، بلسم، ماسك وسيروم"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute right-3 top-3 rounded-full bg-cocoa px-3 py-1.5 text-xs font-bold text-ivory">
              الأكثر طلبا
            </div>
            <div className="absolute left-3 top-3 rounded-full bg-success text-ivory px-3 py-1.5 text-xs font-bold">
              توفري {bundleSaving} درهم
            </div>
          </div>

          <div className="space-y-5 text-center lg:text-right lg:sticky lg:top-24 min-w-0 w-full">
            <span className="inline-block bg-gold/15 text-gold text-xs font-bold px-3 py-1 rounded-badge">
              العرض الأفضل للزبونة اللي باغية نتيجة واضحة
            </span>
            <div className="min-w-0 px-1">
              <h1 className="text-2xl sm:text-4xl font-bold text-cocoa leading-snug break-words">
                روتين OXIPRIME الكامل لإصلاح وترطيب الشعر
              </h1>
              <p className="text-sm text-muted-brown mt-2 break-words">
                شامبو + بلسم + ماسك + سيروم — باك واحد، طلب واحد، نتيجة مرتبة
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <StarRating rating={product.rating} />
              <span className="text-xs text-muted-brown">
                تقييم العميلات · دفع عند الاستلام
              </span>
            </div>
            <p className="text-sm text-secondary leading-relaxed">
              إلا كنتي كتشري شامبو وكتبقي بلا نتيجة، المشكل غالبا ماشي المنتج
              بوحدو — المشكل أن العناية ناقصة. هاد الباك كيجمع الخطوات اللي
              خاصّك: تنظيف، ترطيب، تغذية، وحماية.
            </p>

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
              <ul className="space-y-1.5 text-xs text-muted-brown text-right">
                <li>✓ ما كتخلصيش حتى توصلك الطلبية</li>
                <li>✓ كنأكدو الطلب بالهاتف قبل الإرسال</li>
                <li>✓ تقدري تلغي أو تعدّلي قبل ما نرسلو</li>
              </ul>
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
              <p className="text-xs text-muted-brown">
                بعد الطلب: اتصال للتأكيد ← توصيل ← الدفع عند الباب
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What happens after order - #1 COD trust */}
      <section className="px-4 py-12 bg-cocoa text-ivory">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              شنو كاين من بعد ما تطلبي؟
            </h2>
            <p className="text-sm text-champagne/85 leading-relaxed">
              هادي أهم حاجة عند الزبونة المغربية: تعرف شنو غادي يوقع، ومتى
              غادي تخلص.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {orderFlow.map((item) => (
              <div
                key={item.step}
                className="rounded-card border border-white/10 bg-white/5 p-5 text-center"
              >
                <div className="w-10 h-10 rounded-full bg-gold text-cocoa font-bold flex items-center justify-center mx-auto mb-3 font-sans">
                  {item.step}
                </div>
                <p className="font-bold text-sm mb-1">{item.title}</p>
                <p className="text-xs text-champagne/80 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why complete routine convinces better than price table */}
      <section className="px-4 py-12 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-cocoa mb-3">
              علاش منتج واحد كيبقا ناقص؟
            </h2>
            <p className="text-sm text-secondary leading-relaxed">
              بزاف ديال البنات كيشريو شامبو وكيستناو معجزة. الشعر خاصو سلسلة
              عناية كاملة — كل خطوة كتكمّل اللي قبلها.
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

          <div className="rounded-card border border-champagne/40 bg-ivory p-5 sm:p-6 text-center max-w-2xl mx-auto">
            <p className="text-sm text-secondary leading-relaxed mb-4">
              الباك كامل بـ{' '}
              <span className="font-bold text-cocoa">
                {formatPrice(product.price)}
              </span>{' '}
              مع دفع عند الاستلام وتأكيد بالهاتف. ما تحتاجيش تختاري — الروتين
              جاهز.
            </p>
            <button
              type="button"
              onClick={onAddToCart}
              disabled={isAdding}
              className="w-full sm:w-auto bg-cocoa text-ivory px-8 py-3.5 font-bold rounded-btn hover:bg-espresso transition-colors disabled:opacity-70"
            >
              {isAdding ? 'تمت الإضافة ✓' : 'أضيفي الروتين الكامل للسلة'}
            </button>
          </div>
        </div>
      </section>

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
                'بغيتي توفير 197 درهم على الروتين كامل',
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

      {/* How routine works + visuals */}
      <LazySection minHeight="520px">
        <section className="px-4 py-12 bg-background">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-cocoa mb-3">
                كيفاش يخدم الروتين؟
              </h2>
              <p className="text-sm text-secondary leading-relaxed">
                ماشي 4 منتجات مفرّقين — روتين واحد مرتب. الصور غير للشرح، بلا
                روابط تخرجك من صفحة الباك.
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
                      sizes="(max-width: 1024px) 50vw, 25vw"
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
          </div>
        </section>
      </LazySection>

      {/* Results + ingredients */}
      <section className="px-4 py-12 bg-ivory">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="relative aspect-[16/11] overflow-hidden rounded-card border border-champagne/30 shadow-card">
            <Image
              src="/images/oxiprime-smooth-hair-result.webp"
              alt="نتيجة شعر ناعم ولامع مع روتين OXIPRIME"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              loading="lazy"
              className="object-cover"
            />
          </div>
          <div className="space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold text-cocoa">
              شنو تقدري تحسي بيه؟
            </h2>
            <ul className="space-y-3 text-sm text-secondary">
              {[
                'نعومة وسهولة تسريح من أول غسلات',
                'لمعان أوضح مع الاستمرار أسبوع أو أكثر',
                'نفشة أقل خصوصا مع السيروم',
                'روتين واضح ما كيبقاش غير شامبو بوحدو',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 min-w-0">
                  <span className="text-success font-bold shrink-0">✓</span>
                  <span className="min-w-0 flex-1 break-words">{item}</span>
                </li>
              ))}
            </ul>
            <div>
              <p className="font-bold text-cocoa mb-2 text-sm">المكونات البارزة</p>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="rounded-badge border border-champagne/40 bg-background px-3 py-1 text-xs font-bold text-cocoa"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-muted-brown leading-relaxed">
              عناية تجميلية بالشعر، ليست علاجا طبيا. النتائج تختلف حسب نوع
              الشعر وطريقة الاستعمال.
            </p>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="px-4 py-10 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {trustPoints.map((item) => (
              <div
                key={item.title}
                className="rounded-card border border-champagne/30 bg-ivory p-4 text-center"
              >
                <p className="font-bold text-sm text-cocoa mb-1">{item.title}</p>
                <p className="text-xs text-muted-brown leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <LazySection minHeight="280px">
        <section className="px-4 py-12 bg-ivory">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold text-cocoa text-center mb-2">
              علاش العميلات كيطمّنو قبل ما يخلصو؟
            </h2>
            <p className="text-sm text-secondary text-center mb-8">
              الثقة كتجي من الدفع عند الاستلام + التأكيد بالهاتف + روتين واضح.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  name: 'س.م. · الدار البيضاء',
                  text: 'خلصت غير ملي وصلات الطلبية. الشعر ولى أسهل فالتسريح من أول أسبوع.',
                },
                {
                  name: 'ف.ب. · الرباط',
                  text: 'كنت كنضيّع فلوس فتجارب. الباك وفرّ ليا 197 درهم وخلاه الروتين واضح.',
                },
                {
                  name: 'ن.ح. · مراكش',
                  text: 'تصلو بيا قبل الإرسال وعدّلت العنوان. هاد الشي اللي خلاني نطلب براحة.',
                },
              ].map((review) => (
                <div
                  key={review.name}
                  className="rounded-card border border-champagne/30 bg-background p-5 space-y-3"
                >
                  <StarRating rating={5} />
                  <p className="text-sm text-secondary leading-relaxed italic">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <p className="text-xs text-muted-brown">{review.name}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-[11px] text-muted-brown mt-4">
              شهادات أولية. النتائج قد تختلف حسب نوع الشعر.
            </p>
          </div>
        </section>
      </LazySection>

      {/* FAQ */}
      <section className="px-4 py-12 bg-background">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-cocoa text-center mb-3">
            كلشي اللي كتوقف الزبونة قبل الطلب
          </h2>
          <p className="text-sm text-secondary text-center mb-8 leading-relaxed">
            جاوبنا بصراحة على الأسئلة اللي كتخلي الكليانة تتردّد — خصوصا الدفع،
            الهاتف، والأصالة.
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

      {/* Final CTA */}
      <section className="px-4 py-12 bg-ivory">
        <div className="container mx-auto max-w-2xl text-center space-y-5 rounded-card border border-gold/40 bg-background p-6 sm:p-8 shadow-card">
          <h2 className="text-2xl sm:text-3xl font-bold text-cocoa">
            القرار بسيط: باك واحد، ثقة أكبر
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
          <p className="text-xs text-muted-brown">
            إلغاء أو تعديل ممكن قبل الإرسال · توصيل داخل المغرب
          </p>
        </div>
      </section>

    </div>
  );
}

function SingleProductPage({
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
      <section className="px-3 sm:px-4 py-6 sm:py-10 bg-gradient-to-b from-[#EFE5D6] to-background">
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
                    sizes="(max-width: 1024px) 100vw, 50vw"
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
                    sizes="(max-width: 1024px) 100vw, 50vw"
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
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
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

export function ProductPageClient({ slug }: { slug: string }) {
  const product = getProductBySlug(slug);
  const addItem = useCartStore((state) => state.addItem);
  const [isAdding, setIsAdding] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cocoa font-bold">المنتج غير موجود</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      nameAr: product.nameAr,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      image: product.image ?? getListImage(product),
      isBundle: product.isBundle,
    });
    setIsAdding(true);
    window.setTimeout(() => setIsAdding(false), 1500);
  };

  if (product.isBundle) {
    return (
      <BundlePage
        product={product}
        isAdding={isAdding}
        onAddToCart={handleAddToCart}
      />
    );
  }

  return (
    <SingleProductPage
      product={product}
      isAdding={isAdding}
      onAddToCart={handleAddToCart}
    />
  );
}
