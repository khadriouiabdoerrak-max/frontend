'use client';

import { useState } from 'react';

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

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-champagne/30 py-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-right font-bold text-cocoa focus:outline-none"
      >
        <span className="text-sm sm:text-base">{q}</span>
        <span
          className={`text-gold shrink-0 ml-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {open && (
        <p className="mt-3 text-sm text-secondary leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export function HomeFAQ() {
  return (
    <section className="py-16 sm:py-20 px-6 bg-ivory">
      <div className="container mx-auto max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-cocoa text-center mb-10">
          أسئلة شائعة
        </h2>
        <div>
          {FAQS.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
