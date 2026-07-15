export default function PoliciesPage() {
  return (
    <div className="pt-32 pb-24 bg-background">
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="text-4xl font-bold mb-16 text-center font-arabic tracking-tight">
          السياسات والشروط
        </h1>

        <div className="space-y-16 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold mb-6 text-primary">سياسة الشحن والتوصيل</h2>
            <p className="mb-4">
              نحن في OXIPRIME لا نرسل أي طلب مباشرة بعد ملء الاستمارة. كل طلب يمر أولاً بمرحلة تأكيد هاتفية أو عبر واتساب لضمان صحة المعلومات وتفادي إرجاع الشحنة.
            </p>
            <ul className="list-disc list-inside space-y-2 pe-4">
              <li><strong>حالة الطلب الأولى:</strong> في انتظار التأكيد.</li>
              <li><strong>الدفع:</strong> نقداً عند الاستلام بعد تأكيد الطلب.</li>
              <li><strong>الدار البيضاء والرباط:</strong> التوصيل خلال 24 ساعة عمل.</li>
              <li><strong>باقي المدن المغربية:</strong> التوصيل خلال 48 إلى 72 ساعة عمل.</li>
              <li><strong>تكلفة الشحن:</strong> الشحن مجاني لجميع الطلبات التي تتجاوز 500 درهم. للطلبات الأقل، تضاف رسوم شحن رمزية (30 درهم).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 text-primary">سياسة الاسترجاع والاستبدال</h2>
            <p className="mb-4">
              نضمن لك جودة منتجاتنا بنسبة 100%. إذا لم تكن راضياً عن تجربتك، يمكنك استرجاع المنتج وفق الشروط التالية:
            </p>
            <ul className="list-disc list-inside space-y-2 pe-4">
              <li>يجب طلب الاسترجاع خلال 7 أيام من تاريخ الاستلام.</li>
              <li>يجب أن يكون المنتج في حالته الأصلية ولم يتم استهلاك أكثر من 10% من محتواه.</li>
              <li>يتحمل العميل تكلفة الشحن للاسترجاع إلا في حالة وجود عيب مصنعي.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 text-primary">سياسة الخصوصية</h2>
            <p className="mb-4">
              نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. المعلومات التي نجمعها (الاسم، رقم الهاتف، العنوان) تُستخدم حصرياً لمعالجة وتوصيل طلباتك ولتحسين تجربتك معنا. لن نقوم أبداً ببيع أو مشاركة بياناتك مع أطراف ثالثة لأغراض تسويقية دون موافقتك الصريحة.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
