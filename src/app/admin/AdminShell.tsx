'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  ADMIN_TOKEN_KEY,
  adminLogin,
  adminLogout,
  fetchAdminMetrics,
  fetchAdminOrderDetail,
  fetchAdminOrders,
  formatAdminDate,
  telHref,
  type AdminMetrics,
  type AdminOrder,
  type AdminOrderDetail,
} from '@/lib/admin';

const OpsDesk = dynamic(() => import('./OpsDesk'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[50dvh] flex items-center justify-center text-muted-brown">
      جاري فتح التشغيل…
    </div>
  ),
});

type Tab = 'dashboard' | 'orders' | 'ops' | 'ship';

function parseTab(raw: string | null): Tab {
  // Manager order browser (attractive preview)
  if (raw === 'preview' || raw === 'list' || raw === 'catalog') return 'orders';
  // OpsDesk owns board / orders / ship URL tabs
  if (raw === 'board' || raw === 'orders' || raw === 'ops' || raw === 'confirm')
    return 'ops';
  if (raw === 'ship' || raw === 'shipping') return 'ship';
  return 'dashboard';
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-champagne/40 bg-ivory p-5 shadow-card">
      <p className="text-xs font-medium text-muted-brown mb-2">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-cocoa tracking-tight">
        {value}
      </p>
      {hint ? (
        <p className="text-[11px] text-muted-brown mt-2 leading-relaxed">{hint}</p>
      ) : null}
    </div>
  );
}

