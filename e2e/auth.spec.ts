import { test, expect } from '@playwright/test'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

test.describe('Authentication', () => {
  // Run these tests WITHOUT authentication
  test.use({ storageState: { cookies: [], origins: [] } })

  test('should display login form', async ({ page }) => {
    await page.goto('/login')

    // Check login form elements are visible
    await expect(page.getByTestId('login-form')).toBeVisible()
    await expect(page.getByTestId('login-email')).toBeVisible()
    await expect(page.getByTestId('login-password')).toBeVisible()
    await expect(page.getByTestId('login-submit')).toBeVisible()
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login')

    // Enter invalid credentials
    await page.getByTestId('login-email').fill('invalid@example.com')
    await page.getByTestId('login-password').fill('wrongpassword')
    await page.getByTestId('login-submit').click()

    // Should show error message
    await expect(page.getByTestId('login-error')).toBeVisible({ timeout: 5000 })
  })

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies()

    // Try to access protected route
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })
})

test.describe('Authenticated User', () => {
  // Use saved auth state
  test.use({ storageState: 'e2e/.auth/user.json' })

  test('should redirect to dashboard after login', async ({ page }) => {
    await page.goto('/dashboard')

    // Should stay on dashboard (not redirect to login)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should logout successfully', async ({ page, context }) => {
    // Navigate to settings page where logout is located
    await page.goto('/dashboard/settings')

    // Verify logout button exists
    await expect(page.getByTestId('user-menu')).toBeVisible()

    // Click logout button
    await page.getByTestId('user-menu').click()

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })

    // Re-authenticate to not affect other tests
    // Clear storage and re-run authentication
    await page.goto('/login')
    await page.getByTestId('login-email').fill(process.env.TEST_USER_EMAIL!)
    await page.getByTestId('login-password').fill(process.env.TEST_USER_PASSWORD!)
    await page.getByTestId('login-submit').click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

    // Save auth state again
    await context.storageState({ path: 'e2e/.auth/user.json' })
  })
})
