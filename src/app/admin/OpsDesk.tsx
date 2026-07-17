'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
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
    const id = window.setInterval(() => void loadOrders(token, true), 20000);
    return () => window.clearInterval(id);
  }, [token, loadOrders]);

  const confirmQueue = useMemo(() => {
    return [...orders.filter(isConfirmQueue)].sort((a, b) => {
      const rank = (s: string) => (s === 'PENDING_CONFIRMATION' ? 0 : 1);
      const d = rank(a.status) - rank(b.status);
      if (d !== 0) return d;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [orders]);

  const shipQueue = useMemo(() => {
    return [...orders.filter(isShipQueue)].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [orders]);

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

  useEffect(() => {
    setNotesDraft(active?.notes || '');
    setTrackingDraft(active?.tracking_number || '');
    setShowCancel(false);
    setCopied(false);
  }, [active?.order_number]);

  const pickNextAfter = (orderNumber: string, list: AdminOrder[]) => {
    const idx = list.findIndex((o) => o.order_number === orderNumber);
    const remaining = list.filter((o) => o.order_number !== orderNumber);
    if (remaining.length === 0) {
      setActiveId(null);
      return;
    }
    const next = remaining[Math.min(idx, remaining.length - 1)];
    setActiveId(next.order_number);
  };

  const applyLocal = (updated: AdminOrder) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.order_number === updated.order_number ? { ...o, ...updated } : o,
      ),
    );
  };

  const runPatch = async (
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
  };

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
      pickNextAfter(orderNumber, shipQueue.filter((o) => o.status !== 'SHIPPED'));
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

  const logout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken('');
    setOrders([]);
    setInput('');
    document.title = 'مكتب التشغيل | تاجكِ';
  };

  const brandNew = stats?.pending ?? confirmQueue.filter((o) => o.status === 'PENDING_CONFIRMATION').length;
  const inTransit = stats?.shipped ?? 0;
  const confirmedToday = stats?.confirmed ?? 0;

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

  if (booting) {
    return (
      <div className="min-h-[100dvh] bg-[#f7f3ee] flex items-center justify-center text-[#7a6555]">
        جاري فتح المكتب…
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-[100dvh] bg-[#f7f3ee] flex items-center justify-center px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void loadOrders(input.trim());
          }}
          className="w-full max-w-sm bg-white border border-[#e8ddd0] rounded-2xl p-6 space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-center gap-2 text-[#3a2418]">
            <Lock className="w-5 h-5" />
            <h1 className="text-xl font-bold">مكتب التشغيل</h1>
          </div>
          <p className="text-sm text-[#7a6555] text-center leading-relaxed">
            نفس الرمز ديال المبيعات. هنا كتأكّدي، كتشحني، وكتتابعي كل الطلبات.
          </p>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="رمز الدخول"
            className="w-full p-4 border border-[#e8ddd0] rounded-xl bg-[#faf7f3] text-[#3a2418] text-center text-lg"
            autoFocus
          />
          {error ? (
            <p className="text-sm text-red-700 text-center">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-full bg-[#3a2418] text-[#f7f3ee] py-3.5 text-base font-bold rounded-xl disabled:opacity-50"
          >
            {loading ? 'جاري الدخول…' : 'دخول للمكتب'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#f7f3ee] text-[#3a2418]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-[#e8ddd0] bg-[#f7f3ee]/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-3 py-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-lg sm:text-xl font-bold">مكتب التشغيل</h1>
              <p className="text-xs text-[#7a6555]">تاجكِ · تأكيد ثم شحن ثم تتبع</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void loadOrders(token)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e8ddd0] bg-white text-sm font-medium"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e8ddd0] text-sm text-[#7a6555]"
              >
                <LogOut className="w-4 h-4" />
                خروج
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { label: 'جديد بالطابور', value: brandNew },
              { label: 'للتأكيد', value: confirmQueue.length },
              { label: 'مؤكد / جاهز', value: confirmedToday + (stats?.ready_to_ship || 0) },
              { label: 'فالتوصيل', value: inTransit },
              { label: 'مرتجع', value: stats?.returned ?? 0 },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-white border border-[#e8ddd0] px-3 py-2 text-center"
              >
                <p className="text-[11px] text-[#7a6555]">{s.label}</p>
                <p className="text-xl font-bold tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-1 p-1 rounded-xl bg-[#ebe3da]">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => selectTab(t.id)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  tab === t.id
                    ? 'bg-[#3a2418] text-[#f7f3ee]'
                    : 'text-[#5c4a3d] hover:bg-white/70'
                }`}
              >
                {t.label}
                {t.id === 'confirm' ? ` (${confirmQueue.length})` : ''}
                {t.id === 'ship'
                  ? ` (${shipQueue.filter((o) => o.status !== 'SHIPPED').length})`
                  : ''}
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

      {/* Confirm + Ship: queue + focus */}
      {(tab === 'confirm' || tab === 'ship') && (
        <div className="mx-auto max-w-6xl px-3 py-4">
          <div className="grid lg:grid-cols-[minmax(0,280px)_1fr] gap-4 items-start">
            {/* Queue */}
            <aside className="rounded-2xl border border-[#e8ddd0] bg-white overflow-hidden max-h-[70vh] lg:max-h-[calc(100dvh-220px)] flex flex-col">
              <div className="px-3 py-2.5 border-b border-[#e8ddd0] text-sm font-bold bg-[#faf7f3]">
                الطابور · {queueForTab.length}
              </div>
              <div className="overflow-y-auto flex-1">
                {queueForTab.length === 0 ? (
                  <p className="p-6 text-sm text-[#7a6555] text-center">
                    {tab === 'confirm'
                      ? 'ما كاين حتى طلب خاصو تأكيد.'
                      : 'ما كاين حتى طلب للشحن.'}
                  </p>
                ) : (
                  queueForTab.map((o) => {
                    const selected = o.order_number === activeId;
                    const isNew = o.status === 'PENDING_CONFIRMATION';
                    return (
                      <button
                        key={o.order_number}
                        type="button"
                        onClick={() => setActiveId(o.order_number)}
                        className={`w-full text-right px-3 py-3 border-b border-[#f0e8df] transition-colors ${
                          selected
                            ? 'bg-[#3a2418] text-[#f7f3ee]'
                            : isNew
                              ? 'bg-[#fff8e8] hover:bg-[#fff3d6]'
                              : 'hover:bg-[#faf7f3]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold truncate">{o.customer_name}</p>
                            <p
                              className={`text-xs truncate ${selected ? 'text-[#d4c4b4]' : 'text-[#7a6555]'}`}
                            >
                              {o.city} · {timeAgo(o.created_at)}
                              {isNew ? ' · جديد' : ''}
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

            {/* Focus card */}
            <section className="rounded-2xl border border-[#e8ddd0] bg-white min-h-[420px]">
              {!active ? (
                <div className="h-full flex items-center justify-center p-10 text-[#7a6555] text-sm">
                  اختاري طلب من الطابور باش تبداي.
                </div>
              ) : tab === 'confirm' ? (
                <ConfirmFocus
                  order={active}
                  busy={busy}
                  notesDraft={notesDraft}
                  setNotesDraft={setNotesDraft}
                  showCancel={showCancel}
                  setShowCancel={setShowCancel}
                  onSaveNotes={() => void saveNotes()}
                  onConfirm={() =>
                    void runPatch(active.order_number, { status: 'CONFIRMED' }, true)
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
                  onShip={(withProvider) => void runShip(active.order_number, withProvider)}
                  onDelivered={() =>
                    void runPatch(active.order_number, { status: 'DELIVERED' })
                  }
                  onReturned={() =>
                    void runPatch(active.order_number, { status: 'RETURNED' })
                  }
                />
              )}
            </section>
          </div>
        </div>
      )}

      {/* Monitor */}
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
                    ? 'bg-[#3a2418] text-white border-[#3a2418]'
                    : 'bg-white border-[#e8ddd0]'
                }`}
              >
                {f.label}
              </button>
            ))}
            <input
              value={monitorQuery}
              onChange={(e) => setMonitorQuery(e.target.value)}
              placeholder="بحث: اسم / مدينة / هاتف / رقم"
              className="ms-auto flex-1 min-w-[180px] max-w-sm p-2.5 rounded-xl border border-[#e8ddd0] bg-white text-sm"
            />
            <button
              type="button"
              onClick={() => {
                window.location.href = `/api/admin/orders/csv?token=${encodeURIComponent(token)}`;
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#3a2418] text-white text-sm font-bold"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#e8ddd0] bg-white">
            <table className="w-full text-sm text-right min-w-[960px]">
              <thead className="bg-[#faf7f3] text-[#7a6555]">
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
                    <td colSpan={9} className="p-8 text-center text-[#7a6555]">
                      ما كاين حتى طلب.
                    </td>
                  </tr>
                ) : (
                  monitorRows.map((o) => (
                    <tr key={o.order_number} className="border-t border-[#f0e8df] align-top">
                      <td className="p-3 whitespace-nowrap text-[#7a6555] text-xs">
                        {formatAdminDate(o.created_at)}
                      </td>
                      <td className="p-3 font-mono text-xs">{o.order_number}</td>
                      <td className="p-3 font-medium">{o.customer_name}</td>
                      <td className="p-3 dir-ltr text-left whitespace-nowrap">{o.phone}</td>
                      <td className="p-3">{o.city}</td>
                      <td className="p-3 max-w-[180px] text-xs">{o.products}</td>
                      <td className="p-3 font-bold whitespace-nowrap">{o.total_amount}</td>
                      <td className="p-3 text-xs">{o.tracking_number || '—'}</td>
                      <td className="p-3 whitespace-nowrap text-xs">{o.status_label}</td>
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
  busy,
  notesDraft,
  setNotesDraft,
  showCancel,
  setShowCancel,
  onSaveNotes,
  onConfirm,
  onNoAnswer,
  onCancel,
}: {
  order: AdminOrder;
  busy: boolean;
  notesDraft: string;
  setNotesDraft: (v: string) => void;
  showCancel: boolean;
  setShowCancel: (v: boolean) => void;
  onSaveNotes: () => void;
  onConfirm: () => void;
  onNoAnswer: () => void;
  onCancel: (reason: string) => void;
}) {
  const waHref = customerWhatsAppHref(
    order.phone,
    buildCallCenterConfirmMessage(order),
  );

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-[#7a6555]">
            {order.order_number} · {timeAgo(order.created_at)} · {order.status_label}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-1">{order.customer_name}</h2>
          <p className="text-lg dir-ltr text-left sm:text-right font-semibold mt-1 tracking-wide">
            {order.phone}
          </p>
        </div>
        <p className="text-2xl font-bold tabular-nums">{order.total_amount} DH</p>
      </div>

      <div className="rounded-xl bg-[#faf7f3] border border-[#e8ddd0] p-4 space-y-1">
        <p className="text-sm">
          <span className="text-[#7a6555]">المدينة: </span>
          {order.city}
        </p>
        <p className="text-sm">
          <span className="text-[#7a6555]">العنوان: </span>
          {order.address}
        </p>
        <p className="text-sm pt-1 border-t border-[#e8ddd0] mt-2">
          <span className="text-[#7a6555]">المنتجات: </span>
          {order.products}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a
          href={telHref(order.phone)}
          className="inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#3a2418] text-[#f7f3ee] text-base font-bold"
        >
          <Phone className="w-5 h-5" />
          اتصال
        </a>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#25D366] text-white text-base font-bold"
        >
          <MessageCircle className="w-5 h-5" />
          واتساب
        </a>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-[#7a6555]">ملاحظة داخلية</label>
        <textarea
          value={notesDraft}
          onChange={(e) => setNotesDraft(e.target.value)}
          rows={2}
          className="w-full p-3 rounded-xl border border-[#e8ddd0] bg-[#faf7f3] text-sm"
          placeholder="شنو قالت؟ وقت الاتصال؟"
        />
        <button
          type="button"
          disabled={busy}
          onClick={onSaveNotes}
          className="text-sm text-[#7a6555] underline disabled:opacity-40"
        >
          حفظ الملاحظة
        </button>
      </div>

      {!showCancel ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
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
            className="inline-flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-amber-600 text-amber-900 text-base font-bold disabled:opacity-40"
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
        <div className="space-y-3 pt-2 border-t border-[#e8ddd0]">
          <p className="text-sm font-bold">علاش ملغى؟</p>
          <div className="flex flex-wrap gap-2">
            {CANCEL_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                disabled={busy}
                onClick={() => onCancel(reason)}
                className="px-3 py-2 rounded-xl border border-[#e8ddd0] bg-[#faf7f3] text-sm font-medium hover:border-[#3a2418] disabled:opacity-40"
              >
                {reason}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowCancel(false)}
            className="text-sm text-[#7a6555]"
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
  onCopy,
  onExport,
  onReady,
  onShip,
  onDelivered,
  onReturned,
}: {
  order: AdminOrder;
  busy: boolean;
  courier: string;
  setCourier: (id: string) => void;
  trackingDraft: string;
  setTrackingDraft: (v: string) => void;
  copied: boolean;
  onCopy: () => void;
  onExport: () => void;
  onReady: () => void;
  onShip: (withProvider: boolean) => void;
  onDelivered: () => void;
  onReturned: () => void;
}) {
  const canShip =
    order.status === 'CONFIRMED' || order.status === 'READY_TO_SHIP';
  const inTransit = order.status === 'SHIPPED';

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-[#7a6555]">
            {order.order_number} · {order.status_label}
          </p>
          <h2 className="text-2xl font-bold mt-1">{order.customer_name}</h2>
          <p className="text-sm text-[#7a6555] mt-1">
            {order.city} — {order.address}
          </p>
          <p className="text-sm mt-2">{order.products}</p>
        </div>
        <p className="text-2xl font-bold tabular-nums">{order.total_amount} DH</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-[#7a6555]">الشركة:</span>
        {COURIERS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCourier(c.id)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              courier === c.id
                ? 'bg-[#3a2418] text-white border-[#3a2418]'
                : 'border-[#e8ddd0] bg-[#faf7f3]'
            }`}
          >
            {c.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onExport}
          className="ms-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e8ddd0] text-sm"
        >
          <Download className="w-4 h-4" />
          CSV
        </button>
      </div>

      <input
        value={trackingDraft}
        onChange={(e) => setTrackingDraft(e.target.value)}
        placeholder="رقم التتبع"
        className="w-full p-3.5 rounded-xl border border-[#e8ddd0] bg-[#faf7f3] text-sm"
      />

      {canShip ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={onCopy}
            className="inline-flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-[#3a2418] text-base font-bold"
          >
            <Copy className="w-5 h-5" />
            {copied ? 'تم النسخ' : 'نسخ للشركة'}
          </button>
          {order.status === 'CONFIRMED' ? (
            <button
              type="button"
              disabled={busy}
              onClick={onReady}
              className="inline-flex items-center justify-center gap-2 py-4 rounded-2xl border border-[#e8ddd0] text-base font-bold"
            >
              جهّز للطرد
            </button>
          ) : (
            <div />
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => onShip(false)}
            className="sm:col-span-2 inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#3a2418] text-[#f7f3ee] text-base font-bold"
          >
            <Truck className="w-5 h-5" />
            تم الإرسال للشركة
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onShip(true)}
            className="sm:col-span-2 inline-flex items-center justify-center gap-2 py-3 rounded-2xl border border-[#e8ddd0] text-sm font-bold text-[#7a6555]"
          >
            أرسل عبر المزود (webhook/يدوي)
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
