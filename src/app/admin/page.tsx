import type { Metadata } from 'next';
import { Suspense } from 'react';
import OpsDesk from './OpsDesk';

export const metadata: Metadata = {
  title: 'مكتب التشغيل | تاجكِ',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-[#f5f0ea] flex items-center justify-center text-[#6a5648]">
          جاري الفتح…
        </div>
      }
    >
      <OpsDesk />
    </Suspense>
  );
}
