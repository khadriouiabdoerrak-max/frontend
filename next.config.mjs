/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Balance: sharp on phones, avoid huge desktop variants
    deviceSizes: [320, 360, 414, 640, 750, 828],
    imageSizes: [48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    qualities: [50, 55, 60, 65, 70],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'zustand'],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
