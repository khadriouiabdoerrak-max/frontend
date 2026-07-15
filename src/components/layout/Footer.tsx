import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-cocoa text-ivory pt-12 pb-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <p className="text-xl font-bold mb-2">تاجكِ</p>
            <p className="text-champagne/70 text-sm leading-relaxed">
              متجر مغربي لمنتجات OXIPRIME. دفع عند الاستلام.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-sm">الروابط</h4>
            <ul className="space-y-2 text-sm text-champagne/70">
              <li><Link href="/">الرئيسية</Link></li>
              <li><Link href="/collection">المجموعة</Link></li>
              <li><Link href="/about">من نحن</Link></li>
              <li><Link href="/contact">تواصلي معنا</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-sm">السياسات</h4>
            <ul className="space-y-2 text-sm text-champagne/70">
              <li><Link href="/privacy">الخصوصية</Link></li>
              <li><Link href="/terms">الشروط</Link></li>
              <li><Link href="/return-policy">التوصيل والإرجاع</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-sm">تواصلي معنا</h4>
            <ul className="space-y-2 text-sm text-champagne/70">
              <li>📞 تأكيد الطلبات بالهاتف</li>
              <li>✉️ contact@oxiprime.store</li>
              <li>🇲🇦 المغرب</li>
            </ul>
          </div>
        </div>

        <p className="text-center text-xs text-champagne/50 border-t border-white/10 pt-6">
          © {new Date().getFullYear()} تاجكِ · oxiprime.store
        </p>
      </div>
    </footer>
  );
}
