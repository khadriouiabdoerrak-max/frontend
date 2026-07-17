'use client';

/**
 * Tajouki Ops Desk v2 — built like a real COD call-center console:
 * urgency queue, customer history/risk, one-call focus, keyboard shortcuts, bulk ship.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Keyboard,
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

type TabId = 'confirm' | 'ship' | 'monitor';

const TABS: { id: TabId; label: string }[] = [
  { id: 'confirm', label: 'للتأكيد' },
  { id: 'ship', label: 'للشحن' },
  { id: 'monitor', label: 'المراقبة' },
];

const COURIERS = [
  { id: 'generic', label: 'عام' },
  { id: 'cathedis', label: 'Cathedis' },
  { id: 'ozone', label: 'Ozone' },
];

const MONITOR_FILTERS: { id: string; label: string }[] = [
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

const CALL_CHECKLIST = [
  'تأكيد الاسم والمنتج',
  'تأكيد الهاتف والمدينة',
  'العنوان + علامة قريبة (مدرسة، صيدلية…)',
  'توضيح الدفع عند الاستلام والمدة',
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
    osc.type = 'sine';
    osc.frequency.value = 920;
    gain.gain.value = 0.045;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => {
      osc.stop();
      void ctx.close();
    }, 160);
  } catch {
    /* ignore */
  }
}

function waitMinutes(iso: string) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.floor((Date.now() - t) / 60000);
}

