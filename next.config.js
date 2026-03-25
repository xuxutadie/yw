/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // 安全与合规配置
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      // 为PDF文件移除所有限制
      {
        source: '/resources/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: '',
          },
          {
            key: 'Content-Security-Policy',
            value: '',
          },
          {
            key: 'X-Frame-Options',
            value: '',
          },
        ],
      },
    ]
  },
  // 确保仅教师访问
  async redirects() {
    return [
      {
        source: '/student/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/parent/:path*',
        destination: '/',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
