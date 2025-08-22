module.exports = {
  trailingSlash: false,
  async rewrites() {
    return [
      {
        source: '/alerts/verify/:path*',
        destination: '/index.html'
      },
      {
        source: '/alerts/manage/:path*', 
        destination: '/index.html'
      },
      {
        source: '/((?!api|_next/static|_next/image|favicon|robots|sitemap|manifest|.*\\.).*)',
        destination: '/index.html'
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/alerts/(.*)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate'
          }
        ]
      }
    ];
  }
};