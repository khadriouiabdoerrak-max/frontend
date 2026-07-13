'use client';

import Link from 'next/link';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { openCart, items } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/collection', label: 'المجموعة' },
    { href: '/about', label: 'من نحن' },
    { href: '/contact', label: 'تواصلي معنا' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 w-full z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-ivory/95 backdrop-blur-md shadow-sm py-3'
            : 'bg-ivory py-4'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            {/* Circle mark */}
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: '#3A2418',
                border: '1px solid #C99A4A',
              }}
            >
              <span className="text-[10px] sm:text-xs font-bold text-gold tracking-widest font-sans leading-none">
                OXI
              </span>
            </div>
            {/* Text block */}
            <div className="flex flex-col leading-none">
              <span className="text-xl sm:text-2xl font-bold text-cocoa leading-tight">
                تاجكِ
              </span>
              <span className="text-[10px] text-muted-brown font-sans tracking-wider">
                .oxiprime
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-secondary">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
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
                <ShoppingBag className="w-5 h-5 text-cocoa" />
                {mounted && itemCount > 0 && (
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
                <X className="w-5 h-5 text-cocoa" />
              ) : (
                <Menu className="w-5 h-5 text-cocoa" />
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
