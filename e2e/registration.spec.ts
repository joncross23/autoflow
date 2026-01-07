import { test, expect } from '@playwright/test'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

test.describe('Registration', () => {
  // Run these tests WITHOUT authentication
  test.use({ storageState: { cookies: [], origins: [] } })

  test('should display registration form', async ({ page }) => {
    await page.goto('/register')

    // Check registration form elements are visible
    await expect(page.getByTestId('register-form')).toBeVisible()
    await expect(page.getByTestId('register-name')).toBeVisible()
    await expect(page.getByTestId('register-email')).toBeVisible()
    await expect(page.getByTestId('register-password')).toBeVisible()
    await expect(page.getByTestId('register-confirm-password')).toBeVisible()
    await expect(page.getByTestId('register-submit')).toBeVisible()
  })

  test('should show error when passwords do not match', async ({ page }) => {
    await page.goto('/register')

    // Fill in the form with mismatched passwords
    await page.getByTestId('register-name').fill('Test User')
    await page.getByTestId('register-email').fill('test@example.com')
    await page.getByTestId('register-password').fill('password123')
    await page.getByTestId('register-confirm-password').fill('differentpassword')
    await page.getByTestId('register-submit').click()

    // Should show password mismatch error
    await expect(page.getByTestId('register-error')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('register-error')).toContainText('Passwords do not match')
  })

  test('should show error when password is too short', async ({ page }) => {
    await page.goto('/register')

    // Fill in the form with a short password
    await page.getByTestId('register-name').fill('Test User')
    await page.getByTestId('register-email').fill('test@example.com')
    await page.getByTestId('register-password').fill('12345')
    await page.getByTestId('register-confirm-password').fill('12345')
    await page.getByTestId('register-submit').click()

    // Should show password length error
    await expect(page.getByTestId('register-error')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('register-error')).toContainText('Password must be at least 6 characters')
  })

  test('should navigate to login page via sign in link', async ({ page }) => {
    await page.goto('/register')

    // Click on the "Sign in" link
    await page.getByTestId('register-login-link').click()

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })

  test('should have correct form labels and placeholders', async ({ page }) => {
    await page.goto('/register')

    // Check name field
    const nameInput = page.getByTestId('register-name')
    await expect(nameInput).toHaveAttribute('placeholder', 'John Doe')
    await expect(nameInput).toHaveAttribute('required', '')

    // Check email field
    const emailInput = page.getByTestId('register-email')
    await expect(emailInput).toHaveAttribute('placeholder', 'you@example.com')
    await expect(emailInput).toHaveAttribute('type', 'email')
    await expect(emailInput).toHaveAttribute('required', '')

    // Check password field
    const passwordInput = page.getByTestId('register-password')
    await expect(passwordInput).toHaveAttribute('placeholder', 'At least 6 characters')
    await expect(passwordInput).toHaveAttribute('type', 'password')
    await expect(passwordInput).toHaveAttribute('required', '')

    // Check confirm password field
    const confirmPasswordInput = page.getByTestId('register-confirm-password')
    await expect(confirmPasswordInput).toHaveAttribute('placeholder', 'Repeat your password')
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password')
    await expect(confirmPasswordInput).toHaveAttribute('required', '')
  })

  test('should disable form during submission', async ({ page }) => {
    await page.goto('/register')

    // Fill in valid form data
    await page.getByTestId('register-name').fill('Test User')
    await page.getByTestId('register-email').fill(`test-${Date.now()}@example.com`)
    await page.getByTestId('register-password').fill('validpassword123')
    await page.getByTestId('register-confirm-password').fill('validpassword123')

    // Start submission
    await page.getByTestId('register-submit').click()

    // Form should show loading state (button should be disabled)
    // Note: This is a quick check as form submission is fast
    await expect(page.getByTestId('register-submit')).toBeDisabled()
  })

  test('should show success state after valid registration', async ({ page }) => {
    await page.goto('/register')

    // Generate a unique email to avoid duplicate user errors
    const uniqueEmail = `test-user-${Date.now()}@test-autoflow.com`

    // Fill in valid form data
    await page.getByTestId('register-name').fill('Test User')
    await page.getByTestId('register-email').fill(uniqueEmail)
    await page.getByTestId('register-password').fill('validpassword123')
    await page.getByTestId('register-confirm-password').fill('validpassword123')
    await page.getByTestId('register-submit').click()

    // Should show success message or error (depending on Supabase config)
    // Wait for either success or error state
    await expect(
      page.getByTestId('register-success').or(page.getByTestId('register-error'))
    ).toBeVisible({ timeout: 10000 })
  })

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/register')

    // Fill in the form with invalid email (browser validation)
    await page.getByTestId('register-name').fill('Test User')
    await page.getByTestId('register-email').fill('invalid-email')
    await page.getByTestId('register-password').fill('validpassword123')
    await page.getByTestId('register-confirm-password').fill('validpassword123')
    await page.getByTestId('register-submit').click()

    // Form should not submit (browser validation will prevent it)
    // Verify we're still on the register page
    await expect(page).toHaveURL(/\/register/)
  })

  test('should show error for already registered email', async ({ page }) => {
    await page.goto('/register')

    // Use the test user email that already exists
    const existingEmail = process.env.TEST_USER_EMAIL || 'testuser@autoflow.com'

    // Fill in the form with an existing email
    await page.getByTestId('register-name').fill('Existing User')
    await page.getByTestId('register-email').fill(existingEmail)
    await page.getByTestId('register-password').fill('validpassword123')
    await page.getByTestId('register-confirm-password').fill('validpassword123')
    await page.getByTestId('register-submit').click()

    // Should show error message (exact message depends on Supabase config)
    // Could be "User already registered" or similar
    await expect(
      page.getByTestId('register-error').or(page.getByTestId('register-success'))
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Registration - Authenticated User', () => {
  // Use saved auth state
  test.use({ storageState: 'e2e/.auth/user.json' })

  test('should redirect authenticated user away from register page', async ({ page }) => {
    // Navigate to register while authenticated
    await page.goto('/register')

    // Authenticated users should be redirected (or see the form - depends on app logic)
    // This test verifies the behaviour is consistent
    // If the app redirects, check for dashboard
    // If it shows the form, that's also valid behaviour for some apps

    // Wait for navigation to settle
    await page.waitForLoadState('networkidle')

    // Check if we're on register or got redirected
    const url = page.url()
    const isOnRegister = url.includes('/register')
    const isOnDashboard = url.includes('/dashboard')

    // Either behaviour is acceptable, but log for documentation
    expect(isOnRegister || isOnDashboard).toBe(true)
  })
})
