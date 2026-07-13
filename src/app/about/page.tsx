import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'من نحن | تاجكِ',
  description:
    'تاجكِ — متجر مغربي متخصص في منتجات OXIPRIME للعناية الاحترافية بالشعر. دفع عند الاستلام داخل المغرب.',
};

export default function AboutPage() {
  return (
    <div className="pt-8 pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-14">
          <h1 className="text-3xl sm:text-4xl font-bold text-cocoa mb-4">
            من نحن
          </h1>
          <p className="text-secondary text-sm leading-relaxed max-w-xl mx-auto">
            متجر مغربي متخصص في العناية الاحترافية بالشعر.
          </p>
        </div>

        <div className="space-y-10 text-sm text-secondary leading-loose">
          <div className="bg-ivory rounded-card border border-champagne/30 p-8">
            <h2 className="text-xl font-bold text-cocoa mb-4">قصة تاجكِ</h2>
            <p>
              <strong className="text-cocoa">تاجكِ</strong> هو متجر مغربي
              متخصص في بيع منتجات OXIPRIME للعناية الاحترافية بالشعر. تأسس
              المتجر ليمنح المرأة المغربية تجربة شراء موثوقة، أنيقة، وواضحة،
              مع منتجات مختارة للشعر الجاف، المتضرر، والمتعرض للحرارة أو
              الصباغة.
            </p>
            <p className="mt-4">
              نؤمن أن الشعر ليس تفصيلا صغيرا في جمال المرأة، بل جزء من
              ثقتها اليومية. لذلك نقدم روتينا متكاملا يجمع بين التنظيف،
              الترطيب، التغذية، والحماية، مع خدمة دفع عند الاستلام وتأكيد
              الطلب عبر الهاتف.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                title: 'منتجات مختارة',
                desc: 'منتجات مختارة للعناية الاحترافية بالشعر من مجموعة OXIPRIME.',
              },
              {
                title: 'روتين متكامل',
                desc: 'روتين مكون من 4 خطوات للعناية بالشعر الجاف والمتضرر.',
              },
              {
                title: 'دفع عند الاستلام',
                desc: 'تجربة شراء موثوقة بالدفع عند الاستلام في جميع مدن المغرب.',
              },
              {
                title: 'متجر مغربي',
                desc: 'متجر مغربي متخصص في منتجات OXIPRIME. معلومات واضحة عن كل منتج.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-ivory rounded-card border border-champagne/30 p-5"
              >
                <h3 className="font-bold text-cocoa mb-2">{item.title}</h3>
                <p className="text-xs text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <p className="text-muted-brown text-sm mb-6">
              جمالكِ يبدأ من ثقة شعركِ.
            </p>
            <Link
              href="/collection"
              className="inline-block bg-cocoa text-ivory px-8 py-4 font-bold rounded-btn hover:bg-espresso transition-colors"
            >
              اكتشفي المجموعة
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
