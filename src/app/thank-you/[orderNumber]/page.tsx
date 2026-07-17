import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Phone } from 'lucide-react';
import { getWhatsAppHref } from '@/lib/site';
import { buildOrderConfirmWhatsAppMessage } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'تم استلام طلبكِ | تاجكِ',
  description:
    'تم استلام طلبكِ بنجاح. سيتواصل معكِ فريق تاجكِ لتأكيد الطلب قبل الإرسال.',
};

type PageProps = {
  params: Promise<{ orderNumber: string }>;
};

export default async function ThankYouPage({ params }: PageProps) {
  const { orderNumber } = await params;
  const decodedOrder = decodeURIComponent(orderNumber);
  const waHref = getWhatsAppHref(
    buildOrderConfirmWhatsAppMessage(decodedOrder),
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-20">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-cocoa">
          تم استلام طلبكِ بنجاح
        </h1>

        <p className="text-secondary leading-relaxed text-sm">
          شكرا لثقتكِ في تاجكِ. طلبكِ قيد التأكيد، وسيتواصل معكِ فريقنا عبر
          الهاتف لتأكيد العنوان والمنتجات قبل الإرسال.
        </p>

        <div className="bg-ivory rounded-card border border-champagne/30 p-5 inline-block w-full">
          <p className="text-xs text-muted-brown mb-1">رقم الطلب</p>
          <p className="text-xl font-bold text-cocoa font-sans" dir="ltr">
            {decodedOrder}
          </p>
        </div>

        <div className="bg-gold/10 border border-gold/30 rounded-card p-4 flex items-start gap-3 text-right">
          <Phone className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-cocoa">
              يرجى إبقاء هاتفكِ متاحا
            </p>
            <p className="text-xs text-secondary mt-1">
              سيتواصل معكِ فريقنا لتأكيد الطلب بسرعة.
            </p>
          </div>
        </div>

        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-[#25D366] text-white py-4 font-bold rounded-btn hover:bg-[#1ebe59] transition-colors text-sm"
        >
          تأكيد طلبي عبر واتساب
        </a>

        <Link
          href="/collection"
          className="block w-full bg-transparent text-cocoa border border-cocoa py-4 font-bold rounded-btn hover:bg-cocoa/5 transition-colors text-sm"
        >
          العودة للتسوق
        </Link>
      </div>
    </div>
  );
}
