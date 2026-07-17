import type { Metadata } from 'next';
import Link from 'next/link';
import { guides } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'دليل العناية بالشعر | تاجكِ',
  description:
    'مقالات عملية بالعربية حول الشعر الجاف فالمغرب، الروتين بعد الصباغة، وكيفاش تستعملي OXIPRIME.',
};

export default function GuidesIndexPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-cocoa">
            دليل العناية بالشعر
          </h1>
          <p className="text-sm text-secondary">
            نصائح واضحة للزبونة المغربية — بلا تعقيد.
          </p>
        </div>
        <div className="space-y-4">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="block bg-ivory border border-champagne/30 rounded-card p-5 hover:border-gold/50 transition-colors"
            >
              <p className="text-xs text-muted-brown mb-1">
                {guide.readingMinutes} دقائق قراءة
              </p>
              <h2 className="text-lg font-bold text-cocoa">{guide.title}</h2>
              <p className="text-sm text-secondary mt-2 leading-relaxed">
                {guide.description}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/science"
            className="text-sm text-cocoa underline underline-offset-2"
          >
            اقرئي أيضاً: العلم وراء OXIPRIME
          </Link>
        </div>
      </div>
    </div>
  );
}
