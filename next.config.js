/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ["prisma", "@prisma/client"],
  },
  appDir: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // 字体优化配置
  optimizeFonts: true,
  // 图片优化配置
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // 性能优化配置
  productionBrowserSourceMaps: false,
  compress: true,
};

module.exports = nextConfig;
