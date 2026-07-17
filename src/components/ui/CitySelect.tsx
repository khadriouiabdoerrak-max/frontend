'use client';

import { useMemo, useState } from 'react';
import { CHECKOUT_CITIES, cityLabel } from '@/lib/cities';

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  allowCustom?: boolean;
};

export function CitySelect({
  value,
  onChange,
  className = '',
  placeholder = 'اختاري المدينة',
  allowCustom = false,
}: Props) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return CHECKOUT_CITIES;
    return CHECKOUT_CITIES.filter(
      (c) =>
        c.label.includes(q.trim()) ||
        c.value.toLowerCase().includes(needle) ||
        (c.group || '').includes(q.trim()),
    );
  }, [q]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof CHECKOUT_CITIES>();
    for (const c of filtered) {
      const g = c.group || 'مدن';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(c);
    }
    return [...map.entries()];
  }, [filtered]);

  const display = value ? cityLabel(value) : '';

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full p-3.5 border rounded-btn bg-white text-right text-cocoa border-champagne/50"
      >
        {display || (
          <span className="text-muted-brown">{placeholder}</span>
        )}
      </button>
      {open ? (
        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-hidden rounded-xl border border-champagne/40 bg-white shadow-lg">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="بحث عن مدينة أو حي…"
            className="w-full p-2.5 border-b border-champagne/30 text-right text-sm outline-none"
          />
          <div className="max-h-52 overflow-y-auto text-right">
            {groups.map(([group, cities]) => (
              <div key={group}>
                <p className="px-3 py-1.5 text-[11px] font-bold text-muted-brown bg-[#faf6f1]">
                  {group}
                </p>
                {cities.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      onChange(c.value);
                      setOpen(false);
                      setQ('');
                    }}
                    className={`w-full px-3 py-2 text-sm text-right hover:bg-[#f5efe8] ${
                      value === c.value ? 'font-bold text-[#c45c26]' : ''
                    }`}
                  >
                    {group === 'الدار البيضاء' ? c.label : c.label}
                  </button>
                ))}
              </div>
            ))}
            {filtered.length === 0 ? (
              <p className="p-3 text-sm text-muted-brown">ما كايناش نتيجة</p>
            ) : null}
            {allowCustom && q.trim().length >= 2 ? (
              <button
                type="button"
                onClick={() => {
                  onChange(q.trim());
                  setOpen(false);
                  setQ('');
                }}
                className="w-full px-3 py-2 text-sm text-right border-t border-champagne/30 text-[#c45c26] font-bold"
              >
                استعملي «{q.trim()}»
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
