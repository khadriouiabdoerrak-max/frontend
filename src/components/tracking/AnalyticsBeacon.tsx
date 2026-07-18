'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/** Lightweight first-party page_view → backend (Morocco / non-VPN filter server-side). */
export function AnalyticsBeacon() {
  const pathname = usePathname();
  const last = useRef('');

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    if (last.current === pathname) return;
    last.current = pathname;

    const body = JSON.stringify({
      path: pathname,
      event_type: 'page_view',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    });

    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics/event', blob);
        return;
      }
    } catch {
      /* fall through */
    }

    void fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
