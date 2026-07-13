'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

const messages = [
  'الدفع عند الاستلام متوفر داخل المغرب',
  'عرض محدود: الروتين الكامل بـ 599 درهم بدل 796 درهم — توفيري 197 درهم',
  'توصلكِ الطلبية للدار مع تأكيد عبر الهاتف',
];

export function AnnouncementBar() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-cocoa text-ivory text-sm py-2.5 px-4 relative flex items-center justify-center gap-4">
      <div className="flex items-center gap-6">
        {messages.map((msg, i) => (
          <span
            key={i}
            className={`${i === current ? 'block' : 'hidden'} text-center`}
          >
            {msg}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 absolute left-4 top-1/2 -translate-y-1/2">
        {messages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i === current ? 'bg-gold' : 'bg-white/30'
            }`}
            aria-label={`رسالة ${i + 1}`}
          />
        ))}
      </div>

      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
        aria-label="إغلاق"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
