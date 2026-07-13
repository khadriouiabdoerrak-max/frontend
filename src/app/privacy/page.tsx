import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | تاجكِ',
};

export default function PrivacyPage() {
  return (
    <div className="pt-8 pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-6 max-w-2xl">
        <h1 className="text-3xl font-bold text-cocoa mb-8">
          سياسة الخصوصية
        </h1>
        <div className="bg-ivory rounded-card border border-champagne/30 p-8 space-y-6 text-sm text-secondary leading-loose">
          <section>
            <h2 className="font-bold text-cocoa mb-2">1. البيانات التي نجمعها</h2>
            <p>
              عند إتمام طلب الشراء، نجمع الاسم الكامل، رقم الهاتف، المدينة،
              والعنوان. هذه البيانات تُستخدم فقط لتأكيد الطلب وتوصيله.
            </p>
          </section>
          <section>
            <h2 className="font-bold text-cocoa mb-2">2. كيف نستخدم بياناتكِ</h2>
            <p>
              نستخدم بياناتكِ لمعالجة الطلب، التواصل معكِ لتأكيد التوصيل، وتحسين
              تجربتكِ على الموقع. لا نبيع بياناتكِ لأي طرف ثالث.
            </p>
          </section>
          <section>
            <h2 className="font-bold text-cocoa mb-2">3. الحماية والأمان</h2>
            <p>
              نحرص على حماية بياناتكِ باستخدام إجراءات أمنية مناسبة. لا نجمع
              أرقام البطاقات البنكية لأن الدفع يتم عند الاستلام فقط.
            </p>
          </section>
          <section>
            <h2 className="font-bold text-cocoa mb-2">4. حقوقكِ</h2>
            <p>
              يمكنكِ في أي وقت طلب حذف بياناتكِ أو الاطلاع عليها عبر التواصل
              معنا على: contact@oxiprime.store
            </p>
          </section>
          <section>
            <h2 className="font-bold text-cocoa mb-2">5. التعديلات</h2>
            <p>
              قد نحدّث هذه السياسة من وقت لآخر. يُنصح بمراجعتها بشكل دوري.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
