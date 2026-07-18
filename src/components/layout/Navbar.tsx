'use client';

import Link from 'next/link';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { useCartStore } from '@/lib/store';
import { useEffect, useState } from 'react';

function IconBag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6h15l-1.5 9h-12z" />
      <path d="M6 6l-1-3H2" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

function IconMenu({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function Navbar() {
  const { openCart, items } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const itemCount = mounted
    ? items.reduce((total, item) => total + item.quantity, 0)
    : 0;

  const navLinks = [
    { href: '/', label: 'الرئيسية', prefetch: true },
    { href: '/collection', label: 'المجموعة', prefetch: false },
    { href: '/quiz', label: 'اختبار الشعر', prefetch: false },
    { href: '/guides', label: 'الدليل', prefetch: false },
    { href: '/contact', label: 'تواصلي معنا', prefetch: false },
  ];

  return (
    <>
      <header
        className={`sticky top-0 w-full z-40 ${
          isScrolled
            ? 'bg-ivory shadow-sm py-2.5'
            : 'bg-ivory py-3'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Logo / Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 shrink-0 group"
            aria-label="تاجكِ — الصفحة الرئيسية"
          >
            <BrandLogo className="transition-transform group-hover:scale-[1.03] shadow-sm ring-1 ring-champagne/50" />
            <div className="flex flex-col leading-none gap-0.5">
              <span className="text-xl sm:text-2xl font-bold text-cocoa leading-tight">
                تاجكِ
              </span>
              <span className="text-[10px] sm:text-[11px] text-gold font-medium tracking-wide">
                OXIPRIME
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-secondary">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={link.prefetch}
                className="hover:text-cocoa transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-btn hover:bg-champagne/30 transition-colors"
              aria-label="سلة التسوق"
            >
              <span className="hidden sm:block text-sm font-medium text-secondary">
                سلة التسوق
              </span>
              <div className="relative">
                <IconBag className="w-5 h-5 text-cocoa" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 bg-gold text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {itemCount}
                  </span>
                )}
              </div>
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-btn hover:bg-champagne/30 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="القائمة"
            >
              {menuOpen ? (
                <IconX className="w-5 h-5 text-cocoa" />
              ) : (
                <IconMenu className="w-5 h-5 text-cocoa" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-ivory border-t border-champagne/40 px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={link.prefetch}
                className="block py-3 text-base font-medium text-secondary hover:text-cocoa transition-colors border-b border-champagne/20 last:border-0"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
