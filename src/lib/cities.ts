/** Cities stored exactly as OzonExpress expects (French NAME). */
export type CheckoutCity = {
  value: string;
  label: string;
  group?: string;
};

const CASA = 'الدار البيضاء';

/** All Casablanca districts + major Morocco cities for checkout / ops. */
export const CHECKOUT_CITIES: CheckoutCity[] = [
  { value: 'Casablanca – Centre Ville', label: 'وسط المدينة', group: CASA },
  { value: 'Casablanca – Maarif', label: 'المعاريف', group: CASA },
  { value: 'Casablanca – Ain Diab', label: 'عين الذئاب', group: CASA },
  { value: 'Casablanca – Anfa', label: 'أنفا', group: CASA },
  { value: 'Casablanca – Bourgogne', label: 'بوركون', group: CASA },
  { value: 'Casablanca – Hay Hassani', label: 'الحي الحسني', group: CASA },
  { value: 'Casablanca – Bernoussi', label: 'البرنوصي', group: CASA },
  { value: 'Casablanca – Ain Sebaa', label: 'عين السبع', group: CASA },
  { value: 'Casablanca – Sidi Moumen', label: 'سيدي مومن', group: CASA },
  { value: 'Casablanca – Oulfa', label: 'الولفة', group: CASA },
  { value: 'Casablanca – Ain Chock', label: 'عين الشق', group: CASA },
  { value: 'Casablanca – Californie', label: 'كاليفورنيا', group: CASA },
  { value: 'Casablanca – Sidi Maarouf', label: 'سيدي معروف', group: CASA },
  { value: 'Casablanca – Lissasfa', label: 'ليساسفة', group: CASA },
  { value: 'Casablanca – Moulay Rachid', label: 'مولاي رشيد', group: CASA },
  { value: 'Casablanca – Sbata', label: 'سباتة', group: CASA },
  { value: 'Casablanca – Hay Mohammadi', label: 'الحي المحمدي', group: CASA },
  { value: 'Casablanca – Roches Noires', label: 'روش نوار', group: CASA },
  { value: 'Casablanca – Derb Omar', label: 'درب عمر', group: CASA },
  { value: 'Casablanca – 2 Mars', label: '2 مارس', group: CASA },
  { value: 'Rabat', label: 'الرباط', group: 'مدن أخرى' },
  { value: 'SALE', label: 'سلا', group: 'مدن أخرى' },
  { value: 'TEMARA', label: 'تمارة', group: 'مدن أخرى' },
  { value: 'KENITRA VILLE', label: 'القنيطرة', group: 'مدن أخرى' },
  { value: 'Mohammedia', label: 'المحمدية', group: 'مدن أخرى' },
  { value: 'Marrakech', label: 'مراكش', group: 'مدن أخرى' },
  { value: 'Fes', label: 'فاس', group: 'مدن أخرى' },
  { value: 'Meknes', label: 'مكناس', group: 'مدن أخرى' },
  { value: 'Tanger', label: 'طنجة', group: 'مدن أخرى' },
  { value: 'Tetouan', label: 'تطوان', group: 'مدن أخرى' },
  { value: 'Agadir', label: 'أكادير', group: 'مدن أخرى' },
  { value: 'Ait Melloul', label: 'أيت ملول', group: 'مدن أخرى' },
  { value: 'Oujda', label: 'وجدة', group: 'مدن أخرى' },
  { value: 'Nador', label: 'الناظور', group: 'مدن أخرى' },
  { value: 'El Jadida', label: 'الجديدة', group: 'مدن أخرى' },
  { value: 'Safi', label: 'آسفي', group: 'مدن أخرى' },
  { value: 'Khouribga', label: 'خريبكة', group: 'مدن أخرى' },
  { value: 'Beni Mellal', label: 'بني ملال', group: 'مدن أخرى' },
  { value: 'BERRECHID VILLE', label: 'برشيد', group: 'مدن أخرى' },
  { value: 'Settate', label: 'سطات', group: 'مدن أخرى' },
  { value: 'Larache', label: 'العرائش', group: 'مدن أخرى' },
  { value: 'Khemisset ville', label: 'الخميسات', group: 'مدن أخرى' },
  { value: 'TAZA-VILLE', label: 'تازة', group: 'مدن أخرى' },
  { value: 'ERRACHIDIA', label: 'الرشيدية', group: 'مدن أخرى' },
];

export function cityLabel(value: string): string {
  const hit = CHECKOUT_CITIES.find((c) => c.value === value);
  if (!hit) return value;
  return hit.group === CASA ? `${CASA} — ${hit.label}` : hit.label;
}

export function ozoneTrackingUrl(tracking: string): string {
  const tn = (tracking || '').trim();
  if (!tn || tn.startsWith('MAN-')) return '';
  return `https://ozonexpress.ma/#tracking`;
}

export const STALE_SHIP_DAYS = 5;
