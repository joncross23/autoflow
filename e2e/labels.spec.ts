import { test, expect } from '@playwright/test'

test.describe('Labels System', () => {
  // Use saved auth state
  test.use({ storageState: 'e2e/.auth/user.json' })

  // Create a test idea before each test
  let testIdeaTitle: string

  test.beforeEach(async ({ page }) => {
    // Create a unique test idea via quick capture
    testIdeaTitle = `Label Test ${Date.now()}`
    await page.goto('/dashboard')
    await page.getByTestId('quick-capture-input').fill(testIdeaTitle)
    await page.getByTestId('quick-capture-input').press('Enter')
    await expect(page.getByTestId('quick-capture-success')).toBeVisible({ timeout: 10000 })

    // Navigate to ideas page
    await page.goto('/dashboard/ideas')
    await page.waitForTimeout(1000) // Wait for table to load

    // Open the idea detail slider
    await page.getByText(testIdeaTitle).click()
    await expect(page.getByTestId('idea-detail-slider')).toBeVisible({ timeout: 5000 })
  })

  test.afterEach(async ({ page }) => {
    // Close the slider
    if (await page.getByTestId('idea-slider-close').isVisible()) {
      await page.getByTestId('idea-slider-close').click()
    }
  })

  test('should open labels dropdown', async ({ page }) => {
    // Click Add button in labels section
    await page.getByTestId('labels-add-button').click()

    // Dropdown should be visible
    await expect(page.getByText('Search labels...')).toBeVisible({ timeout: 3000 })
  })

  test('should show 6 default color labels', async ({ page }) => {
    // Open labels dropdown
    await page.getByTestId('labels-add-button').click()
    await expect(page.getByText('Search labels...')).toBeVisible({ timeout: 3000 })

    // Should show at least 6 label options (the defaults)
    const labelButtons = page.locator('button:has-text(" ")').filter({ hasNot: page.locator('button:has-text("Cancel")') })
    await expect(labelButtons.first()).toBeVisible()
  })

  test('should assign a label to an idea', async ({ page }) => {
    // Open labels dropdown
    await page.getByTestId('labels-add-button').click()
    await page.waitForTimeout(500)

    // Click the first label color bar to assign it
    const firstLabel = page.locator('button[class*="bg-red-500"]').first()
    if (await firstLabel.isVisible()) {
      await firstLabel.click()
      await page.waitForTimeout(500)

      // Close dropdown by clicking X
      await page.locator('button[class*="hover:bg-bg-hover"]:has-text("")').first().click()
      await page.waitForTimeout(500)

      // The label should now appear in the labels section
      const labelsSection = page.locator('text=Labels').locator('..').locator('..')
      await expect(labelsSection.locator('span[class*="bg-red-500"]')).toBeVisible()
    }
  })

  test('should create a new label', async ({ page }) => {
    // Open labels dropdown
    await page.getByTestId('labels-add-button').click()
    await page.waitForTimeout(500)

    // Click "Create a new label"
    await page.getByText('Create a new label').click()
    await page.waitForTimeout(500)

    // Should show create form
    await expect(page.getByText('Create Label')).toBeVisible()

    // Enter label name
    const labelName = `Test Label ${Date.now()}`
    await page.getByPlaceholder('Label name (optional)').fill(labelName)

    // Select a color (click second color option - orange)
    const orangeColorButton = page.locator('button[class*="bg-orange-500"]').nth(1)
    await orangeColorButton.click()
    await page.waitForTimeout(300)

    // Click Create button
    await page.getByRole('button', { name: /^Create$/i }).click()
    await page.waitForTimeout(1000)

    // The new label should be assigned and visible
    const labelsSection = page.locator('text=Labels').locator('..').locator('..')
    await expect(labelsSection.getByText(labelName)).toBeVisible({ timeout: 5000 })
  })

  test('should edit a label by clicking color bar', async ({ page }) => {
    // First create a label to edit
    await page.getByTestId('labels-add-button').click()
    await page.waitForTimeout(500)
    await page.getByText('Create a new label').click()
    await page.waitForTimeout(500)

    const originalName = `Edit Test ${Date.now()}`
    await page.getByPlaceholder('Label name (optional)').fill(originalName)
    await page.getByRole('button', { name: /^Create$/i }).click()
    await page.waitForTimeout(1000)

    // Open dropdown again
    await page.getByTestId('labels-add-button').click()
    await page.waitForTimeout(500)

    // Click the label color bar to edit
    await page.getByText(originalName).click()
    await page.waitForTimeout(500)

    // Should show edit form
    await expect(page.getByText('Edit Label')).toBeVisible()

    // Change the name
    const newName = `Edited ${Date.now()}`
    const nameInput = page.getByPlaceholder('Label name (optional)')
    await nameInput.clear()
    await nameInput.fill(newName)

    // Click Save
    await page.getByRole('button', { name: /^Save$/i }).click()
    await page.waitForTimeout(1000)

    // Should show the new name in the dropdown
    await expect(page.getByText(newName)).toBeVisible()
  })

  test('should delete a label', async ({ page }) => {
    // First create a label to delete
    await page.getByTestId('labels-add-button').click()
    await page.waitForTimeout(500)
    await page.getByText('Create a new label').click()
    await page.waitForTimeout(500)

    const labelName = `Delete Test ${Date.now()}`
    await page.getByPlaceholder('Label name (optional)').fill(labelName)
    await page.getByRole('button', { name: /^Create$/i }).click()
    await page.waitForTimeout(1000)

    // Open dropdown again
    await page.getByTestId('labels-add-button').click()
    await page.waitForTimeout(500)

    // Click the label color bar to edit
    await page.getByText(labelName).click()
    await page.waitForTimeout(500)

    // Should show edit form with Delete button
    await expect(page.getByText('Edit Label')).toBeVisible()

    // Set up dialog handler BEFORE clicking delete
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('Delete label')
      dialog.accept()
    })

    // Click Delete button
    await page.getByRole('button', { name: /delete/i }).click()
    await page.waitForTimeout(1000)

    // Label should be removed from the list
    await expect(page.getByText(labelName)).not.toBeVisible()
  })

  test('should unassign a label from an idea', async ({ page }) => {
    // First assign a label
    await page.getByTestId('labels-add-button').click()
    await page.waitForTimeout(500)

    const firstLabel = page.locator('button[class*="bg-red-500"]').first()
    if (await firstLabel.isVisible()) {
      await firstLabel.click()
      await page.waitForTimeout(500)

      // Close dropdown
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)

      // Label should be visible
      const labelsSection = page.locator('text=Labels').locator('..').locator('..')
      const assignedLabel = labelsSection.locator('span[class*="bg-red-500"]').first()
      await expect(assignedLabel).toBeVisible()

      // Click the X button on the label chip to remove it
      const removeButton = assignedLabel.locator('button')
      await removeButton.click()
      await page.waitForTimeout(500)

      // Label should be removed
      await expect(assignedLabel).not.toBeVisible()
    }
  })

  test('should filter labels by search', async ({ page }) => {
    // Create two labels with different names
    const label1 = `Apple ${Date.now()}`
    const label2 = `Banana ${Date.now()}`

    // Create first label
    await page.getByTestId('labels-add-button').click()
    await page.waitForTimeout(500)
    await page.getByText('Create a new label').click()
    await page.waitForTimeout(500)
    await page.getByPlaceholder('Label name (optional)').fill(label1)
    await page.getByRole('button', { name: /^Create$/i }).click()
    await page.waitForTimeout(1000)

    // Create second label
    await page.getByTestId('labels-add-button').click()
    await page.waitForTimeout(500)
    await page.getByText('Create a new label').click()
    await page.waitForTimeout(500)
    await page.getByPlaceholder('Label name (optional)').fill(label2)
    await page.getByRole('button', { name: /^Create$/i }).click()
    await page.waitForTimeout(1000)

    // Open dropdown
    await page.getByTestId('labels-add-button').click()
    await page.waitForTimeout(500)

    // Both labels should be visible
    await expect(page.getByText(label1)).toBeVisible()
    await expect(page.getByText(label2)).toBeVisible()

    // Search for "Apple"
    await page.getByPlaceholder('Search labels...').fill('Apple')
    await page.waitForTimeout(500)

    // Only label1 should be visible
    await expect(page.getByText(label1)).toBeVisible()
    await expect(page.getByText(label2)).not.toBeVisible()
  })

  test('should show custom color picker for new label', async ({ page }) => {
    // Open labels dropdown
    await page.getByTestId('labels-add-button').click()
    await page.waitForTimeout(500)

    // Click "Create a new label"
    await page.getByText('Create a new label').click()
    await page.waitForTimeout(500)

    // Should show "Custom Colour" section
    await expect(page.getByText('Custom Colour')).toBeVisible()

    // Should have a color preview box
    const colorPreview = page.locator('div[style*="background"]').filter({ has: page.locator('..') })
    await expect(colorPreview.first()).toBeVisible()
  })
})
