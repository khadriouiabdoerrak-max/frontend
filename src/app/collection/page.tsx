import Link from 'next/link';
import Image from 'next/image';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { StarRating } from '@/components/home/StarRating';
import { products, bundleProduct, getListImage } from '@/lib/products';
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

export default function CollectionPage() {
  return (
    <div className="bg-background pb-24">
      <section className="px-4 pt-10 pb-6 sm:pt-14">
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-cocoa mb-3">
            مجموعة OXIPRIME
          </h1>
          <p className="text-secondary text-sm leading-relaxed">
            الروتين الكامل هو الاختيار الأفضل — أو اختاري منتج بوحدو.
          </p>
        </div>
      </section>

      {/* Bundle hero offer */}
      <section className="px-4 pb-12">
        <div className="container mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-card border border-gold/40 bg-ivory shadow-card">
            <div className="bg-cocoa text-ivory text-center py-2.5 px-4 text-sm font-bold">
              الأكثر طلباً — باك OXIPRIME الكامل · توفري {saving} درهم
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              <Link
                href={`/products/${bundleProduct.slug}`}
                className="relative block aspect-[4/5] lg:aspect-auto lg:min-h-[420px] bg-gradient-to-b from-[#F4EBE0] to-champagne/20"
                aria-label={bundleProduct.nameAr}
              >
                <Image
                  src="/images/oxiprime-bundle-clear-products.webp"
                  alt="باك OXIPRIME الكامل: شامبو، بلسم، ماسك وسيروم"
                  fill
                  priority
                  quality={65}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 520px"
                  className="object-cover"
                />
                <span className="absolute top-3 right-3 rounded-full bg-success text-ivory text-xs font-bold px-3 py-1.5">
                  وفرّي {saving} درهم
                </span>
              </Link>

              <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center gap-5 text-center lg:text-right">
                <div>
                  <p className="text-xs font-bold text-gold mb-2 tracking-wide">
                    العرض الأفضل
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-cocoa leading-tight">
                    {bundleProduct.nameAr}
                  </h2>
                  <p className="text-sm text-secondary mt-3 leading-relaxed">
                    شامبو + بلسم + ماسك + سيروم فباك واحد. روتين مرتب، ثمن أوضح،
                    ودفع عند الاستلام.
                  </p>
                </div>

                <StarRating rating={bundleProduct.rating} />

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <span className="text-4xl font-bold text-cocoa">
                    {formatPrice(bundleProduct.price)}
                  </span>
                  <span className="text-lg line-through text-muted-brown">
                    {formatPrice(bundleProduct.compareAtPrice!)}
                  </span>
                </div>

                <ul className="space-y-2 text-sm text-secondary text-right">
                  {[
                    '4 منتجات روتين متكامل',
                    'نتيجة أوضح من منتج بوحدو',
                    'تأكيد بالهاتف · دفع عند الاستلام',
                  ].map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 justify-end lg:justify-start"
                    >
                      <span>{point}</span>
                      <span className="text-success font-bold shrink-0">✓</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row gap-3">
                  <AddToCartButton
                    product={bundleCartItem}
                    className="w-full bg-cocoa text-ivory py-4 px-6 font-bold rounded-btn hover:bg-espresso transition-colors"
                  >
                    أضيفي الباك — {formatPrice(bundleProduct.price)}
                  </AddToCartButton>
                  <Link
                    href={`/products/${bundleProduct.slug}`}
                    className="w-full border border-cocoa text-cocoa py-4 px-6 font-bold rounded-btn text-center hover:bg-cocoa/5 transition-colors"
                  >
                    شوفي التفاصيل
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Individual products */}
      <section className="px-4 pb-8">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-cocoa">
              أو اختاري منتج بوحدو
            </h2>
            <p className="text-sm text-muted-brown mt-2">
              متوفر فردياً — النتيجة أوضح مع الروتين الكامل
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-ivory border border-champagne/30 rounded-card overflow-hidden flex flex-col"
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="block aspect-[3/4] relative bg-gradient-to-b from-background to-champagne/20"
                >
                  <Image
                    src={getListImage(product)}
                    alt={product.nameAr}
                    fill
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 240px"
                    quality={65}
                    loading="lazy"
                    className="object-cover"
                  />
                </Link>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <StarRating rating={product.rating} />
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-bold text-sm text-cocoa leading-snug break-words hover:text-gold transition-colors">
                      {product.nameAr}
                    </h3>
                  </Link>
                  <span className="font-bold text-sm text-cocoa">
                    {formatPrice(product.price)}
                  </span>
                  <AddToCartButton
                    product={{
                      id: product.id,
                      slug: product.slug,
                      nameAr: product.nameAr,
                      price: product.price,
                      image: getListImage(product),
                      isBundle: false,
                    }}
                    className="w-full bg-cocoa text-ivory py-2.5 text-xs font-bold rounded-btn mt-auto"
                  >
                    أضيفي للسلة
                  </AddToCartButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
