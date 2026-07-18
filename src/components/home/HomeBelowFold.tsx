'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { LazySection } from '@/components/home/LazySection';
import { StarRating } from '@/components/home/StarRating';
import {
  CodTrustList,
  CompactOrderFlow,
  ProductReviewsSection,
  ResultPromiseSection,
  WhatsAppAskLink,
} from '@/components/product/ProductTrustBits';
import { products, bundleProduct } from '@/lib/products';
import { formatPrice } from '@/lib/utils';

const bundleCartItem = {
  id: bundleProduct.id,
  slug: bundleProduct.slug,
  nameAr: bundleProduct.nameAr,
  price: bundleProduct.price,
  compareAtPrice: bundleProduct.compareAtPrice,
  image: bundleProduct.image,
  isBundle: true as const,
};

const saving =
  (bundleProduct.compareAtPrice ?? bundleProduct.price) - bundleProduct.price;

const productImages: Record<string, string> = {
  'repair-hair-shampoo': '/images/oxiprime-shampoo-realistic.webp',
  'repair-hair-conditioner': '/images/oxiprime-conditioner-realistic.webp',
  'deep-conditioning-repair-mask': '/images/oxiprime-mask-realistic.webp',
  'thermal-keratin-hair-serum': '/images/oxiprime-serum-realistic.webp',
};

const routineSteps = [
  {
    step: '1',
    title: 'تنظيف لطيف',
    desc: 'الشامبو كينقي الشعر بلا إحساس بالجفاف.',
  },
  {
    step: '2',
    title: 'ترطيب ونعومة',
    desc: 'البلسم كيرطب الأطراف وكيسهّل التسريح.',
  },
  {
    step: '3',
    title: 'تغذية مكثفة',
    desc: 'الماسك عناية أسبوعية للشعر الجاف والمتضرر.',
  },
  {
    step: '4',
    title: 'حماية ولمعان',
    desc: 'السيروم كيحمي من الحرارة وكيزيد اللمعان.',
  },
];

