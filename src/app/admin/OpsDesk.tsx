'use client';

/**
 * Tajouki Ops — نظام إدارة الطلبات
 * لوحة أرقام + جدول مبيعات بكل الحالات + ورقة تفاصيل حسب المرحلة.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  Lock,
  LogOut,
  MessageCircle,
  Phone,
  PhoneMissed,
  RefreshCw,
  RotateCcw,
  Truck,
  X,
} from 'lucide-react';
import {
  buildCallCenterConfirmMessage,
  customerWhatsAppHref,
} from '@/lib/whatsapp';
import {
  ADMIN_TOKEN_KEY,
  CANCEL_REASONS,
  COURIER_PREF_KEY,
  AdminOrder,
  AdminStats,
  buildCourierCopyLine,
  copyText,
  fetchAdminOrders,
  formatAdminDate,
  patchAdminOrder,
  shipAdminOrder,
  telHref,
  timeAgo,
} from '@/lib/admin';

type Mode = 'board' | 'orders' | 'ship';

/** Pipeline filters for the orders sheet */
type PipeFilter =
  | 'all'
  | 'new'
  | 'call1'
  | 'call2'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'returned'
  | 'cancelled';

const MODES: { id: Mode; label: string }[] = [
  { id: 'board', label: 'لوحة' },
  { id: 'orders', label: 'الطلبات' },
  { id: 'ship', label: 'الشحن' },
];

const COURIERS = [
  { id: 'generic', label: 'عام' },
  { id: 'cathedis', label: 'Cathedis' },
  { id: 'ozone', label: 'Ozone' },
];

function playChime() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.04;
    osc.start();
    setTimeout(() => {
      osc.stop();
      void ctx.close();
    }, 150);
  } catch {
    /* ignore */
  }
}

function minsWaiting(iso: string) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.floor((Date.now() - t) / 60000);
}

function urgency(o: AdminOrder) {
  let s = minsWaiting(o.created_at);
  if (o.status === 'NO_ANSWER') s += 100;
  if (minsWaiting(o.created_at) >= 120) s += 80;
  if (o.total_amount >= 500) s += 30;
  return s;
}

/** 0 = ما تّصلوش بعد، 1 = مكالمة أولى، 2 = مكالمة ثانية+ */
function callAttempt(notes?: string | null): 0 | 1 | 2 {
  const n = (notes || '').trim();
  if (!n) return 0;
  if (/مكالمة\s*(2|الثانية|تانية)|call\s*2/i.test(n)) return 2;
  if (/مكالمة\s*(1|الأولى|الاولى|اولى)|call\s*1/i.test(n)) return 1;
  return 0;
}

function isConfirmQueue(o: AdminOrder) {
  return o.status === 'PENDING_CONFIRMATION' || o.status === 'NO_ANSWER';
}

function isShipQueue(o: AdminOrder) {
  return (
    o.status === 'CONFIRMED' ||
    o.status === 'READY_TO_SHIP' ||
    o.status === 'SHIPPED'
  );
}

/** Display stage for the sheet (كل حالات الكونفيرماسيون + الشحن) */
function stageOf(o: AdminOrder): PipeFilter {
  if (o.status === 'CANCELLED') return 'cancelled';
  if (o.status === 'RETURNED') return 'returned';
  if (o.status === 'DELIVERED') return 'delivered';
  if (o.status === 'SHIPPED') return 'shipped';
  if (o.status === 'CONFIRMED' || o.status === 'READY_TO_SHIP')
    return 'confirmed';
  const a = callAttempt(o.notes);
  if (a >= 2 || (o.status === 'NO_ANSWER' && a >= 2)) return 'call2';
  if (a === 1 || o.status === 'NO_ANSWER') return 'call1';
  return 'new';
}

function stageLabel(o: AdminOrder): string {
  switch (stageOf(o)) {
    case 'new':
      return 'جديد — بانتظار الاتصال';
    case 'call1':
      return 'مكالمة 1 — ما جاوبش';
    case 'call2':
      return 'مكالمة 2 — ما جاوبش';
    case 'confirmed':
      return 'مؤكَّد — جاهز للشحن';
    case 'shipped':
      return 'فالطريق';
    case 'delivered':
      return 'تسلّم';
    case 'returned':
      return 'مرتجع';
    case 'cancelled':
      return 'ملغي';
    default:
      return o.status_label;
  }
}

