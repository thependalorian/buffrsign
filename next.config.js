/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Fix multiple lockfiles warning by setting the correct root
  outputFileTracingRoot: __dirname,
  
  images: {
    qualities: [75, 90, 95, 100],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Configure for Docker deployment
    unoptimized: process.env.NODE_ENV === 'production' && process.env.DOCKER_DEPLOYMENT === 'true',
  },
  
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Environment-specific configurations
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Note: API configuration moved to individual route handlers in Next.js 15
  // Request size limits are now handled in route.ts files
  
  // Headers for security and CORS
  async headers() {
    return [
      {
        source: '/api/ai/:path*',
        headers: [
          // Security headers
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          // CORS headers (restricted for AI endpoints)
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NODE_ENV === 'development' ? 'http://localhost:3002' : 'https://buffrsign.com' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          // General API headers
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NODE_ENV === 'development' ? 'http://localhost:3002' : 'https://buffrsign.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
