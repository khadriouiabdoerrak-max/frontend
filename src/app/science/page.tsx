import type { Metadata } from 'next';
import Link from 'next/link';
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  title: `العلم وراء OXIPRIME | ${brand.name}`,
  description:
    'لماذا روتين OXIPRIME الكامل يناسب شعر المرأة المغربية: الماء العسر، الصباغة، والحرارة.',
};

export default function SciencePage() {
  return (
    <div className="pt-12 pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-12 space-y-3">
          <p className="text-xs font-bold tracking-wide text-gold">
            {brand.name} · {brand.productLine}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-cocoa">
            العلم وراء الروتين الكامل
          </h1>
          <p className="text-sm text-secondary leading-relaxed max-w-xl mx-auto">
            الشعر هيكل حيّ — مشي سطح فقط. لذلك في {brand.name} نختار روتيناً
            يعمل على التنظيف، الترطيب، إعادة البناء، والحماية معاً.
          </p>
        </div>

        <div className="space-y-10 text-sm text-secondary leading-relaxed text-right">
          <section className="bg-ivory rounded-card border border-champagne/30 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-cocoa mb-3">
              مشكلة الماء العسر في المغرب
            </h2>
            <p>
              الماء في كثير من المدن المغربية فيه نسب عالية من الكالسيوم
              والمغنيسيوم. هاد المعادن كتتركّم على الشعر وكتخليو باهت، جاف، وأكثر
              عرضة للتقصف. لذلك الخطوة الأولى في روتين {brand.productLine} هي
              تنظيف لطيف يهيّئ الشعر لباقي العناية — بلا إحساس بالجفاف القاسي.
            </p>
          </section>

          <section className="bg-ivory rounded-card border border-champagne/30 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-cocoa mb-3">
              لماذا روتين كامل أفضل من منتج واحد؟
            </h2>
            <p>
              الصباغة والحرارة كيكسرو الروابط اللي كتعطي الشعر قوته ومرونته.
              منتج واحد كيحل جزء من المشكلة. الروتين الكامل كيجمع: تنظيف، ترطيب
              يومي، تغذية أسبوعية مركّزة، وحماية قبل السشوار أو البلاكة — وهادشي
              هو أساس اختيار {brand.name}.
            </p>
          </section>

          <section className="bg-ivory rounded-card border border-champagne/30 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-cocoa mb-3">
              الخطوات الأربع
            </h2>
            <ul className="space-y-2 list-disc pe-5">
              <li>
                <strong className="text-cocoa">الشامبو:</strong> تنظيف لطيف
                وتحضير الشعر.
              </li>
              <li>
                <strong className="text-cocoa">البلسم:</strong> ترطيب ونعومة بعد
                كل غسلة.
              </li>
              <li>
                <strong className="text-cocoa">الماسك:</strong> تغذية مكثفة مرة
                أو مرتين في الأسبوع.
              </li>
              <li>
                <strong className="text-cocoa">السيروم:</strong> حماية من الحرارة
                ولمعان بدون مظهر دهني.
              </li>
            </ul>
          </section>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/collection"
            className="inline-block bg-cocoa text-ivory px-8 py-4 font-bold rounded-btn hover:bg-espresso transition-colors"
          >
            شوفي مجموعة {brand.name}
          </Link>
        </div>
      </div>
    </div>
  );
}