function phoneRisk(orders: AdminOrder[], phone: string) {
  const same = orders.filter((o) => o.phone === phone);
  const cancelled = same.filter((o) => o.status === 'CANCELLED').length;
  const returned = same.filter((o) => o.status === 'RETURNED').length;
  return { cancelled, returned, risky: cancelled + returned >= 2 };
}

function parseMode(tab: string | null): Mode {
  if (tab === 'ship' || tab === 'shipping') return 'ship';
  if (
    tab === 'orders' ||
    tab === 'confirm' ||
    tab === 'all' ||
    tab === 'sales' ||
    tab === 'monitor'
  )
    return 'orders';
  return 'board';
}

function modeQuery(m: Mode) {
  if (m === 'ship') return 'ship';
  if (m === 'orders') return 'orders';
  return 'board';
}

export default function OpsDesk() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = parseMode(searchParams.get('tab'));

  const [token, setToken] = useState('');
  const [pin, setPin] = useState('');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [mode, setMode] = useState<Mode>(initial);
  const [pipe, setPipe] = useState<PipeFilter>(
    initial === 'ship' ? 'confirmed' : 'all',
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [courier, setCourier] = useState('generic');
  const [tracking, setTracking] = useState('');
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState('');

  const knownNew = useRef<Set<string>>(new Set());
  const primed = useRef(false);

  const goMode = (m: Mode) => {
    setMode(m);
    setShowCancel(false);
    setDetailOpen(false);
    if (m === 'ship') setPipe('confirmed');
    else if (m === 'orders') setPipe('all');
    router.replace(`/admin?tab=${modeQuery(m)}`, { scroll: false });
  };

  const openDetail = (id: string) => {
    setActiveId(id);
    setDetailOpen(true);
    setShowCancel(false);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setShowCancel(false);
  };

  const load = useCallback(async (secret: string, silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await fetchAdminOrders(secret);
      const next = data.orders || [];
      const freshIds = next
        .filter((o) => o.status === 'PENDING_CONFIRMATION')
        .map((o) => o.order_number);
      if (primed.current) {
        const brand = freshIds.filter((id) => !knownNew.current.has(id));
        if (brand.length) playChime();
      } else primed.current = true;
      knownNew.current = new Set(freshIds);
      setOrders(next);
      if (data.stats) setStats(data.stats);
      setToken(secret);
      sessionStorage.setItem(ADMIN_TOKEN_KEY, secret);
    } catch (err) {
      if (!silent) {
        setToken('');
        setOrders([]);
        setStats(null);
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      }
      setError(err instanceof Error ? err.message : 'خطأ');
    } finally {
      setLoading(false);
      setBooting(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    const pref = localStorage.getItem(COURIER_PREF_KEY);
    if (pref) setCourier(pref);
    if (saved) void load(saved);
    else setBooting(false);
  }, [load]);

  useEffect(() => {
    if (!token) return;
    const id = window.setInterval(() => void load(token, true), 20000);
    return () => window.clearInterval(id);
  }, [token, load]);

  const pipeCounts = useMemo(() => {
    const c: Record<PipeFilter, number> = {
      all: orders.length,
      new: 0,
      call1: 0,
      call2: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      returned: 0,
      cancelled: 0,
    };
    for (const o of orders) {
      const s = stageOf(o);
      c[s] += 1;
    }
    return c;
  }, [orders]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const ac = isConfirmQueue(a);
      const bc = isConfirmQueue(b);
      if (ac && bc) return urgency(b) - urgency(a);
      if (ac !== bc) return ac ? -1 : 1;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [orders]);

  const sheetRows = useMemo(() => {
    let list = sortedOrders;
    if (mode === 'ship') {
      list = list.filter(isShipQueue);
      if (pipe === 'confirmed') {
        list = list.filter(
          (o) => o.status === 'CONFIRMED' || o.status === 'READY_TO_SHIP',
        );
      } else if (pipe === 'shipped') {
        list = list.filter((o) => o.status === 'SHIPPED');
      }
    } else if (pipe !== 'all') {
      list = list.filter((o) => stageOf(o) === pipe);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.customer_name.toLowerCase().includes(q) ||
          o.city.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.order_number.toLowerCase().includes(q) ||
          stageLabel(o).includes(q) ||
          (o.notes || '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [sortedOrders, mode, pipe, query]);

  const confirmWaiting =
    pipeCounts.new + pipeCounts.call1 + pipeCounts.call2;
  const shipReady = pipeCounts.confirmed;

  useEffect(() => {
    if (!detailOpen || !activeId) return;
    if (!orders.some((o) => o.order_number === activeId)) {
      setDetailOpen(false);
      setActiveId(null);
    }
  }, [orders, activeId, detailOpen]);

  const active = useMemo(
    () => orders.find((o) => o.order_number === activeId) ?? null,
    [orders, activeId],
  );

  useEffect(() => {
    setNotes(active?.notes || '');
    setTracking(active?.tracking_number || '');
    setShowCancel(false);
    setCopied(false);
  }, [active?.order_number]);

  const patch = async (
    id: string,
    body: Record<string, unknown>,
    closeAfter = false,
  ) => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      const updated = await patchAdminOrder(token, id, body);
      setOrders((prev) =>
        prev.map((o) => (o.order_number === id ? { ...o, ...updated } : o)),
      );
      if (closeAfter) closeDetail();
      void load(token, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ');
    } finally {
      setBusy(false);
      setShowCancel(false);
    }
  };

  const doShip = async (id: string) => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      const updated = await shipAdminOrder(token, id, {
        courier_name: courier,
        tracking_number: tracking,
        create_with_provider: false,
      });
      setOrders((prev) =>
        prev.map((o) => (o.order_number === id ? { ...o, ...updated } : o)),
      );
      closeDetail();
      void load(token, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ');
    } finally {
      setBusy(false);
    }
  };

  if (booting) {
    return (
      <div className="min-h-[100dvh] bg-[#f5f0ea] flex items-center justify-center text-[#6a5648]">
        جاري الفتح…
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-[100dvh] bg-[#f5f0ea] flex items-center justify-center px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void load(pin.trim());
          }}
          className="w-full max-w-sm bg-white border border-[#e6d9cc] rounded-2xl p-6 space-y-4"
        >
          <div className="text-center space-y-1">
            <Lock className="w-6 h-6 mx-auto text-[#2a1810]" />
            <h1 className="text-xl font-bold text-[#2a1810]">تاجكِ تشغيل</h1>
            <p className="text-sm text-[#6a5648]">إدارة وتتبّع الطلبات</p>
          </div>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="رمز الدخول"
            className="w-full p-4 rounded-xl border border-[#e6d9cc] text-center text-lg bg-[#faf6f1]"
            autoFocus
          />
          {error ? (
            <p className="text-sm text-red-700 text-center">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading || !pin.trim()}
            className="w-full py-3.5 rounded-xl bg-[#2a1810] text-white font-bold disabled:opacity-50"
          >
            دخول
          </button>
        </form>
      </div>
    );
  }

  const risk = active ? phoneRisk(orders, active.phone) : null;
  const attempt = active ? callAttempt(active.notes) : 0;
  const activeStage = active ? stageOf(active) : null;

  const orderFilters: { id: PipeFilter; label: string }[] =
    mode === 'ship'
      ? [
          { id: 'confirmed', label: 'جاهز للشحن' },
          { id: 'shipped', label: 'فالطريق' },
          { id: 'all', label: 'كل الشحن' },
        ]
      : [
          { id: 'all', label: 'الكل' },
          { id: 'new', label: 'جديد' },
          { id: 'call1', label: 'مكالمة 1' },
          { id: 'call2', label: 'مكالمة 2' },
          { id: 'confirmed', label: 'مؤكَّد' },
          { id: 'shipped', label: 'فالطريق' },
          { id: 'delivered', label: 'تسلّم' },
          { id: 'returned', label: 'مرتجع' },
          { id: 'cancelled', label: 'ملغي' },
        ];

  const boardCards: {
    label: string;
    value: number;
    filter: PipeFilter;
    desk: Mode;
  }[] = [
    { label: 'جديد', value: pipeCounts.new, filter: 'new', desk: 'orders' },
    {
      label: 'مكالمة 1',
      value: pipeCounts.call1,
      filter: 'call1',
      desk: 'orders',
    },
    {
      label: 'مكالمة 2',
      value: pipeCounts.call2,
      filter: 'call2',
      desk: 'orders',
    },
    {
      label: 'مؤكَّد',
      value: pipeCounts.confirmed,
      filter: 'confirmed',
      desk: 'ship',
    },
    {
      label: 'فالطريق',
      value: pipeCounts.shipped,
      filter: 'shipped',
      desk: 'ship',
    },
    {
      label: 'تسلّم',
      value: pipeCounts.delivered,
      filter: 'delivered',
      desk: 'orders',
    },
    {
      label: 'مرتجع',
      value: pipeCounts.returned,
      filter: 'returned',
      desk: 'orders',
    },
    {
      label: 'ملغي',
      value: pipeCounts.cancelled,
      filter: 'cancelled',
      desk: 'orders',
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#f5f0ea] text-[#2a1810]">
      <header className="sticky top-0 z-20 border-b border-[#e6d9cc] bg-[#f5f0ea]/95 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-3 py-3 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-wrap">
            <h1 className="font-bold text-lg shrink-0">تاجكِ تشغيل</h1>
            <span className="text-sm bg-white border border-[#e6d9cc] rounded-full px-3 py-1 tabular-nums">
              {stats?.today ?? 0} اليوم
            </span>
            <span className="text-sm bg-white border border-[#e6d9cc] rounded-full px-3 py-1 tabular-nums">
              {confirmWaiting} تأكيد
            </span>
            <span className="text-sm bg-white border border-[#e6d9cc] rounded-full px-3 py-1 tabular-nums">
              {shipReady} شحن
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void load(token)}
              className="p-2.5 rounded-xl border border-[#e6d9cc] bg-white"
              aria-label="تحديث"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem(ADMIN_TOKEN_KEY);
                setToken('');
                setOrders([]);
                setStats(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e6d9cc] text-sm text-[#6a5648]"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-3 pb-3">
          <div className="flex gap-1 p-1 rounded-xl bg-[#e8dfd5]">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => goMode(m.id)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold ${
                  mode === m.id
                    ? 'bg-[#2a1810] text-white'
                    : 'text-[#5c4a3c]'
                }`}
              >
                {m.label}
                {m.id === 'orders' ? ` (${orders.length})` : ''}
                {m.id === 'ship' ? ` (${shipReady + pipeCounts.shipped})` : ''}
              </button>
            ))}
          </div>
        </div>
      </header>

      {error ? (
        <p className="mx-auto max-w-[1400px] px-3 pt-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {/* Board */}
      {mode === 'board' && (
        <div className="mx-auto max-w-[1400px] px-3 py-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold">خط الطلب من الدخول حتى التسليم</h2>
            <p className="text-sm text-[#6a5648] mt-1">
              اضغطي على أي حالة باش تفتحي جدول الطلبات ديالها.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-[#e6d9cc] bg-white p-4">
              <p className="text-xs text-[#6a5648]">دخلو اليوم</p>
              <p className="text-3xl font-bold tabular-nums mt-1">
                {stats?.today ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e6d9cc] bg-white p-4">
              <p className="text-xs text-[#6a5648]">مجموع الطلبات</p>
              <p className="text-3xl font-bold tabular-nums mt-1">
                {orders.length}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e6d9cc] bg-white p-4">
              <p className="text-xs text-[#6a5648]">خصّهم تأكيد</p>
              <p className="text-3xl font-bold tabular-nums mt-1">
                {confirmWaiting}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e6d9cc] bg-white p-4">
              <p className="text-xs text-[#6a5648]">خصّهم شحن</p>
              <p className="text-3xl font-bold tabular-nums mt-1">{shipReady}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {boardCards.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => {
                  setPipe(c.filter);
                  setMode(c.desk);
                  router.replace(`/admin?tab=${modeQuery(c.desk)}`, {
                    scroll: false,
                  });
                }}
                className="text-right rounded-xl border border-[#e6d9cc] bg-white p-3 hover:border-[#2a1810]"
              >
                <p className="text-[11px] text-[#6a5648] leading-tight">
                  {c.label}
                </p>
                <p className="text-2xl font-bold tabular-nums mt-1">{c.value}</p>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => goMode('orders')}
            className="px-5 py-3 rounded-xl bg-[#2a1810] text-white font-bold text-sm"
          >
            فتح جدول الطلبات
          </button>
        </div>
      )}

      {/* Orders / Ship sheet */}
      {(mode === 'orders' || mode === 'ship') && (
        <div className="mx-auto max-w-[1400px] px-3 py-4 space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-bold text-lg">
                {mode === 'ship' ? 'مكتب الشحن والتتبع' : 'جدول الطلبات'}
              </h2>
              <p className="text-sm text-[#6a5648]">
                بحال شيت المبيعات — فلّتري الحالة، ومن بعد{' '}
                <span className="font-bold text-[#2a1810]">تفاصيل</span> باش
                تصرّفي.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="بحث: اسم، هاتف، مدينة، رقم طلب…"
                className="min-w-[200px] flex-1 p-2.5 rounded-xl border border-[#e6d9cc] bg-white text-sm"
              />
              {mode === 'ship' ? (
                <button
                  type="button"
                  onClick={() => {
                    const qs = new URLSearchParams({
                      token,
                      template: courier,
                      status: 'CONFIRMED,READY_TO_SHIP',
                    });
                    window.location.href = `/api/admin/orders/export/courier?${qs}`;
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#e6d9cc] bg-white text-sm font-bold"
                >
                  <Download className="w-4 h-4" />
                  CSV شركة
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `/api/admin/orders/csv?token=${encodeURIComponent(token)}`;
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#2a1810] text-white font-bold text-sm"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              )}
            </div>
          </div>

          {/* Status pipeline filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {orderFilters.map((f) => {
              const count =
                mode === 'ship' && f.id === 'all'
                  ? pipeCounts.confirmed + pipeCounts.shipped
                  : pipeCounts[f.id];
              const activeChip = pipe === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPipe(f.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold border tabular-nums ${
                    activeChip
                      ? 'bg-[#2a1810] text-white border-[#2a1810]'
                      : 'bg-white border-[#e6d9cc] text-[#5c4a3c]'
                  }`}
                >
                  {f.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#b7c9b0] bg-white shadow-sm">
            <table className="w-full text-sm text-right min-w-[1100px] border-collapse">
              <thead>
                <tr className="bg-[#dfe9d8] text-[#243d22] border-b border-[#b7c9b0]">
                  <th className="p-2.5 font-semibold border-l border-[#b7c9b0] whitespace-nowrap">
                    وقت
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#b7c9b0]">
                    رقم الطلب
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#b7c9b0]">
                    الزبونة
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#b7c9b0]">
                    الهاتف
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#b7c9b0]">
                    المدينة
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#b7c9b0] min-w-[140px]">
                    المنتجات
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#b7c9b0]">
                    COD
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#b7c9b0] min-w-[150px]">
                    الحالة
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#b7c9b0]">
                    تتبع
                  </th>
                  <th className="p-2.5 font-semibold whitespace-nowrap">تفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {sheetRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="p-12 text-center text-[#6a5648]"
                    >
                      ما كاين حتى طلب فهاد الفلتر.
                    </td>
                  </tr>
                ) : (
                  sheetRows.map((o, i) => {
                    const st = stageOf(o);
                    const hot = st === 'new' || st === 'call1' || st === 'call2';
                    return (
                      <tr
                        key={o.order_number}
                        className={`border-t border-[#dde8d8] ${
                          hot && st !== 'new'
                            ? 'bg-amber-50/70'
                            : i % 2 === 0
                              ? 'bg-white'
                              : 'bg-[#f4f8f1]'
                        } hover:bg-[#eaf2e4]`}
                      >
                        <td className="p-2.5 text-xs text-[#6a5648] whitespace-nowrap border-l border-[#dde8d8]">
                          {formatAdminDate(o.created_at)}
                          <div className="text-[11px]">
                            {timeAgo(o.created_at)}
                          </div>
                        </td>
                        <td className="p-2.5 font-mono text-xs border-l border-[#dde8d8]">
                          {o.order_number}
                        </td>
                        <td className="p-2.5 font-medium border-l border-[#dde8d8]">
                          {o.customer_name}
                        </td>
                        <td className="p-2.5 dir-ltr text-left border-l border-[#dde8d8] whitespace-nowrap">
                          {o.phone}
                        </td>
                        <td className="p-2.5 border-l border-[#dde8d8]">
                          {o.city}
                        </td>
                        <td
                          className="p-2.5 text-xs max-w-[180px] truncate border-l border-[#dde8d8]"
                          title={o.products}
                        >
                          {o.products}
                        </td>
                        <td className="p-2.5 font-bold tabular-nums border-l border-[#dde8d8]">
                          {o.total_amount}
                        </td>
                        <td className="p-2.5 text-xs font-medium border-l border-[#dde8d8]">
                          {stageLabel(o)}
                        </td>
                        <td className="p-2.5 text-xs font-mono border-l border-[#dde8d8]">
                          {o.tracking_number || '—'}
                        </td>
                        <td className="p-2">
                          <button
                            type="button"
                            onClick={() => openDetail(o.order_number)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2a1810] text-white text-xs font-bold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            تفاصيل
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#6a5648] tabular-nums">
            {sheetRows.length} سطر ظاهر
          </p>
        </div>
      )}

      {/* Detail drawer — full lifecycle actions */}
      {detailOpen && active ? (
        <div className="fixed inset-0 z-40 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            aria-label="إغلاق"
            onClick={closeDetail}
          />
          <div className="relative z-10 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl border-s border-[#e6d9cc]">
            <div className="sticky top-0 flex items-center justify-between gap-2 border-b border-[#e6d9cc] bg-white px-4 py-3">
              <div>
                <h3 className="font-bold">إدارة الطلب</h3>
                <p className="text-xs text-[#6a5648]">{stageLabel(active)}</p>
              </div>
              <button
                type="button"
                onClick={closeDetail}
                className="p-2 rounded-lg border border-[#e6d9cc]"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-5">
              {risk?.risky ? (
                <p className="flex gap-2 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  تحذير: إلغاء/إرجاع متكرر على هاد الرقم.
                </p>
              ) : null}

              <div>
                <p className="text-xs text-[#6a5648] font-mono">
                  {active.order_number} · {timeAgo(active.created_at)}
                </p>
                <h2 className="text-2xl font-bold mt-1">{active.customer_name}</h2>
                <p className="text-xl font-semibold mt-2 dir-ltr tracking-wide">
                  {active.phone}
                </p>
                <p className="text-2xl font-bold tabular-nums mt-3">
                  {active.total_amount}{' '}
                  <span className="text-sm text-[#6a5648]">DH COD</span>
                </p>
              </div>

              <div className="text-sm space-y-1.5 rounded-xl bg-[#faf6f1] border border-[#e6d9cc] p-3">
                <p>
                  <span className="text-[#6a5648]">المدينة: </span>
                  {active.city}
                </p>
                <p>
                  <span className="text-[#6a5648]">العنوان: </span>
                  {active.address}
                </p>
                <p>
                  <span className="text-[#6a5648]">المنتجات: </span>
                  {active.products}
                </p>
                {active.tracking_number ? (
                  <p>
                    <span className="text-[#6a5648]">التتبع: </span>
                    {active.tracking_number}
                  </p>
                ) : null}
                {active.cancel_reason ? (
                  <p>
                    <span className="text-[#6a5648]">سبب الإلغاء: </span>
                    {active.cancel_reason}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={telHref(active.phone)}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#2a1810] text-white font-bold text-sm"
                >
                  <Phone className="w-4 h-4" />
                  اتصال
                </a>
                <a
                  href={customerWhatsAppHref(
                    active.phone,
                    buildCallCenterConfirmMessage(active),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#25D366] text-white font-bold text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  واتساب
                </a>
              </div>

              {/* Confirmation stage */}
              {isConfirmQueue(active) && !showCancel ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#6a5648]">
                    الكونفيرماسيون
                  </p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void patch(
                        active.order_number,
                        { status: 'CONFIRMED', notes: notes || undefined },
                        true,
                      )
                    }
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-700 text-white font-bold disabled:opacity-40"
                  >
                    <Check className="w-5 h-5" />
                    تأكيد — يدوز للشحن
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={busy || attempt >= 1}
                      onClick={() =>
                        void patch(active.order_number, {
                          status: 'NO_ANSWER',
                          notes: 'مكالمة أولى — ما جاوبش',
                        })
                      }
                      className="flex items-center justify-center gap-1 py-3 rounded-xl border-2 border-amber-500 font-bold text-sm disabled:opacity-40"
                    >
                      <PhoneMissed className="w-4 h-4" />
                      مكالمة 1
                    </button>
                    <button
                      type="button"
                      disabled={busy || attempt >= 2}
                      onClick={() =>
                        void patch(active.order_number, {
                          status: 'NO_ANSWER',
                          notes: 'مكالمة ثانية — ما جاوبش',
                        })
                      }
                      className="flex items-center justify-center gap-1 py-3 rounded-xl border-2 border-amber-700 font-bold text-sm disabled:opacity-40"
                    >
                      <PhoneMissed className="w-4 h-4" />
                      مكالمة 2
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setShowCancel(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-red-600 text-red-700 font-bold"
                  >
                    <X className="w-5 h-5" />
                    إلغاء الطلب
                  </button>
                </div>
              ) : null}

              {isConfirmQueue(active) && showCancel ? (
                <div className="space-y-3">
                  <p className="font-bold">سبب الإلغاء</p>
                  <div className="flex flex-wrap gap-2">
                    {CANCEL_REASONS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void patch(
                            active.order_number,
                            {
                              status: 'CANCELLED',
                              cancel_reason: r,
                              notes: r,
                            },
                            true,
                          )
                        }
                        className="px-3 py-2 rounded-lg border border-[#e6d9cc] bg-[#faf6f1] text-sm"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCancel(false)}
                    className="text-sm text-[#6a5648]"
                  >
                    رجوع
                  </button>
                </div>
              ) : null}

              {/* Shipping */}
              {(active.status === 'CONFIRMED' ||
                active.status === 'READY_TO_SHIP') && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-[#6a5648]">
                    تهيئة الشحن
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {COURIERS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCourier(c.id);
                          localStorage.setItem(COURIER_PREF_KEY, c.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm border ${
                          courier === c.id
                            ? 'bg-[#2a1810] text-white border-[#2a1810]'
                            : 'border-[#e6d9cc] bg-[#faf6f1]'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <input
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    placeholder="رقم التتبع ديال الشركة"
                    className="w-full p-3 rounded-xl border border-[#e6d9cc] bg-[#faf6f1]"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      await copyText(buildCourierCopyLine(active));
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1200);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-[#2a1810] font-bold"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'تم النسخ' : 'نسخ سطر للشركة'}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void doShip(active.order_number)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#2a1810] text-white font-bold"
                  >
                    <Truck className="w-4 h-4" />
                    خرج للطرد — فالطريق
                  </button>
                </div>
              )}

              {active.status === 'SHIPPED' && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#6a5648]">التتبع</p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void patch(
                        active.order_number,
                        { status: 'DELIVERED' },
                        true,
                      )
                    }
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-700 text-white font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    تم التسليم
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void patch(
                        active.order_number,
                        { status: 'RETURNED' },
                        true,
                      )
                    }
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-red-600 text-red-700 font-bold"
                  >
                    <RotateCcw className="w-4 h-4" />
                    مرتجع
                  </button>
                </div>
              )}

              {(activeStage === 'delivered' ||
                activeStage === 'returned' ||
                activeStage === 'cancelled') && (
                <p className="text-sm text-[#6a5648] bg-[#faf6f1] border border-[#e6d9cc] rounded-xl px-3 py-3">
                  الطلب سالا فهاد المرحلة:{' '}
                  <span className="font-bold">{stageLabel(active)}</span>
                </p>
              )}

              <div>
                <label className="text-xs text-[#6a5648]">ملاحظة داخلية</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="ملاحظة المكالمة، علامة، رقم ثاني…"
                  className="mt-1 w-full p-3 rounded-xl border border-[#e6d9cc] bg-[#faf6f1] text-sm"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void patch(active.order_number, {
                      status: active.status,
                      notes,
                    })
                  }
                  className="mt-1 text-sm text-[#6a5648] underline"
                >
                  حفظ الملاحظة
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
