import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('public pages offer only supported actions and policy links', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /internet of things club/i })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Footer' }).getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy')
  await expect(page.getByRole('navigation', { name: 'Footer' }).getByRole('link', { name: 'Club rules' })).toHaveAttribute('href', '/club-rules')
  await expect(page.getByText(/186 members|268 assets|live telemetry/i)).toHaveCount(0)

  await page.goto('/lab/live')
  await expect(page.getByText('Not yet available')).toBeVisible()
  await expect(page.getByText(/No physical device, broker, or sensor status is verified/i)).toBeVisible()
})

test('public landing page has no critical axe violations', async ({ page }) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations.filter((violation) => violation.impact === 'critical')).toEqual([])
})


test('security headers and crawl controls are present', async ({ page, request }) => {
  const response = await page.goto('/')
  expect(response?.headers()['x-content-type-options']).toBe('nosniff')
  expect(response?.headers()['x-frame-options']).toBe('DENY')
  expect(response?.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin')

  const robots = await request.get('/robots.txt')
  expect(robots.ok()).toBe(true)
  const robotsText = await robots.text()
  expect(robotsText).toContain('Disallow: /admin/')
  expect(robotsText).toContain('Disallow: /register')
  expect(robotsText).toContain('Sitemap: https://iotclub.dpdns.org/sitemap.xml')

  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.ok()).toBe(true)
  const sitemapText = await sitemap.text()
  expect(sitemapText).toContain('https://iotclub.dpdns.org/about')
  expect(sitemapText).not.toContain('/login')
  expect(sitemapText).not.toContain('/register')
})
