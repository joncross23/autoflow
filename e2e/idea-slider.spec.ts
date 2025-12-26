import { test, expect } from '@playwright/test'

test.describe('Idea Detail Slider', () => {
  // Use saved auth state
  test.use({ storageState: 'e2e/.auth/user.json' })

  // Create a test idea before each test
  let testIdeaTitle: string

  test.beforeEach(async ({ page }) => {
    // Create a unique test idea via quick capture
    testIdeaTitle = `Slider Test ${Date.now()}`
    await page.goto('/dashboard')
    await page.getByTestId('quick-capture-input').fill(testIdeaTitle)
    await page.getByTestId('quick-capture-input').press('Enter')
    await expect(page.getByTestId('quick-capture-success')).toBeVisible({ timeout: 10000 })

    // Navigate to ideas page
    await page.goto('/dashboard/ideas')
    await page.waitForTimeout(1000) // Wait for table to load
  })

  test('should open idea detail slider when clicking on idea', async ({ page }) => {
    // Click on the test idea
    await page.getByText(testIdeaTitle).click()

    // Slider should be visible
    await expect(page.getByTestId('idea-detail-slider')).toBeVisible({ timeout: 5000 })

    // Title should be displayed
    await expect(page.getByTestId('idea-slider-title')).toHaveText(testIdeaTitle)
  })

  test('should close slider with X button', async ({ page }) => {
    await page.getByText(testIdeaTitle).click()
    await expect(page.getByTestId('idea-detail-slider')).toBeVisible({ timeout: 5000 })

    // Click close button
    await page.getByTestId('idea-slider-close').click()

    // Slider should be hidden
    await expect(page.getByTestId('idea-detail-slider')).not.toBeVisible({ timeout: 5000 })
  })

  test('should close slider with Escape key', async ({ page }) => {
    await page.getByText(testIdeaTitle).click()
    await expect(page.getByTestId('idea-detail-slider')).toBeVisible({ timeout: 5000 })

    // Press Escape
    await page.keyboard.press('Escape')

    // Slider should be hidden
    await expect(page.getByTestId('idea-detail-slider')).not.toBeVisible({ timeout: 5000 })
  })

  test('should edit idea title', async ({ page }) => {
    await page.getByText(testIdeaTitle).click()
    await expect(page.getByTestId('idea-detail-slider')).toBeVisible({ timeout: 5000 })

    // Click title to edit
    await page.getByTestId('idea-slider-title').click()

    // Input should appear
    await expect(page.getByTestId('idea-slider-title-input')).toBeVisible()

    // Update the title
    const newTitle = `Updated ${testIdeaTitle}`
    await page.getByTestId('idea-slider-title-input').fill(newTitle)
    await page.getByTestId('idea-slider-title-input').press('Enter')

    // Wait for save
    await page.waitForTimeout(1000)

    // Title should be updated
    await expect(page.getByTestId('idea-slider-title')).toHaveText(newTitle)
  })

  test('should change idea status', async ({ page }) => {
    await page.getByText(testIdeaTitle).click()
    await expect(page.getByTestId('idea-detail-slider')).toBeVisible({ timeout: 5000 })

    // Click status button
    await page.getByTestId('idea-slider-status-button').click()

    // Status menu should appear
    await expect(page.getByTestId('idea-slider-status-menu')).toBeVisible()

    // Click "Evaluating" status
    await page.getByTestId('idea-slider-status-evaluating').click()

    // Wait for status to update
    await page.waitForTimeout(1000)

    // Status menu should close
    await expect(page.getByTestId('idea-slider-status-menu')).not.toBeVisible()
  })

  test('should open more actions menu', async ({ page }) => {
    await page.getByText(testIdeaTitle).click()
    await expect(page.getByTestId('idea-detail-slider')).toBeVisible({ timeout: 5000 })

    // Click more button
    await page.getByTestId('idea-slider-more-button').click()

    // Menu should appear
    await expect(page.getByTestId('idea-slider-more-menu')).toBeVisible()

    // Check menu options are visible
    await expect(page.getByTestId('idea-slider-duplicate')).toBeVisible()
    await expect(page.getByTestId('idea-slider-archive')).toBeVisible()
    await expect(page.getByTestId('idea-slider-delete')).toBeVisible()
  })

  test('should show Accept & Start button for new ideas', async ({ page }) => {
    await page.getByText(testIdeaTitle).click()
    await expect(page.getByTestId('idea-detail-slider')).toBeVisible({ timeout: 5000 })

    // Accept button should be visible for new ideas
    await expect(page.getByTestId('idea-slider-accept-button')).toBeVisible()
    await expect(page.getByTestId('idea-slider-accept-button')).toContainText('Accept & Start')
  })

  test('should delete idea from more menu', async ({ page }) => {
    await page.getByText(testIdeaTitle).click()
    await expect(page.getByTestId('idea-detail-slider')).toBeVisible({ timeout: 5000 })

    // Open more menu
    await page.getByTestId('idea-slider-more-button').click()
    await expect(page.getByTestId('idea-slider-more-menu')).toBeVisible()

    // Handle the confirmation dialog
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm')
      await dialog.accept()
    })

    // Click delete
    await page.getByTestId('idea-slider-delete').click()

    // Slider should close
    await expect(page.getByTestId('idea-detail-slider')).not.toBeVisible({ timeout: 10000 })

    // Idea should no longer appear in the list
    await expect(page.getByText(testIdeaTitle)).not.toBeVisible()
  })
})
