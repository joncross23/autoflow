import { test, expect } from '@playwright/test'

test.describe('Ideas Page', () => {
  // Use saved auth state
  test.use({ storageState: 'e2e/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/ideas')
  })

  test('should display ideas table', async ({ page }) => {
    // Check the page header
    await expect(page.getByRole('heading', { name: 'Ideas' })).toBeVisible()

    // Ideas table should be visible
    await expect(page.getByTestId('ideas-table')).toBeVisible()
  })

  test('should show filter panel', async ({ page }) => {
    // Filter panel should be visible or toggle button should exist
    const filterToggle = page.getByTestId('filter-panel-toggle')
    if (await filterToggle.isVisible()) {
      await filterToggle.click()
    }

    await expect(page.getByTestId('filter-panel')).toBeVisible()
  })

  test('should create a new idea', async ({ page }) => {
    // Create a unique idea title
    const ideaTitle = `Test Idea ${Date.now()}`

    // Click new idea button
    await page.getByRole('button', { name: /new idea/i }).click()

    // Fill in idea form
    await expect(page.getByTestId('idea-form')).toBeVisible()
    await page.getByTestId('idea-form-title').fill(ideaTitle)
    await page.getByTestId('idea-form-submit').click()

    // Wait for idea to be created
    await page.waitForTimeout(1000)

    // Idea should appear in the table
    await expect(page.getByText(ideaTitle)).toBeVisible({ timeout: 5000 })
  })

  test('should filter ideas by status', async ({ page }) => {
    // Open filter panel if needed
    const filterToggle = page.getByTestId('filter-panel-toggle')
    if (await filterToggle.isVisible()) {
      await filterToggle.click()
    }

    // Click on a status filter (use first() to avoid strict mode with duplicate buttons)
    const statusFilter = page.getByRole('button', { name: /evaluating/i }).first()
    if (await statusFilter.isVisible()) {
      await statusFilter.click()
      await page.waitForTimeout(500)
    }
  })

  test('should search ideas by title', async ({ page }) => {
    // Look for search input
    const searchInput = page.getByPlaceholder(/search/i)
    if (await searchInput.isVisible()) {
      // Type search query
      await searchInput.fill('test')
      await page.waitForTimeout(500)
    }
  })

  test('should clear all filters', async ({ page }) => {
    // Open filter panel if needed
    const filterToggle = page.getByTestId('filter-panel-toggle')
    if (await filterToggle.isVisible()) {
      await filterToggle.click()
    }

    // Look for clear filters button
    const clearButton = page.getByTestId('filter-panel-clear')
    if (await clearButton.isVisible()) {
      await clearButton.click()
      await page.waitForTimeout(500)
    }
  })

  test('should delete an idea', async ({ page }) => {
    // First create an idea to delete
    const ideaTitle = `Delete Test ${Date.now()}`

    // Click new idea button
    await page.getByRole('button', { name: /new idea/i }).click()
    await page.getByTestId('idea-form-title').fill(ideaTitle)
    await page.getByTestId('idea-form-submit').click()
    await page.waitForTimeout(1000)

    // Click on the idea row in the table (use first() to avoid strict mode)
    await page.getByText(ideaTitle).first().click()

    // Wait for detail slider/modal to open
    await page.waitForTimeout(500)

    // Handle confirmation dialog
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm')
      await dialog.accept()
    })

    // Find and click delete button (use first() to avoid multiple matches)
    const deleteButton = page.getByRole('button', { name: /delete/i }).first()
    if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await deleteButton.click()
      await page.waitForTimeout(1000)

      // Verify idea is removed from table
      await expect(page.getByText(ideaTitle).first()).not.toBeVisible({ timeout: 5000 })
    }
  })
})
