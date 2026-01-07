import { test, expect } from '@playwright/test'

test.describe('Settings Page', () => {
  // Use saved auth state
  test.use({ storageState: 'e2e/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/settings')
  })

  test('should display settings page header', async ({ page }) => {
    // Check page header
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

    // Check subtitle
    await expect(page.getByText('Manage your account and preferences')).toBeVisible()
  })

  test('should display navigation tabs', async ({ page }) => {
    // Account tab should be visible
    await expect(page.getByRole('link', { name: /Account/i })).toBeVisible()

    // Appearance tab should be visible
    await expect(page.getByRole('link', { name: /Appearance/i })).toBeVisible()
  })

  test('should display account section with user info', async ({ page }) => {
    // Account section heading
    await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible()

    // User info should be displayed (email at minimum)
    await expect(page.getByText('Full name')).toBeVisible()
    await expect(page.getByText('Email')).toBeVisible()
  })

  test('should display sign out button', async ({ page }) => {
    // Sign out button should be visible
    await expect(page.getByTestId('user-menu')).toBeVisible()
    await expect(page.getByTestId('user-menu')).toContainText(/Sign out/i)
  })

  test('should display password change form', async ({ page }) => {
    // Password section heading
    await expect(page.getByRole('heading', { name: 'Change Password' })).toBeVisible()

    // Form fields - using placeholder text as selectors
    await expect(page.getByPlaceholder('At least 6 characters')).toBeVisible()
    await expect(page.getByPlaceholder('Repeat your password')).toBeVisible()

    // Submit button
    await expect(page.getByRole('button', { name: /Update password/i })).toBeVisible()
  })

  test('should show password mismatch error', async ({ page }) => {
    // Enter mismatched passwords
    await page.getByPlaceholder('At least 6 characters').fill('password123')
    await page.getByPlaceholder('Repeat your password').fill('differentpassword')

    // Submit
    await page.getByRole('button', { name: /Update password/i }).click()

    // Should show error
    await expect(page.getByText('Passwords do not match')).toBeVisible()
  })

  test('should show password too short error', async ({ page }) => {
    // Enter password that is too short
    await page.getByPlaceholder('At least 6 characters').fill('123')
    await page.getByPlaceholder('Repeat your password').fill('123')

    // Submit
    await page.getByRole('button', { name: /Update password/i }).click()

    // Should show error
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible()
  })

  test('should display data export section', async ({ page }) => {
    // Data section heading
    await expect(page.getByRole('heading', { name: 'Data & Privacy' })).toBeVisible()

    // Export button
    await expect(page.getByRole('button', { name: /Export My Data/i })).toBeVisible()

    // Description text
    await expect(page.getByText(/Download a copy of all your ideas/i)).toBeVisible()
  })

  test('should navigate to appearance settings tab', async ({ page }) => {
    // Click on Appearance tab
    await page.getByRole('link', { name: /Appearance/i }).click()

    // Should navigate to appearance page
    await expect(page).toHaveURL(/\/dashboard\/settings\/appearance/)
  })
})

test.describe('Appearance Settings', () => {
  // Use saved auth state
  test.use({ storageState: 'e2e/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/settings/appearance')
  })

  test('should display appearance section header', async ({ page }) => {
    // Check page header
    await expect(page.getByRole('heading', { name: 'Appearance' })).toBeVisible()

    // Mode description
    await expect(page.getByText(/Select dark or light mode/i)).toBeVisible()
  })

  test('should display mode selection buttons', async ({ page }) => {
    // All mode buttons should be visible
    await expect(page.getByRole('button', { name: /Dark/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Light/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /System/i })).toBeVisible()
  })

  test('should display theme presets section', async ({ page }) => {
    // Theme section heading (use exact to avoid matching "Custom Themes")
    await expect(page.getByRole('heading', { name: 'Theme', exact: true })).toBeVisible()

    // Description
    await expect(page.getByText(/Choose a theme that suits your style/i)).toBeVisible()
  })

  test('should display custom themes section', async ({ page }) => {
    // Custom themes heading
    await expect(page.getByRole('heading', { name: 'Custom Themes' })).toBeVisible()

    // Customise button
    await expect(page.getByRole('button', { name: /Customise/i })).toBeVisible()
  })

  test('should switch between mode options', async ({ page }) => {
    // Click Light mode
    await page.getByRole('button', { name: /Light/i }).click()

    // Wait for potential transition
    await page.waitForTimeout(500)

    // Click Dark mode
    await page.getByRole('button', { name: /Dark/i }).click()

    // Wait for potential transition
    await page.waitForTimeout(500)

    // Click System mode
    await page.getByRole('button', { name: /System/i }).click()

    // Wait for potential transition
    await page.waitForTimeout(500)

    // All buttons should still be visible after switching
    await expect(page.getByRole('button', { name: /Dark/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Light/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /System/i })).toBeVisible()
  })

  test('should open customisation panel', async ({ page }) => {
    // Click Customise button
    await page.getByRole('button', { name: /Customise/i }).click()

    // Panel should open with customisation options
    await expect(page.getByRole('heading', { name: 'Customise Theme' })).toBeVisible({ timeout: 5000 })

    // Accent colour section should be visible
    await expect(page.getByText('Accent Colour')).toBeVisible()

    // Background section should be visible
    await expect(page.getByText(/Background/i).first()).toBeVisible()
  })

  test('should display accent colour options in panel', async ({ page }) => {
    // Open customisation panel
    await page.getByRole('button', { name: /Customise/i }).click()
    await expect(page.getByRole('heading', { name: 'Customise Theme' })).toBeVisible({ timeout: 5000 })

    // Check for accent colour options - look for specific colour names
    await expect(page.getByText('Cyan')).toBeVisible()
    await expect(page.getByText('Blue')).toBeVisible()
    await expect(page.getByText('Emerald')).toBeVisible()
    await expect(page.getByText('Amber')).toBeVisible()
  })

  test('should display background type toggle in panel', async ({ page }) => {
    // Open customisation panel
    await page.getByRole('button', { name: /Customise/i }).click()
    await expect(page.getByRole('heading', { name: 'Customise Theme' })).toBeVisible({ timeout: 5000 })

    // Solid and Gradient buttons should be visible
    await expect(page.getByRole('button', { name: /Solid/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Gradient/i })).toBeVisible()
  })

  test('should display save custom theme section in panel', async ({ page }) => {
    // Open customisation panel
    await page.getByRole('button', { name: /Customise/i }).click()
    await expect(page.getByRole('heading', { name: 'Customise Theme' })).toBeVisible({ timeout: 5000 })

    // Save section should be visible
    await expect(page.getByText('Save as Custom Theme')).toBeVisible()

    // Theme name input should be visible
    await expect(page.getByPlaceholder(/Theme name/i)).toBeVisible()
  })

  test('should close customisation panel', async ({ page }) => {
    // Open customisation panel
    await page.getByRole('button', { name: /Customise/i }).click()
    await expect(page.getByRole('heading', { name: 'Customise Theme' })).toBeVisible({ timeout: 5000 })

    // Press Escape to close
    await page.keyboard.press('Escape')

    // Panel should be closed - look for the panel to not be visible
    await expect(page.getByRole('heading', { name: 'Customise Theme' })).not.toBeVisible({ timeout: 5000 })
  })

  test('should navigate back to account tab', async ({ page }) => {
    // Click on Account tab
    await page.getByRole('link', { name: /Account/i }).click()

    // Should navigate to main settings page
    await expect(page).toHaveURL(/\/dashboard\/settings$/)

    // Account section should be visible
    await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible()
  })
})
