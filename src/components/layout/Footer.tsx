import Link from 'next/link';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { brand } from '@/lib/brand';
import { getWhatsAppHref, siteConfig } from '@/lib/site';

export function Footer() {
  return (
    <footer className="bg-cocoa text-ivory pt-12 pb-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <BrandLogo variant="footer" className="w-11 h-11 shrink-0" />
              <div>
                <p className="text-xl font-bold leading-tight">{brand.name}</p>
                <p className="text-[10px] text-champagne/80 tracking-[0.18em] uppercase font-sans">
                  {brand.productLine}
                </p>
              </div>
            </div>
            <p className="text-champagne/70 text-sm leading-relaxed mb-3">
              {brand.footerBlurb}
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              {siteConfig.instagramUrl && (
                <a
                  href={siteConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-champagne hover:text-ivory"
                >
                  Instagram
                </a>
              )}
              {siteConfig.tiktokUrl && (
                <a
                  href={siteConfig.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-champagne hover:text-ivory"
                >
                  TikTok
                </a>
              )}
              <a
                href={getWhatsAppHref(`السلام عليكم من ${brand.name}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-champagne hover:text-ivory"
              >
                WhatsApp
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-sm">الروابط</h4>
            <ul className="space-y-2 text-sm text-champagne/70">
              <li>
                <Link href="/">الرئيسية</Link>
              </li>
              <li>
                <Link href="/collection">المجموعة</Link>
              </li>
              <li>
                <Link href="/quiz">اختبار الشعر</Link>
              </li>
              <li>
                <Link href="/guides">دليل العناية</Link>
              </li>
              <li>
                <Link href="/about">من نحن</Link>
              </li>
              <li>
                <Link href="/contact">تواصلي معنا</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-sm">المساعدة</h4>
            <ul className="space-y-2 text-sm text-champagne/70">
              <li>
                <Link href="/faq">الأسئلة الشائعة</Link>
              </li>
              <li>
                <Link href="/policies">سياسات الشحن</Link>
              </li>
              <li>
                <Link href="/science">العلم وراء OXIPRIME</Link>
              </li>
              <li>
                <Link href="/privacy">الخصوصية</Link>
              </li>
              <li>
                <Link href="/terms">الشروط</Link>
              </li>
              <li>
                <Link href="/return-policy">التوصيل والإرجاع</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-sm">تواصلي معنا</h4>
            <ul className="space-y-2 text-sm text-champagne/70">
              <li dir="ltr" className="font-sans text-right">
                {siteConfig.phoneDisplay}
              </li>
              <li>✉️ {siteConfig.email}</li>
              <li>المغرب · دفع عند الاستلام</li>
            </ul>
          </div>
        </div>

        <p className="text-center text-xs text-champagne/50 border-t border-white/10 pt-6">
          © {new Date().getFullYear()} {brand.name} · oxiprime.store
        </p>
      </div>
    </footer>
  );
}
