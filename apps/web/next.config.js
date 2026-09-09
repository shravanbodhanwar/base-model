/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { typedRoutes: false },
  async rewrites() {
    const apiBase = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
    const target = apiBase || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001');
    if (!target) {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: `${target}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
