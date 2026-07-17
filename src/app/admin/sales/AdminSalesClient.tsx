'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Lock, LogOut, PhoneCall, RefreshCw, Truck } from 'lucide-react';
import {
  ADMIN_TOKEN_KEY,
  AdminOrder,
  AdminStats,
  fetchAdminOrders,
  formatAdminDate,
} from '@/lib/admin';

type StatusFilter = 'ALL' | string;

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'ALL', label: 'الكل' },
  { id: 'PENDING_CONFIRMATION', label: 'قيد التأكيد' },
  { id: 'NO_ANSWER', label: 'ما جاوبش' },
  { id: 'CONFIRMED', label: 'مؤكد' },
  { id: 'READY_TO_SHIP', label: 'جاهز للشحن' },
  { id: 'SHIPPED', label: 'مرسل' },
  { id: 'DELIVERED', label: 'مسلم' },
  { id: 'RETURNED', label: 'مرتجع' },
  { id: 'CANCELLED', label: 'ملغى' },
];

export default function AdminSalesClient() {
  const [token, setToken] = useState('');
  const [input, setInput] = useState('');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [cityQuery, setCityQuery] = useState('');

  const loadOrders = useCallback(async (secret: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminOrders(secret);
      setOrders(data.orders || []);
      setStats(data.stats || null);
      setToken(secret);
      sessionStorage.setItem(ADMIN_TOKEN_KEY, secret);
    } catch (err) {
      setOrders([]);
      setToken('');
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      setError(err instanceof Error ? err.message : 'خطأ غير متوقع');
    } finally {
      setLoading(false);
      setBooting(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (saved) void loadOrders(saved);
    else setBooting(false);
  }, [loadOrders]);

  const filtered = useMemo(() => {
    let list = orders;
    if (filter !== 'ALL') list = list.filter((o) => o.status === filter);
    if (cityQuery.trim()) {
      const q = cityQuery.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.city.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.order_number.toLowerCase().includes(q) ||
          o.phone.includes(q),
      );
    }
    return list;
  }, [orders, filter, cityQuery]);

  const deliveryRate =
    stats && stats.delivered + stats.returned > 0
      ? Math.round(
          (stats.delivered / (stats.delivered + stats.returned)) * 100,
        )
      : null;

  const logout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken('');
    setOrders([]);
    setInput('');
  };

  const downloadCsv = () => {
    if (!token) return;
    window.location.href = `/api/admin/orders/csv?token=${encodeURIComponent(token)}`;
  };

  if (booting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-brown">
        جاري التحميل…
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void loadOrders(input.trim());
          }}
          className="w-full max-w-sm bg-ivory border border-champagne/40 rounded-2xl p-6 space-y-4 shadow-sm"
        >
          <div className="flex items-center gap-2 text-cocoa justify-center">
            <Lock className="w-5 h-5" />
            <h1 className="text-lg font-bold">مبيعات تاجكِ</h1>
          </div>
          <p className="text-sm text-muted-brown text-center">
            أدخلي رمز الدخول باش تشوفي الطلبات وتحمّلي Excel.
          </p>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="رمز الدخول"
            className="w-full p-3.5 border border-champagne/50 rounded-btn bg-white text-cocoa text-center"
            autoFocus
          />
          {error ? (
            <p className="text-sm text-error text-center">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-full bg-cocoa text-ivory py-3 font-bold rounded-btn hover:bg-espresso disabled:opacity-60"
          >
            {loading ? 'جاري الدخول…' : 'دخول'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-3 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-cocoa">لوحة المراقبة</h1>
            <p className="text-sm text-muted-brown">
              {filtered.length} معروض · {stats?.total ?? orders.length} إجمالي
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/confirm"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn border border-champagne/50 text-sm text-cocoa hover:bg-ivory"
            >
              <PhoneCall className="w-4 h-4" />
              التأكيد
            </Link>
            <Link
              href="/admin/shipping"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn border border-champagne/50 text-sm text-cocoa hover:bg-ivory"
            >
              <Truck className="w-4 h-4" />
              الشحن
            </Link>
            <button
              type="button"
              onClick={() => void loadOrders(token)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn border border-champagne/50 text-sm text-cocoa hover:bg-ivory"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </button>
            <button
              type="button"
              onClick={downloadCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn bg-cocoa text-ivory text-sm font-bold hover:bg-espresso"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn border border-champagne/50 text-sm text-muted-brown hover:bg-ivory"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </button>
          </div>
        </div>

        {stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
            {[
              { label: 'اليوم', value: stats.today },
              { label: 'قيد التأكيد', value: stats.pending },
              { label: 'مؤكد', value: stats.confirmed },
              { label: 'جاهز للشحن', value: stats.ready_to_ship },
              { label: 'مرسل', value: stats.shipped },
              { label: 'مسلم', value: stats.delivered },
              { label: 'مرتجع', value: stats.returned },
              { label: 'ملغى', value: stats.cancelled },
              {
                label: 'نسبة التسليم',
                value: deliveryRate != null ? `${deliveryRate}%` : '—',
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-champagne/40 bg-ivory px-3 py-3 text-center"
              >
                <p className="text-xs text-muted-brown">{card.label}</p>
                <p className="text-lg font-bold text-cocoa">{card.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 items-center">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-btn text-sm border ${
                filter === f.id
                  ? 'bg-cocoa text-ivory border-cocoa'
                  : 'border-champagne/50 text-cocoa hover:bg-ivory'
              }`}
            >
              {f.label}
            </button>
          ))}
          <input
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            placeholder="بحث: مدينة / اسم / هاتف / رقم"
            className="ms-auto min-w-[200px] flex-1 max-w-xs p-2 border border-champagne/50 rounded-btn text-sm"
          />
        </div>

        {error ? (
          <p className="text-sm text-error bg-error/10 rounded-btn px-3 py-2">{error}</p>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-champagne/40 bg-ivory">
          <table className="w-full text-sm text-right min-w-[1000px]">
            <thead className="bg-background text-muted-brown">
              <tr>
                <th className="p-3 font-medium">التاريخ</th>
                <th className="p-3 font-medium">الطلب</th>
                <th className="p-3 font-medium">الزبون</th>
                <th className="p-3 font-medium">الهاتف</th>
                <th className="p-3 font-medium">المدينة</th>
                <th className="p-3 font-medium">المنتجات</th>
                <th className="p-3 font-medium">المجموع</th>
                <th className="p-3 font-medium">التتبع</th>
                <th className="p-3 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-brown">
                    ما كاين حتى طلب.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr
                    key={o.order_number}
                    className="border-t border-champagne/30 align-top"
                  >
                    <td className="p-3 whitespace-nowrap text-muted-brown">
                      {formatAdminDate(o.created_at)}
                    </td>
                    <td className="p-3 font-mono text-xs text-cocoa">
                      {o.order_number}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-cocoa">{o.customer_name}</div>
                      <div className="text-xs text-muted-brown max-w-[180px] truncate">
                        {o.address}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap dir-ltr text-left">{o.phone}</td>
                    <td className="p-3">{o.city}</td>
                    <td className="p-3 max-w-[200px]">{o.products}</td>
                    <td className="p-3 font-bold text-cocoa whitespace-nowrap">
                      {o.total_amount} DH
                    </td>
                    <td className="p-3 text-xs">
                      {o.tracking_number || '—'}
                      {o.courier_name ? (
                        <div className="text-muted-brown">{o.courier_name}</div>
                      ) : null}
                    </td>
                    <td className="p-3 whitespace-nowrap">{o.status_label}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
