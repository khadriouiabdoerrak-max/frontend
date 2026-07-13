'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Phone,
  Truck,
  Star,
  ChevronDown,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { products, bundleProduct } from '@/lib/products';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const FAQS = [
  {
    q: 'هل المنتجات مناسبة للشعر المتضرر؟',
    a: 'نعم. منتجات OXIPRIME مصممة خصيصا للعناية بالشعر الجاف، المتضرر من الصباغة، الحرارة، والماء القاسي.',
  },
  {
    q: 'كيف أستعمل الروتين الكامل؟',
    a: 'ابدئي بالشامبو، ثم البلسم بعد كل غسلة، ثم الماسك مرة أو مرتين في الأسبوع، وأنهي بالسيروم قبل أو بعد السشوار.',
  },
  {
    q: 'هل الدفع عند الاستلام متوفر؟',
    a: 'نعم. الدفع عند الاستلام متوفر في جميع مدن المغرب. لا حاجة لبطاقة بنكية.',
  },
  {
    q: 'متى تصلني الطلبية؟',
    a: 'بعد تأكيد الطلب عبر الهاتف، تصل الطلبية في غضون 2 إلى 4 أيام عمل حسب المدينة.',
  },
  {
    q: 'هل يمكنني طلب منتج واحد فقط؟',
    a: 'نعم. يمكنك طلب أي منتج بشكل فردي بـ 199 درهم. لكن أفضل نتيجة تحصلين عليها باستخدام الروتين الكامل.',
  },
];

