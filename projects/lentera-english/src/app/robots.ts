// robots.txt (Rilis 11): index the public pages, not the app, admin or API.
import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/app', '/admin', '/api', '/masuk', '/daftar', '/download'] }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
