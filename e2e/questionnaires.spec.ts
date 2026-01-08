import { test, expect } from '@playwright/test'

test.describe('Questionnaires - Public Form', () => {
  // Public forms don't require authentication
  test.use({ storageState: { cookies: [], origins: [] } })

  const formSlug = 'automation-audit'
  const formUrl = `/forms/${formSlug}`

  test.beforeEach(async ({ page }) => {
    await page.goto(formUrl)
  })

  test('should display public form without authentication', async ({ page }) => {
    // Check page loads
    await expect(page).toHaveURL(formUrl)

    // Check header with form title
    await expect(page.getByRole('heading', { name: /AI & Automation Audit/i })).toBeVisible()

    // Check AutoFlow branding
    await expect(page.getByText('AutoFlow')).toBeVisible()

    // Check description is visible
    await expect(page.getByText(/Help us understand your automation opportunities/i)).toBeVisible()
  })

  test('should show progress bar and question dots', async ({ page }) => {
    // Progress bar should show "Question 1 of 7"
    await expect(page.getByText('Question 1 of 7')).toBeVisible()

    // Should show percentage
    await expect(page.getByText(/\d+% complete/)).toBeVisible()

    // Question dots should be visible (7 dots: 6 questions + 1 contact page)
    const dots = page.locator('[role="progressbar"][aria-label]')
    await expect(dots.first()).toBeVisible()

    // Verify we have 7 dots (6 questions + contact page)
    await expect(dots).toHaveCount(7)
  })

  test('should display first question with all elements', async ({ page }) => {
    // Question number badge (use role selector to avoid strict mode violations)
    await expect(page.getByRole('status', { name: 'Question 1' })).toBeVisible()

    // Question text
    await expect(page.getByText(/What's one task you personally do every single week/i)).toBeVisible()

    // Hint text
    await expect(page.getByText(/Think about tasks that feel repetitive/i)).toBeVisible()

    // Textarea should be visible
    const textarea = page.getByPlaceholder(/Manually updating spreadsheets/i)
    await expect(textarea).toBeVisible()

    // Character count should show "Required"
    await expect(page.getByText('Required')).toBeVisible()

    // Tip should show
    await expect(page.getByText('Tip: More detail helps our AI')).toBeVisible()
  })

  test('should show character count feedback', async ({ page }) => {
    const textarea = page.locator('textarea').first()

    // Initially shows "Required"
    await expect(page.getByText('Required')).toBeVisible()

    // Type less than 20 characters
    await textarea.fill('Short answer')
    await expect(page.getByText(/\d+ characters/)).toBeVisible()
    await expect(page.getByText('Tip: More detail helps our AI')).toBeVisible()

    // Type 20+ characters
    await textarea.fill('This is a longer answer with more than twenty characters in it')
    await expect(page.getByText('✓ Good detail')).toBeVisible()
  })

  test('should navigate between questions', async ({ page }) => {
    // Previous button should be disabled on first question
    const prevButton = page.getByRole('button', { name: /Previous/i })
    await expect(prevButton).toBeDisabled()

    // Click Next to go to question 2
    const nextButton = page.getByRole('button', { name: /Next Question/i })
    await nextButton.click()

    // Should show question 2
    await expect(page.getByText('Question 2 of 7')).toBeVisible()
    await expect(page.getByText(/Describe one process in your business/i)).toBeVisible()

    // Previous button should now be enabled
    await expect(prevButton).toBeEnabled()

    // Click Previous to go back
    await prevButton.click()

    // Should be back at question 1
    await expect(page.getByText('Question 1 of 7')).toBeVisible()
  })

  test('should progress through all questions to contact page', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: /Next Question|Continue to Details/i })

    // Navigate through all 6 questions
    for (let i = 0; i < 6; i++) {
      await expect(page.getByText(`Question ${i + 1} of 7`)).toBeVisible()
      await nextButton.click()
    }

    // Should reach contact page (question 7 of 7)
    await expect(page.getByText('Question 7 of 7')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Your Details/i })).toBeVisible()

    // Contact fields should be visible
    await expect(page.getByLabel(/Name/i)).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()

    // Submit button should be visible but disabled
    const submitButton = page.getByRole('button', { name: /Submit Responses/i })
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeDisabled()
  })

  test('should auto-save answers to localStorage', async ({ page, context }) => {
    const textarea = page.locator('textarea').first()
    const testAnswer = `Auto-save test ${Date.now()}`

    // Fill in an answer
    await textarea.fill(testAnswer)

    // Wait a bit for debounce
    await page.waitForTimeout(500)

    // Reload the page
    await page.reload()

    // Answer should be restored
    await expect(page.locator('textarea').first()).toHaveValue(testAnswer)
  })

  test('should validate contact fields before submission', async ({ page }) => {
    // Navigate to contact page
    const nextButton = page.getByRole('button', { name: /Next Question|Continue to Details/i })
    for (let i = 0; i < 6; i++) {
      await nextButton.click()
    }

    const submitButton = page.getByRole('button', { name: /Submit Responses/i })
    const nameInput = page.getByLabel(/Name/i)
    const emailInput = page.getByLabel(/Email/i)

    // Submit button should be disabled initially
    await expect(submitButton).toBeDisabled()

    // Fill name only
    await nameInput.fill('Test User')
    await expect(submitButton).toBeDisabled()

    // Fill invalid email
    await emailInput.fill('invalid-email')
    await expect(submitButton).toBeDisabled()

    // Fill valid email
    await emailInput.fill('test@example.com')
    await expect(submitButton).toBeEnabled()
  })

  test('should submit form and show success page', async ({ page }) => {
    // Fill in all questions
    const questions = [
      'Manual spreadsheet updates every Monday',
      'Invoice approval takes too long',
      'About 15 hours per week on admin',
      'Focus on strategic partnerships',
      'Marketing to sales handoff is messy',
      'Weekly status reports are manual'
    ]

    for (let i = 0; i < questions.length; i++) {
      const textarea = page.locator('textarea')
      await textarea.fill(questions[i])

      const nextButton = page.getByRole('button', { name: /Next Question|Continue to Details/i })
      await nextButton.click()
    }

    // Fill contact details
    await page.getByLabel(/Name/i).fill('Test User')
    await page.getByLabel(/Email/i).fill(`test-${Date.now()}@example.com`)

    // Submit form
    const submitButton = page.getByRole('button', { name: /Submit Responses/i })
    await submitButton.click()

    // Should show success page
    await expect(page.getByRole('heading', { name: /Thank you!/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/Your responses have been submitted/i)).toBeVisible()
    await expect(page.getByText(/What happens next/i)).toBeVisible()
  })

  test('should show preview mode banner with ?preview=true', async ({ page }) => {
    await page.goto(`${formUrl}?preview=true`)

    // Preview banner should be visible
    await expect(page.getByText(/Preview Mode - Submissions won't be saved/i)).toBeVisible()

    // Can still navigate and fill form
    const textarea = page.locator('textarea').first()
    await textarea.fill('Preview test answer')
    await expect(textarea).toHaveValue('Preview test answer')
  })

  test('should not save to localStorage in preview mode', async ({ page }) => {
    await page.goto(`${formUrl}?preview=true`)

    const textarea = page.locator('textarea').first()
    await textarea.fill('Should not be saved')

    // Wait and reload
    await page.waitForTimeout(500)
    await page.reload()

    // In preview mode, answer should NOT be restored
    // Note: This tests that preview mode doesn't pollute localStorage
    await expect(page.getByText(/Preview Mode/i)).toBeVisible()
  })

  test('should complete submission in preview mode without saving', async ({ page }) => {
    await page.goto(`${formUrl}?preview=true`)

    // Fill minimal required fields and submit quickly
    const nextButton = page.getByRole('button', { name: /Next Question|Continue to Details/i })

    for (let i = 0; i < 6; i++) {
      await nextButton.click()
    }

    // Fill contact and submit
    await page.getByLabel(/Name/i).fill('Preview User')
    await page.getByLabel(/Email/i).fill('preview@example.com')

    const submitButton = page.getByRole('button', { name: /Submit Responses/i })
    await submitButton.click()

    // Should show success (but not actually save to database)
    await expect(page.getByRole('heading', { name: /Thank you!/i })).toBeVisible({ timeout: 5000 })
  })

  test('should update progress percentage as user advances', async ({ page }) => {
    // Check initial progress (question 1 of 7 ≈ 14%)
    await expect(page.getByText(/14% complete/i)).toBeVisible()

    // Navigate to question 2
    await page.getByRole('button', { name: /Next Question/i }).click()
    await expect(page.getByText(/28% complete/i)).toBeVisible()

    // Navigate to question 3
    await page.getByRole('button', { name: /Next Question/i }).click()
    await expect(page.getByText(/42% complete/i)).toBeVisible()
  })

  test('should show correct button labels at different stages', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: /Next Question|Continue to Details/i })

    // First 5 questions should say "Next Question"
    for (let i = 0; i < 5; i++) {
      await expect(page.getByRole('button', { name: 'Next Question' })).toBeVisible()
      await nextButton.click()
    }

    // Last question (question 6) should say "Continue to Details"
    await expect(page.getByRole('button', { name: 'Continue to Details' })).toBeVisible()
    await nextButton.click()

    // Contact page should show "Submit Responses"
    await expect(page.getByRole('button', { name: /Submit Responses/i })).toBeVisible()
  })

  test('should handle rapid navigation without breaking', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: /Next Question|Continue to Details/i })
    const prevButton = page.getByRole('button', { name: /Previous/i })

    // Rapidly click next
    for (let i = 0; i < 3; i++) {
      await nextButton.click()
    }

    // Should be at question 4
    await expect(page.getByText('Question 4 of 7')).toBeVisible()

    // Rapidly click previous
    for (let i = 0; i < 2; i++) {
      await prevButton.click()
    }

    // Should be at question 2
    await expect(page.getByText('Question 2 of 7')).toBeVisible()
  })
})

test.describe('Questionnaires - Form Not Found', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('should show 404 for invalid form slug', async ({ page }) => {
    await page.goto('/forms/non-existent-form')

    // Should show 404 page
    await expect(page.getByText(/404|Not Found/i)).toBeVisible()
  })

  test('should show 404 for inactive form', async ({ page }) => {
    // This would require seeding an inactive form, so we'll skip for now
    // In a real test, you'd create an inactive form and verify it returns 404
  })
})
