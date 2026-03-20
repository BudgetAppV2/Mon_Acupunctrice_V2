import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ]
  },
}

export default withPWA(nextConfig)
