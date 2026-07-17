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
        <div className="min-h-[100dvh] bg-[#f7f3ee] flex items-center justify-center text-[#7a6555]">
          جاري فتح المكتب…
        </div>
      }
    >
      <OpsDesk />
    </Suspense>
  );
}
