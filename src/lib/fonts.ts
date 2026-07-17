import { IBM_Plex_Sans_Arabic } from 'next/font/google';

export const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-ibm-plex-arabic',
  preload: true,
  adjustFontFallback: true,
  fallback: ['Tahoma', 'Arial', 'sans-serif'],
});
