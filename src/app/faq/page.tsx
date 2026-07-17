import type { Metadata } from 'next';
import { ChevronDown } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة | تاجكِ',
  description:
    'أجوبة حول الدفع عند الاستلام، التوصيل فالمغرب، تأكيد الطلب، ومنتجات OXIPRIME.',
};

const faqs = [
  {
    q: 'هل يمكنني الدفع عند الاستلام؟',
    a: 'نعم. الدفع عند الاستلام متاح في جميع المدن المغربية. كتخلصي غير ملي توصل الطلبية.',
  },
  {
    q: 'علاش كتتصلو بيا بعد الطلب؟',
    a: 'كنأكدو الاسم، المدينة والعنوان بالهاتف أو واتساب قبل الإرسال. هادشي كينقص الأخطاء والطلبات الراجعة.',
  },
  {
    q: 'كم يستغرق التوصيل؟',
    a: 'الدار البيضاء والرباط غالباً خلال 24 ساعة عمل. باقي المدن من 48 إلى 72 ساعة عمل بعد التأكيد.',
  },
  {
    q: 'شنو ثمن التوصيل؟',
    a: 'التوصيل مجاني للطلبات فوق 500 درهم. للطلبات الأقل تضاف 30 درهم.',
  },
  {
    q: 'واش المنتجات مناسبة بعد الصباغة والحرارة؟',
    a: 'نعم. الروتين مصمم للشعر الجاف والمتضرر من الصباغة والحرارة. السيروم كيعطي حماية إضافية قبل السشوار أو البلاكة.',
  },
  {
    q: 'كيفاش نعرف حالة طلبي؟',
    a: 'بعد الطلب، كنأكدو معاكِ بالهاتف أو واتساب. تقدري تتصلي بينا فأي وقت برقم الطلب.',
  },
];

export default function FAQPage() {
  return (
    <div className="pt-12 pb-24 bg-background min-h-screen">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.a,
            },
          })),
        }}
      />
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-10 text-center text-cocoa">
          الأسئلة الشائعة
        </h1>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group bg-ivory border border-champagne/30 rounded-card"
            >
              <summary className="flex items-center justify-between gap-3 p-5 cursor-pointer list-none font-bold text-cocoa">
                {faq.q}
                <ChevronDown className="w-5 h-5 shrink-0 transition-transform group-open:rotate-180 text-muted-brown" />
              </summary>
              <div className="px-5 pb-5 text-secondary leading-relaxed text-sm">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
