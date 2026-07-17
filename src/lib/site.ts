/** Public site contact & commerce config (set via env in production). */

function digitsOnly(value: string | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

export const FREE_SHIPPING_THRESHOLD = 500;
export const SHIPPING_FEE_MAD = 30;

export const siteConfig = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://oxiprime.store',
  email: 'contact@oxiprime.store',
  phoneDisplay:
    process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? '+212 6 00 00 00 00',
  /** International digits only, e.g. 2126XXXXXXXX */
  whatsappNumber: digitsOnly(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER),
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? '',
  tiktokUrl: process.env.NEXT_PUBLIC_TIKTOK_URL ?? '',
};

export function hasWhatsApp(): boolean {
  return siteConfig.whatsappNumber.length >= 11;
}

export function getWhatsAppHref(message?: string): string {
  const phone = siteConfig.whatsappNumber || '212600000000';
  const base = `https://wa.me/${phone}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
