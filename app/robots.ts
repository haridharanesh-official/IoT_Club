import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/auth/',
        '/admin/',
        '/dashboard/',
        '/teacher/',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/membership/status',
      ],
    },
    sitemap: 'https://iotclub.dpdns.org/sitemap.xml',
    host: 'https://iotclub.dpdns.org',
  }
}
