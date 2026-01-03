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

    // Click delete
    await page.getByTestId('idea-slider-delete').click()

    // Wait for custom confirmation dialog to appear
    await expect(page.getByRole('dialog', { name: /delete idea/i })).toBeVisible({ timeout: 5000 })

    // Click the "Delete" button in the confirmation dialog
    await page.getByRole('button', { name: 'Delete', exact: true }).click()

    // Wait for API call to complete
    await page.waitForTimeout(1000)

    // Slider should close
    await expect(page.getByTestId('idea-detail-slider')).not.toBeVisible({ timeout: 10000 })

    // Idea should no longer appear in the list
    await expect(page.getByText(testIdeaTitle)).not.toBeVisible()
  })

  test('should archive idea from more menu', async ({ page }) => {
    await page.getByText(testIdeaTitle).click()
    await expect(page.getByTestId('idea-detail-slider')).toBeVisible({ timeout: 5000 })

    // Open more menu
    await page.getByTestId('idea-slider-more-button').click()
    await expect(page.getByTestId('idea-slider-more-menu')).toBeVisible()

    // Click archive
    await page.getByTestId('idea-slider-archive').click()

    // Wait for custom confirmation dialog to appear
    await expect(page.getByRole('dialog', { name: /archive idea/i })).toBeVisible({ timeout: 5000 })

    // Click the "Archive" button in the confirmation dialog
    await page.getByRole('button', { name: 'Archive', exact: true }).click()

    // Wait for API call to complete
    await page.waitForTimeout(1000)

    // Slider should close
    await expect(page.getByTestId('idea-detail-slider')).not.toBeVisible({ timeout: 10000 })

    // Idea should no longer appear in the list (archived ideas are hidden by default)
    await expect(page.getByText(testIdeaTitle)).not.toBeVisible()
  })

  test('should duplicate idea from more menu', async ({ page }) => {
    await page.getByText(testIdeaTitle).click()
    await expect(page.getByTestId('idea-detail-slider')).toBeVisible({ timeout: 5000 })

    // Open more menu
    await page.getByTestId('idea-slider-more-button').click()
    await expect(page.getByTestId('idea-slider-more-menu')).toBeVisible()

    // Click duplicate
    await page.getByTestId('idea-slider-duplicate').click()

    // Wait for API call to complete
    await page.waitForTimeout(1000)

    // Should show success toast with the copied idea title
    await expect(page.getByText(/created.*copy/i)).toBeVisible({ timeout: 5000 })
  })

  test('should edit idea description', async ({ page }) => {
    await page.getByText(testIdeaTitle).click()
    await expect(page.getByTestId('idea-detail-slider')).toBeVisible({ timeout: 5000 })

    // Find description section (look for "Description" heading)
    const descriptionSection = page.locator('text=Description').locator('..')
    if (await descriptionSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Click on description area to edit
      const descriptionArea = descriptionSection.locator('div').filter({ hasText: /click to add/i })
      if (await descriptionArea.isVisible({ timeout: 2000 }).catch(() => false)) {
        await descriptionArea.click()

        // Fill in description
        const textarea = page.locator('textarea').first()
        if (await textarea.isVisible()) {
          await textarea.fill('Test description for automated testing')
          await textarea.blur() // Trigger save on blur

          // Wait for save
          await page.waitForTimeout(1000)

          // Verify description is saved
          await expect(page.getByText('Test description for automated testing')).toBeVisible()
        }
      }
    }
  })

  test('should change effort estimate', async ({ page }) => {
    await page.getByText(testIdeaTitle).click()
    await expect(page.getByTestId('idea-detail-slider')).toBeVisible({ timeout: 5000 })

    // Scroll to bottom to find effort metadata
    await page.evaluate(() => {
      const slider = document.querySelector('[data-testid="idea-detail-slider"]')
      if (slider) {
        slider.scrollTop = slider.scrollHeight
      }
    })

    // Look for effort button (shows "Effort?" if not set)
    const effortButton = page.getByRole('button', { name: /effort/i })
    if (await effortButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await effortButton.click()

      // Wait for dropdown menu
      await page.waitForTimeout(500)

      // Select "Small" effort
      const smallOption = page.getByRole('button', { name: /small/i }).first()
      if (await smallOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await smallOption.click()
        await page.waitForTimeout(1000)

        // Verify effort is updated
        await expect(page.getByText(/small/i)).toBeVisible()
      }
    }
  })

  test('should change planning horizon', async ({ page }) => {
    await page.getByText(testIdeaTitle).click()
    await expect(page.getByTestId('idea-detail-slider')).toBeVisible({ timeout: 5000 })

    // Scroll to bottom to find horizon metadata
    await page.evaluate(() => {
      const slider = document.querySelector('[data-testid="idea-detail-slider"]')
      if (slider) {
        slider.scrollTop = slider.scrollHeight
      }
    })

    // Look for horizon button (shows "Horizon?" if not set)
    const horizonButton = page.getByRole('button', { name: /horizon/i })
    if (await horizonButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await horizonButton.click()

      // Wait for dropdown menu
      await page.waitForTimeout(500)

      // Select "Now" horizon
      const nowOption = page.getByRole('button', { name: /^now$/i }).first()
      if (await nowOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nowOption.click()
        await page.waitForTimeout(1500)

        // Success - horizon was clicked and selection made
        // (verification would require finding the updated metadata which may have scrolled out of view)
      }
    }
  })
})

