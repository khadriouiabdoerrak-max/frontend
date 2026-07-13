import { ChevronDown } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      q: "هل منتجات OXIPRIME مناسبة للشعر المعالج بالكيراتين والبروتين؟",
      a: "نعم، جميع منتجاتنا خالية تماماً من السلفات (Sulfates) والكلوريد الصوديوم، مما يجعلها آمنة ومثالية للحفاظ على علاجات الكيراتين والبروتين لفترة أطول."
    },
    {
      q: "كم يستغرق التوصيل؟",
      a: "نقوم بالتوصيل داخل الدار البيضاء والرباط خلال 24 ساعة. لباقي المدن المغربية، يستغرق التوصيل من 48 إلى 72 ساعة."
    },
    {
      q: "هل يمكنني الدفع عند الاستلام؟",
      a: "نعم، الدفع عند الاستلام متاح. بعد إرسال الطلب، سيتصل بك فريقنا لتأكيد العنوان والمنتجات قبل إرسال الشحنة."
    },
    {
      q: "لماذا تتصلون بي بعد الطلب؟",
      a: "هذا جزء من خدمة التأكيد الخاصة بنا. نتصل بك لتفادي أخطاء العنوان، تأكيد التوفر، وتقليل الطلبات الراجعة. لن يتم إرسال الطلب حتى يتم تأكيده هاتفياً أو عبر واتساب."
    },
    {
      q: "ما هو الفرق بين N°2 و N°3؟",
      a: "N°2 (THE ARCHITECT) هو ماسك علاجي عميق يعيد بناء روابط الشعر من الداخل ويستخدم 1-2 مرات أسبوعياً. بينما N°3 (THE SEALER) هو بلسم يُستخدم بعد كل غسلة لإغلاق مسام الشعر وحبس الترطيب."
    }
  ];

  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="text-4xl font-bold mb-12 text-center font-arabic tracking-tight">
          الأسئلة الشائعة
        </h1>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-white border border-gray-200 rounded-sm">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold">
                {faq.q}
                <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180 text-secondary" />
              </summary>
              <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}