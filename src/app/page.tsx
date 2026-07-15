import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { LazySection } from '@/components/home/LazySection';
import { StarRating } from '@/components/home/StarRating';
import { products, bundleProduct, getListImage } from '@/lib/products';
import { formatPrice } from '@/lib/utils';

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
  isBundle: true as const,
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative bg-gradient-to-b from-[#EFE5D6] to-background pt-12 pb-14 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-5 text-center lg:text-right">
            <h1 className="text-3xl sm:text-5xl font-bold text-cocoa leading-tight">
              تاجكِ... روتين احترافي لشعر أكثر نعومة ولمعانا.
            </h1>
            <p className="text-sm sm:text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
              مجموعة OXIPRIME للشعر الجاف والمتضرر: شامبو، بلسم، ماسك وسيروم
              كيراتين — روتين صالون داخل بيتكِ.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <AddToCartButton
                product={bundleCartItem}
                className="w-full sm:w-auto bg-cocoa text-ivory px-8 py-3.5 font-bold rounded-btn text-base"
              >
                اطلبي الروتين الكامل
              </AddToCartButton>
              <Link
                href="/collection"
                className="w-full sm:w-auto bg-transparent text-cocoa border border-cocoa px-8 py-3.5 font-bold rounded-btn text-base text-center"
              >
                تصفحي المنتجات
              </Link>
            </div>
            <p className="text-xs text-muted-brown">
              دفع عند الاستلام | توصيل داخل المغرب
            </p>
          </div>

          <Link
            href={`/products/${bundleProduct.slug}`}
            className="relative block overflow-hidden rounded-card border border-champagne/40 bg-ivory shadow-card"
            aria-label="شوفي روتين OXIPRIME الكامل"
          >
            <div className="relative min-h-[220px] sm:min-h-[280px] w-full bg-gradient-to-b from-champagne/30 to-ivory flex items-center justify-center gap-3 p-6">
              {products.map((product) => (
                <Image
                  key={product.id}
                  src={getListImage(product)}
                  alt=""
                  width={56}
                  height={80}
                  className="h-14 sm:h-16 w-auto object-contain"
                />
              ))}
            </div>
            <div className="absolute inset-x-4 bottom-4 rounded-card bg-cocoa/90 p-3 text-center text-ivory">
              <p className="text-sm font-bold">شوفي الباك الكامل</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="bg-cocoa text-ivory py-3 px-4">
        <div className="container mx-auto grid grid-cols-2 gap-3 text-center text-[11px] sm:text-sm font-medium">
          <span>✓ منتجات أصلية</span>
          <span>📞 تأكيد هاتفي</span>
          <span>🚚 توصيل المغرب</span>
          <span>💵 دفع عند الاستلام</span>
        </div>
      </section>

      <section className="py-14 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-3xl text-center space-y-4">
          <h2 className="text-2xl sm:text-4xl font-bold text-cocoa">
            هل فقد شعركِ نعومته ولمعانه؟
          </h2>
          <p className="text-secondary text-sm sm:text-base leading-relaxed">
            الصباغة، السشوار والماء القاسي يخلو الشعر جافا وباهتا. تحتاجين
            روتينا يغذي، يرطب، ويحمي — ماشي غير شامبو عادي.
          </p>
        </div>
      </section>

      <section className="py-14 px-4 sm:px-6 bg-ivory">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl sm:text-4xl font-bold text-cocoa text-center mb-10">
            روتين من 4 خطوات
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-background rounded-card p-4 border border-champagne/30 text-center"
              >
                <div className="w-8 h-8 rounded-full bg-cocoa text-ivory flex items-center justify-center font-bold text-xs mx-auto mb-2">
                  {product.step}
                </div>
                <h3 className="font-bold text-cocoa text-xs leading-snug">
                  {product.nameAr}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LazySection minHeight="420px">
        <section className="py-14 px-4 sm:px-6 bg-background">
          <div className="container mx-auto max-w-5xl bg-ivory rounded-card border border-gold/40 overflow-hidden">
            <div className="bg-cocoa text-ivory text-center py-2.5 text-sm font-bold">
              الأكثر توفيرا — باك OXIPRIME الكامل
            </div>
            <div className="p-6 sm:p-8 space-y-5 text-center lg:text-right">
              <h2 className="text-2xl sm:text-3xl font-bold text-cocoa">
                {bundleProduct.nameAr}
              </h2>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <span className="text-3xl font-bold text-cocoa">
                  {formatPrice(bundleProduct.price)}
                </span>
                <span className="text-lg line-through text-muted-brown">
                  {formatPrice(bundleProduct.compareAtPrice!)}
                </span>
                <span className="text-sm text-success font-bold">
                  توفير 197 درهم
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href={`/products/${bundleProduct.slug}`}
                  className="bg-cocoa text-ivory py-3.5 px-6 font-bold rounded-btn text-center"
                >
                  شوفي التفاصيل
                </Link>
                <AddToCartButton
                  product={bundleCartItem}
                  className="border border-cocoa text-cocoa py-3.5 px-6 font-bold rounded-btn"
                >
                  أضيفي للسلة
                </AddToCartButton>
              </div>
            </div>
          </div>
        </section>
      </LazySection>

      <LazySection minHeight="480px">
        <section className="py-14 px-4 sm:px-6 bg-ivory">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold text-cocoa text-center mb-8">
              تسوقي المنتجات بشكل فردي
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-background rounded-card border border-champagne/30 overflow-hidden flex flex-col"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="block aspect-[4/5] relative bg-gradient-to-b from-ivory to-champagne/20 p-4"
                  >
                    <Image
                      src={getListImage(product)}
                      alt={product.nameAr}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      loading="lazy"
                      className="object-contain p-2"
                    />
                  </Link>
                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <StarRating rating={product.rating} />
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-bold text-xs text-cocoa leading-snug">
                        {product.nameAr}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-bold text-sm text-cocoa">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <AddToCartButton
                      product={{
                        id: product.id,
                        slug: product.slug,
                        nameAr: product.nameAr,
                        price: product.price,
                        isBundle: false,
                      }}
                      className="w-full bg-cocoa text-ivory py-2 text-xs font-bold rounded-btn"
                    >
                      أضيفي للسلة
                    </AddToCartButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </LazySection>

      <LazySection minHeight="200px">
        <section className="py-14 px-4 bg-background text-center">
          <div className="container mx-auto max-w-xl space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-cocoa">
              ابدئي روتين تاجكِ اليوم
            </h2>
            <AddToCartButton
              product={bundleCartItem}
              className="bg-cocoa text-ivory px-8 py-3.5 font-bold rounded-btn"
            >
              أضيفي الروتين الكامل — 599 درهم
            </AddToCartButton>
          </div>
        </section>
      </LazySection>

      <HomeFAQ />
    </div>
  );
}