function DayBars({
  days,
}: {
  days: { date: string; clicks: number; orders: number }[];
}) {
  const max = Math.max(1, ...days.map((d) => Math.max(d.clicks, d.orders)));
  const slice = days.slice(-14);
  return (
    <div className="rounded-2xl border border-champagne/40 bg-ivory p-5 shadow-card">
      <p className="text-sm font-bold text-cocoa mb-4">آخر 14 يوم — نقرات / طلبات</p>
      <div className="flex items-end gap-1.5 h-36">
        {slice.map((d) => (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <div className="w-full flex items-end justify-center gap-0.5 h-28">
              <div
                className="w-[40%] rounded-t bg-gold/70"
                style={{ height: `${(d.clicks / max) * 100}%`, minHeight: d.clicks ? 4 : 0 }}
                title={`نقرات ${d.clicks}`}
              />
              <div
                className="w-[40%] rounded-t bg-cocoa"
                style={{ height: `${(d.orders / max) * 100}%`, minHeight: d.orders ? 4 : 0 }}
                title={`طلبات ${d.orders}`}
              />
            </div>
            <span className="text-[9px] text-muted-brown truncate w-full text-center">
              {d.date.slice(8)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-3 text-[11px] text-muted-brown">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-gold/70" /> نقرات صالحة
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-cocoa" /> طلبات
        </span>
      </div>
    </div>
  );
}

export default function AdminShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get('tab'));

  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [from, setFrom] = useState(daysAgoISO(29));
  const [to, setTo] = useState(todayISO());
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selected, setSelected] = useState<AdminOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [query, setQuery] = useState('');

  const setTab = (next: Tab) => {
    const q =
      next === 'orders'
        ? 'preview'
        : next === 'ops'
          ? 'board'
          : next === 'ship'
            ? 'ship'
            : 'dashboard';
    router.replace(`/admin?tab=${q}`, { scroll: false });
  };

  const bootstrap = useCallback(async (secret: string) => {
    setLoading(true);
    setError('');
    try {
      // Validate token by loading orders
      await fetchAdminOrders(secret);
      setToken(secret);
      sessionStorage.setItem(ADMIN_TOKEN_KEY, secret);
    } catch (err) {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      setToken('');
      setError(err instanceof Error ? err.message : 'جلسة غير صالحة');
    } finally {
      setLoading(false);
      setBooting(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (saved) void bootstrap(saved);
    else setBooting(false);
  }, [bootstrap]);

  const loadMetrics = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchAdminMetrics(token, { from, to });
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل المقاييس');
    }
  }, [token, from, to]);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchAdminOrders(token);
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الطلبات');
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (tab === 'dashboard') void loadMetrics();
    if (tab === 'orders') void loadOrders();
  }, [token, tab, loadMetrics, loadOrders]);

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await adminLogin(username.trim(), password);
      sessionStorage.setItem(ADMIN_TOKEN_KEY, res.token);
      setToken(res.token);
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const onLogout = async () => {
    if (token) await adminLogout(token);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken('');
    setMetrics(null);
    setOrders([]);
    setSelected(null);
  };

  const openOrder = async (orderNumber: string) => {
    if (!token) return;
    setDetailLoading(true);
    try {
      const detail = await fetchAdminOrderDetail(token, orderNumber);
      setSelected(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل المعاينة');
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.city.toLowerCase().includes(q),
    );
  }, [orders, query]);

  if (booting) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center text-muted-brown">
        جاري الفتح…
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center px-4">
        <form
          onSubmit={onLogin}
          className="w-full max-w-sm bg-ivory border border-champagne/40 rounded-2xl p-7 space-y-4 shadow-card"
        >
          <div className="text-center space-y-1">
            <p className="text-xs font-bold tracking-wide text-gold">تاجكِ</p>
            <h1 className="text-xl font-bold text-cocoa">لوحة تحكم المدير</h1>
            <p className="text-sm text-muted-brown">مقاييس · طلبات · تشغيل</p>
          </div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="اسم المستخدم"
            autoComplete="username"
            className="w-full p-3.5 rounded-xl border border-champagne/50 bg-background text-cocoa"
            autoFocus
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            autoComplete="current-password"
            className="w-full p-3.5 rounded-xl border border-champagne/50 bg-background text-cocoa"
          />
          {error ? (
            <p className="text-sm text-error text-center">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className="w-full py-3.5 rounded-xl bg-cocoa text-ivory font-bold disabled:opacity-50"
          >
            دخول
          </button>
        </form>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: 'لوحة' },
    { id: 'orders', label: 'طلبات' },
    { id: 'ops', label: 'تشغيل' },
    { id: 'ship', label: 'شحن' },
  ];

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-30 border-b border-champagne/40 bg-ivory/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-gold">تاجكِ</p>
            <h1 className="text-lg font-bold text-cocoa">لوحة تحكم المدير</h1>
          </div>
          <nav className="flex flex-wrap gap-1.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-colors ${
                  tab === t.id
                    ? 'bg-cocoa text-ivory'
                    : 'bg-background text-secondary hover:text-cocoa'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="text-xs font-medium text-muted-brown hover:text-cocoa"
          >
            خروج
          </button>
        </div>
      </header>

      {error && tab !== 'ops' && tab !== 'ship' ? (
        <p className="max-w-6xl mx-auto px-4 pt-3 text-sm text-error">{error}</p>
      ) : null}

      {(tab === 'ops' || tab === 'ship') && (
        <div className="border-t border-champagne/30">
          <OpsDesk />
        </div>
      )}

      {tab === 'dashboard' && (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm space-y-1">
              <span className="text-muted-brown text-xs">من</span>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="block rounded-xl border border-champagne/50 bg-ivory px-3 py-2 text-cocoa"
              />
            </label>
            <label className="text-sm space-y-1">
              <span className="text-muted-brown text-xs">إلى</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="block rounded-xl border border-champagne/50 bg-ivory px-3 py-2 text-cocoa"
              />
            </label>
            <button
              type="button"
              onClick={() => void loadMetrics()}
              className="px-4 py-2.5 rounded-xl bg-cocoa text-ivory text-sm font-bold"
            >
              تحديث
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              label="نقرات صالحة (المغرب)"
              value={String(metrics?.clicks_counted ?? '—')}
              hint="MA فقط · بدون VPN"
            />
            <MetricCard
              label="الطلبات"
              value={String(metrics?.orders ?? '—')}
            />
            <MetricCard
              label="معدل التحويل"
              value={
                metrics ? `${metrics.conversion_rate.toFixed(1)}%` : '—'
              }
              hint="طلبات ÷ نقرات صالحة"
            />
            <MetricCard
              label="الإيراد (بدون ملغى)"
              value={
                metrics
                  ? `${Math.round(metrics.revenue).toLocaleString('fr-MA')} DH`
                  : '—'
              }
            />
          </div>

          {metrics ? <DayBars days={metrics.by_day} /> : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-champagne/40 bg-ivory p-5 shadow-card">
              <p className="text-sm font-bold text-cocoa mb-3">أهم المدن</p>
              <ul className="space-y-2 text-sm">
                {(metrics?.top_cities || []).map((c) => (
                  <li
                    key={c.city}
                    className="flex justify-between border-b border-champagne/20 pb-2"
                  >
                    <span className="text-cocoa">{c.city}</span>
                    <span className="text-muted-brown font-bold">{c.count}</span>
                  </li>
                ))}
                {!metrics?.top_cities?.length ? (
                  <li className="text-muted-brown text-xs">لا بيانات بعد</li>
                ) : null}
              </ul>
            </div>
            <div className="rounded-2xl border border-champagne/40 bg-ivory p-5 shadow-card">
              <p className="text-sm font-bold text-cocoa mb-3">أكثر المنتجات</p>
              <ul className="space-y-2 text-sm">
                {(metrics?.top_products || []).map((p) => (
                  <li
                    key={p.name}
                    className="flex justify-between gap-3 border-b border-champagne/20 pb-2"
                  >
                    <span className="text-cocoa truncate">{p.name}</span>
                    <span className="text-muted-brown font-bold shrink-0">
                      {p.quantity}
                    </span>
                  </li>
                ))}
                {!metrics?.top_products?.length ? (
                  <li className="text-muted-brown text-xs">لا بيانات بعد</li>
                ) : null}
              </ul>
            </div>
          </div>

          <p className="text-[11px] text-muted-brown">
            خام: {metrics?.clicks_raw ?? 0} حدث · محسوب:{' '}
            {metrics?.clicks_counted ?? 0} (IP مغربي صالح)
          </p>
        </div>
      )}

      {tab === 'orders' && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="بحث: رقم · اسم · هاتف · مدينة"
              className="flex-1 min-w-[200px] rounded-xl border border-champagne/50 bg-ivory px-4 py-2.5 text-sm text-cocoa"
            />
            <button
              type="button"
              onClick={() => void loadOrders()}
              className="px-4 py-2.5 rounded-xl bg-cocoa text-ivory text-sm font-bold"
            >
              تحديث
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 space-y-2 max-h-[70dvh] overflow-y-auto pe-1">
              {filteredOrders.map((o) => (
                <button
                  key={o.order_number}
                  type="button"
                  onClick={() => void openOrder(o.order_number)}
                  className={`w-full text-right rounded-2xl border p-4 transition-colors ${
                    selected?.order_number === o.order_number
                      ? 'border-gold bg-gold/10'
                      : 'border-champagne/40 bg-ivory hover:border-gold/40'
                  }`}
                >
                  <div className="flex justify-between gap-2 mb-1">
                    <span className="font-bold text-cocoa text-sm">
                      {o.order_number}
                    </span>
                    <span className="text-[11px] font-bold text-gold">
                      {o.status_label}
                    </span>
                  </div>
                  <p className="text-sm text-cocoa">{o.customer_name}</p>
                  <p className="text-xs text-muted-brown mt-0.5">
                    {o.city} · {o.total_amount} DH
                  </p>
                </button>
              ))}
              {!filteredOrders.length ? (
                <p className="text-sm text-muted-brown py-8 text-center">
                  لا طلبات
                </p>
              ) : null}
            </div>

            <div className="lg:col-span-3">
              {detailLoading ? (
                <div className="rounded-2xl border border-champagne/40 bg-ivory p-10 text-center text-muted-brown">
                  جاري المعاينة…
                </div>
              ) : selected ? (
                <OrderPreview order={selected} />
              ) : (
                <div className="rounded-2xl border border-dashed border-champagne/50 bg-ivory/60 p-12 text-center text-muted-brown text-sm">
                  اختاري طلباً من القائمة لمعاينة جذابة
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderPreview({ order }: { order: AdminOrderDetail }) {
  const items = order.items || [];
  const audit = order.audit || [];

  return (
    <article className="rounded-2xl border border-champagne/40 bg-gradient-to-b from-[#FBF7F0] to-ivory shadow-card overflow-hidden">
      <div className="bg-cocoa text-ivory px-5 py-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] text-champagne/80">طلب</p>
          <h2 className="text-xl font-bold tracking-wide">{order.order_number}</h2>
        </div>
        <span className="rounded-full bg-gold/20 text-champagne px-3 py-1 text-xs font-bold">
          {order.status_label}
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-background/80 border border-champagne/30 p-4">
            <p className="text-[11px] text-muted-brown mb-1">الزبونة</p>
            <p className="font-bold text-cocoa text-lg leading-snug">
              {order.customer_name}
            </p>
            <a
              href={telHref(order.phone)}
              className="text-sm text-gold font-medium mt-1 inline-block"
              dir="ltr"
            >
              {order.phone}
            </a>
            <p className="text-sm text-secondary mt-2">
              {order.city}
              <br />
              {order.address}
            </p>
          </div>
          <div className="rounded-xl bg-background/80 border border-champagne/30 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-brown">المجموع الفرعي</span>
              <span className="font-bold text-cocoa">{order.subtotal} DH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-brown">التوصيل</span>
              <span className="font-bold text-cocoa">{order.shipping_fee} DH</span>
            </div>
            <div className="flex justify-between text-base border-t border-champagne/30 pt-2">
              <span className="font-bold text-cocoa">الإجمالي</span>
              <span className="font-bold text-gold text-xl">
                {order.total_amount} DH
              </span>
            </div>
            <p className="text-[11px] text-muted-brown pt-1">
              {formatAdminDate(order.created_at)}
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-cocoa mb-3">المنتجات</h3>
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li
                key={`${item.name}-${i}`}
                className="flex justify-between gap-3 rounded-xl border border-champagne/30 bg-ivory px-4 py-3 text-sm"
              >
                <span className="text-cocoa">
                  <span className="font-bold">{item.quantity}×</span> {item.name}
                </span>
                <span className="text-muted-brown shrink-0">
                  {item.unit_price} DH
                </span>
              </li>
            ))}
            {!items.length ? (
              <li className="text-sm text-muted-brown">{order.products}</li>
            ) : null}
          </ul>
        </section>

        {(order.tracking_number || order.courier_name || order.notes) && (
          <section className="rounded-xl border border-champagne/30 bg-background/60 p-4 text-sm space-y-1">
            {order.courier_name ? (
              <p>
                <span className="text-muted-brown">الناقل: </span>
                <span className="text-cocoa font-medium">{order.courier_name}</span>
              </p>
            ) : null}
            {order.tracking_number ? (
              <p>
                <span className="text-muted-brown">التتبع: </span>
                <span className="text-cocoa font-mono" dir="ltr">
                  {order.tracking_number}
                </span>
              </p>
            ) : null}
            {order.notes ? (
              <p className="text-secondary pt-1">{order.notes}</p>
            ) : null}
          </section>
        )}

        {audit.length > 0 ? (
          <section>
            <h3 className="text-sm font-bold text-cocoa mb-3">سجل العمليات</h3>
            <ol className="relative border-s border-champagne/50 ms-2 space-y-3 ps-4">
              {audit.slice(0, 8).map((a, i) => (
                <li key={`${a.created_at}-${i}`} className="text-sm">
                  <span className="absolute -start-[5px] mt-1.5 w-2.5 h-2.5 rounded-full bg-gold" />
                  <p className="font-bold text-cocoa">{a.action}</p>
                  <p className="text-xs text-muted-brown">
                    {a.operator || '—'} · {formatAdminDate(a.created_at)}
                  </p>
                  {a.detail ? (
                    <p className="text-xs text-secondary mt-0.5">{a.detail}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>
    </article>
  );
}
