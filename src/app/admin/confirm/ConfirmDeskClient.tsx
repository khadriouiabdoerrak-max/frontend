'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  Lock,
  LogOut,
  MessageCircle,
  Phone,
  PhoneMissed,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  buildCallCenterConfirmMessage,
  customerWhatsAppHref,
} from '@/lib/whatsapp';

type AdminOrder = {
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
};

type StatusFilter =
  | 'ALL'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'NO_ANSWER'
  | 'CANCELLED';

const STORAGE_KEY = 'oxiprime-admin-token';

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'ALL', label: 'الكل' },
  { id: 'PENDING_CONFIRMATION', label: 'قيد التأكيد' },
  { id: 'NO_ANSWER', label: 'ما جاوبش' },
  { id: 'CONFIRMED', label: 'مؤكد' },
  { id: 'CANCELLED', label: 'ملغى' },
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('ar-MA', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function telHref(phone: string) {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return `tel:${cleaned}`;
}

export default function ConfirmDeskClient() {
  const [token, setToken] = useState('');
  const [input, setInput] = useState('');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('PENDING_CONFIRMATION');
  const [updating, setUpdating] = useState<string | null>(null);

  const loadOrders = useCallback(async (secret: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'X-Admin-Token': secret },
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || 'فشل التحميل');
      }
      setOrders(data.orders || []);
      setToken(secret);
      sessionStorage.setItem(STORAGE_KEY, secret);
    } catch (err) {
      setOrders([]);
      setToken('');
      sessionStorage.removeItem(STORAGE_KEY);
      setError(err instanceof Error ? err.message : 'خطأ غير متوقع');
    } finally {
      setLoading(false);
      setBooting(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      void loadOrders(saved);
    } else {
      setBooting(false);
    }
  }, [loadOrders]);

  const filtered = useMemo(() => {
    if (filter === 'ALL') return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const pendingCount = orders.filter(
    (o) => o.status === 'PENDING_CONFIRMATION' || o.status === 'NO_ANSWER',
  ).length;

  const updateStatus = async (
    orderNumber: string,
    status: string,
    notes?: string,
  ) => {
    if (!token) return;
    setUpdating(orderNumber);
    setError('');
    try {
      const res = await fetch(
        `/api/admin/orders/${encodeURIComponent(orderNumber)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': token,
          },
          body: JSON.stringify({ status, notes: notes ?? null }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || 'فشل تحديث الحالة');
      }
      setOrders((prev) =>
        prev.map((o) => (o.order_number === orderNumber ? { ...o, ...data } : o)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ غير متوقع');
    } finally {
      setUpdating(null);
    }
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setToken('');
    setOrders([]);
    setInput('');
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
            <h1 className="text-lg font-bold">تأكيد الطلبات</h1>
          </div>
          <p className="text-sm text-muted-brown text-center">
            أدخلي رمز الدخول باش تبداي التأكيد بالهاتف.
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
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-cocoa">مكان التأكيد</h1>
            <p className="text-sm text-muted-brown">
              {pendingCount} خاصهم اتصال · {filtered.length} معروض
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/sales"
              className="inline-flex items-center px-3 py-2 rounded-btn border border-champagne/50 text-sm text-cocoa hover:bg-ivory"
            >
              المبيعات
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
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn border border-champagne/50 text-sm text-muted-brown hover:bg-ivory"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-btn text-sm border transition-colors ${
                filter === f.id
                  ? 'bg-cocoa text-ivory border-cocoa'
                  : 'border-champagne/50 text-cocoa hover:bg-ivory'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error ? (
          <p className="text-sm text-error bg-error/10 rounded-btn px-3 py-2">{error}</p>
        ) : null}

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-champagne/40 bg-ivory p-8 text-center text-muted-brown">
              ما كاين حتى طلب فهاد الفلتر.
            </div>
          ) : (
            filtered.map((o) => {
              const busy = updating === o.order_number;
              const waHref = customerWhatsAppHref(
                o.phone,
                buildCallCenterConfirmMessage(o),
              );
              return (
                <article
                  key={o.order_number}
                  className="rounded-xl border border-champagne/40 bg-ivory p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs text-muted-brown">
                        {o.order_number} · {formatDate(o.created_at)}
                      </p>
                      <h2 className="text-lg font-bold text-cocoa">
                        {o.customer_name}
                      </h2>
                      <p className="text-sm text-muted-brown">
                        {o.city} — {o.address}
                      </p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-btn bg-background text-cocoa">
                      {o.status_label}
                    </span>
                  </div>

                  <p className="text-sm text-cocoa">{o.products}</p>
                  <p className="font-bold text-cocoa">{o.total_amount} DH</p>
                  {o.notes ? (
                    <p className="text-xs text-muted-brown">ملاحظة: {o.notes}</p>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={telHref(o.phone)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn bg-cocoa text-ivory text-sm font-bold hover:bg-espresso"
                    >
                      <Phone className="w-4 h-4" />
                      اتصال
                    </a>
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn bg-[#25D366] text-white text-sm font-bold hover:bg-[#1ebe59]"
                    >
                      <MessageCircle className="w-4 h-4" />
                      واتساب
                    </a>
                    <span className="inline-flex items-center px-3 py-2 text-sm dir-ltr">
                      {o.phone}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1 border-t border-champagne/30">
                    <button
                      type="button"
                      disabled={busy || o.status === 'CONFIRMED'}
                      onClick={() => void updateStatus(o.order_number, 'CONFIRMED')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn bg-emerald-700 text-white text-sm font-bold disabled:opacity-40"
                    >
                      <Check className="w-4 h-4" />
                      تأكيد
                    </button>
                    <button
                      type="button"
                      disabled={busy || o.status === 'NO_ANSWER'}
                      onClick={() =>
                        void updateStatus(
                          o.order_number,
                          'NO_ANSWER',
                          'ما جاوبش — إعادة اتصال',
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn border border-amber-600 text-amber-800 text-sm font-bold disabled:opacity-40"
                    >
                      <PhoneMissed className="w-4 h-4" />
                      ما جاوبش
                    </button>
                    <button
                      type="button"
                      disabled={busy || o.status === 'CANCELLED'}
                      onClick={() => {
                        const reason =
                          window.prompt('سبب الإلغاء (اختياري):') ?? '';
                        void updateStatus(
                          o.order_number,
                          'CANCELLED',
                          reason.trim() || 'ملغى من التأكيد',
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn border border-error text-error text-sm font-bold disabled:opacity-40"
                    >
                      <X className="w-4 h-4" />
                      إلغاء
                    </button>
                    {o.status !== 'PENDING_CONFIRMATION' ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void updateStatus(
                            o.order_number,
                            'PENDING_CONFIRMATION',
                          )
                        }
                        className="inline-flex items-center px-3 py-2 rounded-btn border border-champagne/50 text-sm text-muted-brown disabled:opacity-40"
                      >
                        رجّع لقيد التأكيد
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
