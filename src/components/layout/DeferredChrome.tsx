'use client';

import dynamic from 'next/dynamic';

const StickyOrderBar = dynamic(
  () =>
    import('@/components/home/StickyOrderBar').then((mod) => mod.StickyOrderBar),
  { ssr: false },
);

const WhatsAppButton = dynamic(
  () =>
    import('@/components/layout/WhatsAppButton').then(
      (mod) => mod.WhatsAppButton,
    ),
  { ssr: false },
);

const TrackingScripts = dynamic(
  () =>
    import('@/components/tracking/TrackingScripts').then(
      (mod) => mod.TrackingScripts,
    ),
  { ssr: false },
);

/** Load non-critical chrome after hydration so the first paint stays light on phones. */
export function DeferredChrome() {
  return (
    <>
      <TrackingScripts />
      <StickyOrderBar />
      <WhatsAppButton />
    </>
  );
}
