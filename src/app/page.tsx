import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { brand } from '@/lib/brand';
import { bundleProduct } from '@/lib/products';
import { formatPrice } from '@/lib/utils';

const HomeBelowFold = dynamic(
  () =>
    import('@/components/home/HomeBelowFold').then((mod) => mod.HomeBelowFold),
  {
    loading: () => <div className="min-h-[1200px] bg-background" aria-hidden />,
  },
);

const HomeFAQ = dynamic(
  () => import('@/components/home/HomeFAQ').then((mod) => mod.HomeFAQ),
  { loading: () => null },
);

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

const trustChips = [
  'دفع عند الاستلام',
  'تأكيد بالهاتف / واتساب',
  'توصيل لجميع المدن',
  'توصيل مجاني فوق 500 درهم',
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-b from-[#E4EDE8] via-[#EEF2EF] to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(26,107,88,0.12),_transparent_55%)]" />
        <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 pt-10 pb-12 sm:pt-14 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-5 text-center lg:text-right order-2 lg:order-1">
              <p className="text-xs font-bold tracking-wide text-gold">
                {brand.name} · {brand.tagline}
              </p>
              <h1 className="text-3xl sm:text-5xl font-bold text-cocoa leading-tight animate-fade-up">
                شعركِ تاجكِ — يستاهل روتين إصلاح كامل.
              </h1>
              <p className="text-sm sm:text-lg text-secondary max-w-xl mx-auto lg:mx-0 leading-relaxed">
                باك {brand.productLine} الواحد: شامبو + بلسم + ماسك + سيروم.
                تنظيف، ترطيب، تغذية وحماية — بثمن أوضح ودفع عند الاستلام.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <AddToCartButton
                  product={bundleCartItem}
                  className="w-full sm:w-auto bg-cocoa text-ivory px-8 py-4 font-bold rounded-btn text-base hover:bg-espresso transition-colors"
                >
                  اطلبي الروتين الكامل — {formatPrice(bundleProduct.price)}
                </AddToCartButton>
                <Link
                  href={`/products/${bundleProduct.slug}`}
                  className="w-full sm:w-auto bg-transparent text-cocoa border border-cocoa px-8 py-4 font-bold rounded-btn text-base text-center hover:bg-cocoa/5 transition-colors"
                >
                  شوفي تفاصيل الباك
                </Link>
              </div>
              <p className="text-xs text-muted-brown">
                دفع عند الاستلام | تأكيد هاتفي | توصيل داخل المغرب
              </p>
            </div>

            <Link
              href={`/products/${bundleProduct.slug}`}
              className="group relative block overflow-hidden rounded-card border border-champagne/40 bg-ivory shadow-card order-1 lg:order-2 animate-fade-in"
              aria-label={`شوفي روتين ${brand.productLine} الكامل`}
            >
              <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] w-full">
                <Image
                  src="/images/oxiprime-hair-lifestyle-hero.webp"
                  alt={`شعر ناعم ولامع مع روتين ${brand.productLine}`}
                  fill
                  priority
                  quality={60}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 520px"
                  className="object-cover md:transition-transform md:duration-700 md:group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cocoa/85 via-cocoa/40 to-transparent p-5 sm:p-6">
                  <p className="text-ivory text-sm sm:text-base font-bold">
                    اضغطي وشوفي الباك الكامل
                  </p>
                  <p className="text-champagne text-xs mt-1">
                    توفري {saving} درهم مقارنة بالشراء الفردي
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-cocoa text-ivory py-3.5 px-4">
        <div className="container mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-[11px] sm:text-sm font-medium">
          {trustChips.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </div>
      </section>

      <section className="py-14 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-bold text-cocoa">
            هل فقد شعركِ نعومته ولمعانه؟
          </h2>
          <p className="text-secondary text-sm sm:text-base leading-relaxed">
            الصباغة، السشوار والماء العسر كيخليو الشعر جاف وباهت. الحل ماشي
            منتج واحد — خاصك روتين إصلاح كامل من {brand.name}.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {['جفاف وتقصف', 'نفشة وصعوبة التسريح', 'لمعان ضعيف'].map((item) => (
              <div
                key={item}
                className="rounded-card border border-champagne/30 bg-ivory px-4 py-3 text-sm font-bold text-cocoa"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeBelowFold />
      <HomeFAQ />
    </div>
  );
}
