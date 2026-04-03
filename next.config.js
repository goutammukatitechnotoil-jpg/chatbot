/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  serverExternalPackages: ['mongodb'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
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
