'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

function useDeferredReady(timeoutMs = 4000) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let done = false;
    let idleId: number | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;

    const enable = () => {
      if (done) return;
      done = true;
      setReady(true);
      window.removeEventListener('scroll', enable);
      window.removeEventListener('pointerdown', enable);
      window.removeEventListener('touchstart', enable);
      window.removeEventListener('keydown', enable);
      if (idleId !== undefined && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timerId !== undefined) clearTimeout(timerId);
    };

    window.addEventListener('scroll', enable, { once: true, passive: true });
    window.addEventListener('pointerdown', enable, { once: true });
    window.addEventListener('touchstart', enable, {
      once: true,
      passive: true,
    });
    window.addEventListener('keydown', enable, { once: true });

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(enable, { timeout: timeoutMs });
    } else {
      timerId = setTimeout(enable, timeoutMs);
    }

    return () => {
      done = true;
      window.removeEventListener('scroll', enable);
      window.removeEventListener('pointerdown', enable);
      window.removeEventListener('touchstart', enable);
      window.removeEventListener('keydown', enable);
      if (idleId !== undefined && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timerId !== undefined) clearTimeout(timerId);
    };
  }, [timeoutMs]);

  return ready;
}

export function TrackingScripts() {
  const ready = useDeferredReady(4000);
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  const snapchatPixelId = process.env.NEXT_PUBLIC_SNAPCHAT_PIXEL_ID;

  if (!ready) return null;

  return (
    <>
      {metaPixelId && (
        <Script id="meta-pixel" strategy="lazyOnload">
          {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${metaPixelId}');
          fbq('track', 'PageView');
        `}
        </Script>
      )}

      {tiktokPixelId && (
        <Script id="tiktok-pixel" strategy="lazyOnload">
          {`
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            ttq.load('${tiktokPixelId}');
            ttq.page();
          }(window, document, 'ttq');
        `}
        </Script>
      )}

      {snapchatPixelId && (
        <Script id="snapchat-pixel" strategy="lazyOnload">
          {`
          (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
          {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
          a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
          r.src=n;var u=t.getElementsByTagName(s)[0];
          u.parentNode.insertBefore(r,u);})(window,document,
          'https://sc-static.net/scevent.min.js');
          snaptr('init', '${snapchatPixelId}');
          snaptr('track', 'PAGE_VIEW');
        `}
        </Script>
      )}
    </>
  );
}
