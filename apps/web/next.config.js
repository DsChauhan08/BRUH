/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@bruh/ui', '@bruh/crypto', '@bruh/db'],
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    domains: ['scontent.cdninstagram.com'],
  },
};

module.exports = nextConfig;
