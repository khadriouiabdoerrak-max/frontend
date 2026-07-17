import { getWhatsAppHref, hasWhatsApp } from '@/lib/site';
import { formatPrice } from '@/lib/utils';

type WhatsAppCartItem = {
  nameAr: string;
  quantity: number;
  price: number;
};

export function buildCartWhatsAppMessage(
  items: WhatsAppCartItem[],
  total: number,
  city?: string,
): string {
  const lines = items.map(
    (item) => `• ${item.nameAr} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`,
  );
  const cityLine = city ? `\nالمدينة: ${city}` : '';
  return [
    'السلام عليكم، بغيت نطلب من تاجكِ:',
    '',
    ...lines,
    '',
    `المجموع: ${formatPrice(total)}${cityLine}`,
    '',
    'الدفع عند الاستلام.',
  ].join('\n');
}

export function buildOrderConfirmWhatsAppMessage(orderNumber: string): string {
  return `السلام عليكم، بغيت نأكد طلبي رقم ${orderNumber}`;
}

/** Open WhatsApp chat with the customer (call-center / status messages). */
export function customerWhatsAppHref(phone: string, message: string): string {
  let digits = (phone || '').replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length === 10) {
    digits = `212${digits.slice(1)}`;
  } else if (digits.length === 9 && (digits.startsWith('6') || digits.startsWith('7'))) {
    digits = `212${digits}`;
  }
  // already 212… → keep
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function openCustomerWhatsApp(phone: string, message: string) {
  const href = customerWhatsAppHref(phone, message);
  if (typeof window !== 'undefined') {
    window.open(href, '_blank', 'noopener,noreferrer');
  }
  return href;
}

export function buildCallCenterConfirmMessage(order: {
  order_number: string;
  customer_name: string;
  products: string;
  total_amount: number;
}): string {
  return [
    `السلام عليكم ${order.customer_name}،`,
    `معاك تاجكِ بخصوص طلبك رقم ${order.order_number}.`,
    `المنتجات: ${order.products}`,
    `المجموع: ${order.total_amount} درهم — الدفع عند الاستلام.`,
    'واش نقدرو نأكدو الطلب؟',
  ].join('\n');
}

export function buildConfirmedWhatsAppMessage(order: {
  order_number: string;
  customer_name: string;
  total_amount: number;
}): string {
  return [
    `السلام عليكم ${order.customer_name}،`,
    `طلبك رقم ${order.order_number} تأكّد بنجاح ✅`,
    `المجموع: ${order.total_amount} درهم — الدفع عند الاستلام.`,
    'غادي نصيفطوه قريب. شكراً لثقتك تاجكِ.',
  ].join('\n');
}

export function buildShippedWhatsAppMessage(order: {
  order_number: string;
  customer_name: string;
  tracking_number?: string;
}): string {
  const track = (order.tracking_number || '').trim();
  const lines = [
    `السلام عليكم ${order.customer_name}،`,
    `طلبك رقم ${order.order_number} تصيفط ✅`,
  ];
  if (track && !track.startsWith('MAN-')) {
    lines.push(`رقم التتبع: ${track}`);
    lines.push('تقدري تتبعيه من موقع OzonExpress.');
  }
  lines.push('الله يسهّل التوصيل 🌿');
  return lines.join('\n');
}

export function buildDeliveredWhatsAppMessage(order: {
  order_number: string;
  customer_name: string;
}): string {
  return [
    `السلام عليكم ${order.customer_name}،`,
    `نتمنى يكون طلبك ${order.order_number} عجبك.`,
    'شكراً لثقتك تاجكِ — إلا بغيتي مساعدة حنا هنا.',
  ].join('\n');
}

export function cartWhatsAppHref(
  items: WhatsAppCartItem[],
  total: number,
  city?: string,
): string {
  return getWhatsAppHref(buildCartWhatsAppMessage(items, total, city));
}

export { getWhatsAppHref, hasWhatsApp };
