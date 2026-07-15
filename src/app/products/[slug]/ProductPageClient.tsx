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

const bundleFaqs = [
  {
    title: 'واش الباك مناسب للشعر المصبوغ والمتضرر؟',
    content:
      'نعم، الروتين موجه للشعر الجاف والمتضرر. النتائج تختلف حسب نوع الشعر.',
  },
  {
    title: 'علاش ناخذ الباك كامل؟',
    content:
      'كل خطوة كتكمّل اللي قبلها: تنظيف، ترطيب، تغذية، وحماية.',
  },
  {
    title: 'كيفاش نخلص؟',
    content: 'الدفع عند الاستلام. كنتواصل معك بالهاتف قبل الإرسال.',
  },
];

function ProductImage({ product }: { product: Product }) {
  return (
    <div className="relative aspect-[4/5] bg-ivory rounded-card border border-champagne/30 overflow-hidden p-6">
      <Image
        src={getListImage(product)}
        alt={product.nameAr}
        fill
        sizes="(max-width: 1024px) 100vw, 40vw"
        className="object-contain p-4"
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
    <div className="pb-16 min-h-screen bg-background">
      <section className="px-4 py-8 bg-gradient-to-b from-[#EFE5D6] to-background">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="grid grid-cols-4 gap-2 p-4 bg-ivory rounded-card border border-champagne/30">
            {products.map((item) => (
              <Image
                key={item.id}
                src={getListImage(item)}
                alt={item.nameAr}
                width={80}
                height={100}
                className="w-full h-auto object-contain"
              />
            ))}
          </div>
          <div className="space-y-4 text-center lg:text-right">
            <h1 className="text-2xl sm:text-4xl font-bold text-cocoa">
              {product.nameAr}
            </h1>
            <StarRating rating={product.rating} />
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <span className="text-3xl font-bold text-cocoa">
                {formatPrice(product.price)}
              </span>
              <span className="line-through text-muted-brown">
                {formatPrice(product.compareAtPrice!)}
              </span>
            </div>
            <button
              type="button"
              onClick={onAddToCart}
              disabled={isAdding}
              className="w-full sm:w-auto bg-cocoa text-ivory px-8 py-3.5 font-bold rounded-btn disabled:opacity-70"
            >
              {isAdding ? 'تمت الإضافة ✓' : 'أضيفي الروتين الكامل'}
            </button>
            <p className="text-xs text-muted-brown">
              ✓ دفع عند الاستلام | 📞 تأكيد هاتفي
            </p>
          </div>
        </div>
      </section>

      <LazySection minHeight="200px">
        <section className="px-4 py-10 container mx-auto max-w-3xl">
          <h2 className="text-xl font-bold text-cocoa mb-4">أسئلة شائعة</h2>
          {bundleFaqs.map((faq, i) => (
            <div key={faq.title} className="border-b border-champagne/30 py-3">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-right font-bold text-sm text-cocoa"
              >
                {faq.title}
              </button>
              {openFaq === i && (
                <p className="mt-2 text-sm text-secondary leading-relaxed">
                  {faq.content}
                </p>
              )}
            </div>
          ))}
        </section>
      </LazySection>
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
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  const accordions = [
    { title: 'طريقة الاستعمال', content: product.howToUse },
    { title: 'المكونات الرئيسية', content: product.ingredients.join(' · ') },
  ];

  const relatedProducts = products
    .filter((item) => item.id !== product.id)
    .slice(0, 3);

  return (
    <div className="pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-5xl pt-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-5/12">
            <ProductImage product={product} />
          </div>

          <div className="w-full lg:w-7/12 space-y-5">
            {product.step && (
              <span className="inline-block bg-gold/10 text-gold text-xs font-bold px-3 py-1 rounded-badge">
                خطوة {product.step} — {product.stepLabel}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-cocoa">
              {product.nameAr}
            </h1>
            <StarRating rating={product.rating} />
            <p className="text-3xl font-bold text-cocoa">
              {formatPrice(product.price)}
            </p>
            <p className="text-sm text-secondary leading-relaxed">
              {product.descriptionAr}
            </p>

            <ul className="space-y-2 text-sm text-secondary">
              {product.benefits.map((benefit) => (
                <li key={benefit}>✓ {benefit}</li>
              ))}
            </ul>

            <button
              type="button"
              onClick={onAddToCart}
              disabled={isAdding}
              className="w-full bg-cocoa text-ivory py-3.5 font-bold rounded-btn disabled:opacity-70"
            >
              {isAdding ? 'تمت الإضافة ✓' : 'أضيفي للسلة'}
            </button>

            {!product.isBundle && (
              <button
                type="button"
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
                className="w-full border border-cocoa text-cocoa py-3 font-bold rounded-btn text-sm"
              >
                الروتين الكامل — {formatPrice(bundleProduct.price)}
              </button>
            )}

            <div className="border-t border-champagne/30 divide-y divide-champagne/30">
              {accordions.map((item, i) => (
                <div key={item.title} className="py-3">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenAccordion(openAccordion === i ? null : i)
                    }
                    className="w-full text-right font-bold text-sm text-cocoa"
                  >
                    {item.title}
                  </button>
                  {openAccordion === i && (
                    <p className="pt-2 text-sm text-secondary leading-relaxed">
                      {item.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <LazySection minHeight="180px">
          <div className="mt-12">
            <h2 className="text-lg font-bold text-cocoa mb-4">
              الأفضل مع هذا المنتج
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedProducts.map((related) => (
                <Link
                  key={related.id}
                  href={`/products/${related.slug}`}
                  className="bg-ivory rounded-card border border-champagne/30 p-3 flex gap-3"
                >
                  <Image
                    src={getListImage(related)}
                    alt={related.nameAr}
                    width={48}
                    height={64}
                    className="w-12 h-16 object-contain shrink-0"
                  />
                  <div>
                    <p className="font-bold text-sm text-cocoa line-clamp-2">
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
        </LazySection>
      </div>
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