const bundleVisuals = [
  {
    label: 'الشامبو',
    src: '/images/oxiprime-shampoo-realistic.png',
    alt: 'شامبو OXIPRIME لإصلاح الشعر',
  },
  {
    label: 'البلسم',
    src: '/images/oxiprime-conditioner-realistic.png',
    alt: 'بلسم OXIPRIME للترطيب والنعومة',
  },
  {
    label: 'الماسك',
    src: '/images/oxiprime-mask-realistic.png',
    alt: 'ماسك OXIPRIME الاحترافي للتغذية المكثفة',
  },
  {
    label: 'السيروم',
    src: '/images/oxiprime-serum-realistic.png',
    alt: 'سيروم OXIPRIME بالكيراتين والزيوت الطبيعية',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-champagne/30 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-right font-bold text-cocoa focus:outline-none"
      >
        <span className="text-sm sm:text-base">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-gold shrink-0 ml-3 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="mt-3 text-sm text-secondary leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function Home() {
  const { addItem, openCart } = useCartStore();

  const handleAddProduct = (product: (typeof products)[number]) => {
    addItem({
      id: product.id,
      slug: product.slug,
      nameAr: product.nameAr,
      price: product.price,
      isBundle: false,
    });
  };

  const handleAddBundle = () => {
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
    <div className="flex flex-col min-h-screen">

      {/* ─── HERO ─── */}
      <section className="relative bg-gradient-to-b from-[#EFE5D6] to-background pt-16 pb-20 px-6">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-6 text-center lg:text-right"
          >
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-cocoa leading-tight"
            >
              تاجكِ... روتين احترافي لشعر أكثر نعومة ولمعانا.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg text-secondary max-w-2xl mx-auto leading-relaxed"
            >
              اكتشفي مجموعة OXIPRIME للعناية بالشعر الجاف والمتضرر: شامبو،
              بلسم، ماسك وسيروم كيراتين، مصممة لتمنحكِ روتين صالون داخل
              بيتكِ.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
            >
              <button
                onClick={handleAddBundle}
                className="w-full sm:w-auto bg-cocoa text-ivory px-8 py-4 font-bold rounded-btn hover:bg-espresso transition-colors text-base"
              >
                اطلبي الروتين الكامل
              </button>
              <Link
                href="/collection"
                className="w-full sm:w-auto bg-transparent text-cocoa border border-cocoa px-8 py-4 font-bold rounded-btn hover:bg-cocoa/5 transition-colors text-base text-center"
              >
                تصفحي المنتجات
              </Link>
            </motion.div>
            <motion.p
              variants={fadeUp}
              className="text-xs text-muted-brown"
            >
              دفع عند الاستلام | توصيل داخل المغرب | متابعة الطلب عبر الهاتف
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <Link
              href={`/products/${bundleProduct.slug}`}
              className="group relative block overflow-hidden rounded-card border border-champagne/40 bg-ivory shadow-card"
              aria-label="شوفي روتين OXIPRIME الكامل"
            >
              <img
                src="/images/oxiprime-hair-lifestyle-hero.png"
                alt="شعر ناعم ولامع مع منتجات OXIPRIME"
                className="h-full min-h-[320px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-5 bottom-5 rounded-card bg-cocoa/85 p-4 text-center text-ivory shadow-card">
                <p className="text-sm font-bold">اضغطي وشوفي الباك الكامل</p>
                <p className="mt-1 text-xs text-champagne">
                  روتين كامل لشعر أكثر نعومة ولمعانا
                </p>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <section className="bg-cocoa text-ivory py-4 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs sm:text-sm font-medium">
            {[
              { icon: ShieldCheck, label: 'منتجات أصلية' },
              { icon: Phone, label: 'تأكيد عبر الهاتف' },
              { icon: Truck, label: 'توصيل داخل المغرب' },
              { icon: Package, label: 'دفع عند الاستلام' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-2">
                <Icon className="w-4 h-4 text-gold shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROBLEM SECTION ─── */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="space-y-5"
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-bold text-cocoa"
            >
              هل فقد شعركِ نعومته ولمعانه؟
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-secondary text-base leading-relaxed"
            >
              الصباغة، السشوار، البلاكة، والماء القاسي قد تجعل الشعر جافا،
              باهتا، صعب التسريح وأكثر عرضة للتكسر. لهذا تحتاجين روتينا
              متكاملا لا يكتفي بالتنظيف، بل يساعد على الترطيب، التغذية،
              الحماية، واللمعان.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ─── PROTOCOL / 4 STEPS ─── */}
      <section className="py-20 px-6 bg-ivory">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-cocoa">
                روتين من 4 خطوات للعناية المتكاملة
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  variants={fadeUp}
                  transition={{ delay: i * 0.08 }}
                  className="bg-background rounded-card p-6 border border-champagne/30 text-center flex flex-col gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-cocoa text-ivory flex items-center justify-center font-bold font-sans mx-auto text-sm">
                    {product.step}
                  </div>
                  <p className="text-xs font-bold text-gold uppercase tracking-widest font-sans">
                    {product.stepLabel}
                  </p>
                  <h3 className="font-bold text-cocoa text-sm leading-snug">
                    {product.nameAr}
                  </h3>
                  <p className="text-xs text-muted-brown leading-relaxed flex-1">
                    {product.shortDescriptionAr}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── BUNDLE OFFER ─── */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="bg-ivory rounded-card border border-gold/40 shadow-card overflow-hidden"
          >
            <div className="bg-cocoa text-ivory text-center py-3 px-4">
              <span className="text-sm font-bold tracking-wide">
                الأكثر توفيرا — باك OXIPRIME الكامل
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <Link
                href={`/products/${bundleProduct.slug}`}
                aria-label="اكتشفي باك OXIPRIME الكامل"
                className="group block bg-gradient-to-br from-[#EFE5D6] via-ivory to-champagne/30 p-5 sm:p-8"
              >
                <motion.div
                  variants={fadeUp}
                  className="relative overflow-hidden rounded-card border border-white/60 bg-gradient-to-b from-[#F4E5CE] to-[#E9C98E] shadow-card"
                >
                  <div className="absolute right-4 top-4 z-20 rounded-full bg-cocoa px-4 py-2 text-xs font-bold text-ivory shadow-card">
                    4 منتجات فباك واحد
                  </div>
                  <img
                    src="/images/oxiprime-complete-bundle-realistic.png"
                    alt="باك OXIPRIME الكامل فيه الشامبو والبلسم والماسك والسيروم"
                    className="h-full min-h-[360px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-x-5 bottom-5 z-40 rounded-card bg-cocoa/90 px-4 py-3 text-center text-ivory shadow-card">
                    <p className="text-sm font-bold">اضغطي على الصورة وشوفي صفحة الباك الكامل</p>
                    <p className="mt-1 text-xs text-champagne">شامبو + بلسم + ماسك + سيروم</p>
                  </div>
                </motion.div>
              </Link>

              <div className="p-8 sm:p-10 flex flex-col justify-center text-center lg:text-right space-y-5">
                <motion.span
                  variants={fadeUp}
                  className="mx-auto lg:mx-0 inline-flex w-fit items-center rounded-badge bg-gold/10 px-3 py-1 text-xs font-bold text-gold"
                >
                  الروتين الكامل للشعر الجاف والمتضرر
                </motion.span>
                <motion.h2 variants={fadeUp} className="text-2xl sm:text-4xl font-bold text-cocoa leading-tight">
                  شوفي الباك كامل واختاري أفضل عرض
                </motion.h2>
                <motion.p variants={fadeUp} className="text-secondary text-sm leading-relaxed">
                  شامبو + بلسم + ماسك + سيروم كيراتين فباك واحد بثمن خاص.
                  الكارد فيه صور المجموعة كاملة، وكليك واحد يفتح صفحة العرض
                  باش تشوفي التفاصيل وطريقة الاستعمال.
                </motion.p>
                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <span className="text-4xl font-bold text-cocoa">
                    {formatPrice(bundleProduct.price)}
                  </span>
                  <div className="text-center sm:text-right">
                    <span className="block text-lg text-muted-brown line-through">
                      {formatPrice(bundleProduct.compareAtPrice!)}
                    </span>
                    <span className="block text-sm text-success font-bold">
                      توفيري 197 درهم
                    </span>
                  </div>
                </motion.div>
                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/products/${bundleProduct.slug}`}
                    className="w-full bg-cocoa text-ivory py-4 px-6 font-bold rounded-btn hover:bg-espresso transition-colors text-base text-center"
                  >
                    افتحي صفحة الباك الكامل
                  </Link>
                  <button
                    onClick={handleAddBundle}
                    className="w-full bg-transparent text-cocoa border border-cocoa py-4 px-6 font-bold rounded-btn hover:bg-cocoa/5 transition-colors text-base"
                  >
                    أضيفي للسلة
                  </button>
                </motion.div>
                <p className="text-xs text-muted-brown">
                  دفع عند الاستلام | تأكيد عبر الهاتف | توصيل داخل المغرب
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── INDIVIDUAL PRODUCTS ─── */}
      <section className="py-20 px-6 bg-ivory">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-cocoa">
                تسوقي المنتجات بشكل فردي
              </h2>
              <p className="text-sm text-muted-brown mt-2">
                كل منتج بـ 199 درهم — أو اختاري الروتين الكامل وتوفري أكثر
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  variants={fadeUp}
                  transition={{ delay: i * 0.08 }}
                  className="bg-background rounded-card border border-champagne/30 overflow-hidden flex flex-col shadow-card"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="block aspect-[4/5] bg-gradient-to-b from-ivory to-champagne/20 overflow-hidden"
                  >
                    <img
                      src={product.image}
                      alt={product.nameAr}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </Link>

                  <div className="p-4 flex flex-col flex-1 gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-gold bg-gold/10 px-2 py-1 rounded-badge">
                        {product.stepLabel}
                      </span>
                      <span className="text-[11px] text-muted-brown font-sans">
                        خطوة {product.step}
                      </span>
                    </div>
                    {/* Stars */}
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Star
                          key={j}
                          className={`w-3.5 h-3.5 ${j < Math.floor(product.rating) ? 'text-gold fill-gold' : 'text-champagne'}`}
                        />
                      ))}
                      <span className="text-xs text-muted-brown mr-1">
                        {product.rating}
                      </span>
                    </div>

                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-bold text-sm text-cocoa leading-snug hover:text-gold transition-colors">
                        {product.nameAr}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-brown leading-relaxed flex-1">
                      {product.shortDescriptionAr}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cocoa">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-xs text-success font-medium">
                        دفع عند الاستلام
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddProduct(product)}
                      className="w-full bg-cocoa text-ivory py-2.5 text-sm font-bold rounded-btn hover:bg-espresso transition-colors"
                    >
                      أضيفي للسلة
                    </button>
                    <p className="text-xs text-center text-muted-brown">
                      الأفضل ضمن الروتين الكامل
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── INGREDIENTS ─── */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="space-y-8"
          >
            <motion.div variants={fadeUp} className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-cocoa">
                مكونات مختارة للعناية بالشعر الجاف والمتضرر
              </h2>
              <p className="text-secondary text-sm leading-relaxed max-w-2xl mx-auto">
                تجمع منتجات OXIPRIME بين مكونات معروفة في عالم العناية بالشعر
                مثل الكيراتين، الكولاجين، زيت الأركان وزيت الجوجوبا، لتمنح
                الشعر مظهرا أكثر نعومة، لمعانا، وسهولة في التسريح.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {[
                { name: 'كيراتين', desc: 'يساعد على مظهر أكثر نعومة' },
                { name: 'كولاجين', desc: 'مرونة ونعومة' },
                { name: 'زيت الأركان', desc: 'لمعان وترطيب عميق' },
                { name: 'زيت الجوجوبا', desc: 'خفيف ومغذي' },
              ].map((ing) => (
                <div
                  key={ing.name}
                  className="bg-ivory rounded-card p-4 border border-champagne/30 text-center"
                >
                  <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-4 h-4 text-gold" />
                  </div>
                  <p className="font-bold text-sm text-cocoa">{ing.name}</p>
                  <p className="text-xs text-muted-brown mt-1">{ing.desc}</p>
                </div>
              ))}
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="text-xs text-muted-brown italic"
            >
              هذه المنتجات مخصصة للعناية التجميلية بالشعر وليست علاجا طبيا.
              النتائج تختلف حسب نوع الشعر وطريقة الاستعمال.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ─── TRUST SECTION ─── */}
      <section className="py-20 px-6 bg-cocoa text-ivory">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-2xl sm:text-3xl font-bold text-center mb-12"
            >
              تجربة شراء موثوقة ومناسبة للسوق المغربي
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  icon: Package,
                  title: 'الدفع عند الاستلام',
                  desc: 'أدّي ثمن الطلبية عند التوصل بها. لا حاجة لبطاقة بنكية.',
                },
                {
                  icon: Phone,
                  title: 'تأكيد عبر الهاتف',
                  desc: 'نتواصل معكِ لتأكيد تفاصيل الطلب قبل الإرسال.',
                },
                {
                  icon: ShieldCheck,
                  title: 'منتجات أصلية',
                  desc: 'نعرض صورا ومعلومات واضحة لكل منتج.',
                },
                {
                  icon: Truck,
                  title: 'خدمة داخل المغرب',
                  desc: 'تجربة بسيطة وسريعة من الطلب إلى التوصيل.',
                },
              ].map(({ icon: Icon, title, desc }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  className="flex items-start gap-4 bg-white/5 rounded-card p-5 border border-white/10"
                >
                  <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="font-bold text-ivory mb-1">{title}</p>
                    <p className="text-sm text-champagne/70 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF / TESTIMONIALS ─── */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-2xl sm:text-3xl font-bold text-cocoa text-center mb-12"
            >
              ماذا يقول العميلات
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  name: 'س.م.',
                  city: 'الدار البيضاء',
                  text: '"شعري ولى أسهل في التسريح وأكثر لمعانا بعد استعمال الروتين."',
                  product: 'الروتين الكامل',
                },
                {
                  name: 'ف.ب.',
                  city: 'الرباط',
                  text: '"الماسك رائع جدا، شعري كان جافا بزاف وهذا المنتج ساعدني كثيرا."',
                  product: 'ماسك OXIPRIME',
                },
                {
                  name: 'ن.ح.',
                  city: 'مراكش',
                  text: '"السيروم خفيف ولا يترك الشعر دهنيا، اللمعان واضح من أول استعمال."',
                  product: 'سيروم الكيراتين',
                },
              ].map((review, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="bg-ivory rounded-card border border-champagne/30 p-6 flex flex-col gap-4"
                >
                  <div className="flex">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-gold fill-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-secondary leading-relaxed italic flex-1">
                    {review.text}
                  </p>
                  <div>
                    <p className="font-bold text-sm text-cocoa">{review.name}</p>
                    <p className="text-xs text-muted-brown">
                      {review.city} · {review.product}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-xs text-muted-brown mt-6">
              هذه شهادات أولية. النتائج قد تختلف حسب نوع الشعر وطريقة الاستعمال.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 px-6 bg-ivory">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-2xl sm:text-3xl font-bold text-cocoa text-center mb-10"
            >
              أسئلة شائعة
            </motion.h2>
            <motion.div variants={fadeUp}>
              {FAQS.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-20 px-6 bg-background text-center">
        <div className="container mx-auto max-w-xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="space-y-6"
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-bold text-cocoa"
            >
              ابدئي روتين تاجكِ اليوم
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-secondary text-sm leading-relaxed"
            >
              جمالكِ يبدأ من ثقة شعركِ. الدفع عند الاستلام في جميع مدن المغرب.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleAddBundle}
                className="bg-cocoa text-ivory px-8 py-4 font-bold rounded-btn hover:bg-espresso transition-colors text-base"
              >
                أضيفي الروتين الكامل — 599 درهم
              </button>
              <Link
                href="/collection"
                className="bg-transparent text-cocoa border border-cocoa px-8 py-4 font-bold rounded-btn hover:bg-cocoa/5 transition-colors text-base text-center"
              >
                اختاري العرض المناسب
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
