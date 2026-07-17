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

export function cartWhatsAppHref(
  items: WhatsAppCartItem[],
  total: number,
  city?: string,
): string {
  return getWhatsAppHref(buildCartWhatsAppMessage(items, total, city));
}

export { getWhatsAppHref, hasWhatsApp };
