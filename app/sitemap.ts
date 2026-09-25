import type { MetadataRoute } from 'next'

const siteUrl = 'https://iotclub.dpdns.org'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-09-25T00:00:00+05:30')

  return [
    { url: siteUrl, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/about`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/club-rules`, lastModified, changeFrequency: 'yearly', priority: 0.4 },
  ]
}
