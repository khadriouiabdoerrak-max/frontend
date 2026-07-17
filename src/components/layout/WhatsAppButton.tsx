'use client';

import { getWhatsAppHref } from '@/lib/site';

const DEFAULT_MSG =
  'السلام عليكم، بغيت معلومات على روتين OXIPRIME والدفع عند الاستلام.';

export function WhatsAppButton() {
  const href = getWhatsAppHref(DEFAULT_MSG);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصلي عبر واتساب"
      className="fixed bottom-20 left-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#1ebe59] lg:bottom-6"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-current" aria-hidden>
        <path d="M16.04 3C9.4 3 4 8.3 4 14.8c0 2.08.56 4.1 1.62 5.88L4 29l8.54-1.56A12.2 12.2 0 0 0 16.04 26.6C22.68 26.6 28 21.3 28 14.8S22.68 3 16.04 3zm0 21.4c-1.86 0-3.68-.5-5.26-1.44l-.38-.22-5.06.92.96-4.92-.24-.4A9.9 9.9 0 0 1 6.1 14.8c0-5.4 4.5-9.8 9.94-9.8s9.94 4.4 9.94 9.8-4.5 9.8-9.94 9.8zm5.44-7.34c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.45-2.38-1.44-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.92-2.2-.24-.57-.48-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1-1.04 2.45s1.07 2.84 1.22 3.04c.15.2 2.1 3.2 5.1 4.48.71.3 1.27.48 1.7.62.72.23 1.37.2 1.88.12.57-.08 1.76-.72 2-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
      </svg>
    </a>
  );
}
