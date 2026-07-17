export type AdminOrder = {
  order_number: string;
  created_at: string;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  products: string;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  status: string;
  status_label: string;
  notes?: string;
  cancel_reason?: string;
  tracking_number?: string;
  courier_name?: string;
  courier_status?: string;
  courier_synced_at?: string | null;
  follow_up_at?: string | null;
  status_changed_at?: string | null;
  days_open?: number;
  days_in_status?: number;
  confirmed_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  returned_at?: string | null;
};

export type AdminStats = {
  today: number;
  today_confirmed?: number;
  today_shipped?: number;
  today_delivered?: number;
  today_returned?: number;
  today_cancelled?: number;
  en_attente?: number;
  appel_1?: number;
  appel_2?: number;
  appel_3?: number;
  reporte?: number;
  reporte_due?: number;
  pending: number;
  confirmed: number;
  ready_to_ship: number;
  shipped: number;
  stale_shipped?: number;
  delivered: number;
  returned: number;
  cancelled: number;
  cancel_reasons?: Record<string, number>;
  total: number;
};

export function hasRealTracking(order?: {
  tracking_number?: string | null;
} | null): boolean {
  const t = (order?.tracking_number || '').trim();
  return Boolean(t) && !t.toUpperCase().startsWith('MAN-');
}

export const ADMIN_TOKEN_KEY = 'oxiprime-admin-token';
export const COURIER_PREF_KEY = 'oxiprime-default-courier';

export const CANCEL_REASONS = [
  'رفض الزبونة',
  'رقم غلط',
  'ثمن مرتفع',
  'طلب مكرر',
  'خارج منطقة التوصيل',
  'أخرى',
] as const;

export function formatAdminDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('ar-MA', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

/** Relative time in Darija-friendly Arabic, e.g. "قبل 12 د" */
export function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.max(0, Math.floor((Date.now() - then) / 60000));
  if (mins < 1) return 'دابا';
  if (mins < 60) return `قبل ${mins} د`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `قبل ${hours} س`;
  const days = Math.floor(hours / 24);
  return `قبل ${days} ي`;
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function copyText(text: string) {
  return navigator.clipboard.writeText(text);
}

export function buildCourierCopyLine(o: AdminOrder) {
  return [
    o.order_number,
    o.customer_name,
    o.phone,
    o.city,
    o.address,
    o.products,
    `${o.total_amount} DH`,
    o.notes || '',
  ].join(' | ');
}

export async function fetchAdminOrders(token: string, status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`/api/admin/orders${qs}`, {
    headers: { 'X-Admin-Token': token },
    cache: 'no-store',
  });
  const text = await res.text();
  let data: { detail?: string; total?: number; orders?: AdminOrder[]; stats?: AdminStats } = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      res.ok
        ? 'رد غير صالح من السيرفر'
        : `خطأ السيرفر (${res.status}) — عاودي Déployer للـ backend`,
    );
  }
  if (!res.ok) throw new Error(data?.detail || 'فشل التحميل');
  return data as {
    total: number;
    orders: AdminOrder[];
    stats?: AdminStats;
  };
}

export async function patchAdminOrder(
  token: string,
  orderNumber: string,
  body: Record<string, unknown>,
) {
  const res = await fetch(
    `/api/admin/orders/${encodeURIComponent(orderNumber)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': token,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || 'فشل تحديث الحالة');
  return data as AdminOrder;
}

export async function syncOzonExpress(token: string) {
  const res = await fetch('/api/admin/couriers/ozonexpress/sync', {
    method: 'POST',
    headers: { 'X-Admin-Token': token },
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || data?.message || 'فشل المزامنة');
  return data as {
    ok: boolean;
    message?: string;
    checked?: number;
    updated?: number;
  };
}

export async function shipAdminOrder(
  token: string,
  orderNumber: string,
  body: {
    courier_name?: string;
    tracking_number?: string;
    create_with_provider?: boolean;
    city?: string;
    address?: string;
  },
) {
  const res = await fetch(
    `/api/admin/orders/${encodeURIComponent(orderNumber)}/ship`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': token,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || 'فشل الشحن');
  return data as AdminOrder;
}
