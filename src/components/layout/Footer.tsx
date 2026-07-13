import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-cocoa text-ivory pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ border: '1px solid #C99A4A' }}
              >
                <span className="text-[10px] font-bold text-gold tracking-widest font-sans">
                  OXI
                </span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-bold text-ivory">تاجكِ</span>
                <span className="text-[10px] text-champagne font-sans tracking-wider">
                  .oxiprime
                </span>
              </div>
            </div>
            <p className="text-champagne/70 text-sm leading-relaxed max-w-xs">
              متجر مغربي متخصص في منتجات OXIPRIME للعناية الاحترافية بالشعر.
              دفع عند الاستلام داخل المغرب.
            </p>
            <p className="mt-4 text-xs text-champagne/50 font-sans">
              منتجات أصلية | دفع عند الاستلام | خدمة داخل المغرب
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-ivory mb-4 text-sm tracking-wide">
              الروابط
            </h4>
            <ul className="space-y-3 text-sm text-champagne/70">
              <li>
                <Link href="/" className="hover:text-gold transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link
                  href="/collection"
                  className="hover:text-gold transition-colors"
                >
                  المجموعة
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-gold transition-colors"
                >
                  من نحن
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-gold transition-colors"
                >
                  تواصلي معنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-bold text-ivory mb-4 text-sm tracking-wide">
              خدمة العميلات
            </h4>
            <ul className="space-y-3 text-sm text-champagne/70">
              <li>
                <Link
                  href="/return-policy"
                  className="hover:text-gold transition-colors"
                >
                  سياسة التوصيل والدفع عند الاستلام
                </Link>
              </li>
              <li>
                <Link
                  href="/return-policy"
                  className="hover:text-gold transition-colors"
                >
                  سياسة الاستبدال والإرجاع
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-gold transition-colors"
                >
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-gold transition-colors"
                >
                  الشروط والأحكام
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-ivory mb-4 text-sm tracking-wide">
              تواصلي معنا
            </h4>
            <ul className="space-y-3 text-sm text-champagne/70">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
                <span dir="ltr">+212 6 00 00 00 00</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
                <span className="font-sans">contact@oxiprime.store</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
                <span>المغرب</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-champagne/40 gap-3">
          <p>© {new Date().getFullYear()} تاجكِ · oxiprime.store. جميع الحقوق محفوظة.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gold transition-colors">
              الخصوصية
            </Link>
            <Link href="/terms" className="hover:text-gold transition-colors">
              الشروط
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
