import { test, expect } from '@playwright/test'

test.describe('RICE Score', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test('should be able to add RICE score to an idea', async ({ page }) => {
    // Go to ideas page
    await page.goto('/dashboard/ideas')
    await page.waitForTimeout(1000)

    // Create a new idea first
    const ideaTitle = `RICE Test Idea ${Date.now()}`
    await page.getByRole('button', { name: /new idea/i }).click()
    await page.getByTestId('idea-form-title').fill(ideaTitle)
    await page.getByTestId('idea-form-submit').click()
    await page.waitForTimeout(1000)

    // Click on the newly created idea to open slider
    await page.getByText(ideaTitle).first().click()

    // Wait for slider to open
    await page.waitForTimeout(2000)

    // Look for RICE Score section
    const riceSection = page.getByRole('button', { name: /rice score/i })
    await expect(riceSection).toBeVisible()

    // Click to expand if collapsed
    await riceSection.click()
    await page.waitForTimeout(500)

    // Check for Reach dropdown
    const reachSelect = page.locator('select').filter({ has: page.locator('option:has-text("Select...")') }).first()
    await expect(reachSelect).toBeVisible()

    // Try to select a value
    await reachSelect.selectOption('5')

    // Check for Impact dropdown
    const impactSelect = page.locator('select').filter({ has: page.locator('option:has-text("Medium")') }).first()
    await expect(impactSelect).toBeVisible()
    await impactSelect.selectOption('1')

    // Check for Confidence slider
    const confidenceSlider = page.locator('input[type="range"]')
    await expect(confidenceSlider).toBeVisible()
    await confidenceSlider.fill('80')

    // Check for Effort dropdown
    const effortSelect = page.locator('select').filter({ has: page.locator('option:has-text("1 week")') }).first()
    await expect(effortSelect).toBeVisible()
    await effortSelect.selectOption('4')

    // Save button should appear
    const saveButton = page.getByRole('button', { name: /save score/i })
    await expect(saveButton).toBeVisible()

    // Click save
    await saveButton.click()

    // Wait for save to complete
    await page.waitForTimeout(2000)

    // Close the slider
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    // Refresh the page to verify the score was saved to database
    await page.reload()
    await page.waitForTimeout(2000)

    // Click on the idea again to reopen slider
    await page.getByText(ideaTitle).first().click()
    await page.waitForTimeout(2000)

    // Expand RICE section
    const riceSectionAfterReload = page.getByRole('button', { name: /rice score/i })
    await riceSectionAfterReload.click()
    await page.waitForTimeout(500)

    // Verify the saved values are still there
    const reachAfterSave = page.locator('select').filter({ has: page.locator('option[value="5"]') }).first()
    await expect(reachAfterSave).toHaveValue('5')

    // Verify score is calculated and displayed
    const scoreDisplay = page.locator('.text-2xl.font-bold.text-primary')
    await expect(scoreDisplay).toBeVisible({ timeout: 5000 })

    const scoreValue = await scoreDisplay.textContent()
    console.log('RICE Score:', scoreValue)
    expect(Number(scoreValue)).toBeGreaterThan(0)
  })
})
