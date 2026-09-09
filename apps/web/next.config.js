/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack configuration (empty object enables default)
  turbopack: {},
  async rewrites() {
    const apiBase = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
