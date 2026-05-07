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
  // Libs natives Node a externaliser pour eviter parse webpack des binaires .node
  // (fixes: ./node_modules/@resvg/resvg-js-darwin-arm64/resvgjs.darwin-arm64.node)
  serverExternalPackages: ['@resvg/resvg-js', 'sharp', 'satori'],

  // Vercel Output File Tracing : exclure de la fonction serverless les assets
  // de la banque visuelle qui ne sont JAMAIS lus au runtime.
  // Le runtime cover-generator lit uniquement .jpg (backgrounds via pige.ts)
  // et .svg / .png (lineart via line-art-processor.ts). Les .eps sont des
  // sources Adobe Illustrator conservées en repo mais jamais touchées en prod.
  // Sans ces exclusions, la fonction api/cover/generate atteint 375 MB
  // (limite Vercel = 300 MB).
  outputFileTracingExcludes: {
    '*': [
      'content/visual-bank/_archive-ai/**',
      'content/visual-bank/_poc-output/**',
      'content/visual-bank/raw-downloads/**',
      'content/visual-bank/scripts/**',
      'content/visual-bank/**/*.eps',
      'content/visual-bank/**/.DS_Store',
    ],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
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
      // Canonicalisation www — non-www → www
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'acupuncturejudith.ca' }],
        destination: 'https://www.acupuncturejudith.ca/:path*',
        permanent: true,
      },
      // Pages Wix → nouvelles URLs
      { source: '/bienfaits', destination: '/faq', permanent: true },
      { source: '/acupuncture-sociale', destination: '/services/acupuncture-sociale', permanent: true },
      { source: '/contactez-moi', destination: '/contact', permanent: true },
      { source: '/politique-de-confidentialite-et-cookies', destination: '/politique-de-confidentialite', permanent: true },
      { source: '/book-online', destination: '/reserver', permanent: true },
      { source: '/plans-pricing', destination: '/tarifs', permanent: true },
      // Blog : /post/slug → /blog/slug
      { source: '/post/:slug*', destination: '/blog/:slug*', permanent: true },
      // Blog : slugs accentués (Wix) → ASCII
      { source: '/blog/b%C3%A9b%C3%A9-si%C3%A8ge-acupuncture', destination: '/blog/bebe-siege-acupuncture', permanent: true },
      { source: '/blog/pr%C3%A9paration-accouchement-induction-acupuncture', destination: '/blog/preparation-accouchement-induction-acupuncture', permanent: true },
      { source: '/blog/l-acupuncture-sociale-pratique-essentielle-pour-la-communaut%C3%A9', destination: '/blog/l-acupuncture-sociale-pratique-essentielle-pour-la-communaute', permanent: true },
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
