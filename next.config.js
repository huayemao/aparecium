/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // 外部服务器组件包配置
  serverExternalPackages: ["prisma", "@prisma/client"],
  // 图片优化配置
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // 性能优化配置
  productionBrowserSourceMaps: false,
  compress: true,
  // 路径别名配置
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias['@'] = require('path').resolve(__dirname, '.');
    return config;
  },
  // Turbopack configuration (empty to silence the warning)
  turbopack: {},
};

module.exports = nextConfig;
