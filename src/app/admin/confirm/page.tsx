import type { Metadata } from 'next';
import ConfirmDeskClient from './ConfirmDeskClient';

export const metadata: Metadata = {
  title: 'Confirmation | Tajouki',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ConfirmDeskClient />;
}
