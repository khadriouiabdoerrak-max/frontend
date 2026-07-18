import Image from 'next/image';
import { StarRating } from '@/components/home/StarRating';
import { getWhatsAppHref, hasWhatsApp } from '@/lib/whatsapp';

export const productReviews = [
  {
    name: 'سلمى — الدار البيضاء',
    text: 'من بعد أسابيع الشعر ولى ناعم بزاف والتسريح سهّل. الباك كامل يستاهل.',
    rating: 5,
    image: '/images/review-salma.webp',
    imageAlt: 'نتيجة شعر أنعم بعد روتين العناية',
  },
  {
    name: 'إيمان — مراكش',
    text: 'الدفع عند الاستلام ريحني. وصل في أيام قليلة والمنتجات واضحة فالصور.',
    rating: 5,
    image: '/images/review-iman.webp',
    imageAlt: 'شعر بعد عناية وترطيب منتظم',
  },
  {
    name: 'نادية — طنجة',
    text: 'شعري كان جاف من الصباغة. الماسك والسيروم بداو الفرق من أول استعمالات.',
    rating: 4.8,
    image: '/images/review-nadia.webp',
    imageAlt: 'استعمال روتين العناية خطوة بخطوة',
  },
];

export const orderFlowSteps = [
  {
    step: '1',
    title: 'تسجلي الطلب',
    desc: 'أضيفي للسلة وكمّلي الاسم، الهاتف والمدينة.',
  },
  {
    step: '2',
    title: 'نتصلو بيك',
    desc: 'كنأكدو التفاصيل بالهاتف قبل ما نرسلو.',
  },
  {
    step: '3',
    title: 'كنرسلو',
    desc: 'بعد التأكيد، الطلبية كتمشي للتوصيل.',
  },
  {
    step: '4',
    title: 'كتخلصي عند الباب',
    desc: 'تشوفي الطلبية وتخلصي عند الاستلام.',
  },
];

export function CodTrustList() {
  return (
    <ul className="space-y-1.5 text-xs text-muted-brown text-right">
      <li>✓ ما كتخلصيش حتى توصلك الطلبية</li>
      <li>✓ كنأكدو الطلب بالهاتف قبل الإرسال</li>
      <li>✓ تقدري تلغي أو تعدّلي قبل ما نرسلو</li>
      <li>✓ توصيل داخل المغرب · عادة 2–4 أيام عمل</li>
    </ul>
  );
}

export function WhatsAppAskLink({ productName }: { productName: string }) {
  if (!hasWhatsApp()) return null;
  const href = getWhatsAppHref(
    `السلام عليكم، بغيت نسول على: ${productName}\nواش مناسب لشعري؟ الدفع عند الاستلام؟`,
  );
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full border border-champagne/50 bg-background text-cocoa py-3 text-sm font-bold rounded-btn text-center hover:border-gold/60 hover:bg-ivory transition-colors"
    >
      سولي على واتساب قبل الطلب
    </a>
  );
}

export type ReviewVisual = {
  image: string;
  imageAlt: string;
};

/** Build 3 distinct visuals for a single product page (product-specific). */
export function reviewVisualsForProduct(input: {
  nameAr: string;
  image?: string;
  usageImage?: string;
  accentImage?: string;
}): ReviewVisual[] {
  const productImg = input.image ?? '/images/oxiprime-shampoo-realistic.webp';
  const usageImg = input.usageImage ?? productImg;
  const accent =
    input.accentImage ?? '/images/oxiprime-smooth-hair-result.webp';
  return [
    {
      image: usageImg,
      imageAlt: `استعمال ${input.nameAr}`,
    },
    {
      image: productImg,
      imageAlt: input.nameAr,
    },
    {
      image: accent,
      imageAlt: `نتيجة مع ${input.nameAr}`,
    },
  ];
}

