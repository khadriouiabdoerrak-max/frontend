/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Sharp on phones, still capped for weight
    deviceSizes: [320, 360, 414, 640, 750, 828, 1080],
    imageSizes: [48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    qualities: [60, 65, 70, 72, 75, 78],
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