function urgencyRank(o: AdminOrder) {
  const mins = waitMinutes(o.created_at);
  // Hot: older than 2h, or high COD, or NO_ANSWER needing callback
  let score = mins;
  if (o.status === 'NO_ANSWER') score += 90;
  if (o.total_amount >= 500) score += 40;
  if (mins >= 120) score += 80;
  if (mins >= 240) score += 120;
  return score;
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

function customerStats(orders: AdminOrder[], phone: string) {
  const same = orders.filter((o) => o.phone === phone);
  return {
    total: same.length,
    cancelled: same.filter((o) => o.status === 'CANCELLED').length,
    returned: same.filter((o) => o.status === 'RETURNED').length,
    delivered: same.filter((o) => o.status === 'DELIVERED').length,
    confirmed: same.filter((o) =>
      ['CONFIRMED', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED'].includes(o.status),
    ).length,
  };
}

export default function OpsDesk() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabId) || 'confirm';

  const [token, setToken] = useState('');
  const [input, setInput] = useState('');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [tab, setTab] = useState<TabId>(
    ['confirm', 'ship', 'monitor'].includes(initialTab) ? initialTab : 'confirm',
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [courier, setCourier] = useState('generic');
  const [trackingDraft, setTrackingDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const [monitorQuery, setMonitorQuery] = useState('');
  const [monitorFilter, setMonitorFilter] = useState('ALL');
  const [selectedShip, setSelectedShip] = useState<Set<string>>(new Set());
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [showKeys, setShowKeys] = useState(false);

  const knownNew = useRef<Set<string>>(new Set());
  const primed = useRef(false);

  const selectTab = (id: TabId) => {
    setTab(id);
    setShowCancel(false);
    router.replace(`/admin?tab=${id}`, { scroll: false });
  };

  const loadOrders = useCallback(async (secret: string, silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await fetchAdminOrders(secret);
      const next = data.orders || [];
      const newIds = next
        .filter((o) => o.status === 'PENDING_CONFIRMATION')
        .map((o) => o.order_number);

      if (primed.current) {
        const fresh = newIds.filter((id) => !knownNew.current.has(id));
        if (fresh.length > 0) {
          playChime();
          document.title = `(${fresh.length}) مكتب التشغيل | تاجكِ`;
        }
      } else {
        primed.current = true;
      }
      knownNew.current = new Set(newIds);
      setOrders(next);
      setStats(data.stats || null);
      setToken(secret);
      sessionStorage.setItem(ADMIN_TOKEN_KEY, secret);
    } catch (err) {
      if (!silent) {
        setOrders([]);
        setToken('');
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      }
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

  useEffect(() => {
    if (!token) return;
    const id = window.setInterval(() => void loadOrders(token, true), 15000);
    return () => window.clearInterval(id);
  }, [token, loadOrders]);

  const confirmQueue = useMemo(() => {
    return [...orders.filter(isConfirmQueue)].sort(
      (a, b) => urgencyRank(b) - urgencyRank(a),
    );
  }, [orders]);

  const shipQueue = useMemo(() => {
    return [...orders.filter(isShipQueue)].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [orders]);

  const toShipOnly = useMemo(
    () =>
      shipQueue.filter(
        (o) => o.status === 'CONFIRMED' || o.status === 'READY_TO_SHIP',
      ),
    [shipQueue],
  );

  const queueForTab = tab === 'ship' ? shipQueue : confirmQueue;

  useEffect(() => {
    if (tab === 'monitor') return;
    if (queueForTab.length === 0) {
      setActiveId(null);
      return;
    }
    if (!activeId || !queueForTab.some((o) => o.order_number === activeId)) {
      setActiveId(queueForTab[0].order_number);
    }
  }, [queueForTab, activeId, tab]);

  const active = useMemo(
    () => orders.find((o) => o.order_number === activeId) || null,
    [orders, activeId],
  );

  const activeHistory = useMemo(() => {
    if (!active) return null;
    return customerStats(orders, active.phone);
  }, [active, orders]);

  useEffect(() => {
    setNotesDraft(active?.notes || '');
    setTrackingDraft(active?.tracking_number || '');
    setShowCancel(false);
    setCopied(false);
    setChecklist({});
  }, [active?.order_number]);

  const pickNextAfter = (orderNumber: string, list: AdminOrder[]) => {
    const idx = list.findIndex((o) => o.order_number === orderNumber);
    const remaining = list.filter((o) => o.order_number !== orderNumber);
    if (remaining.length === 0) {
      setActiveId(null);
      return;
    }
    const next = remaining[Math.min(Math.max(idx, 0), remaining.length - 1)];
    setActiveId(next.order_number);
  };

  const applyLocal = (updated: AdminOrder) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.order_number === updated.order_number ? { ...o, ...updated } : o,
      ),
    );
  };

  const runPatch = useCallback(
    async (
      orderNumber: string,
      body: Record<string, unknown>,
      advanceConfirm = false,
    ) => {
      if (!token) return;
      setBusy(true);
      setError('');
      try {
        const updated = await patchAdminOrder(token, orderNumber, body);
        applyLocal(updated);
        if (advanceConfirm) pickNextAfter(orderNumber, confirmQueue);
        void loadOrders(token, true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطأ');
      } finally {
        setBusy(false);
        setShowCancel(false);
      }
    },
    [token, confirmQueue, loadOrders],
  );

  const runShip = async (orderNumber: string, withProvider: boolean) => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      const updated = await shipAdminOrder(token, orderNumber, {
        courier_name: courier,
        tracking_number: trackingDraft,
        create_with_provider: withProvider,
      });
      applyLocal(updated);
      pickNextAfter(orderNumber, toShipOnly);
      setSelectedShip((prev) => {
        const n = new Set(prev);
        n.delete(orderNumber);
        return n;
      });
      void loadOrders(token, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ');
    } finally {
      setBusy(false);
    }
  };

  const saveNotes = async () => {
    if (!token || !active) return;
    await runPatch(active.order_number, {
      status: active.status,
      notes: notesDraft,
    });
  };

  // Keyboard shortcuts — only on confirm tab with active order
  useEffect(() => {
    if (!token || tab !== 'confirm' || !active || showCancel) return;

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (busy) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        const idx = confirmQueue.findIndex(
          (o) => o.order_number === active.order_number,
        );
        const next = confirmQueue[idx + 1];
        if (next) setActiveId(next.order_number);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        const idx = confirmQueue.findIndex(
          (o) => o.order_number === active.order_number,
        );
        const prev = confirmQueue[idx - 1];
        if (prev) setActiveId(prev.order_number);
      } else if (e.key === '1') {
        e.preventDefault();
        void runPatch(active.order_number, { status: 'CONFIRMED' }, true);
      } else if (e.key === '2') {
        e.preventDefault();
        void runPatch(
          active.order_number,
          {
            status: 'NO_ANSWER',
            notes: notesDraft || 'ما جاوبش — إعادة اتصال',
          },
          true,
        );
      } else if (e.key === '3') {
        e.preventDefault();
        setShowCancel(true);
      } else if (e.key === 'c' || e.key === 'C') {
        window.location.href = telHref(active.phone);
      } else if (e.key === 'w' || e.key === 'W') {
        window.open(
          customerWhatsAppHref(
            active.phone,
            buildCallCenterConfirmMessage(active),
          ),
          '_blank',
        );
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [token, tab, active, showCancel, busy, confirmQueue, notesDraft, runPatch]);

  const logout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken('');
    setOrders([]);
    setInput('');
    document.title = 'مكتب التشغيل | تاجكِ';
  };

  const confirmRate = useMemo(() => {
    if (!stats) return null;
    const decided =
      stats.confirmed +
      stats.ready_to_ship +
      stats.shipped +
      stats.delivered +
      stats.cancelled +
      stats.returned;
    if (decided <= 0) return null;
    const ok =
      stats.confirmed +
      stats.ready_to_ship +
      stats.shipped +
      stats.delivered;
    return Math.round((ok / decided) * 100);
  }, [stats]);

  const deliveryRate =
    stats && stats.delivered + stats.returned > 0
      ? Math.round(
          (stats.delivered / (stats.delivered + stats.returned)) * 100,
        )
      : null;

  const hotCount = confirmQueue.filter(
    (o) => waitMinutes(o.created_at) >= 120 || o.status === 'NO_ANSWER',
  ).length;

  const monitorRows = useMemo(() => {
    let list = orders;
    if (monitorFilter !== 'ALL') {
      list = list.filter((o) => o.status === monitorFilter);
    }
    if (monitorQuery.trim()) {
      const q = monitorQuery.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.city.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.order_number.toLowerCase().includes(q) ||
          o.phone.includes(q),
      );
    }
    return list;
  }, [orders, monitorFilter, monitorQuery]);

  const toggleShipSelect = (id: string) => {
    setSelectedShip((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const copySelectedShip = async () => {
    const lines = toShipOnly
      .filter((o) => selectedShip.has(o.order_number))
      .map(buildCourierCopyLine);
    if (lines.length === 0) return;
    await copyText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (booting) {
    return (
      <div className="min-h-[100dvh] bg-[#f3efe9] flex items-center justify-center text-[#6b5748]">
        جاري فتح المكتب…
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-[100dvh] bg-[#f3efe9] flex items-center justify-center px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void loadOrders(input.trim());
          }}
          className="w-full max-w-sm bg-white border border-[#e5d9cc] rounded-2xl p-7 space-y-4 shadow-sm"
        >
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#3a2418] text-[#f3efe9] mb-1">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-[#2c1a12]">مكتب التشغيل</h1>
            <p className="text-sm text-[#6b5748] leading-relaxed">
              كونسول تأكيد وشحن COD — صُمّم لسرعة المكالمة وتقليل الإرجاع.
            </p>
          </div>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="رمز الدخول"
            className="w-full p-4 border border-[#e5d9cc] rounded-xl bg-[#faf6f1] text-[#2c1a12] text-center text-lg"
            autoFocus
          />
          {error ? (
            <p className="text-sm text-red-700 text-center">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-full bg-[#2c1a12] text-[#f3efe9] py-3.5 text-base font-bold rounded-xl disabled:opacity-50"
          >
            {loading ? 'جاري الدخول…' : 'دخول'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#f3efe9] text-[#2c1a12]">
      <header className="sticky top-0 z-30 border-b border-[#e5d9cc] bg-[#f3efe9]/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-3 py-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                مكتب التشغيل
              </h1>
              <p className="text-xs text-[#6b5748]">
                تاجكِ · أسرع تأكيد = أقل إرجاع
                {hotCount > 0 ? (
                  <span className="text-amber-800 font-semibold">
                    {' '}
                    · {hotCount} مستعجل
                  </span>
                ) : null}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowKeys((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e5d9cc] bg-white text-xs font-medium"
                title="اختصارات"
              >
                <Keyboard className="w-4 h-4" />
                <span className="hidden sm:inline">اختصارات</span>
              </button>
              <button
                type="button"
                onClick={() => void loadOrders(token)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e5d9cc] bg-white text-sm font-medium"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                />
                تحديث
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e5d9cc] text-sm text-[#6b5748]"
              >
                <LogOut className="w-4 h-4" />
                خروج
              </button>
            </div>
          </div>

          {showKeys ? (
            <div className="rounded-xl border border-[#e5d9cc] bg-white px-3 py-2 text-xs text-[#6b5748] flex flex-wrap gap-x-4 gap-y-1">
              <span>
                <kbd className="font-mono bg-[#f3efe9] px-1 rounded">1</kbd>{' '}
                تأكيد
              </span>
              <span>
                <kbd className="font-mono bg-[#f3efe9] px-1 rounded">2</kbd> ما
                جاوبش
              </span>
              <span>
                <kbd className="font-mono bg-[#f3efe9] px-1 rounded">3</kbd>{' '}
                إلغاء
              </span>
              <span>
                <kbd className="font-mono bg-[#f3efe9] px-1 rounded">C</kbd>{' '}
                اتصال
              </span>
              <span>
                <kbd className="font-mono bg-[#f3efe9] px-1 rounded">W</kbd>{' '}
                واتساب
              </span>
              <span>
                <kbd className="font-mono bg-[#f3efe9] px-1 rounded">↑↓</kbd>{' '}
                الطابور
              </span>
            </div>
          ) : null}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { label: 'للتأكيد', value: confirmQueue.length },
              { label: 'مستعجل +2س', value: hotCount, warn: hotCount > 0 },
              {
                label: 'نسبة التأكيد',
                value: confirmRate != null ? `${confirmRate}%` : '—',
              },
              { label: 'فالتوصيل', value: stats?.shipped ?? 0 },
              {
                label: 'نسبة التسليم',
                value: deliveryRate != null ? `${deliveryRate}%` : '—',
              },
              { label: 'اليوم', value: stats?.today ?? 0 },
            ].map((s) => (
              <div
                key={s.label}
                className={`rounded-xl border px-3 py-2 text-center ${
                  s.warn
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-white border-[#e5d9cc]'
                }`}
              >
                <p className="text-[11px] text-[#6b5748]">{s.label}</p>
                <p className="text-xl font-bold tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-1 p-1 rounded-xl bg-[#e8dfd4]">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => selectTab(t.id)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  tab === t.id
                    ? 'bg-[#2c1a12] text-[#f3efe9] shadow-sm'
                    : 'text-[#5c4a3d] hover:bg-white/60'
                }`}
              >
                {t.label}
                {t.id === 'confirm' ? ` (${confirmQueue.length})` : ''}
                {t.id === 'ship' ? ` (${toShipOnly.length})` : ''}
              </button>
            ))}
          </div>
        </div>
      </header>

      {error ? (
        <div className="mx-auto max-w-6xl px-3 pt-3">
          <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </p>
        </div>
      ) : null}

      {(tab === 'confirm' || tab === 'ship') && (
        <div className="mx-auto max-w-6xl px-3 py-4">
          <div className="grid lg:grid-cols-[minmax(0,300px)_1fr] gap-4 items-start">
            <aside className="rounded-2xl border border-[#e5d9cc] bg-white overflow-hidden max-h-[70vh] lg:max-h-[calc(100dvh-260px)] flex flex-col shadow-sm">
              <div className="px-3 py-2.5 border-b border-[#e5d9cc] text-sm font-bold bg-[#faf6f1] flex items-center justify-between">
                <span>الطابور · {queueForTab.length}</span>
                {tab === 'confirm' ? (
                  <span className="text-[10px] font-normal text-[#6b5748]">
                    مرتّب بالاستعجال
                  </span>
                ) : null}
              </div>
              <div className="overflow-y-auto flex-1">
                {queueForTab.length === 0 ? (
                  <p className="p-8 text-sm text-[#6b5748] text-center leading-relaxed">
                    {tab === 'confirm'
                      ? 'الطابور فاضي — مبروك. الطلبات الجدد غادي يطيحو هنا أوتوماتيك.'
                      : 'ما كاينش طرود جاهزة. أكّدي طلبات أولاً.'}
                  </p>
                ) : (
                  queueForTab.map((o) => {
                    const selected = o.order_number === activeId;
                    const mins = waitMinutes(o.created_at);
                    const hot = mins >= 120 || o.status === 'NO_ANSWER';
                    const hist = customerStats(orders, o.phone);
                    const risky = hist.cancelled + hist.returned >= 2;
                    return (
                      <button
                        key={o.order_number}
                        type="button"
                        onClick={() => setActiveId(o.order_number)}
                        className={`w-full text-right px-3 py-3 border-b border-[#f0e7dc] transition-colors ${
                          selected
                            ? 'bg-[#2c1a12] text-[#f3efe9]'
                            : hot
                              ? 'bg-amber-50 hover:bg-amber-100/80'
                              : 'hover:bg-[#faf6f1]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold truncate flex items-center gap-1">
                              {hot && !selected ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              ) : null}
                              {o.customer_name}
                              {risky && !selected ? (
                                <span className="text-[10px] text-red-700 font-semibold">
                                  خطر
                                </span>
                              ) : null}
                            </p>
                            <p
                              className={`text-xs truncate ${selected ? 'text-[#cbb8a8]' : 'text-[#6b5748]'}`}
                            >
                              {o.city} · {timeAgo(o.created_at)}
                              {o.status === 'NO_ANSWER' ? ' · إعادة' : ''}
                              {o.status === 'PENDING_CONFIRMATION' && mins < 30
                                ? ' · جديد'
                                : ''}
                            </p>
                          </div>
                          <p className="text-sm font-bold tabular-nums shrink-0">
                            {o.total_amount}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            <section className="rounded-2xl border border-[#e5d9cc] bg-white min-h-[440px] shadow-sm">
              {!active ? (
                <div className="h-full min-h-[440px] flex items-center justify-center p-10 text-[#6b5748] text-sm">
                  اختاري طلب من الطابور.
                </div>
              ) : tab === 'confirm' ? (
                <ConfirmFocus
                  order={active}
                  history={activeHistory}
                  busy={busy}
                  notesDraft={notesDraft}
                  setNotesDraft={setNotesDraft}
                  showCancel={showCancel}
                  setShowCancel={setShowCancel}
                  checklist={checklist}
                  setChecklist={setChecklist}
                  onSaveNotes={() => void saveNotes()}
                  onConfirm={() =>
                    void runPatch(
                      active.order_number,
                      { status: 'CONFIRMED' },
                      true,
                    )
                  }
                  onNoAnswer={() =>
                    void runPatch(
                      active.order_number,
                      {
                        status: 'NO_ANSWER',
                        notes: notesDraft || 'ما جاوبش — إعادة اتصال',
                      },
                      true,
                    )
                  }
                  onCancel={(reason) =>
                    void runPatch(
                      active.order_number,
                      {
                        status: 'CANCELLED',
                        cancel_reason: reason,
                        notes: reason,
                      },
                      true,
                    )
                  }
                />
              ) : (
                <ShipFocus
                  order={active}
                  busy={busy}
                  courier={courier}
                  setCourier={(id) => {
                    setCourier(id);
                    localStorage.setItem(COURIER_PREF_KEY, id);
                  }}
                  trackingDraft={trackingDraft}
                  setTrackingDraft={setTrackingDraft}
                  copied={copied}
                  selectedCount={selectedShip.size}
                  onToggleSelect={() => toggleShipSelect(active.order_number)}
                  isSelected={selectedShip.has(active.order_number)}
                  onCopySelected={() => void copySelectedShip()}
                  onCopy={async () => {
                    await copyText(buildCourierCopyLine(active));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1200);
                  }}
                  onExport={() => {
                    const qs = new URLSearchParams({
                      token,
                      template: courier,
                      status: 'CONFIRMED,READY_TO_SHIP',
                    });
                    window.location.href = `/api/admin/orders/export/courier?${qs}`;
                  }}
                  onReady={() =>
                    void runPatch(active.order_number, {
                      status: 'READY_TO_SHIP',
                      courier_name: courier,
                    })
                  }
                  onShip={(withProvider) =>
                    void runShip(active.order_number, withProvider)
                  }
                  onDelivered={() =>
                    void runPatch(active.order_number, { status: 'DELIVERED' })
                  }
                  onReturned={() =>
                    void runPatch(active.order_number, { status: 'RETURNED' })
                  }
                  onSelectAllToShip={() =>
                    setSelectedShip(
                      new Set(toShipOnly.map((o) => o.order_number)),
                    )
                  }
                />
              )}
            </section>
          </div>
        </div>
      )}

      {tab === 'monitor' && (
        <div className="mx-auto max-w-6xl px-3 py-4 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            {MONITOR_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setMonitorFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm border ${
                  monitorFilter === f.id
                    ? 'bg-[#2c1a12] text-white border-[#2c1a12]'
                    : 'bg-white border-[#e5d9cc]'
                }`}
              >
                {f.label}
              </button>
            ))}
            <input
              value={monitorQuery}
              onChange={(e) => setMonitorQuery(e.target.value)}
              placeholder="بحث: اسم / مدينة / هاتف / رقم"
              className="ms-auto flex-1 min-w-[180px] max-w-sm p-2.5 rounded-xl border border-[#e5d9cc] bg-white text-sm"
            />
            <button
              type="button"
              onClick={() => {
                window.location.href = `/api/admin/orders/csv?token=${encodeURIComponent(token)}`;
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2c1a12] text-white text-sm font-bold"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#e5d9cc] bg-white shadow-sm">
            <table className="w-full text-sm text-right min-w-[960px]">
              <thead className="bg-[#faf6f1] text-[#6b5748]">
                <tr>
                  <th className="p-3 font-medium">الوقت</th>
                  <th className="p-3 font-medium">الطلب</th>
                  <th className="p-3 font-medium">الزبون</th>
                  <th className="p-3 font-medium">الهاتف</th>
                  <th className="p-3 font-medium">المدينة</th>
                  <th className="p-3 font-medium">المنتجات</th>
                  <th className="p-3 font-medium">COD</th>
                  <th className="p-3 font-medium">تتبع</th>
                  <th className="p-3 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {monitorRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="p-8 text-center text-[#6b5748]"
                    >
                      ما كاين حتى طلب.
                    </td>
                  </tr>
                ) : (
                  monitorRows.map((o) => (
                    <tr
                      key={o.order_number}
                      className="border-t border-[#f0e7dc] align-top hover:bg-[#faf6f1]/80"
                    >
                      <td className="p-3 whitespace-nowrap text-[#6b5748] text-xs">
                        {formatAdminDate(o.created_at)}
                      </td>
                      <td className="p-3 font-mono text-xs">{o.order_number}</td>
                      <td className="p-3 font-medium">{o.customer_name}</td>
                      <td className="p-3 dir-ltr text-left whitespace-nowrap">
                        {o.phone}
                      </td>
                      <td className="p-3">{o.city}</td>
                      <td className="p-3 max-w-[180px] text-xs">{o.products}</td>
                      <td className="p-3 font-bold whitespace-nowrap">
                        {o.total_amount}
                      </td>
                      <td className="p-3 text-xs">
                        {o.tracking_number || '—'}
                      </td>
                      <td className="p-3 whitespace-nowrap text-xs">
                        {o.status_label}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfirmFocus({
  order,
  history,
  busy,
  notesDraft,
  setNotesDraft,
  showCancel,
  setShowCancel,
  checklist,
  setChecklist,
  onSaveNotes,
  onConfirm,
  onNoAnswer,
  onCancel,
}: {
  order: AdminOrder;
  history: ReturnType<typeof customerStats> | null;
  busy: boolean;
  notesDraft: string;
  setNotesDraft: (v: string) => void;
  showCancel: boolean;
  setShowCancel: (v: boolean) => void;
  checklist: Record<string, boolean>;
  setChecklist: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onSaveNotes: () => void;
  onConfirm: () => void;
  onNoAnswer: () => void;
  onCancel: (reason: string) => void;
}) {
  const waHref = customerWhatsAppHref(
    order.phone,
    buildCallCenterConfirmMessage(order),
  );
  const mins = waitMinutes(order.created_at);
  const hot = mins >= 120;
  const risky =
    history != null && history.cancelled + history.returned >= 2;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {(hot || risky) && (
        <div
          className={`rounded-xl px-3 py-2 text-sm font-medium flex items-start gap-2 ${
            risky
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-amber-50 text-amber-900 border border-amber-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            {risky
              ? `انتباه: هاد الرقم عندو ${history!.cancelled} إلغاء و ${history!.returned} إرجاع من قبل.`
              : `مستعجل: الطلب باقي كاينشي ${timeAgo(order.created_at)} — أكّدي بسرعة.`}
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-[#6b5748]">
            {order.order_number} · {timeAgo(order.created_at)} ·{' '}
            {order.status_label}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-1 tracking-tight">
            {order.customer_name}
          </h2>
          <p className="text-xl dir-ltr sm:text-right font-semibold mt-1 tabular-nums tracking-wide">
            {order.phone}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-2xl sm:text-3xl font-bold tabular-nums">
            {order.total_amount}{' '}
            <span className="text-base font-semibold text-[#6b5748]">DH</span>
          </p>
          <p className="text-xs text-[#6b5748]">الدفع عند الاستلام</p>
        </div>
      </div>

      {history && history.total > 1 ? (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded-lg bg-[#faf6f1] border border-[#e5d9cc]">
            طلبات سابقة: {history.total - 1}
          </span>
          <span className="px-2 py-1 rounded-lg bg-[#faf6f1] border border-[#e5d9cc]">
            تسليم: {history.delivered}
          </span>
          <span className="px-2 py-1 rounded-lg bg-[#faf6f1] border border-[#e5d9cc]">
            إلغاء: {history.cancelled}
          </span>
          <span className="px-2 py-1 rounded-lg bg-[#faf6f1] border border-[#e5d9cc]">
            إرجاع: {history.returned}
          </span>
        </div>
      ) : (
        <p className="text-xs text-[#6b5748]">زبونة جديدة (أول طلب فالقائمة).</p>
      )}

      <div className="rounded-xl bg-[#faf6f1] border border-[#e5d9cc] p-4 space-y-1.5">
        <p className="text-sm">
          <span className="text-[#6b5748]">المدينة: </span>
          <strong>{order.city}</strong>
        </p>
        <p className="text-sm">
          <span className="text-[#6b5748]">العنوان: </span>
          {order.address}
        </p>
        <p className="text-sm pt-2 border-t border-[#e5d9cc]">
          <span className="text-[#6b5748]">المنتجات: </span>
          {order.products}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a
          href={telHref(order.phone)}
          className="inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#2c1a12] text-[#f3efe9] text-base font-bold active:scale-[0.99]"
        >
          <Phone className="w-5 h-5" />
          اتصال
        </a>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#25D366] text-white text-base font-bold active:scale-[0.99]"
        >
          <MessageCircle className="w-5 h-5" />
          واتساب
        </a>
      </div>

      <div className="rounded-xl border border-[#e5d9cc] p-3 space-y-2">
        <p className="text-xs font-bold text-[#6b5748]">تشيك ليست المكالمة</p>
        {CALL_CHECKLIST.map((item) => (
          <label
            key={item}
            className="flex items-center gap-2 text-sm cursor-pointer"
          >
            <input
              type="checkbox"
              checked={!!checklist[item]}
              onChange={() =>
                setChecklist((prev) => ({ ...prev, [item]: !prev[item] }))
              }
              className="rounded border-[#c4b5a5]"
            />
            {item}
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-xs text-[#6b5748]">ملاحظة داخلية</label>
        <textarea
          value={notesDraft}
          onChange={(e) => setNotesDraft(e.target.value)}
          rows={2}
          className="w-full p-3 rounded-xl border border-[#e5d9cc] bg-[#faf6f1] text-sm"
          placeholder="علامة قريبة، رقم ثاني، وقت مناسب للاتصال…"
        />
        <button
          type="button"
          disabled={busy}
          onClick={onSaveNotes}
          className="text-sm text-[#6b5748] underline disabled:opacity-40"
        >
          حفظ الملاحظة
        </button>
      </div>

      {!showCancel ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            disabled={busy || order.status === 'CONFIRMED'}
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-700 text-white text-base font-bold disabled:opacity-40"
          >
            <Check className="w-5 h-5" />
            تأكيد
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onNoAnswer}
            className="inline-flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-amber-600 text-amber-950 text-base font-bold disabled:opacity-40"
          >
            <PhoneMissed className="w-5 h-5" />
            ما جاوبش
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setShowCancel(true)}
            className="inline-flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-red-600 text-red-700 text-base font-bold disabled:opacity-40"
          >
            <X className="w-5 h-5" />
            إلغاء
          </button>
        </div>
      ) : (
        <div className="space-y-3 pt-2 border-t border-[#e5d9cc]">
          <p className="text-sm font-bold">علاش ملغى؟</p>
          <div className="flex flex-wrap gap-2">
            {CANCEL_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                disabled={busy}
                onClick={() => onCancel(reason)}
                className="px-3 py-2.5 rounded-xl border border-[#e5d9cc] bg-[#faf6f1] text-sm font-medium hover:border-[#2c1a12] disabled:opacity-40"
              >
                {reason}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowCancel(false)}
            className="text-sm text-[#6b5748]"
          >
            رجوع
          </button>
        </div>
      )}
    </div>
  );
}

function ShipFocus({
  order,
  busy,
  courier,
  setCourier,
  trackingDraft,
  setTrackingDraft,
  copied,
  selectedCount,
  isSelected,
  onToggleSelect,
  onCopySelected,
  onCopy,
  onExport,
  onReady,
  onShip,
  onDelivered,
  onReturned,
  onSelectAllToShip,
}: {
  order: AdminOrder;
  busy: boolean;
  courier: string;
  setCourier: (id: string) => void;
  trackingDraft: string;
  setTrackingDraft: (v: string) => void;
  copied: boolean;
  selectedCount: number;
  isSelected: boolean;
  onToggleSelect: () => void;
  onCopySelected: () => void;
  onCopy: () => void;
  onExport: () => void;
  onReady: () => void;
  onShip: (withProvider: boolean) => void;
  onDelivered: () => void;
  onReturned: () => void;
  onSelectAllToShip: () => void;
}) {
  const canShip =
    order.status === 'CONFIRMED' || order.status === 'READY_TO_SHIP';
  const inTransit = order.status === 'SHIPPED';

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-[#6b5748]">
            {order.order_number} · {order.status_label}
          </p>
          <h2 className="text-2xl font-bold mt-1">{order.customer_name}</h2>
          <p className="text-sm text-[#6b5748] mt-1">
            {order.city} — {order.address}
          </p>
          <p className="text-sm mt-2">{order.products}</p>
          <p className="text-sm dir-ltr mt-1">{order.phone}</p>
        </div>
        <p className="text-2xl font-bold tabular-nums">{order.total_amount} DH</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center rounded-xl bg-[#faf6f1] border border-[#e5d9cc] p-3">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
          />
          تحديد للنسخ الجماعي
        </label>
        <button
          type="button"
          onClick={onSelectAllToShip}
          className="text-xs underline text-[#6b5748]"
        >
          تحديد الكل الجاهز
        </button>
        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={onCopySelected}
          className="ms-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5d9cc] bg-white text-sm font-medium disabled:opacity-40"
        >
          <Copy className="w-3.5 h-3.5" />
          نسخ المحدد ({selectedCount})
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-[#6b5748]">الشركة:</span>
        {COURIERS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCourier(c.id)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              courier === c.id
                ? 'bg-[#2c1a12] text-white border-[#2c1a12]'
                : 'border-[#e5d9cc] bg-[#faf6f1]'
            }`}
          >
            {c.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onExport}
          className="ms-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e5d9cc] text-sm"
        >
          <Download className="w-4 h-4" />
          CSV
        </button>
      </div>

      <input
        value={trackingDraft}
        onChange={(e) => setTrackingDraft(e.target.value)}
        placeholder="رقم التتبع"
        className="w-full p-3.5 rounded-xl border border-[#e5d9cc] bg-[#faf6f1] text-sm"
      />

      {canShip ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={onCopy}
            className="inline-flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-[#2c1a12] text-base font-bold"
          >
            <Copy className="w-5 h-5" />
            {copied ? 'تم النسخ' : 'نسخ هاد الطلب'}
          </button>
          {order.status === 'CONFIRMED' ? (
            <button
              type="button"
              disabled={busy}
              onClick={onReady}
              className="inline-flex items-center justify-center gap-2 py-4 rounded-2xl border border-[#e5d9cc] text-base font-bold"
            >
              جهّز للطرد
            </button>
          ) : (
            <div className="hidden sm:block" />
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => onShip(false)}
            className="sm:col-span-2 inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#2c1a12] text-[#f3efe9] text-base font-bold"
          >
            <Truck className="w-5 h-5" />
            تم الإرسال للشركة
          </button>
        </div>
      ) : null}

      {inTransit ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={onDelivered}
            className="inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-700 text-white text-base font-bold"
          >
            <CheckCircle2 className="w-5 h-5" />
            تم التسليم
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onReturned}
            className="inline-flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-red-600 text-red-700 text-base font-bold"
          >
            <RotateCcw className="w-5 h-5" />
            مرتجع
          </button>
        </div>
      ) : null}
    </div>
  );
}
