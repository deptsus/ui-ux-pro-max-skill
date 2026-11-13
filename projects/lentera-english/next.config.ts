import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // PGlite (embedded dev database) ships WASM and must not be bundled.
  serverExternalPackages: ['@electric-sql/pglite'],
  // Turbopack's on-disk dev cache (.next/dev) went stale twice during
  // development: every page then reloaded in a loop ("HMR hash mismatch") and
  // the app never left its splash screen, with no error shown. Deleting
  // .next/dev fixed it each time. Compiling from scratch on `next dev` costs
  // well under a second here, so the cache is not worth that failure mode.
  experimental: { turbopackFileSystemCacheForDev: false },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache' }],
      },
    ];
  },
};

export default config;
