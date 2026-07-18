import type { Metadata } from 'next';
import Link from 'next/link';
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  title: `من نحن | ${brand.name}`,
  description: brand.shortDescription,
};

const pillars = [
  {
    title: 'اختيار متخصص',
    desc: `نركّز على روتين ${brand.productLine} الكامل — مشي على رفّ مليان منتجات بلا منطق.`,
  },
  {
    title: 'روتين من 4 خطوات',
    desc: 'تنظيف، ترطيب، تغذية، وحماية. كل خطوة تكمّل اللي قبلها لنتيجة أوضح.',
  },
  {
    title: 'ثقة مغربية',
    desc: 'دفع عند الاستلام، تأكيد بالهاتف أو واتساب، وتوصيل لجميع المدن.',
  },
  {
    title: 'وضوح قبل الشراء',
    desc: 'معلومات واضحة عن كل منتج، مع دليل عناية واختبار شعر يسهّل الاختيار.',
  },
];

export default function AboutPage() {
  return (
    <div className="pt-8 pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-14 space-y-3">
          <p className="text-xs font-bold tracking-wide text-gold">
            {brand.name}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-cocoa">
            من نحن
          </h1>
          <p className="text-secondary text-sm leading-relaxed max-w-xl mx-auto">
            {brand.tagline}
          </p>
        </div>

        <div className="space-y-10 text-sm text-secondary leading-loose">
          <div className="bg-ivory rounded-card border border-champagne/30 p-8">
            <h2 className="text-xl font-bold text-cocoa mb-4">
              قصة {brand.name}
            </h2>
            <p>
              <strong className="text-cocoa">{brand.name}</strong> هي{' '}
              {brand.identity}
            </p>
            <p className="mt-4">{brand.positioning}</p>
            <p className="mt-4">
              نؤمن أن الشعر ليس تفصيلاً صغيراً في جمال المرأة، بل جزء من ثقتها
              اليومية. لذلك نقدّم روتيناً متكاملاً يجمع بين التنظيف، الترطيب،
              التغذية، والحماية — مع خدمة محلية واضحة من أول طلب حتى التوصيل.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {pillars.map((item) => (
              <div
                key={item.title}
                className="bg-ivory rounded-card border border-champagne/30 p-5"
              >
                <h3 className="font-bold text-cocoa mb-2">{item.title}</h3>
                <p className="text-xs text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <p className="text-muted-brown text-sm mb-6">{brand.promise}</p>
            <Link
              href="/collection"
              className="inline-block bg-cocoa text-ivory px-8 py-4 font-bold rounded-btn hover:bg-espresso transition-colors"
            >
              اكتشفي المجموعة
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
