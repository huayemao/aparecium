/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  serverExternalPackages: ["prisma", "@prisma/client"],
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  productionBrowserSourceMaps: false,
  compress: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias['@'] = require('path').resolve(__dirname, '.');
    return config;
  },
  turbopack: {},
};

module.exports = nextConfig;
