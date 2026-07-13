import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الشروط والأحكام | تاجكِ',
};

export default function TermsPage() {
  return (
    <div className="pt-8 pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-6 max-w-2xl">
        <h1 className="text-3xl font-bold text-cocoa mb-8">
          الشروط والأحكام
        </h1>
        <div className="bg-ivory rounded-card border border-champagne/30 p-8 space-y-6 text-sm text-secondary leading-loose">
          <section>
            <h2 className="font-bold text-cocoa mb-2">1. الموقع والخدمة</h2>
            <p>
              هذا الموقع مملوك لمتجر تاجكِ (oxiprime.store). باستخدام الموقع،
              توافقين على هذه الشروط.
            </p>
          </section>
          <section>
            <h2 className="font-bold text-cocoa mb-2">2. الطلبيات والأسعار</h2>
            <p>
              الأسعار المعروضة بالدرهم المغربي (MAD) وتشمل ضريبة القيمة
              المضافة. نحتفظ بحق تعديل الأسعار في أي وقت. الطلب يُعتبر
              مؤكدا بعد التواصل الهاتفي مع العميلة.
            </p>
          </section>
          <section>
            <h2 className="font-bold text-cocoa mb-2">3. الدفع عند الاستلام</h2>
            <p>
              طريقة الدفع الوحيدة المتاحة هي الدفع عند الاستلام (COD). يتم
              تأكيد الطلب عبر الهاتف قبل الإرسال.
            </p>
          </section>
          <section>
            <h2 className="font-bold text-cocoa mb-2">4. المنتجات</h2>
            <p>
              منتجات OXIPRIME مخصصة للعناية التجميلية بالشعر وليست علاجا
              طبيا. النتائج قد تختلف حسب نوع الشعر وطريقة الاستعمال.
            </p>
          </section>
          <section>
            <h2 className="font-bold text-cocoa mb-2">
              5. المسؤولية والضمانات
            </h2>
            <p>
              نلتزم بتقديم منتجات أصلية وتوصيلها في الوقت المحدد. لا نتحمل
              مسؤولية الاستخدام غير الصحيح للمنتجات.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
