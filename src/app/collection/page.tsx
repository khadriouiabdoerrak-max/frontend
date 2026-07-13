'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { products, bundleProduct } from '@/lib/products';
import { formatPrice } from '@/lib/utils';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function CollectionPage() {
  const { addItem } = useCartStore();

  const addBundle = () => {
    addItem({
      id: bundleProduct.id,
      slug: bundleProduct.slug,
      nameAr: bundleProduct.nameAr,
      price: bundleProduct.price,
      compareAtPrice: bundleProduct.compareAtPrice,
      isBundle: true,
    });
  };

  return (
    <div className="bg-background pt-16 pb-24">
      <section className="px-6 py-16">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <h1 className="text-3xl sm:text-5xl font-bold text-cocoa mb-4">
              مجموعة OXIPRIME للعناية بالشعر
            </h1>
            <p className="text-secondary leading-relaxed">
              اختاري المنتج المناسب لكِ أو ابدئي بالروتين الكامل للحصول على
              تجربة عناية متكاملة وثمن أفضل.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="bg-ivory border border-gold/40 rounded-card p-6 sm:p-8 mb-10 text-center shadow-card"
          >
            <span className="inline-block bg-gold/10 text-gold text-xs font-bold px-3 py-1 rounded-badge mb-3">
              الأكثر توفيرا
            </span>
            <h2 className="text-2xl font-bold text-cocoa mb-2">
              {bundleProduct.nameAr}
            </h2>
            <p className="text-sm text-muted-brown max-w-xl mx-auto mb-5">
              شامبو + بلسم + ماسك + سيروم كيراتين في باك واحد.
            </p>
            <div className="flex items-center justify-center gap-4 mb-5">
              <span className="text-3xl font-bold text-cocoa">
                {formatPrice(bundleProduct.price)}
              </span>
              <span className="text-lg line-through text-muted-brown">
                {formatPrice(bundleProduct.compareAtPrice!)}
              </span>
              <span className="text-sm text-success font-bold">
                توفيري 197 درهم
              </span>
            </div>
            <button
              onClick={addBundle}
              className="bg-cocoa text-ivory px-8 py-4 rounded-btn font-bold hover:bg-espresso transition-colors"
            >
              أضيفي الروتين الكامل للسلة
            </button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-ivory border border-champagne/30 rounded-card overflow-hidden flex flex-col"
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="block aspect-[4/5] bg-gradient-to-b from-background to-champagne/20 overflow-hidden"
                >
                  <img
                    src={product.image}
                    alt={product.nameAr}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </Link>
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-gold bg-gold/10 px-2 py-1 rounded-badge">
                      {product.stepLabel}
                    </span>
                    <span className="text-[11px] text-muted-brown font-sans">
                      خطوة {product.step}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`w-3.5 h-3.5 ${
                          index < Math.floor(product.rating)
                            ? 'text-gold fill-gold'
                            : 'text-champagne'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-muted-brown mr-1">
                      {product.rating}
                    </span>
                  </div>
                  <Link href={`/products/${product.slug}`}>
                    <h2 className="font-bold text-cocoa text-sm leading-snug hover:text-gold transition-colors">
                      {product.nameAr}
                    </h2>
                  </Link>
                  <p className="text-xs text-muted-brown leading-relaxed flex-1">
                    {product.shortDescriptionAr}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cocoa">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-xs text-success">
                      دفع عند الاستلام
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      addItem({
                        id: product.id,
                        slug: product.slug,
                        nameAr: product.nameAr,
                        price: product.price,
                        isBundle: product.isBundle,
                      })
                    }
                    className="w-full bg-cocoa text-ivory py-3 rounded-btn text-sm font-bold hover:bg-espresso transition-colors"
                  >
                    أضيفي للسلة
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
