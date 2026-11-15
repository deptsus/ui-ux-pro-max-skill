import type { NextConfig } from 'next';

// Security headers (Rilis 9). The only outside origin the browser talks to is
// the Supabase project (sign-in, recordings, backup links). Next.js puts small
// inline scripts in every page, hence 'unsafe-inline' for scripts; everything
// else is locked to this site. No eval, no plugins, no framing.
const supabase = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : '';
  } catch {
    return '';
  }
})();
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabase}`,
  `media-src 'self' blob: ${supabase}`,
  `connect-src 'self' ${supabase} ${supabase.replace(/^https:/, 'wss:')}`,
  "font-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].map((d) => d.trim()).join('; ');
const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), payment=(), usb=(), microphone=(self)' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const config: NextConfig = {
  // Short commit id of the build, shown with error reports in /admin.
  env: { NEXT_PUBLIC_RELEASE: (process.env.COMMIT_REF ?? 'local').slice(0, 7) },
  poweredByHeader: false,
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
      // Development (next dev) needs eval for hot reload; production gets the full set.
      ...(process.env.NODE_ENV === 'production' ? [{ source: '/:path*', headers: SECURITY_HEADERS }] : []),
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache' }],
      },
    ];
  },
};

export default config;
