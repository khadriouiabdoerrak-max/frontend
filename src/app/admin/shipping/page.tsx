import type { Metadata } from 'next';
import ShippingDeskClient from './ShippingDeskClient';

export const metadata: Metadata = {
  title: 'مكتب الشحن | تاجكِ',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ShippingDeskClient />;
}
