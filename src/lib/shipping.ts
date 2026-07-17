import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE_MAD } from '@/lib/site';

/** Major Moroccan cities for checkout select (Arabic). */
export const MOROCCO_CITIES = [
  'الدار البيضاء',
  'الرباط',
  'سلا',
  'تمارة',
  'مراكش',
  'فاس',
  'طنجة',
  'مكناس',
  'أغادير',
  'وجدة',
  'القنيطرة',
  'تطوان',
  'آسفي',
  'المحمدية',
  'الجديدة',
  'بني ملال',
  'الناظور',
  'خريبكة',
  'سطات',
  'العرائش',
  'القصر الكبير',
  'تازة',
  'برشيد',
  'انزكان',
  'ورزازات',
  'العيون',
  'الداخلة',
  'الحسيمة',
  'إفران',
  'شفشاون',
  'أخرى',
] as const;

export const CITY_OPTIONS: string[] = [...MOROCCO_CITIES];

export function calcShippingFee(subtotalMad: number): number {
  if (subtotalMad <= 0) return 0;
  return subtotalMad >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE_MAD;
}

export function calcOrderTotal(subtotalMad: number): {
  subtotal: number;
  shipping: number;
  total: number;
  freeShipping: boolean;
  remainingForFree: number;
} {
  const shipping = calcShippingFee(subtotalMad);
  return {
    subtotal: subtotalMad,
    shipping,
    total: subtotalMad + shipping,
    freeShipping: shipping === 0 && subtotalMad > 0,
    remainingForFree: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotalMad),
  };
}
