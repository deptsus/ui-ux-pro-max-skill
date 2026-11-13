import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // PGlite (embedded dev database) ships WASM and must not be bundled.
  serverExternalPackages: ['@electric-sql/pglite'],
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
