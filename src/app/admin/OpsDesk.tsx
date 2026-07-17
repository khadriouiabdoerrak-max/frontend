'use client';

/**
 * Tajouki Ops — لوحة · تأكيد · شحن · كلشي
 * Board for counts. Confirm desk for calls. Ship desk for courier + tracking.
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

type Mode = 'board' | 'confirm' | 'ship' | 'all';

/** Soft filter from board tiles (cleared when switching tabs manually). */
type StatusFocus =
  | 'PENDING_CONFIRMATION'
  | 'NO_ANSWER'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'RETURNED'
  | 'CANCELLED'
  | null;

const MODES: { id: Mode; label: string }[] = [
  { id: 'board', label: 'لوحة' },
  { id: 'confirm', label: 'تأكيد' },
  { id: 'ship', label: 'شحن' },
  { id: 'all', label: 'كلشي' },
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

function isConfirm(o: AdminOrder) {
  return o.status === 'PENDING_CONFIRMATION' || o.status === 'NO_ANSWER';
}

function isShip(o: AdminOrder) {
  return (
    o.status === 'CONFIRMED' ||
    o.status === 'READY_TO_SHIP' ||
    o.status === 'SHIPPED'
  );
}

function phoneRisk(orders: AdminOrder[], phone: string) {
  const same = orders.filter((o) => o.phone === phone);
  const cancelled = same.filter((o) => o.status === 'CANCELLED').length;
  const returned = same.filter((o) => o.status === 'RETURNED').length;
  return { cancelled, returned, risky: cancelled + returned >= 2 };
}

function parseMode(tab: string | null): Mode {
  if (tab === 'ship' || tab === 'shipping') return 'ship';
  if (tab === 'all' || tab === 'monitor' || tab === 'sales') return 'all';
  if (tab === 'confirm' || tab === 'confirmation') return 'confirm';
  return 'board';
}

function modeQuery(m: Mode) {
  if (m === 'confirm') return 'confirm';
  if (m === 'ship') return 'ship';
  if (m === 'all') return 'all';
  return 'board';
}

function focusLabel(f: StatusFocus): string {
  switch (f) {
    case 'PENDING_CONFIRMATION':
      return 'بانتظار التأكيد';
    case 'NO_ANSWER':
      return 'ما جاوبش';
    case 'CONFIRMED':
      return 'مؤكَّد / جاهز للشحن';
    case 'SHIPPED':
      return 'فالطريق';
    case 'DELIVERED':
      return 'تسلّم';
    case 'RETURNED':
      return 'مرتجع';
    case 'CANCELLED':
      return 'ملغي';
    default:
      return '';
  }
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
  const [statusFocus, setStatusFocus] = useState<StatusFocus>(null);
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

  const goMode = (m: Mode, clearFocus = true) => {
    setMode(m);
    setShowCancel(false);
    setDetailOpen(false);
    if (clearFocus) setStatusFocus(null);
    router.replace(`/admin?tab=${modeQuery(m)}`, { scroll: false });
  };

  const openFromBoard = (focus: StatusFocus, desk: Mode) => {
    setStatusFocus(focus);
    setMode(desk);
    setShowCancel(false);
    setDetailOpen(false);
    router.replace(`/admin?tab=${modeQuery(desk)}`, { scroll: false });
  };

  const openConfirmDetail = (id: string) => {
    setActiveId(id);
    setDetailOpen(true);
    setShowCancel(false);
  };

  const closeConfirmDetail = () => {
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

  const counts = useMemo(() => {
    const by = (s: string) => orders.filter((o) => o.status === s).length;
    return {
      today: stats?.today ?? 0,
      total: stats?.total ?? orders.length,
      pending: by('PENDING_CONFIRMATION'),
      noAnswer: by('NO_ANSWER'),
      confirmed: by('CONFIRMED') + by('READY_TO_SHIP'),
      shipped: by('SHIPPED'),
      delivered: by('DELIVERED'),
      returned: by('RETURNED'),
      cancelled: by('CANCELLED'),
    };
  }, [orders, stats]);

  const confirmQueue = useMemo(() => {
    let list = orders.filter(isConfirm);
    if (statusFocus === 'PENDING_CONFIRMATION') {
      list = list.filter((o) => o.status === 'PENDING_CONFIRMATION');
    } else if (statusFocus === 'NO_ANSWER') {
      list = list.filter((o) => o.status === 'NO_ANSWER');
    }
    return [...list].sort((a, b) => urgency(b) - urgency(a));
  }, [orders, statusFocus]);

  const shipQueue = useMemo(() => {
    let list = orders.filter(isShip);
    if (statusFocus === 'CONFIRMED') {
      list = list.filter(
        (o) => o.status === 'CONFIRMED' || o.status === 'READY_TO_SHIP',
      );
    } else if (statusFocus === 'SHIPPED') {
      list = list.filter((o) => o.status === 'SHIPPED');
    }
    return [...list].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [orders, statusFocus]);

  const queue = mode === 'ship' ? shipQueue : confirmQueue;
  const hotCount = orders
    .filter(isConfirm)
    .filter(
      (o) => minsWaiting(o.created_at) >= 120 || o.status === 'NO_ANSWER',
    ).length;

  useEffect(() => {
    if (mode === 'all' || mode === 'board') return;
    if (mode === 'confirm') {
      if (
        detailOpen &&
        activeId &&
        !confirmQueue.some((o) => o.order_number === activeId)
      ) {
        setDetailOpen(false);
        setActiveId(null);
      }
      return;
    }
    if (!queue.length) {
      setActiveId(null);
      return;
    }
    if (!activeId || !queue.some((o) => o.order_number === activeId)) {
      setActiveId(queue[0].order_number);
    }
  }, [queue, activeId, mode, detailOpen, confirmQueue]);

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

  const advance = (doneId: string, list: AdminOrder[]) => {
    const rest = list.filter((o) => o.order_number !== doneId);
    if (!rest.length) {
      setActiveId(null);
      return;
    }
    const idx = list.findIndex((o) => o.order_number === doneId);
    setActiveId(rest[Math.min(Math.max(idx, 0), rest.length - 1)].order_number);
  };

  const patch = async (
    id: string,
    body: Record<string, unknown>,
    nextConfirm = false,
  ) => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      const updated = await patchAdminOrder(token, id, body);
      setOrders((prev) =>
        prev.map((o) => (o.order_number === id ? { ...o, ...updated } : o)),
      );
      if (nextConfirm) {
        if (detailOpen) closeConfirmDetail();
        else advance(id, confirmQueue);
      }
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
      advance(
        id,
        shipQueue.filter((o) => o.status !== 'SHIPPED'),
      );
      void load(token, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ');
    } finally {
      setBusy(false);
    }
  };

  const filteredAll = useMemo(() => {
    let list = orders;
    if (
      statusFocus === 'DELIVERED' ||
      statusFocus === 'RETURNED' ||
      statusFocus === 'CANCELLED'
    ) {
      list = list.filter((o) => o.status === statusFocus);
    }
    if (!query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter(
      (o) =>
        o.customer_name.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.order_number.toLowerCase().includes(q) ||
        o.status_label.toLowerCase().includes(q),
    );
  }, [orders, query, statusFocus]);

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
            <p className="text-sm text-[#6a5648]">لوحة · تأكيد · شحن</p>
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
  const shipReady = shipQueue.filter((o) => o.status !== 'SHIPPED').length;

  const boardTiles: {
    key: string;
    label: string;
    value: number;
    focus: StatusFocus;
    desk: Mode;
    hint?: string;
  }[] = [
    {
      key: 'pending',
      label: 'بانتظار التأكيد',
      value: counts.pending,
      focus: 'PENDING_CONFIRMATION',
      desk: 'confirm',
    },
    {
      key: 'no_answer',
      label: 'ما جاوبش',
      value: counts.noAnswer,
      focus: 'NO_ANSWER',
      desk: 'confirm',
    },
    {
      key: 'confirmed',
      label: 'مؤكَّد',
      value: counts.confirmed,
      focus: 'CONFIRMED',
      desk: 'ship',
      hint: 'جاهز للشحن',
    },
    {
      key: 'shipped',
      label: 'فالطريق',
      value: counts.shipped,
      focus: 'SHIPPED',
      desk: 'ship',
    },
    {
      key: 'delivered',
      label: 'تسلّم',
      value: counts.delivered,
      focus: 'DELIVERED',
      desk: 'all',
    },
    {
      key: 'returned',
      label: 'مرتجع',
      value: counts.returned,
      focus: 'RETURNED',
      desk: 'all',
    },
    {
      key: 'cancelled',
      label: 'ملغي',
      value: counts.cancelled,
      focus: 'CANCELLED',
      desk: 'all',
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#f5f0ea] text-[#2a1810]">
      <header className="sticky top-0 z-20 border-b border-[#e6d9cc] bg-[#f5f0ea]/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-3 py-3 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-wrap">
            <h1 className="font-bold text-lg shrink-0">تاجكِ تشغيل</h1>
            {mode === 'board' ? (
              <>
                <span className="text-sm bg-white border border-[#e6d9cc] rounded-full px-3 py-1 tabular-nums">
                  {counts.today} اليوم
                </span>
                <span className="text-sm bg-white border border-[#e6d9cc] rounded-full px-3 py-1 tabular-nums">
                  {counts.total} الكل
                </span>
              </>
            ) : mode === 'confirm' ? (
              <>
                <span className="text-sm bg-white border border-[#e6d9cc] rounded-full px-3 py-1 tabular-nums">
                  {confirmQueue.length} فالطابور
                </span>
                {hotCount > 0 ? (
                  <span className="text-sm bg-amber-100 border border-amber-300 text-amber-950 rounded-full px-3 py-1 tabular-nums">
                    {hotCount} مستعجل
                  </span>
                ) : null}
              </>
            ) : mode === 'ship' ? (
              <span className="text-sm bg-white border border-[#e6d9cc] rounded-full px-3 py-1 tabular-nums">
                {shipReady} للشحن
              </span>
            ) : (
              <span className="text-sm bg-white border border-[#e6d9cc] rounded-full px-3 py-1 tabular-nums">
                {filteredAll.length} طلب
              </span>
            )}
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

        <div className="mx-auto max-w-5xl px-3 pb-3">
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
                {m.id === 'confirm' ? ` (${counts.pending + counts.noAnswer})` : ''}
                {m.id === 'ship' ? ` (${shipReady})` : ''}
              </button>
            ))}
          </div>
        </div>
      </header>

      {error ? (
        <p className="mx-auto max-w-5xl px-3 pt-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {/* Board */}
      {mode === 'board' && (
        <div className="mx-auto max-w-5xl px-3 py-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold">خط الطلبات</h2>
            <p className="text-sm text-[#6a5648] mt-1">
              اضغطي على أي رقم باش تفتحي المكتب المناسب.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-[#e6d9cc] bg-white p-4 sm:col-span-1">
              <p className="text-xs text-[#6a5648]">دخلو اليوم</p>
              <p className="text-3xl font-bold tabular-nums mt-1">
                {counts.today}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e6d9cc] bg-white p-4">
              <p className="text-xs text-[#6a5648]">الكل</p>
              <p className="text-3xl font-bold tabular-nums mt-1">
                {counts.total}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {boardTiles.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => openFromBoard(t.focus, t.desk)}
                className="text-right rounded-2xl border border-[#e6d9cc] bg-white p-4 hover:border-[#2a1810] transition-colors"
              >
                <p className="text-xs text-[#6a5648]">{t.label}</p>
                {t.hint ? (
                  <p className="text-[11px] text-[#8a7464]">{t.hint}</p>
                ) : null}
                <p className="text-3xl font-bold tabular-nums mt-2">{t.value}</p>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => goMode('confirm')}
              className="px-5 py-3 rounded-xl bg-[#2a1810] text-white font-bold text-sm"
            >
              فتح مكتب التأكيد
            </button>
            <button
              type="button"
              onClick={() => goMode('ship')}
              className="px-5 py-3 rounded-xl border border-[#2a1810] font-bold text-sm"
            >
              فتح مكتب الشحن
            </button>
          </div>
        </div>
      )}

      {/* Confirm — sheet like sales */}
      {mode === 'confirm' && (
        <div className="mx-auto max-w-7xl px-3 py-4 space-y-3">
          {statusFocus && focusLabel(statusFocus) ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-white border border-[#e6d9cc] px-3 py-1">
                فلتر: {focusLabel(statusFocus)}
              </span>
              <button
                type="button"
                onClick={() => setStatusFocus(null)}
                className="text-[#6a5648] underline"
              >
                إزالة الفلتر
              </button>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-[#6a5648]">
              جدول التأكيد — اضغطي{' '}
              <span className="font-bold text-[#2a1810]">تفاصيل</span> باش تشوفي
              الطلب وتأكديه.
            </p>
            <span className="text-xs text-[#6a5648] tabular-nums">
              {confirmQueue.length} سطر
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#c8d7c0] bg-white shadow-sm">
            <table className="w-full text-sm text-right min-w-[960px] border-collapse">
              <thead>
                <tr className="bg-[#e8f0e3] text-[#2f4a2a] border-b border-[#c8d7c0]">
                  <th className="p-2.5 font-semibold border-l border-[#c8d7c0] whitespace-nowrap">
                    وقت
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#c8d7c0]">
                    طلب
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#c8d7c0]">
                    زبون
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#c8d7c0]">
                    هاتف
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#c8d7c0]">
                    مدينة
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#c8d7c0] min-w-[160px]">
                    منتجات
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#c8d7c0]">
                    COD
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#c8d7c0]">
                    حالة
                  </th>
                  <th className="p-2.5 font-semibold whitespace-nowrap">تفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {confirmQueue.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="p-10 text-center text-[#6a5648]"
                    >
                      ما كاين حتى طلب فالطابور.
                    </td>
                  </tr>
                ) : (
                  confirmQueue.map((o, i) => {
                    const hot =
                      minsWaiting(o.created_at) >= 120 ||
                      o.status === 'NO_ANSWER';
                    return (
                      <tr
                        key={o.order_number}
                        className={`border-t border-[#e2ebe0] ${
                          hot
                            ? 'bg-amber-50/80'
                            : i % 2 === 0
                              ? 'bg-white'
                              : 'bg-[#f7faf5]'
                        } hover:bg-[#eef5ea]`}
                      >
                        <td className="p-2.5 text-xs text-[#6a5648] whitespace-nowrap border-l border-[#e2ebe0]">
                          {formatAdminDate(o.created_at)}
                          <div className="text-[11px]">
                            {timeAgo(o.created_at)}
                          </div>
                        </td>
                        <td className="p-2.5 font-mono text-xs border-l border-[#e2ebe0]">
                          {o.order_number}
                        </td>
                        <td className="p-2.5 font-medium border-l border-[#e2ebe0]">
                          {hot ? '● ' : ''}
                          {o.customer_name}
                        </td>
                        <td className="p-2.5 dir-ltr text-left border-l border-[#e2ebe0] whitespace-nowrap">
                          {o.phone}
                        </td>
                        <td className="p-2.5 border-l border-[#e2ebe0]">
                          {o.city}
                        </td>
                        <td
                          className="p-2.5 text-xs max-w-[220px] truncate border-l border-[#e2ebe0]"
                          title={o.products}
                        >
                          {o.products}
                        </td>
                        <td className="p-2.5 font-bold tabular-nums border-l border-[#e2ebe0]">
                          {o.total_amount}
                        </td>
                        <td className="p-2.5 text-xs border-l border-[#e2ebe0]">
                          {o.status_label}
                        </td>
                        <td className="p-2">
                          <button
                            type="button"
                            onClick={() => openConfirmDetail(o.order_number)}
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

          {detailOpen && active && isConfirm(active) ? (
            <div className="fixed inset-0 z-40 flex justify-end">
              <button
                type="button"
                className="absolute inset-0 bg-black/35"
                aria-label="إغلاق"
                onClick={closeConfirmDetail}
              />
              <div className="relative z-10 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl border-s border-[#e6d9cc]">
                <div className="sticky top-0 flex items-center justify-between gap-2 border-b border-[#e6d9cc] bg-white px-4 py-3">
                  <h3 className="font-bold">ورقة الطلب</h3>
                  <button
                    type="button"
                    onClick={closeConfirmDetail}
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
                      هاد الرقم عندو إلغاء/إرجاع متكرر من قبل.
                    </p>
                  ) : null}

                  <div>
                    <p className="text-xs text-[#6a5648] font-mono">
                      {active.order_number} · {timeAgo(active.created_at)}
                    </p>
                    <h2 className="text-2xl font-bold mt-1 leading-tight">
                      {active.customer_name}
                    </h2>
                    <p className="text-xl font-semibold mt-2 dir-ltr tracking-wide">
                      {active.phone}
                    </p>
                    <p className="text-2xl font-bold tabular-nums mt-3">
                      {active.total_amount}{' '}
                      <span className="text-sm text-[#6a5648]">DH COD</span>
                    </p>
                  </div>

                  <div className="text-sm space-y-1.5 leading-relaxed rounded-xl bg-[#faf6f1] border border-[#e6d9cc] p-3">
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
                    <p>
                      <span className="text-[#6a5648]">الحالة: </span>
                      {active.status_label}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={telHref(active.phone)}
                      className="flex items-center justify-center gap-2 py-4 rounded-xl bg-[#2a1810] text-white font-bold"
                    >
                      <Phone className="w-5 h-5" />
                      اتصال
                    </a>
                    <a
                      href={customerWhatsAppHref(
                        active.phone,
                        buildCallCenterConfirmMessage(active),
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-4 rounded-xl bg-[#25D366] text-white font-bold"
                    >
                      <MessageCircle className="w-5 h-5" />
                      واتساب
                    </a>
                  </div>

                  {!showCancel ? (
                    <div className="grid gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void patch(
                            active.order_number,
                            { status: 'CONFIRMED' },
                            true,
                          )
                        }
                        className="flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-700 text-white font-bold disabled:opacity-40"
                      >
                        <Check className="w-5 h-5" />
                        تأكيد
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void patch(
                            active.order_number,
                            {
                              status: 'NO_ANSWER',
                              notes: notes || 'ما جاوبش',
                            },
                            true,
                          )
                        }
                        className="flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-amber-600 text-amber-950 font-bold disabled:opacity-40"
                      >
                        <PhoneMissed className="w-5 h-5" />
                        ما جاوبش
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setShowCancel(true)}
                        className="flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-red-600 text-red-700 font-bold disabled:opacity-40"
                      >
                        <X className="w-5 h-5" />
                        إلغاء
                      </button>
                    </div>
                  ) : (
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
                  )}

                  <div>
                    <label className="text-xs text-[#6a5648]">ملاحظة</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="علامة قريبة، رقم ثاني…"
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
                      حفظ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Ship desk */}
      {mode === 'ship' && (
        <div className="mx-auto max-w-5xl px-3 py-4">
          {statusFocus && focusLabel(statusFocus) ? (
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-white border border-[#e6d9cc] px-3 py-1">
                فلتر: {focusLabel(statusFocus)}
              </span>
              <button
                type="button"
                onClick={() => setStatusFocus(null)}
                className="text-[#6a5648] underline"
              >
                إزالة الفلتر
              </button>
            </div>
          ) : null}

          <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">
            {shipQueue.map((o) => (
              <button
                key={o.order_number}
                type="button"
                onClick={() => setActiveId(o.order_number)}
                className={`shrink-0 rounded-xl border px-3 py-2 text-right min-w-[140px] ${
                  o.order_number === activeId
                    ? 'bg-[#2a1810] text-white border-[#2a1810]'
                    : 'bg-white border-[#e6d9cc]'
                }`}
              >
                <p className="font-bold text-sm truncate">{o.customer_name}</p>
                <p className="text-xs opacity-80">
                  {o.total_amount} · {timeAgo(o.created_at)}
                </p>
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-[240px_1fr] gap-4 items-start">
            <aside className="hidden lg:flex flex-col rounded-2xl border border-[#e6d9cc] bg-white overflow-hidden max-h-[calc(100dvh-180px)]">
              <div className="px-3 py-2 border-b border-[#e6d9cc] text-sm font-bold bg-[#faf6f1]">
                الطابور
              </div>
              <div className="overflow-y-auto">
                {shipQueue.length === 0 ? (
                  <p className="p-6 text-sm text-[#6a5648] text-center">فارغ</p>
                ) : (
                  shipQueue.map((o) => {
                    const sel = o.order_number === activeId;
                    return (
                      <button
                        key={o.order_number}
                        type="button"
                        onClick={() => setActiveId(o.order_number)}
                        className={`w-full text-right px-3 py-3 border-b border-[#f0e8df] ${
                          sel ? 'bg-[#2a1810] text-white' : 'hover:bg-[#faf6f1]'
                        }`}
                      >
                        <div className="flex justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold truncate">
                              {o.customer_name}
                            </p>
                            <p
                              className={`text-xs truncate ${sel ? 'text-white/70' : 'text-[#6a5648]'}`}
                            >
                              {o.city} · {timeAgo(o.created_at)}
                            </p>
                          </div>
                          <span className="font-bold tabular-nums shrink-0">
                            {o.total_amount}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            <section className="rounded-2xl border border-[#e6d9cc] bg-white min-h-[480px]">
              {!active || !isShip(active) ? (
                <div className="flex items-center justify-center min-h-[480px] text-[#6a5648] text-sm p-8 text-center">
                  ما كاين حتى طلب للشحن.
                </div>
              ) : (
                <div className="p-5 sm:p-8 space-y-5">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <p className="text-xs font-mono text-[#6a5648]">
                        {active.order_number} · {active.status_label}
                      </p>
                      <h2 className="text-2xl font-bold mt-1">
                        {active.customer_name}
                      </h2>
                      <p className="text-sm text-[#6a5648] mt-1">
                        {active.city} — {active.address}
                      </p>
                      <p className="text-sm mt-2">{active.products}</p>
                      <p className="text-sm dir-ltr mt-1">{active.phone}</p>
                    </div>
                    <p className="text-2xl font-bold">{active.total_amount} DH</p>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
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
                      className="ms-auto inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#e6d9cc] text-sm"
                    >
                      <Download className="w-4 h-4" />
                      CSV
                    </button>
                  </div>

                  <input
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    placeholder="رقم التتبع"
                    className="w-full p-3.5 rounded-xl border border-[#e6d9cc] bg-[#faf6f1]"
                  />

                  {(active.status === 'CONFIRMED' ||
                    active.status === 'READY_TO_SHIP') && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          await copyText(buildCourierCopyLine(active));
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1200);
                        }}
                        className="flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-[#2a1810] font-bold"
                      >
                        <Copy className="w-5 h-5" />
                        {copied ? 'تم' : 'نسخ للشركة'}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void doShip(active.order_number)}
                        className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#2a1810] text-white font-bold"
                      >
                        <Truck className="w-5 h-5" />
                        تم الإرسال
                      </button>
                    </div>
                  )}

                  {active.status === 'SHIPPED' && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void patch(active.order_number, {
                            status: 'DELIVERED',
                          })
                        }
                        className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-700 text-white font-bold"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        تم التسليم
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void patch(active.order_number, {
                            status: 'RETURNED',
                          })
                        }
                        className="flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-red-600 text-red-700 font-bold"
                      >
                        <RotateCcw className="w-5 h-5" />
                        مرتجع
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {mode === 'all' && (
        <div className="mx-auto max-w-5xl px-3 py-4 space-y-3">
          {statusFocus && focusLabel(statusFocus) ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-white border border-[#e6d9cc] px-3 py-1">
                فلتر: {focusLabel(statusFocus)}
              </span>
              <button
                type="button"
                onClick={() => setStatusFocus(null)}
                className="text-[#6a5648] underline"
              >
                إزالة الفلتر
              </button>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="بحث…"
              className="flex-1 min-w-[160px] p-3 rounded-xl border border-[#e6d9cc] bg-white"
            />
            <button
              type="button"
              onClick={() => {
                window.location.href = `/api/admin/orders/csv?token=${encodeURIComponent(token)}`;
              }}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-[#2a1810] text-white font-bold text-sm"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-[#e6d9cc] bg-white">
            <table className="w-full text-sm text-right min-w-[800px]">
              <thead className="bg-[#faf6f1] text-[#6a5648]">
                <tr>
                  <th className="p-3 font-medium">وقت</th>
                  <th className="p-3 font-medium">طلب</th>
                  <th className="p-3 font-medium">زبون</th>
                  <th className="p-3 font-medium">هاتف</th>
                  <th className="p-3 font-medium">مدينة</th>
                  <th className="p-3 font-medium">COD</th>
                  <th className="p-3 font-medium">حالة</th>
                </tr>
              </thead>
              <tbody>
                {filteredAll.map((o) => (
                  <tr key={o.order_number} className="border-t border-[#f0e8df]">
                    <td className="p-3 text-xs text-[#6a5648] whitespace-nowrap">
                      {formatAdminDate(o.created_at)}
                    </td>
                    <td className="p-3 font-mono text-xs">{o.order_number}</td>
                    <td className="p-3 font-medium">{o.customer_name}</td>
                    <td className="p-3 dir-ltr text-left">{o.phone}</td>
                    <td className="p-3">{o.city}</td>
                    <td className="p-3 font-bold">{o.total_amount}</td>
                    <td className="p-3 text-xs">{o.status_label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
