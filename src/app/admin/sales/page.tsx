import type { Metadata } from 'next';
import AdminSalesClient from './AdminSalesClient';

export const metadata: Metadata = {
  title: 'Sales | Tajouki',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminSalesClient />;
}
