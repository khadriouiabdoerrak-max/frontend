import { redirect } from 'next/navigation';

export default function ConfirmRedirectPage() {
  redirect('/admin?tab=confirm');
}
