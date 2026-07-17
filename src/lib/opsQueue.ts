import type { AdminOrder } from '@/lib/admin';

const OPEN_CONFIRM = new Set([
  'PENDING_CONFIRMATION',
  'APPEL_1',
  'APPEL_2',
  'APPEL_3',
  'NO_ANSWER',
  'REPORTE',
  'CONFIRMED',
  'READY_TO_SHIP',
]);

export function nextAppelStatus(current: string): 'APPEL_1' | 'APPEL_2' | 'APPEL_3' {
  if (current === 'APPEL_1' || current === 'NO_ANSWER') return 'APPEL_2';
  if (current === 'APPEL_2') return 'APPEL_3';
  if (current === 'APPEL_3') return 'APPEL_3';
  return 'APPEL_1';
}

export function isReporteDue(o: AdminOrder): boolean {
  if (o.status !== 'REPORTE' || !o.follow_up_at) return false;
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return new Date(o.follow_up_at).getTime() <= end.getTime();
}

/** طابور الاتصال اليوم: انتظار + محاولات + مؤجّل حان وقته */
export function isCallTodayQueue(o: AdminOrder): boolean {
  if (
    [
      'PENDING_CONFIRMATION',
      'APPEL_1',
      'APPEL_2',
      'APPEL_3',
      'NO_ANSWER',
    ].includes(o.status)
  ) {
    return true;
  }
  return isReporteDue(o);
}

export function phoneRiskInfo(orders: AdminOrder[], phone: string, excludeId?: string) {
  const same = orders.filter(
    (o) => o.phone === phone && o.order_number !== excludeId,
  );
  const cancelled = same.filter((o) => o.status === 'CANCELLED').length;
  const returned = same.filter((o) => o.status === 'RETURNED').length;
  const openDupes = same.filter((o) => OPEN_CONFIRM.has(o.status));
  return {
    cancelled,
    returned,
    openDupes,
    risky: cancelled + returned >= 2 || openDupes.length > 0,
    duplicate: openDupes.length > 0,
  };
}

export function todayConfirmedForCourier(orders: AdminOrder[]): AdminOrder[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return orders.filter((o) => {
    if (o.status !== 'CONFIRMED' && o.status !== 'READY_TO_SHIP') return false;
    const t = o.confirmed_at || o.created_at;
    return new Date(t).getTime() >= start.getTime();
  });
}

export function buildCourierBatchText(orders: AdminOrder[]): string {
  return orders
    .map(
      (o, i) =>
        `${i + 1}. ${o.order_number} | ${o.customer_name} | ${o.phone} | ${o.city} | ${o.address} | ${o.products} | ${o.total_amount} DH`,
    )
    .join('\n');
}

export function printCourierList(orders: AdminOrder[]) {
  const rows = orders
    .map(
      (o) =>
        `<tr><td>${o.order_number}</td><td>${o.customer_name}</td><td dir="ltr">${o.phone}</td><td>${o.city}</td><td>${o.address}</td><td>${o.products}</td><td>${o.total_amount}</td></tr>`,
    )
    .join('');
  const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><title>Expédition</title>
  <style>body{font-family:sans-serif;padding:16px}table{border-collapse:collapse;width:100%;font-size:12px}
  th,td{border:1px solid #333;padding:6px;text-align:right}th{background:#eee}</style></head><body>
  <h1>قائمة الشحن — ${new Date().toLocaleDateString('ar-MA')}</h1>
  <table><thead><tr><th>N°</th><th>Client</th><th>Tél</th><th>Ville</th><th>Adresse</th><th>Produits</th><th>COD</th></tr></thead>
  <tbody>${rows || '<tr><td colspan="7">لا طلبات</td></tr>'}</tbody></table>
  <script>window.onload=()=>window.print()</script></body></html>`;
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
}
