import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة التوصيل والإرجاع | تاجكِ',
};

export default function ReturnPolicyPage() {
  return (
    <div className="pt-8 pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-6 max-w-2xl">
        <h1 className="text-3xl font-bold text-cocoa mb-8">
          سياسة التوصيل والدفع عند الاستلام
        </h1>
        <div className="bg-ivory rounded-card border border-champagne/30 p-8 space-y-8 text-sm text-secondary leading-loose">
          <p>
            ثقة تاجكِ مبنية على وضوح الخدمة: تأكيد بالهاتف، دفع عند الاستلام،
            وتوصيل داخل المغرب.
          </p>
          <section>
            <h2 className="font-bold text-cocoa mb-3 text-base">
              التوصيل
            </h2>
            <ul className="space-y-2 list-none">
              <li>✓ التوصيل متوفر في جميع مدن المغرب</li>
              <li>✓ مدة التوصيل: من 2 إلى 4 أيام عمل بعد تأكيد الطلب</li>
              <li>✓ سيتواصل معكِ فريقنا عبر الهاتف قبل الإرسال لتأكيد العنوان</li>
              <li>✓ يُنصح بإبقاء هاتفكِ متاحا بعد تقديم الطلب</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-cocoa mb-3 text-base">
              الدفع عند الاستلام
            </h2>
            <p>
              الدفع يتم حصرا عند استلام الطلبية. لا حاجة لأي بطاقة بنكية أو
              دفع مسبق. يُدفع المبلغ نقدا لعامل التوصيل عند استلام الطرد.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-cocoa mb-3 text-base">
              سياسة الاستبدال والإرجاع
            </h2>
            <ul className="space-y-2">
              <li>
                <strong className="text-cocoa">طرد مفتوح أو تالف:</strong>{' '}
                إذا استلمتِ الطرد مفتوحا أو تالفا، أبلغينا فورا عبر الهاتف
                أو واتساب.
              </li>
              <li>
                <strong className="text-cocoa">منتج خاطئ:</strong>{' '}
                إذا تلقيتِ منتجا مختلفا عما طلبتِه، سنستبدله مجانا.
              </li>
              <li>
                <strong className="text-cocoa">رفض الطلب:</strong>{' '}
                يمكنكِ رفض استلام الطرد إذا كان مفتوحا أو تالفا عند التسليم.
              </li>
            </ul>
            <p className="mt-4 text-xs text-muted-brown">
              لا يُقبل الإرجاع بعد فتح المنتج أو استعماله لأسباب تتعلق بعدم
              الرغبة في الشراء. يُرجى التواصل معنا قبل أي إجراء.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-cocoa mb-3 text-base">
              التواصل معنا
            </h2>
            <p>
              للإبلاغ عن أي مشكلة في طلبكِ، تواصلي معنا عبر:
              <br />
              <span dir="ltr" className="font-sans">
                contact@oxiprime.store
              </span>
              <br />
              أو عبر واتساب على الرقم المعروض على الموقع.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
