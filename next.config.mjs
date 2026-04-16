import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Ne pas intercepter les requetes cross-origin (Firebase Storage, CDN, APIs)
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
      handler: 'NetworkOnly',
    },
    {
      urlPattern: /^https:\/\/.*\.cloudfunctions\.net\/.*/i,
      handler: 'NetworkOnly',
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/**',
      },
    ],
  },
  async redirects() {
    return [
      // Pages Wix → nouvelles URLs
      { source: '/bienfaits', destination: '/faq', permanent: true },
      { source: '/acupuncture-sociale', destination: '/services/acupuncture-sociale', permanent: true },
      { source: '/contactez-moi', destination: '/contact', permanent: true },
      { source: '/politique-de-confidentialite-et-cookies', destination: '/politique-de-confidentialite', permanent: true },
      { source: '/book-online', destination: '/reserver', permanent: true },
      { source: '/plans-pricing', destination: '/tarifs', permanent: true },
      // Blog : /post/slug → /blog/slug
      { source: '/post/:slug*', destination: '/blog/:slug*', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // COOP/COEP requis SEULEMENT pour l'editeur (FFmpeg.wasm + SharedArrayBuffer)
        // Les autres pages n'en ont pas besoin et ca casse Google Auth + Firebase Storage
        source: '/editeur/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      },
      {
        source: '/editeur-v2/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      },
    ]
  },
}

export default withPWA(nextConfig)
