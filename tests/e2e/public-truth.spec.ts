import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('public pages offer only supported actions and policy links', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Build the Connected Future' })).toBeVisible()
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

test('public landing page preserves the original rich IoT Club visual structure', async ({ page }) => {
  await page.goto('/')

  const primaryNavigation = page.getByRole('navigation', { name: 'Primary navigation' })
  await expect(primaryNavigation.getByRole('link', { name: 'Home' })).toBeVisible()
  await expect(primaryNavigation.getByRole('link', { name: 'About' })).toBeVisible()
  await expect(primaryNavigation.getByRole('link', { name: 'Roadmap' })).toBeVisible()
  await expect(primaryNavigation.getByRole('link', { name: 'IPDC Cell' })).toBeVisible()

  await expect(page.getByRole('heading', { name: 'Build the Connected Future' })).toBeVisible()
  await expect(page.getByText('Learn how physical devices, software, and communication technologies come together to create intelligent systems.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Join IoT Club', exact: true }).first()).toHaveAttribute('href', '/register')
  await expect(page.getByRole('heading', { name: 'Beyond the Classroom' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'What You Will Work With' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '16+ Month IoT Learning Roadmap' })).toBeVisible()
  await expect(page.locator('.glass-card').first()).toBeVisible()

  await expect(page.getByRole('heading', { name: 'A place to learn and build' })).toHaveCount(0)
})
