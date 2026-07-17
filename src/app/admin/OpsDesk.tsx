'use client';

/**
 * Tajouki Ops — OMS confirmation + shipping
 * En Attente · Appel 1/2/3 · Reporté · Confirmé · Annulé + jours
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
  buildConfirmedWhatsAppMessage,
  buildDeliveredWhatsAppMessage,
  buildShippedWhatsAppMessage,
  customerWhatsAppHref,
  openCustomerWhatsApp,
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
  fetchOrderAudit,
  formatAdminDate,
  hasRealTracking,
  orderDateParts,
  patchAdminOrder,
  purgeAllAdminOrders,
  shipAdminOrder,
  syncOzonExpress,
  telHref,
  timeAgo,
} from '@/lib/admin';
import {
  buildCourierBatchText,
  isCallTodayQueue,
  nextAppelStatus,
  phoneRiskInfo,
  printCourierList,
  todayConfirmedForCourier,
} from '@/lib/opsQueue';
import { CitySelect } from '@/components/ui/CitySelect';
import { STALE_SHIP_DAYS } from '@/lib/cities';

type Mode = 'board' | 'orders' | 'ship';

type PipeFilter =
  | 'all'
  | 'call_today'
  | 'en_attente'
  | 'appel_1'
  | 'appel_2'
  | 'appel_3'
  | 'reporte'
  | 'confirmed'
  | 'shipped'
  | 'stale'
  | 'delivered'
  | 'returned'
  | 'cancelled';

type AuditEvent = {
  operator: string;
  action: string;
  detail: string;
  created_at: string;
};

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
    const beep = (at: number, freq: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, at);
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.2);
      osc.start(at);
      osc.stop(at + 0.22);
    };
    const t0 = ctx.currentTime;
    beep(t0, 880);
    beep(t0 + 0.24, 988);
    beep(t0 + 0.48, 1175);
    setTimeout(() => void ctx.close(), 900);
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
  if (o.status === 'APPEL_3' || o.status === 'APPEL_2') s += 120;
  if (o.status === 'APPEL_1' || o.status === 'NO_ANSWER') s += 80;
  if (o.status === 'REPORTE') s += 40;
  if ((o.days_open ?? 0) >= 2) s += 50;
  if (o.total_amount >= 500) s += 30;
  return s;
}

function isConfirmQueue(o: AdminOrder) {
  return [
    'PENDING_CONFIRMATION',
    'APPEL_1',
    'APPEL_2',
    'APPEL_3',
    'REPORTE',
    'NO_ANSWER',
  ].includes(o.status);
}

function isShipQueue(o: AdminOrder) {
  return (
    o.status === 'CONFIRMED' ||
    o.status === 'READY_TO_SHIP' ||
    o.status === 'SHIPPED'
  );
}

function isStaleShip(o: AdminOrder) {
  if (o.status !== 'SHIPPED') return false;
  const base = o.shipped_at || o.created_at;
  const days = Math.floor(
    (Date.now() - new Date(base).getTime()) / 86400000,
  );
  return days >= STALE_SHIP_DAYS;
}

function stageOf(o: AdminOrder): PipeFilter {
  switch (o.status) {
    case 'CANCELLED':
      return 'cancelled';
    case 'RETURNED':
      return 'returned';
    case 'DELIVERED':
      return 'delivered';
    case 'SHIPPED':
      return 'shipped';
    case 'CONFIRMED':
    case 'READY_TO_SHIP':
      return 'confirmed';
    case 'REPORTE':
      return 'reporte';
    case 'APPEL_3':
      return 'appel_3';
    case 'APPEL_2':
      return 'appel_2';
    case 'APPEL_1':
    case 'NO_ANSWER':
      return 'appel_1';
    default:
      return 'en_attente';
  }
}

function daysLabel(o: AdminOrder) {
  const open =
    typeof o.days_open === 'number'
      ? o.days_open
      : Math.max(
          0,
          Math.floor(
            (Date.now() - new Date(o.created_at).getTime()) / 86400000,
          ),
        );
  const inSt =
    typeof o.days_in_status === 'number'
      ? o.days_in_status
      : open;
  if (open <= 0 && inSt <= 0) return 'اليوم';
  if (open === inSt) return `${open} ي`;
  return `${open} ي · ${inSt} فالحالة`;
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

function tomorrowLocalInput() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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
  const [showReporte, setShowReporte] = useState(false);
  const [followUpDate, setFollowUpDate] = useState(tomorrowLocalInput());
  const [courier, setCourier] = useState('ozone');
  const [tracking, setTracking] = useState('');
  const [shipCity, setShipCity] = useState('');
  const [shipAddress, setShipAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [ozoneReady, setOzoneReady] = useState(false);
  const [shipConfirm, setShipConfirm] = useState(false);
  const [query, setQuery] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  const knownNew = useRef<Set<string>>(new Set());
  const primed = useRef(false);

  const goMode = (m: Mode) => {
    setMode(m);
    setShowCancel(false);
    setShowReporte(false);
    setDetailOpen(false);
    if (m === 'ship') setPipe('confirmed');
    else if (m === 'orders') {
      setPipe('all');
      setNewOrderCount(0);
    }
    router.replace(`/admin?tab=${modeQuery(m)}`, { scroll: false });
  };

  const openDetail = (id: string) => {
    setActiveId(id);
    setDetailOpen(true);
    setShowCancel(false);
    setShowReporte(false);
    const found = orders.find((o) => o.order_number === id);
    setShipCity(found?.city || '');
    setShipAddress(found?.address || '');
    setTracking(found?.tracking_number || '');
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setShowCancel(false);
    setShowReporte(false);
    setShipConfirm(false);
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
        if (brand.length) {
          playChime();
          setNewOrderCount((n) => n + brand.length);
        }
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
    else setCourier('ozone');
    if (saved) void load(saved);
    else setBooting(false);
  }, [load]);

  useEffect(() => {
    if (!token) return;
    void (async () => {
      try {
        const res = await fetch('/api/admin/couriers', {
          headers: { 'X-Admin-Token': token },
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          ozonexpress_configured?: boolean;
          default?: string;
        };
        setOzoneReady(Boolean(data.ozonexpress_configured));
        if (!localStorage.getItem(COURIER_PREF_KEY) && data.default) {
          setCourier(data.default);
        }
      } catch {
        /* ignore */
      }
    })();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const id = window.setInterval(() => void load(token, true), 20000);
    return () => window.clearInterval(id);
  }, [token, load]);

  const pipeCounts = useMemo(() => {
    const c: Record<PipeFilter, number> = {
      all: orders.length,
      call_today: 0,
      en_attente: 0,
      appel_1: 0,
      appel_2: 0,
      appel_3: 0,
      reporte: 0,
      confirmed: 0,
      shipped: 0,
      stale: 0,
      delivered: 0,
      returned: 0,
      cancelled: 0,
    };
    for (const o of orders) {
      c[stageOf(o)] += 1;
      if (isStaleShip(o)) c.stale += 1;
      if (isCallTodayQueue(o)) c.call_today += 1;
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

  const dateOptions = useMemo(() => {
    const years = new Set<number>();
    const months = new Set<number>();
    const days = new Set<number>();
    for (const o of orders) {
      const p = orderDateParts(o.created_at);
      if (!p.year) continue;
      years.add(p.year);
      if (!filterYear || p.year === Number(filterYear)) {
        months.add(p.month);
        if (
          (!filterYear || p.year === Number(filterYear)) &&
          (!filterMonth || p.month === Number(filterMonth))
        ) {
          days.add(p.day);
        }
      }
    }
    return {
      years: [...years].sort((a, b) => b - a),
      months: [...months].sort((a, b) => a - b),
      days: [...days].sort((a, b) => a - b),
    };
  }, [orders, filterYear, filterMonth]);

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
      } else if (pipe === 'stale') {
        list = list.filter(isStaleShip);
      }
    } else if (pipe === 'call_today') {
      list = list
        .filter(isCallTodayQueue)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime(),
        );
    } else if (pipe === 'stale') {
      list = list.filter(isStaleShip);
    } else if (pipe !== 'all') {
      list = list.filter((o) => stageOf(o) === pipe);
    }
    if (filterYear || filterMonth || filterDay) {
      list = list.filter((o) => {
        const p = orderDateParts(o.created_at);
        if (filterYear && p.year !== Number(filterYear)) return false;
        if (filterMonth && p.month !== Number(filterMonth)) return false;
        if (filterDay && p.day !== Number(filterDay)) return false;
        return true;
      });
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.customer_name.toLowerCase().includes(q) ||
          o.city.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.order_number.toLowerCase().includes(q) ||
          (o.status_label || '').toLowerCase().includes(q) ||
          (o.notes || '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [
    sortedOrders,
    mode,
    pipe,
    query,
    filterYear,
    filterMonth,
    filterDay,
  ]);

  const confirmWaiting =
    pipeCounts.en_attente +
    pipeCounts.appel_1 +
    pipeCounts.appel_2 +
    pipeCounts.appel_3 +
    pipeCounts.reporte;
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

  const cancelTop = useMemo(() => {
    const map = stats?.cancel_reasons || {};
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [stats]);

  useEffect(() => {
    setNotes(active?.notes || '');
    setTracking(active?.tracking_number || '');
    setShipCity(active?.city || '');
    setShipAddress(active?.address || '');
    setShowCancel(false);
    setShowReporte(false);
    setCopied(false);
    if (active?.follow_up_at) {
      try {
        const d = new Date(active.follow_up_at);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        setFollowUpDate(`${y}-${m}-${day}`);
      } catch {
        setFollowUpDate(tomorrowLocalInput());
      }
    } else {
      setFollowUpDate(tomorrowLocalInput());
    }
  }, [active?.order_number]);

  useEffect(() => {
    if (!detailOpen || !activeId || !token) {
      setAuditEvents([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchOrderAudit(token, activeId);
        if (!cancelled) setAuditEvents((data.events || []).slice(0, 5));
      } catch {
        if (!cancelled) setAuditEvents([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [detailOpen, activeId, token, active?.status, active?.notes]);

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
      setShowReporte(false);
    }
  };

  const markNoAnswer = (o: AdminOrder) => {
    const next = nextAppelStatus(o.status);
    const stamp = new Date().toLocaleString('fr-MA');
    void patch(o.order_number, {
      status: next,
      append_note: `ما جاوبش · ${stamp}`,
      mark_contacted: true,
    });
  };

  const doShip = async (id: string, withProvider = false) => {
    if (!token) return;
    if (shipCity.trim().length < 2 || shipAddress.trim().length < 8) {
      setError('المدينة والعنوان ناقصين — المدينة ≥ 2 والعنوان ≥ 8 أحرف');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const updated = await shipAdminOrder(token, id, {
        courier_name: withProvider ? 'ozone' : courier,
        tracking_number: withProvider ? '' : tracking,
        create_with_provider: withProvider,
        city: shipCity.trim() || undefined,
        address: shipAddress.trim() || undefined,
      });
      setOrders((prev) =>
        prev.map((o) => (o.order_number === id ? { ...o, ...updated } : o)),
      );
      // Keep detail open so ops can send WhatsApp tracking message
      void load(token, true);
      if (withProvider && updated.tracking_number) {
        openCustomerWhatsApp(
          updated.phone,
          buildShippedWhatsAppMessage(updated),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!detailOpen || !active || showCancel || showReporte || busy) return;
    const order = active;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDetail();
        return;
      }
      if (!isConfirmQueue(order)) return;
      if (e.key === '1') {
        e.preventDefault();
        markNoAnswer(order);
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        void patch(order.order_number, { status: 'CONFIRMED' });
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setShowReporte(true);
      } else if (e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        setShowCancel(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailOpen, active, showCancel, showReporte, busy, token]);

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
            <p className="text-sm text-[#6a5648]">Confirmation · Suivi</p>
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
            سير
          </button>
        </form>
      </div>
    );
  }

  const risk = active
    ? phoneRiskInfo(orders, active.phone, active.order_number)
    : null;
  const activeStage = active ? stageOf(active) : null;
  const shipAddrOk =
    shipCity.trim().length >= 2 && shipAddress.trim().length >= 8;

  const orderFilters: { id: PipeFilter; label: string }[] =
    mode === 'ship'
      ? [
          { id: 'confirmed', label: 'Confirmé' },
          { id: 'shipped', label: 'En cours' },
          { id: 'stale', label: `متأخر +${STALE_SHIP_DAYS}j` },
          { id: 'all', label: 'Tout envoi' },
        ]
      : [
          { id: 'call_today', label: 'طابور اليوم' },
          { id: 'all', label: 'الكل' },
          { id: 'en_attente', label: 'En Attente' },
          { id: 'appel_1', label: 'Appel 1' },
          { id: 'appel_2', label: 'Appel 2' },
          { id: 'appel_3', label: 'Appel 3' },
          { id: 'reporte', label: 'Reporté' },
          { id: 'confirmed', label: 'Confirmé' },
          { id: 'shipped', label: 'En cours' },
          { id: 'stale', label: 'متأخر' },
          { id: 'delivered', label: 'Livré' },
          { id: 'returned', label: 'Retourné' },
          { id: 'cancelled', label: 'Annulé' },
        ];

  const boardCards: {
    label: string;
    value: number;
    filter: PipeFilter;
    desk: Mode;
  }[] = [
    {
      label: 'En Attente',
      value: pipeCounts.en_attente,
      filter: 'en_attente',
      desk: 'orders',
    },
    {
      label: 'Appel 1',
      value: pipeCounts.appel_1,
      filter: 'appel_1',
      desk: 'orders',
    },
    {
      label: 'Reporté اليوم',
      value: stats?.reporte_due ?? pipeCounts.reporte,
      filter: 'reporte',
      desk: 'orders',
    },
    {
      label: 'Confirmé',
      value: pipeCounts.confirmed,
      filter: 'confirmed',
      desk: 'ship',
    },
    {
      label: 'En cours',
      value: pipeCounts.shipped,
      filter: 'shipped',
      desk: 'ship',
    },
    {
      label: 'متأخر',
      value: stats?.stale_shipped ?? pipeCounts.stale,
      filter: 'stale',
      desk: 'ship',
    },
    {
      label: 'Livré',
      value: pipeCounts.delivered,
      filter: 'delivered',
      desk: 'orders',
    },
    {
      label: 'Annulé',
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
            {newOrderCount > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setNewOrderCount(0);
                  setPipe('call_today');
                  setMode('orders');
                  setDetailOpen(false);
                  router.replace('/admin?tab=orders', { scroll: false });
                }}
                className="text-sm bg-red-600 text-white rounded-full px-3 py-1 tabular-nums font-bold animate-pulse"
              >
                +{newOrderCount} جديد
              </button>
            ) : null}
            <span className="text-sm bg-white border border-[#e6d9cc] rounded-full px-3 py-1 tabular-nums">
              {stats?.today ?? 0} اليوم
            </span>
            <span className="text-sm bg-white border border-[#e6d9cc] rounded-full px-3 py-1 tabular-nums">
              {confirmWaiting} confirmation
            </span>
            <span className="text-sm bg-white border border-[#e6d9cc] rounded-full px-3 py-1 tabular-nums">
              {shipReady} à expédier
            </span>
            {(stats?.sheet_errors ?? 0) > 0 ? (
              <span className="text-sm bg-amber-100 border border-amber-300 text-amber-900 rounded-full px-3 py-1 tabular-nums font-bold">
                Sheet ⚠ {stats?.sheet_errors}
              </span>
            ) : null}
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

      {mode === 'board' && (
        <div className="mx-auto max-w-[1400px] px-3 py-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold">Pipeline confirmation</h2>
            <p className="text-sm text-[#6a5648] mt-1">
              En Attente → Appel 1/2/3 → Reporté / Confirmé / Annulé — من بعد
              الشحن والتتبع.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setNewOrderCount(0);
              setPipe('call_today');
              setMode('orders');
              router.replace('/admin?tab=orders', { scroll: false });
            }}
            className="w-full text-right rounded-2xl border-2 border-[#2a1810] bg-[#2a1810] text-white p-5 hover:opacity-95"
          >
            <p className="text-sm opacity-80">ابدأ من هنا</p>
            <p className="text-2xl font-bold mt-1">طابور اليوم</p>
            <p className="text-4xl font-bold tabular-nums mt-2">
              {pipeCounts.call_today}
            </p>
          </button>

          {(stats?.sheet_errors ?? 0) > 0 ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 font-bold">
              أخطاء مزامنة Sheet: {stats?.sheet_errors} — راجع الطلبات ذات
              sheet_sync_error
            </div>
          ) : null}

          {stats?.weekly ? (
            <div className="rounded-2xl border border-[#e6d9cc] bg-white p-4 space-y-3">
              <p className="text-sm font-bold">إحصائيات الأسبوع</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-[#6a5648]">Confirm rate</p>
                  <p className="text-2xl font-bold tabular-nums">
                    {stats.weekly.confirm_rate}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6a5648]">Return rate</p>
                  <p className="text-2xl font-bold tabular-nums">
                    {stats.weekly.return_rate}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6a5648]">Confirmé</p>
                  <p className="text-2xl font-bold tabular-nums">
                    {stats.weekly.confirmed}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6a5648]">Commandes</p>
                  <p className="text-2xl font-bold tabular-nums">
                    {stats.weekly.orders}
                  </p>
                </div>
              </div>
              {stats.weekly.top_cities?.length ? (
                <div className="flex flex-wrap gap-2">
                  {stats.weekly.top_cities.slice(0, 5).map((c) => (
                    <span
                      key={c.city}
                      className="text-xs px-3 py-1.5 rounded-full bg-[#faf6f1] border border-[#e6d9cc]"
                    >
                      {c.city}: <b>{c.count}</b>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-2xl border border-[#e6d9cc] bg-white p-4">
              <p className="text-xs text-[#6a5648]">طلبات اليوم</p>
              <p className="text-3xl font-bold tabular-nums mt-1">
                {stats?.today ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e6d9cc] bg-white p-4">
              <p className="text-xs text-[#6a5648]">Livré اليوم</p>
              <p className="text-3xl font-bold tabular-nums mt-1 text-emerald-700">
                {stats?.today_delivered ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e6d9cc] bg-white p-4">
              <p className="text-xs text-[#6a5648]">Retourné اليوم</p>
              <p className="text-3xl font-bold tabular-nums mt-1 text-red-700">
                {stats?.today_returned ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e6d9cc] bg-white p-4">
              <p className="text-xs text-[#6a5648]">Annulé اليوم</p>
              <p className="text-3xl font-bold tabular-nums mt-1">
                {stats?.today_cancelled ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e6d9cc] bg-white p-4">
              <p className="text-xs text-[#6a5648]">À confirmer</p>
              <p className="text-3xl font-bold tabular-nums mt-1">
                {confirmWaiting}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e6d9cc] bg-white p-4">
              <p className="text-xs text-[#6a5648]">À expédier</p>
              <p className="text-3xl font-bold tabular-nums mt-1">{shipReady}</p>
            </div>
          </div>
          {cancelTop.length > 0 ? (
            <div className="rounded-2xl border border-[#e6d9cc] bg-white p-4">
              <p className="text-sm font-bold mb-2">أسباب الإلغاء</p>
              <div className="flex flex-wrap gap-2">
                {cancelTop.map(([reason, count]) => (
                  <span
                    key={reason}
                    className="text-xs px-3 py-1.5 rounded-full bg-[#faf6f1] border border-[#e6d9cc]"
                  >
                    {reason}: <b>{count}</b>
                  </span>
                ))}
              </div>
            </div>
          ) : null}

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

      {(mode === 'orders' || mode === 'ship') && (
        <div className="mx-auto max-w-[1400px] px-3 py-4 space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-bold text-lg">
                {mode === 'ship' ? 'Expédition & suivi' : 'Commandes'}
              </h2>
              <p className="text-sm text-[#6a5648]">
                فلتر الحالة · عمود الأيام ·{' '}
                <span className="font-bold text-[#2a1810]">تفاصيل</span> للتصرف.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={filterYear}
                onChange={(e) => {
                  setFilterYear(e.target.value);
                  setFilterMonth('');
                  setFilterDay('');
                }}
                className="p-2.5 rounded-xl border border-[#e6d9cc] bg-white text-sm"
                aria-label="السنة"
              >
                <option value="">سنة</option>
                {dateOptions.years.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
              <select
                value={filterMonth}
                onChange={(e) => {
                  setFilterMonth(e.target.value);
                  setFilterDay('');
                }}
                className="p-2.5 rounded-xl border border-[#e6d9cc] bg-white text-sm"
                aria-label="الشهر"
              >
                <option value="">شهر</option>
                {dateOptions.months.map((m) => (
                  <option key={m} value={String(m)}>
                    {String(m).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="p-2.5 rounded-xl border border-[#e6d9cc] bg-white text-sm"
                aria-label="اليوم"
              >
                <option value="">يوم</option>
                {dateOptions.days.map((d) => (
                  <option key={d} value={String(d)}>
                    {String(d).padStart(2, '0')}
                  </option>
                ))}
              </select>
              {(filterYear || filterMonth || filterDay) && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterYear('');
                    setFilterMonth('');
                    setFilterDay('');
                  }}
                  className="px-2.5 py-2.5 rounded-xl border border-[#e6d9cc] bg-white text-xs font-bold"
                >
                  مسح التاريخ
                </button>
              )}
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="بحث…"
                className="min-w-[180px] flex-1 p-2.5 rounded-xl border border-[#e6d9cc] bg-white text-sm"
              />
              {mode === 'orders' && (
                <button
                  type="button"
                  disabled={busy || !orders.length}
                  onClick={() => {
                    if (!token) return;
                    const ok = window.confirm(
                      `غادي تمسح ${orders.length} طلب كاملين من قاعدة البيانات. متأكد؟`,
                    );
                    if (!ok) return;
                    const typed = window.prompt(
                      'كتب DELETE_ALL_ORDERS باش يتأكد المسح:',
                    );
                    if (typed !== 'DELETE_ALL_ORDERS') {
                      setError('تم الإلغاء — النص غير مطابق');
                      return;
                    }
                    void (async () => {
                      setBusy(true);
                      setError('');
                      try {
                        const res = await purgeAllAdminOrders(token);
                        setOrders([]);
                        await load(token, true);
                        window.alert(
                          `تم المسح: ${res.deleted_orders} طلب`,
                        );
                      } catch (err) {
                        setError(
                          err instanceof Error ? err.message : 'فشل المسح',
                        );
                      } finally {
                        setBusy(false);
                      }
                    })();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-300 bg-red-50 text-red-800 text-sm font-bold disabled:opacity-50"
                >
                  مسح الكل
                </button>
              )}
              {mode === 'ship' ? (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      const batch = todayConfirmedForCourier(orders);
                      await copyText(buildCourierBatchText(batch));
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1200);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#e6d9cc] bg-white text-sm font-bold"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'تم النسخ' : 'نسخ مؤكدي اليوم'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      printCourierList(todayConfirmedForCourier(orders))
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#e6d9cc] bg-white text-sm font-bold"
                  >
                    طباعة
                  </button>
                  <button
                    type="button"
                    disabled={busy || !ozoneReady}
                    onClick={() => {
                      if (!token) return;
                      void (async () => {
                        setBusy(true);
                        setError('');
                        try {
                          await syncOzonExpress(token);
                          void load(token, true);
                        } catch (err) {
                          setError(
                            err instanceof Error ? err.message : 'فشل المزامنة',
                          );
                        } finally {
                          setBusy(false);
                        }
                      })();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#c45c26] text-white text-sm font-bold disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    تحديث Ozone
                  </button>
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
                    CSV
                  </button>
                </>
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

          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {orderFilters.map((f) => {
              const count =
                mode === 'ship' && f.id === 'all'
                  ? pipeCounts.confirmed + pipeCounts.shipped
                  : pipeCounts[f.id];
              const on = pipe === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPipe(f.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold border tabular-nums ${
                    on
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
            <table className="w-full text-sm text-right min-w-[1180px] border-collapse">
              <thead>
                <tr className="bg-[#dfe9d8] text-[#243d22] border-b border-[#b7c9b0]">
                  <th className="p-2.5 font-semibold border-l border-[#b7c9b0]">
                    تاريخ
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#b7c9b0]">
                    أيام
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#b7c9b0]">
                    N°
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#b7c9b0]">
                    Client
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#b7c9b0]">
                    Tél
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#b7c9b0]">
                    Ville
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#b7c9b0] min-w-[120px]">
                    Produits
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#b7c9b0]">
                    COD
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#b7c9b0]">
                    Statut
                  </th>
                  <th className="p-2.5 font-semibold border-l border-[#b7c9b0]">
                    Suivi / RDV
                  </th>
                  <th className="p-2.5 font-semibold">تفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {sheetRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="p-12 text-center text-[#6a5648]"
                    >
                      Aucune commande dans ce filtre.
                    </td>
                  </tr>
                ) : (
                  sheetRows.map((o, i) => {
                    const st = stageOf(o);
                    const hot =
                      st === 'en_attente' ||
                      st === 'appel_1' ||
                      st === 'appel_2' ||
                      st === 'appel_3' ||
                      st === 'reporte';
                    const old = (o.days_open ?? 0) >= 2;
                    return (
                      <tr
                        key={o.order_number}
                        className={`border-t border-[#dde8d8] ${
                          old
                            ? 'bg-red-50/60'
                            : hot && st !== 'en_attente'
                              ? 'bg-amber-50/70'
                              : i % 2 === 0
                                ? 'bg-white'
                                : 'bg-[#f4f8f1]'
                        } hover:bg-[#eaf2e4]`}
                      >
                        <td className="p-2.5 text-xs text-[#6a5648] whitespace-nowrap border-l border-[#dde8d8]">
                          {(() => {
                            const p = orderDateParts(o.created_at);
                            if (!p.year) return formatAdminDate(o.created_at);
                            return (
                              <>
                                <div className="font-bold text-[#2a1810] tabular-nums">
                                  {p.year}
                                </div>
                                <div className="tabular-nums">
                                  {String(p.day).padStart(2, '0')}/
                                  {String(p.month).padStart(2, '0')} · {p.time}
                                </div>
                              </>
                            );
                          })()}
                          <div className="text-[11px]">
                            {timeAgo(o.created_at)}
                          </div>
                        </td>
                        <td className="p-2.5 text-xs font-bold tabular-nums border-l border-[#dde8d8] whitespace-nowrap">
                          {daysLabel(o)}
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
                          className="p-2.5 text-xs max-w-[160px] truncate border-l border-[#dde8d8]"
                          title={o.products}
                        >
                          {o.products}
                        </td>
                        <td className="p-2.5 font-bold tabular-nums border-l border-[#dde8d8]">
                          {o.total_amount}
                        </td>
                        <td className="p-2.5 text-xs font-bold border-l border-[#dde8d8]">
                          {o.status_label}
                        </td>
                        <td className="p-2.5 text-xs border-l border-[#dde8d8]">
                          {o.courier_status
                            ? o.courier_status
                            : o.tracking_number
                              ? o.tracking_number
                              : o.follow_up_at
                                ? formatAdminDate(o.follow_up_at)
                                : '—'}
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
            {sheetRows.length} lignes
          </p>
        </div>
      )}

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
                <h3 className="font-bold">Fiche commande</h3>
                <p className="text-xs text-[#6a5648]">
                  {active.status_label} · {daysLabel(active)}
                </p>
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
                <div className="flex gap-2 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p>
                      Attention: annulations / retours / doublons sur ce numéro
                      ({risk.cancelled} annul. · {risk.returned} ret.).
                    </p>
                    {risk.openDupes.length > 0 ? (
                      <p className="mt-1 font-bold">
                        Ouverts:{' '}
                        {risk.openDupes.map((o) => o.order_number).join(', ')}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {active.sheet_sync_error ? (
                <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl px-3 py-2 font-bold">
                  Sheet sync: {active.sheet_sync_error}
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
                {(active.last_contacted_at || active.last_operator) && (
                  <p className="text-xs text-[#6a5648] mt-2">
                    آخر اتصال:{' '}
                    {active.last_contacted_at
                      ? formatAdminDate(active.last_contacted_at)
                      : '—'}
                    {active.last_operator
                      ? ` · ${active.last_operator}`
                      : ''}
                  </p>
                )}
              </div>

              <div className="text-sm space-y-2 rounded-xl bg-[#faf6f1] border border-[#e6d9cc] p-3">
                <p>
                  <span className="text-[#6a5648]">Produits: </span>
                  {active.products}
                </p>
                {active.follow_up_at ? (
                  <p>
                    <span className="text-[#6a5648]">RDV Reporté: </span>
                    {formatAdminDate(active.follow_up_at)}
                  </p>
                ) : null}
                {active.tracking_number ? (
                  <p>
                    <span className="text-[#6a5648]">Tracking: </span>
                    {active.tracking_number}
                  </p>
                ) : null}
                {active.courier_status ? (
                  <p>
                    <span className="text-[#6a5648]">Statut Ozone: </span>
                    <span className="font-bold text-[#c45c26]">
                      {active.courier_status}
                    </span>
                  </p>
                ) : null}
                <label className="block">
                  <span className="text-[#6a5648] text-xs font-bold">
                    المدينة / الحي
                  </span>
                  <div className="mt-1">
                    <CitySelect
                      value={shipCity}
                      onChange={setShipCity}
                      allowCustom
                      className="text-sm"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-[#6a5648] text-xs font-bold">
                    العنوان
                  </span>
                  <textarea
                    value={shipAddress}
                    onChange={(e) => setShipAddress(e.target.value)}
                    rows={2}
                    className="mt-1 w-full p-2.5 rounded-lg border border-[#e6d9cc] bg-white resize-none"
                    placeholder="الحي، الشارع..."
                  />
                </label>
                <button
                  type="button"
                  disabled={
                    busy ||
                    (shipCity.trim() === (active.city || '') &&
                      shipAddress.trim() === (active.address || ''))
                  }
                  onClick={() =>
                    void patch(active.order_number, {
                      status: active.status,
                      city: shipCity.trim(),
                      address: shipAddress.trim(),
                    })
                  }
                  className="w-full py-2.5 rounded-lg border-2 border-[#2a1810] font-bold text-sm disabled:opacity-40"
                >
                  حفظ المدينة والعنوان
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={telHref(active.phone)}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#2a1810] text-white font-bold text-sm"
                >
                  <Phone className="w-4 h-4" />
                  Appeler
                </a>
                <a
                  href={customerWhatsAppHref(
                    active.phone,
                    isConfirmQueue(active)
                      ? buildCallCenterConfirmMessage(active)
                      : active.status === 'DELIVERED'
                        ? buildDeliveredWhatsAppMessage(active)
                        : active.status === 'SHIPPED' ||
                            hasRealTracking(active)
                          ? buildShippedWhatsAppMessage(active)
                          : buildConfirmedWhatsAppMessage(active),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#25D366] text-white font-bold text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>

              <div className="space-y-2 rounded-xl border border-[#c8e6c9] bg-[#f3faf3] p-3">
                <p className="text-xs font-bold text-[#2e5a32]">
                  رسائل واتساب حسب الحالة
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {isConfirmQueue(active) ? (
                    <a
                      href={customerWhatsAppHref(
                        active.phone,
                        buildCallCenterConfirmMessage(active),
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2.5 rounded-lg bg-[#25D366] text-white text-sm font-bold text-center"
                    >
                      1) طلب التأكيد من الزبونة
                    </a>
                  ) : null}
                  {active.status === 'CONFIRMED' ||
                  active.status === 'READY_TO_SHIP' ? (
                    <a
                      href={customerWhatsAppHref(
                        active.phone,
                        buildConfirmedWhatsAppMessage(active),
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2.5 rounded-lg bg-[#25D366] text-white text-sm font-bold text-center"
                    >
                      2) طلبك تأكّد — غادي يتصيفط
                    </a>
                  ) : null}
                  {active.status === 'SHIPPED' || hasRealTracking(active) ? (
                    <a
                      href={customerWhatsAppHref(
                        active.phone,
                        buildShippedWhatsAppMessage(active),
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2.5 rounded-lg bg-[#25D366] text-white text-sm font-bold text-center"
                    >
                      3) طلبك تصيفط + رقم التتبع
                    </a>
                  ) : null}
                  {active.status === 'DELIVERED' ? (
                    <a
                      href={customerWhatsAppHref(
                        active.phone,
                        buildDeliveredWhatsAppMessage(active),
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2.5 rounded-lg bg-[#25D366] text-white text-sm font-bold text-center"
                    >
                      4) بعد التسليم — شكراً
                    </a>
                  ) : null}
                </div>
              </div>

              {hasRealTracking(active) ? (
                <button
                  type="button"
                  onClick={async () => {
                    await copyText(active.tracking_number || '');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1200);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#c45c26] text-[#c45c26] font-bold text-sm"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'تم نسخ التتبع' : 'نسخ رقم التتبع'}
                </button>
              ) : null}

              {isConfirmQueue(active) && !showCancel && !showReporte ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#6a5648]">
                    Confirmation
                  </p>
                  <p className="text-[11px] text-[#6a5648]">
                    اختصارات: 1 ما جاوبش · C تأكيد · R تأجيل · X إلغاء · Esc
                  </p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => markNoAnswer(active)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-amber-700 text-amber-900 font-bold disabled:opacity-40"
                  >
                    <PhoneMissed className="w-4 h-4" />
                    ما جاوبش
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      void (async () => {
                        await patch(
                          active.order_number,
                          { status: 'CONFIRMED' },
                          false,
                        );
                        openCustomerWhatsApp(
                          active.phone,
                          buildConfirmedWhatsAppMessage(active),
                        );
                      })();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-700 text-white font-bold disabled:opacity-40"
                  >
                    <Check className="w-5 h-5" />
                    Confirmé + واتساب
                  </button>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        ['APPEL_1', 'Appel 1'],
                        ['APPEL_2', 'Appel 2'],
                        ['APPEL_3', 'Appel 3'],
                      ] as const
                    ).map(([st, label]) => (
                      <button
                        key={st}
                        type="button"
                        disabled={busy || active.status === st}
                        onClick={() =>
                          void patch(active.order_number, { status: st })
                        }
                        className="flex items-center justify-center gap-1 py-3 rounded-xl border-2 border-amber-600 font-bold text-xs disabled:opacity-40"
                      >
                        <PhoneMissed className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void patch(active.order_number, {
                        status: 'PENDING_CONFIRMATION',
                      })
                    }
                    className="w-full py-3 rounded-xl border border-[#e6d9cc] font-bold text-sm"
                  >
                    En Attente
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setShowReporte(true)}
                    className="w-full py-3 rounded-xl border-2 border-sky-700 text-sky-900 font-bold text-sm"
                  >
                    Reporté
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setShowCancel(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-red-600 text-red-700 font-bold"
                  >
                    <X className="w-5 h-5" />
                    Annulé
                  </button>
                </div>
              ) : null}

              {isConfirmQueue(active) && showReporte ? (
                <div className="space-y-3">
                  <p className="font-bold">Reporté — jour du rappel</p>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#e6d9cc] bg-[#faf6f1]"
                  />
                  <button
                    type="button"
                    disabled={busy || !followUpDate}
                    onClick={() =>
                      void patch(
                        active.order_number,
                        {
                          status: 'REPORTE',
                          follow_up_at: `${followUpDate}T09:00:00`,
                          notes: notes || `Reporté au ${followUpDate}`,
                        },
                        true,
                      )
                    }
                    className="w-full py-3.5 rounded-xl bg-sky-800 text-white font-bold"
                  >
                    Enregistrer Reporté
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReporte(false)}
                    className="text-sm text-[#6a5648]"
                  >
                    رجوع
                  </button>
                </div>
              ) : null}

              {isConfirmQueue(active) && showCancel ? (
                <div className="space-y-3">
                  <p className="font-bold">Motif Annulé</p>
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

              {(active.status === 'CONFIRMED' ||
                active.status === 'READY_TO_SHIP') && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-[#6a5648]">Expédition</p>
                  {!shipAddrOk ? (
                    <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                      أكمل المدينة (≥ 2) والعنوان (≥ 8) قبل الشحن.
                    </p>
                  ) : null}
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
                    placeholder="N° tracking (يدوي)"
                    className="w-full p-3 rounded-xl border border-[#e6d9cc] bg-[#faf6f1]"
                  />
                  {hasRealTracking(active) ? (
                    <p className="text-sm text-center text-[#c45c26] font-bold bg-[#fff7f0] border border-[#f0d0b8] rounded-xl p-3">
                      تصيفط من قبل — {active.tracking_number}
                    </p>
                  ) : (
                    <button
                      type="button"
                      disabled={busy || !ozoneReady || !shipAddrOk}
                      onClick={() => {
                        if (!shipAddrOk) {
                          setError(
                            'المدينة والعنوان ناقصين — المدينة ≥ 2 والعنوان ≥ 8 أحرف',
                          );
                          return;
                        }
                        setShipConfirm(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#c45c26] text-white font-bold disabled:opacity-50"
                    >
                      <Truck className="w-4 h-4" />
                      {ozoneReady
                        ? 'إرسال إلى OzonExpress'
                        : 'OzonExpress غير مضبوط'}
                    </button>
                  )}
                  {shipConfirm ? (
                    <div className="rounded-xl border-2 border-[#c45c26] bg-[#fff7f0] p-3 space-y-2 text-sm">
                      <p className="font-bold">تأكيد الإرسال؟</p>
                      <p>
                        {active.customer_name} · {active.phone}
                      </p>
                      <p>
                        {shipCity || active.city} —{' '}
                        {shipAddress || active.address}
                      </p>
                      <p className="font-bold tabular-nums">
                        {active.total_amount} DH COD
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShipConfirm(false)}
                          className="py-2 rounded-lg border border-[#e6d9cc] font-bold"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          disabled={busy || !shipAddrOk}
                          onClick={() => {
                            setShipConfirm(false);
                            void doShip(active.order_number, true);
                          }}
                          className="py-2 rounded-lg bg-[#c45c26] text-white font-bold disabled:opacity-50"
                        >
                          نعم، إرسال
                        </button>
                      </div>
                    </div>
                  ) : null}
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
                    {copied ? 'Copié' : 'Copier pour transporteur'}
                  </button>
                  <button
                    type="button"
                    disabled={busy || !shipAddrOk}
                    onClick={() => void doShip(active.order_number, false)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#2a1810] text-white font-bold disabled:opacity-50"
                  >
                    <Truck className="w-4 h-4" />
                    Expédié يدوي (En cours)
                  </button>
                </div>
              )}

              {active.status === 'SHIPPED' && (
                <div className="space-y-2">
                  {hasRealTracking(active) ? (
                    <a
                      href={customerWhatsAppHref(
                        active.phone,
                        buildShippedWhatsAppMessage(active),
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white font-bold text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      واتساب التتبع للزبونة
                    </a>
                  ) : null}
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
                    Livré
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
                    Retourné
                  </button>
                </div>
              )}

              {(activeStage === 'delivered' ||
                activeStage === 'returned' ||
                activeStage === 'cancelled') && (
                <p className="text-sm text-[#6a5648] bg-[#faf6f1] border border-[#e6d9cc] rounded-xl px-3 py-3">
                  Commande clôturée:{' '}
                  <span className="font-bold">{active.status_label}</span>
                </p>
              )}

              <div>
                <label className="text-xs text-[#6a5648]">Note</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
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
                  Sauver note
                </button>
              </div>

              {auditEvents.length > 0 ? (
                <div className="rounded-xl border border-[#e6d9cc] bg-[#faf6f1] p-3 space-y-2">
                  <p className="text-xs font-bold text-[#6a5648]">آخر الأحداث</p>
                  <ul className="space-y-1.5 text-xs">
                    {auditEvents.map((ev, i) => (
                      <li
                        key={`${ev.created_at}-${i}`}
                        className="border-b border-[#e6d9cc]/60 pb-1.5 last:border-0"
                      >
                        <span className="font-bold">{ev.action}</span>
                        {ev.operator ? ` · ${ev.operator}` : ''}
                        <span className="text-[#6a5648]">
                          {' '}
                          · {formatAdminDate(ev.created_at)}
                        </span>
                        {ev.detail ? (
                          <p className="text-[#6a5648] mt-0.5">{ev.detail}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
