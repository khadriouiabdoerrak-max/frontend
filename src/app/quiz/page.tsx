'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { products, bundleProduct } from '@/lib/products';
import { formatPrice } from '@/lib/utils';

type Answers = {
  hair: string;
  concern: string;
  heat: string;
  goal: string;
};

const steps: {
  key: keyof Answers;
  title: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: 'hair',
    title: 'كيفاش شعركِ دابا؟',
    options: [
      { value: 'dry', label: 'جاف ومتقصف' },
      { value: 'damaged', label: 'متضرر (صبغة / حرارة)' },
      { value: 'frizzy', label: 'منفوش وصعب التسريح' },
      { value: 'normal', label: 'عادي وباغي نحافظ عليه' },
    ],
  },
  {
    key: 'concern',
    title: 'شنو أكبر مشكل عندكِ؟',
    options: [
      { value: 'dryness', label: 'الجفاف' },
      { value: 'breakage', label: 'التقصف والتلف' },
      { value: 'frizz', label: 'النفشة' },
      { value: 'dull', label: 'غياب اللمعان' },
    ],
  },
  {
    key: 'heat',
    title: 'واش كتستعملي الحرارة؟',
    options: [
      { value: 'often', label: 'بزاف (سشوار / بلاكة)' },
      { value: 'sometimes', label: 'من مرة لمرة' },
      { value: 'rarely', label: 'تقريباً أبداً' },
    ],
  },
  {
    key: 'goal',
    title: 'شنو النتيجة اللي باغية؟',
    options: [
      { value: 'repair', label: 'إصلاح وترطيب عميق' },
      { value: 'smooth', label: 'نعومة وتسريح ساهل' },
      { value: 'shine', label: 'لمعان وحماية' },
      { value: 'full', label: 'روتين كامل واضح' },
    ],
  },
];

function recommend(answers: Answers) {
  const needsFull =
    answers.goal === 'full' ||
    answers.hair === 'damaged' ||
    (answers.concern === 'breakage' && answers.heat === 'often');

  if (needsFull) {
    return {
      type: 'bundle' as const,
      title: 'الروتين الكامل هو الأنسب ليكِ',
      reason:
        'شعركِ محتاج تنظيف + ترطيب + تغذية + حماية. منتج واحد ما غاديش يكفي بنفس الوضوح.',
      product: bundleProduct,
    };
  }

  if (answers.heat === 'often' || answers.goal === 'shine') {
    const serum = products.find((p) => p.slug === 'thermal-keratin-hair-serum')!;
    return {
      type: 'single' as const,
      title: 'ابدئي بالسيروم، وفكّري فالروتين',
      reason:
        'الحرارة والنفشة كيبان الفرق فيهم بالسيروم، والروتين الكامل كيعطي نتيجة أدوم.',
      product: serum,
    };
  }

  if (answers.concern === 'dryness' || answers.hair === 'dry') {
    const mask = products.find(
      (p) => p.slug === 'deep-conditioning-repair-mask',
    )!;
    return {
      type: 'single' as const,
      title: 'الماسك غادي يفرّق معاكِ',
      reason:
        'الجفاف كيحتاج تغذية مكثفة. الماسك خطوة قوية، والروتين كامل كيثبّت النتيجة.',
      product: mask,
    };
  }

  const shampoo = products.find((p) => p.slug === 'repair-hair-shampoo')!;
  return {
    type: 'single' as const,
    title: 'ابدئي بالشامبو المناسب',
    reason:
      'تنظيف لطيف هو الأساس. إلا بغيتي نتيجة أوضح، الروتين الكامل أحسن اختيار.',
    product: shampoo,
  };
}

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [done, setDone] = useState(false);

  const current = steps[step];
  const progress = done ? 100 : Math.round((step / steps.length) * 100);

  const select = (value: string) => {
    const next = { ...answers, [current.key]: value };
    setAnswers(next);
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  };

  const result = done ? recommend(answers as Answers) : null;
  const cartItem = result
    ? {
        id: result.product.id,
        slug: result.product.slug,
        nameAr: result.product.nameAr,
        price: result.product.price,
        compareAtPrice: result.product.compareAtPrice,
        isBundle: result.product.isBundle,
      }
    : null;

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8 space-y-2">
          <p className="text-xs font-bold tracking-wide text-gold">تاجكِ</p>
          <h1 className="text-3xl font-bold text-cocoa">اختبار الشعر</h1>
          <p className="text-sm text-secondary">
            4 أسئلة قصيرة — ونقترحو عليكِ الأنسب من روتين OXIPRIME.
          </p>
        </div>

        <div className="h-2 bg-champagne/40 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gold transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {!done && current && (
          <div className="bg-ivory border border-champagne/30 rounded-card p-6 space-y-4">
            <p className="text-xs text-muted-brown">
              سؤال {step + 1} من {steps.length}
            </p>
            <h2 className="text-xl font-bold text-cocoa">{current.title}</h2>
            <div className="space-y-2">
              {current.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => select(opt.value)}
                  className="w-full text-right p-4 rounded-btn border border-champagne/40 bg-background hover:border-gold hover:bg-gold/5 transition-colors font-medium text-cocoa"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {done && result && cartItem && (
          <div className="bg-ivory border border-champagne/30 rounded-card p-6 space-y-5 text-center">
            <p className="text-xs font-bold text-gold tracking-wide">
              التوصية ديالكِ
            </p>
            <h2 className="text-2xl font-bold text-cocoa">{result.title}</h2>
            <p className="text-sm text-secondary leading-relaxed">
              {result.reason}
            </p>
            <div className="rounded-card border border-gold/30 bg-background p-4">
              <p className="font-bold text-cocoa">{result.product.nameAr}</p>
              <p className="text-lg font-bold text-cocoa mt-1">
                {formatPrice(result.product.price)}
              </p>
            </div>
            <AddToCartButton
              product={cartItem}
              className="w-full bg-cocoa text-ivory py-4 font-bold rounded-btn"
            >
              أضيفي للسلة
            </AddToCartButton>
            {result.type === 'single' && (
              <Link
                href={`/products/${bundleProduct.slug}`}
                className="block w-full border border-cocoa text-cocoa py-3 font-bold rounded-btn text-sm"
              >
                شوفي الروتين الكامل — {formatPrice(bundleProduct.price)}
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                setStep(0);
                setAnswers({});
                setDone(false);
              }}
              className="text-sm text-muted-brown underline"
            >
              عاودي الاختبار
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
