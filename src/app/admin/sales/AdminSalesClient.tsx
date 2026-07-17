'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Download, Lock, RefreshCw, LogOut } from 'lucide-react';

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

const STORAGE_KEY = 'oxiprime-admin-token';

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

export default function AdminSalesClient() {
  const [token, setToken] = useState('');
  const [input, setInput] = useState('');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

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

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
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
            <h1 className="text-xl font-bold text-cocoa">لوحة المبيعات</h1>
            <p className="text-sm text-muted-brown">
              {orders.length} طلب · حدّثي بعد كل طلب جديد
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/confirm"
              className="inline-flex items-center px-3 py-2 rounded-btn bg-cocoa text-ivory text-sm font-bold hover:bg-espresso"
            >
              مكان التأكيد
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn border border-champagne/50 text-sm text-cocoa hover:bg-ivory"
            >
              <Download className="w-4 h-4" />
              تحميل Excel
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

        {error ? (
          <p className="text-sm text-error bg-error/10 rounded-btn px-3 py-2">{error}</p>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-champagne/40 bg-ivory">
          <table className="w-full text-sm text-right min-w-[900px]">
            <thead className="bg-background text-muted-brown">
              <tr>
                <th className="p-3 font-medium">التاريخ</th>
                <th className="p-3 font-medium">الطلب</th>
                <th className="p-3 font-medium">الزبون</th>
                <th className="p-3 font-medium">الهاتف</th>
                <th className="p-3 font-medium">المدينة</th>
                <th className="p-3 font-medium">المنتجات</th>
                <th className="p-3 font-medium">المجموع</th>
                <th className="p-3 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-brown">
                    ما كاين حتى طلب دابا.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr
                    key={o.order_number}
                    className="border-t border-champagne/30 align-top"
                  >
                    <td className="p-3 whitespace-nowrap text-muted-brown">
                      {formatDate(o.created_at)}
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
                    <td className="p-3 max-w-[220px]">{o.products}</td>
                    <td className="p-3 font-bold text-cocoa whitespace-nowrap">
                      {o.total_amount} DH
                    </td>
                    <td className="p-3 whitespace-nowrap">{o.status_label}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-brown text-center">
          Google Sheets: تحميل Excel ثم File → Import → Upload
        </p>
      </div>
    </div>
  );
}
