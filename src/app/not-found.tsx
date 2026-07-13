import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-8xl font-bold font-sans tracking-tighter mb-4 text-gray-200">404</h1>
      <h2 className="text-2xl font-bold mb-6">الصفحة غير موجودة</h2>
      <p className="text-secondary mb-10 max-w-md leading-relaxed">
        عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      <Link 
        href="/" 
        className="bg-accent text-white px-10 py-4 font-bold tracking-widest hover:bg-gray-800 transition-colors rounded-sm"
      >
        العودة للصفحة الرئيسية
      </Link>
    </div>
  );
}