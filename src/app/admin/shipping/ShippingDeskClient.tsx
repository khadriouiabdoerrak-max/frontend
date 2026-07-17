'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Download,
  Lock,
  LogOut,
  Package,
  RefreshCw,
  RotateCcw,
  Truck,
} from 'lucide-react';
import {
  ADMIN_TOKEN_KEY,
  COURIER_PREF_KEY,
  AdminOrder,
  buildCourierCopyLine,
  copyText,
  fetchAdminOrders,
  formatAdminDate,
  patchAdminOrder,
  shipAdminOrder,
} from '@/lib/admin';

const COURIERS = [
  { id: 'generic', label: 'عام' },
  { id: 'cathedis', label: 'Cathedis' },
  { id: 'ozone', label: 'Ozone Express' },
];

export default function ShippingDeskClient() {
  const [token, setToken] = useState('');
  const [input, setInput] = useState('');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [courier, setCourier] = useState('generic');
  const [trackingDraft, setTrackingDraft] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const loadOrders = useCallback(async (secret: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminOrders(secret);
      setOrders(data.orders || []);
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
    const pref = localStorage.getItem(COURIER_PREF_KEY);
    if (pref) setCourier(pref);
    if (saved) void loadOrders(saved);
    else setBooting(false);
  }, [loadOrders]);

  const shipQueue = useMemo(
    () =>
      orders.filter((o) =>
        ['CONFIRMED', 'READY_TO_SHIP', 'SHIPPED'].includes(o.status),
      ),
    [orders],
  );

  const toShip = shipQueue.filter((o) =>
    ['CONFIRMED', 'READY_TO_SHIP'].includes(o.status),
  );
  const inTransit = shipQueue.filter((o) => o.status === 'SHIPPED');

  const logout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken('');
    setOrders([]);
    setInput('');
  };

  const setCourierPref = (id: string) => {
    setCourier(id);
    localStorage.setItem(COURIER_PREF_KEY, id);
  };

  const onCopy = async (o: AdminOrder) => {
    await copyText(buildCourierCopyLine(o));
    setCopied(o.order_number);
    setTimeout(() => setCopied(null), 1500);
  };

  const markReady = async (orderNumber: string) => {
    if (!token) return;
    setBusy(orderNumber);
    try {
      const data = await patchAdminOrder(token, orderNumber, {
        status: 'READY_TO_SHIP',
        courier_name: courier,
      });
      setOrders((prev) =>
        prev.map((o) => (o.order_number === orderNumber ? { ...o, ...data } : o)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ');
    } finally {
      setBusy(null);
    }
  };

  const doShip = async (o: AdminOrder, withProvider: boolean) => {
    if (!token) return;
    setBusy(o.order_number);
    setError('');
    try {
      const data = await shipAdminOrder(token, o.order_number, {
        courier_name: courier,
        tracking_number: trackingDraft[o.order_number] || o.tracking_number || '',
        create_with_provider: withProvider,
      });
      setOrders((prev) =>
        prev.map((x) => (x.order_number === o.order_number ? { ...x, ...data } : x)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ');
    } finally {
      setBusy(null);
    }
  };

  const markOutcome = async (orderNumber: string, status: 'DELIVERED' | 'RETURNED') => {
    if (!token) return;
    setBusy(orderNumber);
    try {
      const data = await patchAdminOrder(token, orderNumber, { status });
      setOrders((prev) =>
        prev.map((o) => (o.order_number === orderNumber ? { ...o, ...data } : o)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ');
    } finally {
      setBusy(null);
    }
  };

  const downloadCourierCsv = () => {
    if (!token) return;
    const qs = new URLSearchParams({
      token,
      template: courier,
      status: 'CONFIRMED,READY_TO_SHIP',
    });
    window.location.href = `/api/admin/orders/export/courier?${qs}`;
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
            <h1 className="text-lg font-bold">مكتب الشحن</h1>
          </div>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="رمز الدخول"
            className="w-full p-3.5 border border-champagne/50 rounded-btn bg-white text-cocoa text-center"
            autoFocus
          />
          {error ? <p className="text-sm text-error text-center">{error}</p> : null}
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-full bg-cocoa text-ivory py-3 font-bold rounded-btn disabled:opacity-60"
          >
            دخول
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-3 py-6 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-cocoa">مكتب الشحن</h1>
            <p className="text-sm text-muted-brown">
              {toShip.length} جاهزين · {inTransit.length} فالتوصيل
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/confirm"
              className="px-3 py-2 rounded-btn border border-champagne/50 text-sm text-cocoa hover:bg-ivory"
            >
              التأكيد
            </Link>
            <Link
              href="/admin/sales"
              className="px-3 py-2 rounded-btn border border-champagne/50 text-sm text-cocoa hover:bg-ivory"
            >
              المراقبة
            </Link>
            <button
              type="button"
              onClick={() => void loadOrders(token)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn border border-champagne/50 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn border border-champagne/50 text-sm text-muted-brown"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-champagne/40 bg-ivory p-3">
          <span className="text-sm text-muted-brown">شركة التوصيل:</span>
          {COURIERS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCourierPref(c.id)}
              className={`px-3 py-1.5 rounded-btn text-sm border ${
                courier === c.id
                  ? 'bg-cocoa text-ivory border-cocoa'
                  : 'border-champagne/50 text-cocoa'
              }`}
            >
              {c.label}
            </button>
          ))}
          <button
            type="button"
            onClick={downloadCourierCsv}
            className="inline-flex items-center gap-1.5 ms-auto px-3 py-2 rounded-btn bg-cocoa text-ivory text-sm font-bold"
          >
            <Download className="w-4 h-4" />
            تصدير CSV للشركة
          </button>
        </div>

        {error ? (
          <p className="text-sm text-error bg-error/10 rounded-btn px-3 py-2">{error}</p>
        ) : null}

        <section className="space-y-3">
          <h2 className="font-bold text-cocoa flex items-center gap-2">
            <Package className="w-4 h-4" />
            للطرد / الإرسال
          </h2>
          {toShip.length === 0 ? (
            <p className="text-sm text-muted-brown bg-ivory border border-champagne/40 rounded-xl p-6 text-center">
              ما كاين حتى طلب مؤكّد دابا. أكّدي من مكتب التأكيد أولاً.
            </p>
          ) : (
            toShip.map((o) => {
              const isBusy = busy === o.order_number;
              return (
                <article
                  key={o.order_number}
                  className="rounded-xl border border-champagne/40 bg-ivory p-4 space-y-3"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs text-muted-brown">
                        {o.order_number} · {formatAdminDate(o.created_at)}
                      </p>
                      <h3 className="font-bold text-cocoa text-lg">
                        {o.customer_name}
                      </h3>
                      <p className="text-sm text-muted-brown">
                        {o.city} — {o.address}
                      </p>
                      <p className="text-sm mt-1">{o.products}</p>
                      <p className="font-bold">{o.total_amount} DH COD</p>
                    </div>
                    <span className="text-xs px-2 py-1 h-fit rounded-btn bg-background">
                      {o.status_label}
                    </span>
                  </div>

                  <input
                    value={trackingDraft[o.order_number] ?? o.tracking_number ?? ''}
                    onChange={(e) =>
                      setTrackingDraft((prev) => ({
                        ...prev,
                        [o.order_number]: e.target.value,
                      }))
                    }
                    placeholder="رقم التتبع (اختياري)"
                    className="w-full p-2.5 border border-champagne/50 rounded-btn text-sm text-cocoa"
                  />

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void onCopy(o)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn border border-champagne/50 text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      {copied === o.order_number ? 'تم النسخ' : 'نسخ للشركة'}
                    </button>
                    {o.status === 'CONFIRMED' ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void markReady(o.order_number)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn border border-champagne/50 text-sm"
                      >
                        <Package className="w-4 h-4" />
                        جهّز للشحن
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void doShip(o, false)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn bg-cocoa text-ivory text-sm font-bold"
                    >
                      <Truck className="w-4 h-4" />
                      تم الإرسال
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void doShip(o, true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn border border-cocoa text-cocoa text-sm font-bold"
                    >
                      أرسل عبر المزود
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>

        <section className="space-y-3 pt-2">
          <h2 className="font-bold text-cocoa flex items-center gap-2">
            <Truck className="w-4 h-4" />
            فالتوصيل
          </h2>
          {inTransit.length === 0 ? (
            <p className="text-sm text-muted-brown">ما كاين حتى طرد فالتوصيل.</p>
          ) : (
            inTransit.map((o) => {
              const isBusy = busy === o.order_number;
              return (
                <article
                  key={o.order_number}
                  className="rounded-xl border border-champagne/40 bg-ivory p-4 space-y-2"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs text-muted-brown">
                        {o.order_number}
                        {o.tracking_number ? ` · تتبع: ${o.tracking_number}` : ''}
                        {o.courier_name ? ` · ${o.courier_name}` : ''}
                      </p>
                      <h3 className="font-bold text-cocoa">{o.customer_name}</h3>
                      <p className="text-sm text-muted-brown">
                        {o.city} · {o.phone} · {o.total_amount} DH
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void markOutcome(o.order_number, 'DELIVERED')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn bg-emerald-700 text-white text-sm font-bold"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      تم التسليم
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void markOutcome(o.order_number, 'RETURNED')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn border border-error text-error text-sm font-bold"
                    >
                      <RotateCcw className="w-4 h-4" />
                      مرتجع
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