export function ProductReviewsSection({
  title = 'شنو قالت الزبونات',
  subtitle = 'مدن مغربية · دفع عند الاستلام · تأكيد بالهاتف',
  visuals,
}: {
  title?: string;
  subtitle?: string;
  /** Override images per card (keeps texts, changes photos). */
  visuals?: ReviewVisual[];
}) {
  const cards = productReviews.map((review, i) => ({
    ...review,
    image: visuals?.[i]?.image ?? review.image,
    imageAlt: visuals?.[i]?.imageAlt ?? review.imageAlt,
  }));

  return (
    <section className="px-4 py-12 bg-ivory">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-cocoa">{title}</h2>
          <p className="text-sm text-secondary leading-relaxed">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((review) => (
            <article
              key={review.name}
              className="rounded-card border border-champagne/30 bg-background overflow-hidden"
            >
              <div className="relative aspect-[16/10] bg-champagne/20">
                <Image
                  src={review.image}
                  alt={review.imageAlt}
                  fill
                  sizes="(max-width: 640px) 92vw, 300px"
                  quality={60}
                  loading="lazy"
                  className="object-cover"
                />
              </div>
              <div className="p-4 space-y-2.5">
                <StarRating rating={review.rating} />
                <p className="text-sm text-secondary leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </p>
                <p className="text-xs font-bold text-cocoa">{review.name}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="text-center text-[11px] text-muted-brown mt-4">
          صور توضيحية للمنتج/الاستعمال · النتائج تختلف حسب نوع الشعر.
        </p>
      </div>
    </section>
  );
}

export function ResultPromiseSection({
  title = 'من شعر متعب… لنتيجة أوضح',
  subtitle = 'الهدف بسيط: نعومة، تسريح أسهل، ولمعان مع الاستمرار — بلا وعود طبية.',
  beforeSrc = '/images/oxiprime-hair-lifestyle-hero.webp',
  afterSrc = '/images/oxiprime-smooth-hair-result.webp',
  beforeAlt = 'شعر يحتاج روتين إصلاح وترطيب',
  afterAlt = 'نتيجة شعر أنعم وأكثر لمعانا',
  beforeCaption = 'قبل الروتين الكامل · جفاف / نفشة / تعب',
  afterCaption = 'مع الاستمرار · نعومة ولمعان أوضح',
}: {
  title?: string;
  subtitle?: string;
  beforeSrc?: string;
  afterSrc?: string;
  beforeAlt?: string;
  afterAlt?: string;
  beforeCaption?: string;
  afterCaption?: string;
}) {
  return (
    <section className="px-4 py-12 bg-background">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-cocoa mb-3">
            {title}
          </h2>
          <p className="text-sm text-secondary leading-relaxed">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <figure className="overflow-hidden rounded-card border border-champagne/30 bg-ivory">
            <div className="relative aspect-[16/11]">
              <Image
                src={beforeSrc}
                alt={beforeAlt}
                fill
                sizes="(max-width: 640px) 100vw, 420px"
                quality={62}
                loading="lazy"
                className="object-cover"
              />
            </div>
            <figcaption className="p-3 text-center text-xs font-bold text-muted-brown">
              {beforeCaption}
            </figcaption>
          </figure>
          <figure className="overflow-hidden rounded-card border border-gold/40 bg-ivory shadow-card">
            <div className="relative aspect-[16/11]">
              <Image
                src={afterSrc}
                alt={afterAlt}
                fill
                sizes="(max-width: 640px) 100vw, 420px"
                quality={65}
                loading="lazy"
                className="object-cover"
              />
            </div>
            <figcaption className="p-3 text-center text-xs font-bold text-cocoa">
              {afterCaption}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

export function CompactOrderFlow() {
  return (
    <section className="px-4 py-10 bg-cocoa text-ivory">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-7">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            شنو كاين من بعد ما تطلبي؟
          </h2>
          <p className="text-sm text-champagne/85 leading-relaxed">
            كتخلصي غير ملي توصل الطلبية لباب الدار.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {orderFlowSteps.map((item) => (
            <div
              key={item.step}
              className="rounded-card border border-white/10 bg-white/5 p-4 text-center"
            >
              <div className="w-9 h-9 rounded-full bg-gold text-cocoa font-bold flex items-center justify-center mx-auto mb-2 font-sans text-sm">
                {item.step}
              </div>
              <p className="font-bold text-sm mb-1">{item.title}</p>
              <p className="text-[11px] text-champagne/80 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
