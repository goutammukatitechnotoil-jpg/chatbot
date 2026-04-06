/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  serverExternalPackages: ['mongodb'],
  // Configure HMR for development
  webpackDevMiddleware: {
    watchOptions: {
      poll: 1000,
      aggregateTimeout: 300,
    }
  },
  // Configure HMR settings
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Configure HMR for client-side development
      if (dev) {
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
        };
      }
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        'child_process': false,
        'fs/promises': false,
        'timers/promises': false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
