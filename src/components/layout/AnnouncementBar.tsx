import { brand } from '@/lib/brand';

export function AnnouncementBar() {
  return (
    <div className="bg-cocoa text-ivory text-xs sm:text-sm py-2 px-4 text-center">
      {brand.name} · الدفع عند الاستلام داخل المغرب — الروتين الكامل 599 درهم
    </div>
  );
}
