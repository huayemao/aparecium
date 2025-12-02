/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["prisma", "@prisma/client"],
    // 禁用appDir，使用传统的pages路由
  },
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
  // 增加webpack配置优化
  webpack: (config, { isServer }) => {
    // 优化服务器构建 - 移除不支持的配置
    return config;
  },
};

module.exports = nextConfig;
