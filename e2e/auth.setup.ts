import { test as setup, expect } from '@playwright/test'

const authFile = 'e2e/.auth/user.json'

setup('authenticate', async ({ page }) => {
  // Go to login page
  await page.goto('/login')

  // Fill in credentials from environment
  await page.getByTestId('login-email').fill(process.env.TEST_USER_EMAIL!)
  await page.getByTestId('login-password').fill(process.env.TEST_USER_PASSWORD!)

  // Click login button
  await page.getByTestId('login-submit').click()

  // Wait for redirect to dashboard
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

  // Save signed-in state
  await page.context().storageState({ path: authFile })
})