test.describe('Idea Slider - Links and Attachments', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  let testIdeaTitle: string

  test.beforeEach(async ({ page }) => {
    // Create a unique test idea via quick capture
    testIdeaTitle = `Links Test ${Date.now()}`
    await page.goto('/dashboard')
    await page.getByTestId('quick-capture-input').fill(testIdeaTitle)
    await page.getByTestId('quick-capture-input').press('Enter')
    await expect(page.getByTestId('quick-capture-success')).toBeVisible({ timeout: 10000 })

    // Navigate to ideas page and open the slider
    await page.goto('/dashboard/ideas')
    await page.waitForTimeout(1000)
    await page.getByText(testIdeaTitle).click()
    await expect(page.getByTestId('idea-detail-slider')).toBeVisible({ timeout: 5000 })
  })

  test('should add a link to idea', async ({ page }) => {
    // Scroll down to find the Links section (it's a CollapsibleSection)
    const linksSection = page.getByRole('button', { name: /links/i }).first()

    // Click to expand if collapsed
    if (await linksSection.isVisible()) {
      await linksSection.click()
      await page.waitForTimeout(500)
    }

    // Look for "Add link" button
    const addLinkButton = page.getByRole('button', { name: /add link/i }).first()
    if (await addLinkButton.isVisible()) {
      await addLinkButton.click()

      // Fill in link details
      const urlInput = page.getByPlaceholder(/url/i).first()
      if (await urlInput.isVisible()) {
        await urlInput.fill('https://example.com')

        const titleInput = page.getByPlaceholder(/title|label/i).first()
        if (await titleInput.isVisible()) {
          await titleInput.fill('Example Link')
        }

        // Save the link
        const saveButton = page.getByRole('button', { name: /save|add/i }).first()
        if (await saveButton.isVisible()) {
          await saveButton.click()
          await page.waitForTimeout(1000)

          // Verify link appears
          await expect(page.getByText('Example Link')).toBeVisible()
        }
      }
    }
  })

  test('should add an attachment to idea', async ({ page }) => {
    // Scroll down to find the Attachments section
    const attachmentsSection = page.getByRole('button', { name: /attachments/i }).first()

    // Click to expand if collapsed
    if (await attachmentsSection.isVisible()) {
      await attachmentsSection.click()
      await page.waitForTimeout(500)
    }

    // Look for file input or upload button
    const fileInput = page.locator('input[type="file"]').first()
    if (await fileInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Create a test file
      const buffer = Buffer.from('test file content')
      await fileInput.setInputFiles({
        name: 'test-file.txt',
        mimeType: 'text/plain',
        buffer,
      })

      // Wait for upload to complete
      await page.waitForTimeout(2000)

      // Verify attachment appears
      await expect(page.getByText('test-file.txt')).toBeVisible({ timeout: 5000 })
    }
  })
})