export function HomeBelowFold() {
  return (
    <>
      <CompactOrderFlow />

      <LazySection minHeight="560px">
        <section className="py-14 px-4 sm:px-6 bg-ivory">
          <div className="container mx-auto max-w-5xl">
            <div className="overflow-hidden rounded-card border border-gold/40 bg-background shadow-card">
              <div className="bg-cocoa text-ivory text-center py-2.5 text-sm font-bold">
                اختيار تاجكِ — باك OXIPRIME الكامل
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <Link
                  href={`/products/${bundleProduct.slug}`}
                  className="relative block min-h-[280px] lg:min-h-full"
                  aria-label="صفحة الباك الكامل"
                >
                  <Image
                    src="/images/oxiprime-complete-bundle-realistic.webp"
                    alt="باك OXIPRIME الكامل: شامبو، بلسم، ماسك وسيروم"
                    fill
                    sizes="(max-width: 1024px) 100vw, 480px"
                    quality={72}
                    loading="lazy"
                    className="object-cover"
                  />
                </Link>
                <div className="p-6 sm:p-8 space-y-5 text-center lg:text-right">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-cocoa leading-tight">
                      {bundleProduct.nameAr}
                    </h2>
                    <p className="text-sm text-muted-brown mt-2 leading-relaxed">
                      للشعر الجاف، المصبوغ والمنفوش — 4 منتجات بترتيب واضح:
                      تنظفي، ترطبي، تغذي، وتحمي.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                    <span className="text-4xl font-bold text-cocoa">
                      {formatPrice(bundleProduct.price)}
                    </span>
                    <span className="text-lg line-through text-muted-brown">
                      {formatPrice(bundleProduct.compareAtPrice!)}
                    </span>
                    <span className="rounded-badge bg-success/10 px-3 py-1 text-sm font-bold text-success">
                      توفري {saving} درهم
                    </span>
                  </div>

                  <CodTrustList />

                  <div className="flex flex-col sm:flex-row gap-3">
                    <AddToCartButton
                      product={bundleCartItem}
                      className="w-full bg-cocoa text-ivory py-3.5 px-6 font-bold rounded-btn hover:bg-espresso transition-colors"
                    >
                      أضيفي الباك للسلة
                    </AddToCartButton>
                    <Link
                      href={`/products/${bundleProduct.slug}`}
                      className="w-full border border-cocoa text-cocoa py-3.5 px-6 font-bold rounded-btn text-center hover:bg-cocoa/5 transition-colors"
                    >
                      شوفي التفاصيل
                    </Link>
                  </div>
                  <WhatsAppAskLink productName={bundleProduct.nameAr} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </LazySection>

      <section className="py-14 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-4xl font-bold text-cocoa mb-3">
              روتين إصلاح من 4 خطوات
            </h2>
            <p className="text-sm text-secondary leading-relaxed">
              كل خطوة كتكمّل اللي قبلها. النتيجة أوضح ملي كتستعملي الروتين كامل
              — وتقدري حتى تاخذي منتج بوحدو.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {routineSteps.map((item) => (
              <div
                key={item.step}
                className="bg-ivory rounded-card p-4 sm:p-5 border border-champagne/30 text-center"
              >
                <div className="w-9 h-9 rounded-full bg-cocoa text-ivory flex items-center justify-center font-bold text-sm mx-auto mb-3 font-sans">
                  {item.step}
                </div>
                <h3 className="font-bold text-cocoa text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-brown leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LazySection minHeight="420px">
        <ResultPromiseSection />
      </LazySection>

      <LazySection minHeight="280px">
        <ProductReviewsSection
          title="شنو قالت الزبونات"
          subtitle="مدن مغربية · دفع عند الاستلام · تأكيد بالهاتف"
        />
      </LazySection>

      <LazySection minHeight="480px">
        <section className="py-14 px-4 sm:px-6 bg-background">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-8 space-y-2">
              <h2 className="text-2xl font-bold text-cocoa">
                بغيتي منتج بوحدو؟
              </h2>
              <p className="text-sm text-muted-brown max-w-xl mx-auto leading-relaxed">
                كل منتج عندو دور واضح. تقدري تبدئي بواحد — والنتيجة أوضح مع
                الروتين الكامل.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-ivory rounded-card border border-champagne/30 overflow-hidden flex flex-col"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="block aspect-[3/4] relative bg-gradient-to-b from-background to-champagne/20"
                  >
                    <Image
                      src={productImages[product.slug] ?? product.image!}
                      alt={product.nameAr}
                      fill
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 240px"
                      quality={72}
                      loading="lazy"
                      className="object-cover"
                    />
                  </Link>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    {product.step && (
                      <p className="text-[11px] font-bold text-gold">
                        خطوة {product.step} · {product.stepLabel}
                      </p>
                    )}
                    <StarRating rating={product.rating} />
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-bold text-sm text-cocoa leading-snug hover:text-gold transition-colors">
                        {product.nameAr}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-brown leading-relaxed line-clamp-2">
                      {product.shortDescriptionAr}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-1">
                      <span className="font-bold text-sm text-cocoa">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-[10px] text-muted-brown">
                        دفع عند الاستلام
                      </span>
                    </div>
                    <AddToCartButton
                      product={{
                        id: product.id,
                        slug: product.slug,
                        nameAr: product.nameAr,
                        price: product.price,
                        image: productImages[product.slug] ?? product.image,
                        isBundle: false,
                      }}
                      className="w-full bg-cocoa text-ivory py-2 text-xs font-bold rounded-btn"
                    >
                      أضيفي للسلة
                    </AddToCartButton>
                    <Link
                      href={`/products/${product.slug}`}
                      className="block text-center text-[11px] font-bold text-cocoa underline underline-offset-2"
                    >
                      شوفي التفاصيل
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href={`/products/${bundleProduct.slug}`}
                className="inline-block bg-cocoa text-ivory px-6 py-3 font-bold rounded-btn text-sm hover:bg-espresso transition-colors"
              >
                أفضل نتيجة: الروتين الكامل — {formatPrice(bundleProduct.price)}
              </Link>
            </div>
          </div>
        </section>
      </LazySection>

      <section className="py-12 px-4 bg-ivory">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/quiz"
            className="rounded-card border border-champagne/40 bg-background p-6 hover:border-gold/50 transition-colors"
          >
            <p className="text-xs font-bold text-gold mb-2">اختبار سريع</p>
            <h2 className="text-xl font-bold text-cocoa mb-2">
              ماشي عارفة شنو يناسب شعركِ؟
            </h2>
            <p className="text-sm text-secondary">
              4 أسئلة ونقترحو عليكِ الروتين أو المنتج الأنسب.
            </p>
          </Link>
          <Link
            href="/guides"
            className="rounded-card border border-champagne/40 bg-background p-6 hover:border-gold/50 transition-colors"
          >
            <p className="text-xs font-bold text-gold mb-2">دليل العناية</p>
            <h2 className="text-xl font-bold text-cocoa mb-2">
              نصائح للشعر فالمغرب
            </h2>
            <p className="text-sm text-secondary">
              الماء العسر، بعد الصباغة، وكيفاش تستعملي الروتين خطوة بخطوة.
            </p>
          </Link>
        </div>
      </section>

      <LazySection minHeight="200px">
        <section className="py-16 px-4 bg-cocoa text-ivory text-center">
          <div className="container mx-auto max-w-xl space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold">
              ابدئي روتين تاجكِ اليوم
            </h2>
            <p className="text-sm text-champagne/80 leading-relaxed">
              شعركِ تاجكِ — الباك الكامل بـ {formatPrice(bundleProduct.price)}{' '}
              بدل {formatPrice(bundleProduct.compareAtPrice!)}. ما كتخلصيش حتى
              توصلك الطلبية.
            </p>
            <AddToCartButton
              product={bundleCartItem}
              className="bg-gold text-ivory px-8 py-4 font-bold rounded-btn hover:bg-[#8A6D45] transition-colors"
            >
              أضيفي الروتين الكامل — {formatPrice(bundleProduct.price)}
            </AddToCartButton>
            <WhatsAppAskLink productName={bundleProduct.nameAr} />
            <Link
              href="/faq"
              className="block text-xs text-champagne/70 underline underline-offset-2"
            >
              الأسئلة الشائعة
            </Link>
          </div>
        </section>
      </LazySection>
    </>
  );
}
