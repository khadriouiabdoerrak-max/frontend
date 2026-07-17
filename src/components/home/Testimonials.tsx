import { StarRating } from '@/components/home/StarRating';

const reviews = [
  {
    name: 'سلمى — الدار البيضاء',
    text: 'من بعد 3 أسابيع الشعر ولى ناعم بزاف وما بقاش كيتقصف. الباك كامل يستاهل.',
    rating: 5,
  },
  {
    name: 'إيمان — مراكش',
    text: 'الدفع عند الاستلام ريحني. التوصيل وصل في 3 أيام والمنتجات أصلية.',
    rating: 5,
  },
  {
    name: 'نادية — طنجة',
    text: 'كنت عندي شعر جاف من الصباغة. الماسك والسيروم بداو الفرق من أول استعمال.',
    rating: 4.8,
  },
];

export function Testimonials() {
  return (
    <section className="py-14 px-4 sm:px-6 bg-ivory">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-8 space-y-2">
          <p className="text-sm text-gold font-bold">+2,400 زبونة راضية</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-cocoa">
            شنو قالت لينا الزبونات
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {reviews.map((review) => (
            <article
              key={review.name}
              className="bg-background rounded-card border border-champagne/30 p-5 space-y-3"
            >
              <StarRating rating={review.rating} />
              <p className="text-sm text-secondary leading-relaxed">
                &ldquo;{review.text}&rdquo;
              </p>
              <p className="text-xs font-bold text-cocoa">{review.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
