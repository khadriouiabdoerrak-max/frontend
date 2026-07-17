import { redirect } from 'next/navigation';

export default function ShippingRedirectPage() {
  redirect('/admin?tab=ship');
}
