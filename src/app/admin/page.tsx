import type { Metadata } from 'next';
import { Suspense } from 'react';
import AdminShell from './AdminShell';

export const metadata: Metadata = {
  title: 'لوحة تحكم المدير | تاجكِ',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-background flex items-center justify-center text-muted-brown">
          جاري الفتح…
        </div>
      }
    >
      <AdminShell />
    </Suspense>
  );
}
