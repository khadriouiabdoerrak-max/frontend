import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'تشغيل المبيعات | تاجكِ',
  robots: { index: false, follow: false },
};

const desks = [
  {
    href: '/admin/confirm',
    title: 'مكتب التأكيد',
    desc: 'طلبات جديدة · اتصال · واتساب · تأكيد أو إلغاء',
  },
  {
    href: '/admin/shipping',
    title: 'مكتب الشحن',
    desc: 'تجهيز · نسخ/تصدير للشركة · تتبع · تسليم أو مرتجع',
  },
  {
    href: '/admin/sales',
    title: 'لوحة المراقبة',
    desc: 'كل الحالات · إحصائيات · تحميل Excel',
  },
];

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <h1 className="text-2xl font-bold text-cocoa">تشغيل مبيعات تاجكِ</h1>
        <p className="text-sm text-muted-brown">
          اختاري المكتب اللي بغيتي تخدمي بيه
        </p>
        <div className="space-y-3 text-right">
          {desks.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              className="block rounded-xl border border-champagne/40 bg-ivory p-4 hover:border-gold transition-colors"
            >
              <h2 className="font-bold text-cocoa">{d.title}</h2>
              <p className="text-sm text-muted-brown mt-1">{d.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
