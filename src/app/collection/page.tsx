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
  isBundle: true as const,
};

export default function CollectionPage() {
  return (
    <div className="bg-background pt-16 pb-24">
      <section className="px-4 py-12">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-cocoa mb-3">
              مجموعة OXIPRIME
            </h1>
            <p className="text-secondary text-sm leading-relaxed">
              اختاري منتج واحد أو الروتين الكامل بثمن أفضل.
            </p>
          </div>

          <div className="bg-ivory border border-gold/40 rounded-card p-6 mb-8 text-center">
            <h2 className="text-xl font-bold text-cocoa mb-2">
              {bundleProduct.nameAr}
            </h2>
            <p className="text-2xl font-bold text-cocoa mb-4">
              {formatPrice(bundleProduct.price)}
            </p>
            <AddToCartButton
              product={bundleCartItem}
              className="bg-cocoa text-ivory px-8 py-3.5 font-bold rounded-btn"
            >
              أضيفي الروتين الكامل
            </AddToCartButton>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-ivory border border-champagne/30 rounded-card overflow-hidden flex flex-col"
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="block aspect-[4/5] relative p-4 bg-gradient-to-b from-background to-champagne/20"
                >
                  <Image
                    src={getListImage(product)}
                    alt={product.nameAr}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    loading="lazy"
                    className="object-contain p-3"
                  />
                </Link>
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <StarRating rating={product.rating} />
                  <Link href={`/products/${product.slug}`}>
                    <h2 className="font-bold text-xs text-cocoa leading-snug">
                      {product.nameAr}
                    </h2>
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
