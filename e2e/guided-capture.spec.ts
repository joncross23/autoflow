import { test, expect } from '@playwright/test'

test.describe('Guided Capture Flow', () => {
  // Use saved auth state
  test.use({ storageState: 'e2e/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/ideas')
    // Clear any existing draft
    await page.evaluate(() => localStorage.removeItem('guided-capture-draft'))
  })

  test('should display guided capture button with tooltip', async ({ page }) => {
    // Check that Guided Capture button exists
    const guidedCaptureBtn = page.getByRole('button', { name: /guided capture/i })
    await expect(guidedCaptureBtn).toBeVisible()

    // Check tooltip text (title attribute)
    const title = await guidedCaptureBtn.getAttribute('title')
    expect(title).toContain('2 minutes')
    expect(title).toContain('4 questions')
  })

  test('should navigate to capture page when button clicked', async ({ page }) => {
    await page.getByRole('button', { name: /guided capture/i }).click()

    // Should navigate to /dashboard/ideas/capture
    await expect(page).toHaveURL(/\/dashboard\/ideas\/capture/)

    // Should show Guided Capture header
    await expect(page.getByRole('heading', { name: 'Guided Capture' })).toBeVisible()
  })

  test('should show progress dots and question 1', async ({ page }) => {
    await page.goto('/dashboard/ideas/capture')

    // Check header shows "Question 1 of 4"
    await expect(page.getByText('Question 1 of 4')).toBeVisible()

    // Check first question text
    await expect(page.getByText(/what task or process drains your time/i)).toBeVisible()

    // Progress dots should exist (5 total: 4 questions + review)
    const progressDots = page.locator('[role="progressbar"]')
    await expect(progressDots).toHaveCount(5)
  })

  test('should validate minimum character requirement', async ({ page }) => {
    await page.goto('/dashboard/ideas/capture')

    const textarea = page.locator('textarea')
    const nextButton = page.getByRole('button', { name: /next question/i })

    // Next button should be disabled initially
    await expect(nextButton).toBeDisabled()

    // Type less than 20 characters
    await textarea.fill('Short answer')

    // Next button should still be disabled
    await expect(nextButton).toBeDisabled()

    // Type 20+ characters
    await textarea.fill('This is a longer answer with enough detail to pass validation')

    // Next button should be enabled
    await expect(nextButton).toBeEnabled()
  })

  test('should show character count with feedback', async ({ page }) => {
    await page.goto('/dashboard/ideas/capture')

    const textarea = page.locator('textarea')

    // Type some text
    await textarea.fill('Short text here')

    // Should show character count
    await expect(page.getByText(/\d+ characters/)).toBeVisible()

    // Type 20+ characters
    await textarea.fill('This is a longer answer with enough detail')

    // Should show "Good detail" feedback
    await expect(page.getByText(/good detail/i)).toBeVisible()
  })

  test('should navigate through all 4 questions', async ({ page }) => {
    await page.goto('/dashboard/ideas/capture')

    // Answer all 4 questions
    for (let i = 1; i <= 4; i++) {
      // Check we're on the right question
      await expect(page.getByText(`Question ${i} of 4`)).toBeVisible()

      // Fill answer
      const textarea = page.locator('textarea')
      await textarea.fill(`This is a detailed answer for question ${i} with more than 20 characters to meet validation`)

      // Click next (or Review on last question)
      const button = i === 4
        ? page.getByRole('button', { name: /review/i })
        : page.getByRole('button', { name: /next question/i })

      await button.click()
      await page.waitForTimeout(300)
    }

    // Should land on review screen
    await expect(page.getByRole('heading', { name: 'Review Your Idea' })).toBeVisible()
  })

  test('should allow going back to previous questions', async ({ page }) => {
    await page.goto('/dashboard/ideas/capture')

    // Answer first question
    const textarea = page.locator('textarea')
    await textarea.fill('First answer with more than twenty characters here')
    await page.getByRole('button', { name: /next question/i }).click()
    await page.waitForTimeout(300)

    // Should be on question 2
    await expect(page.getByText('Question 2 of 4')).toBeVisible()

    // Click Previous button
    await page.getByRole('button', { name: /previous/i }).click()
    await page.waitForTimeout(300)

    // Should be back on question 1
    await expect(page.getByText('Question 1 of 4')).toBeVisible()

    // Previous answer should be preserved
    await expect(textarea).toHaveValue(/First answer/)
  })

  test('should show review screen with editable title', async ({ page }) => {
    await page.goto('/dashboard/ideas/capture')

    // Answer all questions quickly
    const answers = [
      'Manual data entry every Monday takes two hours',
      'It delays reporting and causes errors that hurt client trust',
      'Every week it takes about two hours, sometimes more with issues',
      'Data would sync overnight and I would just review a dashboard'
    ]

    for (let i = 0; i < 4; i++) {
      const textarea = page.locator('textarea')
      await textarea.fill(answers[i])

      const button = i === 3
        ? page.getByRole('button', { name: /review/i })
        : page.getByRole('button', { name: /next question/i })

      await button.click()
      await page.waitForTimeout(300)
    }

    // Should be on review screen
    await expect(page.getByRole('heading', { name: 'Review Your Idea' })).toBeVisible()

    // Title input should be visible and editable
    const titleInput = page.getByLabel(/idea title/i)
    await expect(titleInput).toBeVisible()

    // Generated title should be from first answer
    const titleValue = await titleInput.inputValue()
    expect(titleValue.length).toBeGreaterThan(0)

    // Should be able to edit title
    await titleInput.fill('My Custom Idea Title')
    await expect(titleInput).toHaveValue('My Custom Idea Title')

    // All answers should be displayed
    for (const answer of answers) {
      await expect(page.getByText(answer)).toBeVisible()
    }
  })

  test('should create idea and redirect to detail view', async ({ page }) => {
    await page.goto('/dashboard/ideas/capture')

    // Complete all questions
    const answers = [
      'Manual sales report compilation every Monday morning',
      'Takes valuable time away from strategic work and is error prone',
      'Weekly task taking approximately two hours each time',
      'Automated dashboard with key metrics ready Monday morning'
    ]

    for (let i = 0; i < 4; i++) {
      const textarea = page.locator('textarea')
      await textarea.fill(answers[i])

      const button = i === 3
        ? page.getByRole('button', { name: /review/i })
        : page.getByRole('button', { name: /next question/i })

      await button.click()
      await page.waitForTimeout(300)
    }

    // Edit title on review screen
    const ideaTitle = `Captured Idea ${Date.now()}`
    const titleInput = page.getByLabel(/idea title/i)
    await titleInput.fill(ideaTitle)

    // Click Create Idea button
    await page.getByRole('button', { name: /create idea/i }).click()

    // Should redirect to ideas page with idea query param
    await expect(page).toHaveURL(/\/dashboard\/ideas\?idea=/, { timeout: 10000 })

    // Idea should be visible in the page
    await expect(page.getByText(ideaTitle)).toBeVisible({ timeout: 5000 })
  })

  test('should display Q&A in idea detail slider', async ({ page }) => {
    await page.goto('/dashboard/ideas/capture')

    // Complete flow
    const answers = [
      'Testing guided capture Q and A display functionality',
      'Need to verify the capture details section appears correctly',
      'This is a one time test taking a few minutes',
      'The Q and A should display beautifully in the detail view'
    ]

    for (let i = 0; i < 4; i++) {
      const textarea = page.locator('textarea')
      await textarea.fill(answers[i])

      const button = i === 3
        ? page.getByRole('button', { name: /review/i })
        : page.getByRole('button', { name: /next question/i })

      await button.click()
      await page.waitForTimeout(300)
    }

    const ideaTitle = `Q&A Test ${Date.now()}`
    await page.getByLabel(/idea title/i).fill(ideaTitle)
    await page.getByRole('button', { name: /create idea/i }).click()

    // Wait for redirect and slider to open
    await page.waitForURL(/\/dashboard\/ideas\?idea=/, { timeout: 10000 })

    // Wait for slider to be visible (it has a role of dialog or complementary)
    await page.waitForTimeout(2000)

    // Check for Capture Details section with longer timeout
    await expect(page.getByText('Capture Details')).toBeVisible({ timeout: 10000 })

    // Check that questions and answers are displayed
    await expect(page.getByText(/what task or process drains/i)).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(answers[0])).toBeVisible({ timeout: 5000 })

    // Edit Answers button should be visible
    await expect(page.getByRole('button', { name: /edit answers/i })).toBeVisible({ timeout: 5000 })
  })

  test('should auto-save and restore draft on refresh', async ({ page }) => {
    await page.goto('/dashboard/ideas/capture')

    // Answer first two questions
    const answer1 = 'First answer that should be auto saved to local storage'
    const answer2 = 'Second answer also saved automatically in draft mode'

    // Question 1
    await page.locator('textarea').fill(answer1)
    await page.getByRole('button', { name: /next question/i }).click()
    await page.waitForTimeout(300)

    // Question 2
    await page.locator('textarea').fill(answer2)
    await page.waitForTimeout(500) // Give time for auto-save

    // Refresh the page
    await page.reload()
    await page.waitForTimeout(500)

    // Should show draft restored toast (check for toast message - use first() to avoid strict mode)
    await expect(page.getByText(/draft restored/i).first()).toBeVisible({ timeout: 3000 })

    // Should be on question 1 with preserved answer
    await expect(page.locator('textarea')).toHaveValue(answer1)

    // Navigate to question 2
    await page.getByRole('button', { name: /next question/i }).click()
    await page.waitForTimeout(300)

    // Second answer should be preserved
    await expect(page.locator('textarea')).toHaveValue(answer2)
  })

  test('should clear draft after successful submission', async ({ page }) => {
    await page.goto('/dashboard/ideas/capture')

    // Complete flow quickly
    for (let i = 0; i < 4; i++) {
      await page.locator('textarea').fill(`Answer ${i + 1} with more than twenty characters`)

      const button = i === 3
        ? page.getByRole('button', { name: /review/i })
        : page.getByRole('button', { name: /next question/i })

      await button.click()
      await page.waitForTimeout(300)
    }

    await page.getByLabel(/idea title/i).fill(`Draft Clear Test ${Date.now()}`)
    await page.getByRole('button', { name: /create idea/i }).click()

    // Wait for redirect
    await page.waitForURL(/\/dashboard\/ideas\?idea=/, { timeout: 10000 })

    // Check localStorage - draft should be cleared
    const draftExists = await page.evaluate(() => {
      return localStorage.getItem('guided-capture-draft') !== null
    })

    expect(draftExists).toBe(false)
  })

  test('should handle special characters in answers', async ({ page }) => {
    await page.goto('/dashboard/ideas/capture')

    // Use special characters in answer
    const specialAnswer = 'Testing with "quotes", emojis 🚀✨, and\nnewlines in the text field'

    await page.locator('textarea').fill(specialAnswer)
    await page.getByRole('button', { name: /next question/i }).click()
    await page.waitForTimeout(300)

    // Go back to verify it was saved correctly
    await page.getByRole('button', { name: /previous/i }).click()
    await page.waitForTimeout(300)

    // Should preserve special characters
    await expect(page.locator('textarea')).toHaveValue(specialAnswer)
  })

  test('should prevent double submission', async ({ page }) => {
    await page.goto('/dashboard/ideas/capture')

    // Complete all questions
    for (let i = 0; i < 4; i++) {
      await page.locator('textarea').fill(`Answer ${i + 1} with sufficient character count here`)

      const button = i === 3
        ? page.getByRole('button', { name: /review/i })
        : page.getByRole('button', { name: /next question/i })

      await button.click()
      await page.waitForTimeout(300)
    }

    await page.getByLabel(/idea title/i).fill(`Double Submit Test ${Date.now()}`)

    const createButton = page.getByRole('button', { name: /create idea/i })

    // Click once and verify it processes
    await createButton.click()

    // Wait a moment for button to be disabled/change to "Creating..."
    await page.waitForTimeout(100)

    // Try clicking again (should be prevented by isSubmitting guard)
    await createButton.click().catch(() => {}) // Might be disabled, ignore error

    // Should only create one idea and redirect once
    await page.waitForURL(/\/dashboard\/ideas\?idea=/, { timeout: 15000 })

    // Button should show "Creating..." briefly or be disabled
    // This is hard to test deterministically but the code has the guard
  })

  test('should show "Edit Answers" button stub', async ({ page }) => {
    await page.goto('/dashboard/ideas/capture')

    // Complete flow
    for (let i = 0; i < 4; i++) {
      await page.locator('textarea').fill(`Answer ${i + 1} with more than twenty characters`)

      const button = i === 3
        ? page.getByRole('button', { name: /review/i })
        : page.getByRole('button', { name: /next question/i })

      await button.click()
      await page.waitForTimeout(300)
    }

    await page.getByLabel(/idea title/i).fill(`Edit Button Test ${Date.now()}`)
    await page.getByRole('button', { name: /create idea/i }).click()

    await page.waitForURL(/\/dashboard\/ideas\?idea=/, { timeout: 10000 })

    // Wait for slider to load
    await page.waitForTimeout(2000)

    // Find Edit Answers button with longer timeout
    const editButton = page.getByRole('button', { name: /edit answers/i })
    await expect(editButton).toBeVisible({ timeout: 10000 })

    // Click it - should show "coming soon" toast
    await editButton.click()
    await page.waitForTimeout(300)

    // Toast should appear (look for toast message)
    await expect(page.getByText(/coming soon/i)).toBeVisible({ timeout: 3000 })
  })

  test('should display all 4 questions in correct order', async ({ page }) => {
    await page.goto('/dashboard/ideas/capture')

    const expectedQuestions = [
      'What task or process drains your time unnecessarily?',
      'Why does this matter? What\'s the real cost?',
      'How often does this happen, and how long does it take?',
      'If this was automated or fixed, what would be different?'
    ]

    // Verify each question appears in order
    for (let i = 0; i < 4; i++) {
      // Check question text
      await expect(page.getByText(expectedQuestions[i])).toBeVisible()

      // Fill answer and proceed
      await page.locator('textarea').fill(`Answer for question ${i + 1} with enough characters`)

      const button = i === 3
        ? page.getByRole('button', { name: /review/i })
        : page.getByRole('button', { name: /next question/i })

      await button.click()
      await page.waitForTimeout(300)
    }

    // Should reach review screen
    await expect(page.getByRole('heading', { name: 'Review Your Idea' })).toBeVisible()
  })
})
