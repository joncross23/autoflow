import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  // Use saved auth state
  test.use({ storageState: 'e2e/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('should display dashboard with stats', async ({ page }) => {
    // Check the page header
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

    // Stats section should be visible
    await expect(page.getByTestId('dashboard-stats')).toBeVisible()
  })

  test('should show quick capture widget', async ({ page }) => {
    // Quick capture should be visible
    await expect(page.getByTestId('quick-capture')).toBeVisible()
    await expect(page.getByTestId('quick-capture-input')).toBeVisible()
  })

  test('should submit idea via quick capture', async ({ page }) => {
    // Create a unique idea title
    const ideaTitle = `Quick Capture Test ${Date.now()}`

    // Enter idea in quick capture
    await page.getByTestId('quick-capture-input').fill(ideaTitle)
    await page.getByTestId('quick-capture-input').press('Enter')

    // Should show success message
    await expect(page.getByTestId('quick-capture-success')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to ideas page', async ({ page }) => {
    // Click on Ideas in sidebar navigation (exact match to avoid ambiguity)
    await page.getByRole('link', { name: 'Ideas', exact: true }).click()

    // Should navigate to ideas page
    await expect(page).toHaveURL(/\/dashboard\/ideas/)
  })

  test('should navigate to tasks page', async ({ page }) => {
    // Click on Tasks in sidebar navigation (exact match to avoid ambiguity)
    await page.getByRole('link', { name: 'Tasks', exact: true }).click()

    // Should navigate to tasks page
    await expect(page).toHaveURL(/\/dashboard\/tasks/)
  })
})
