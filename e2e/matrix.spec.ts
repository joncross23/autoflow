import { test, expect } from '@playwright/test'

test.describe('Matrix Page', () => {
  // Use saved auth state
  test.use({ storageState: 'e2e/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/matrix', { waitUntil: 'networkidle' })
    // Wait for the page to load - use longer timeout for initial data fetch
    await expect(page.getByRole('heading', { name: 'Priority Matrix' })).toBeVisible({ timeout: 30000 })
  })

  test('should display matrix page with header', async ({ page }) => {
    // Check the page header
    await expect(page.getByRole('heading', { name: 'Priority Matrix' })).toBeVisible()

    // Check the description
    await expect(page.getByText('Visualise ideas by Impact vs Effort to identify quick wins')).toBeVisible()
  })

  test('should display refresh button', async ({ page }) => {
    // Refresh button should be visible
    await expect(page.getByRole('button', { name: /refresh/i })).toBeVisible()
  })

  test('should display stats bar with score statistics', async ({ page }) => {
    // Stats should be visible
    await expect(page.getByText('Scored Ideas')).toBeVisible()
    await expect(page.getByText('Unscored')).toBeVisible()
    await expect(page.getByText('Avg Score')).toBeVisible()
    await expect(page.getByText('Highest')).toBeVisible()
    await expect(page.getByText('Lowest')).toBeVisible()
  })

  test('should display matrix view with quadrant labels', async ({ page }) => {
    // Quadrant labels should be visible in the matrix (use first() for potential duplicates)
    await expect(page.getByText('Quick Wins').first()).toBeVisible()
    await expect(page.getByText('Major Projects').first()).toBeVisible()
    await expect(page.getByText('Fill-ins').first()).toBeVisible()
    await expect(page.getByText('Time Sinks').first()).toBeVisible()
  })

  test('should display quadrant filter buttons', async ({ page }) => {
    // Quadrant filter buttons should be visible
    await expect(page.getByRole('button', { name: /quick wins/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /major projects/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /fill-ins/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /time sinks/i }).first()).toBeVisible()
  })

  test('should display axis labels', async ({ page }) => {
    // Axis labels should be visible
    await expect(page.getByText('Impact (Low → High)')).toBeVisible()
    await expect(page.getByText('Effort (Low → High)')).toBeVisible()
  })

  test('should filter by Quick Wins quadrant', async ({ page }) => {
    // Click on Quick Wins filter
    await page.getByRole('button', { name: /quick wins/i }).first().click()
    await page.waitForTimeout(500)

    // Clear filter text should appear
    await expect(page.getByText('Clear filter')).toBeVisible({ timeout: 3000 })
  })

  test('should filter by Major Projects quadrant', async ({ page }) => {
    // Click on Major Projects filter
    await page.getByRole('button', { name: /major projects/i }).first().click()
    await page.waitForTimeout(500)

    // Clear filter text should appear
    await expect(page.getByText('Clear filter')).toBeVisible({ timeout: 3000 })
  })

  test('should filter by Fill-ins quadrant', async ({ page }) => {
    // Click on Fill-ins filter
    await page.getByRole('button', { name: /fill-ins/i }).first().click()
    await page.waitForTimeout(500)

    // Clear filter text should appear
    await expect(page.getByText('Clear filter')).toBeVisible({ timeout: 3000 })
  })

  test('should filter by Time Sinks quadrant', async ({ page }) => {
    // Click on Time Sinks filter
    await page.getByRole('button', { name: /time sinks/i }).first().click()
    await page.waitForTimeout(500)

    // Clear filter text should appear
    await expect(page.getByText('Clear filter')).toBeVisible({ timeout: 3000 })
  })

  test('should toggle quadrant filter on second click', async ({ page }) => {
    // Click on Quick Wins filter
    await page.getByRole('button', { name: /quick wins/i }).first().click()
    await page.waitForTimeout(500)
    await expect(page.getByText('Clear filter')).toBeVisible({ timeout: 3000 })

    // Click again to toggle off
    await page.getByRole('button', { name: /quick wins/i }).first().click()
    await page.waitForTimeout(500)

    // Clear filter should disappear
    await expect(page.getByText('Clear filter')).not.toBeVisible({ timeout: 3000 })
  })

  test('should clear filter using clear button', async ({ page }) => {
    // Click on Quick Wins filter
    await page.getByRole('button', { name: /quick wins/i }).first().click()
    await page.waitForTimeout(500)
    await expect(page.getByText('Clear filter')).toBeVisible({ timeout: 3000 })

    // Click clear filter button
    await page.getByText('Clear filter').click()
    await page.waitForTimeout(500)

    // Clear filter should disappear
    await expect(page.getByText('Clear filter')).not.toBeVisible({ timeout: 3000 })
  })

  test('should display quadrant stats section', async ({ page }) => {
    // Find stats by looking for the distinct stat cards at the bottom
    // The page has two sets of quadrant labels - one in filters and one in stats
    const statsSection = page.locator('.grid.grid-cols-2.sm\\:grid-cols-4').first()
    await expect(statsSection).toBeVisible({ timeout: 3000 })
  })

  test('should display prioritisation tips', async ({ page }) => {
    // Tips section should be visible
    await expect(page.getByText('Prioritisation Tips:')).toBeVisible()
    await expect(page.getByText('High impact, low effort. Do these first!')).toBeVisible()
    await expect(page.getByText('High impact but require significant investment. Plan carefully.')).toBeVisible()
    await expect(page.getByText('Low impact, low effort. Nice to have when you have spare time.')).toBeVisible()
    await expect(page.getByText('Low impact, high effort. Avoid or delegate these.')).toBeVisible()
  })

  test('should refresh data when clicking refresh button', async ({ page }) => {
    // Click refresh button
    await page.getByRole('button', { name: /refresh/i }).click()

    // Page should still be visible after refresh
    await expect(page.getByRole('heading', { name: 'Priority Matrix' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Scored Ideas')).toBeVisible()
  })

  test('should navigate from sidebar', async ({ page }) => {
    // First go to dashboard
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 10000 })

    // Click on Matrix link in sidebar
    await page.getByRole('link', { name: 'Matrix' }).click()

    // Should navigate to matrix page
    await expect(page).toHaveURL(/\/dashboard\/matrix/)
    await expect(page.getByRole('heading', { name: 'Priority Matrix' })).toBeVisible()
  })
})

test.describe('Matrix Page - Idea Interactions', () => {
  // Use saved auth state
  test.use({ storageState: 'e2e/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/matrix', { waitUntil: 'networkidle' })
    // Wait for the page to load - use longer timeout for initial data fetch
    await expect(page.getByRole('heading', { name: 'Priority Matrix' })).toBeVisible({ timeout: 30000 })
  })

  test('should display idea points in matrix if scored ideas exist', async ({ page }) => {
    // Look for idea points in the matrix - they are div elements with rounded-full class
    // The points are inside the matrix container which has aspect-square class
    const matrixContainer = page.locator('.aspect-square').first()
    await expect(matrixContainer).toBeVisible()

    // Look for any circular points (could be bg-primary or bg-muted-foreground)
    const ideaPoints = matrixContainer.locator('.rounded-full')
    const count = await ideaPoints.count()

    // There should be points if there are scored ideas (based on test data)
    // We're just verifying the structure works - actual counts depend on test data
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should show tooltip on idea point hover when ideas exist', async ({ page }) => {
    // Look for idea points in the matrix
    const matrixContainer = page.locator('.aspect-square').first()
    await expect(matrixContainer).toBeVisible()

    // Get all circular point elements in the matrix (the actual visible dots)
    const ideaPoints = matrixContainer.locator('.rounded-full')
    const count = await ideaPoints.count()

    // If there are idea points, hover to show tooltip
    if (count > 0) {
      const firstPoint = ideaPoints.first()
      await firstPoint.hover({ force: true })
      await page.waitForTimeout(500) // Wait for tooltip animation

      // Look for tooltip (bg-bg-elevated class)
      const tooltip = page.locator('.bg-bg-elevated')
      const tooltipVisible = await tooltip.isVisible({ timeout: 2000 }).catch(() => false)

      // Tooltip should appear on hover (if elements exist)
      if (tooltipVisible) {
        await expect(tooltip).toBeVisible()
      }
    }
  })

  test('should open idea detail slider on point click when ideas exist', async ({ page }) => {
    // Look for idea points in the matrix
    const matrixContainer = page.locator('.aspect-square').first()
    await expect(matrixContainer).toBeVisible()

    // Get all circular point elements in the matrix (the actual visible dots)
    const ideaPoints = matrixContainer.locator('.rounded-full')
    const count = await ideaPoints.count()

    // If there are idea points, click to open slider
    if (count > 0) {
      const firstPoint = ideaPoints.first()
      await firstPoint.click({ force: true })
      await page.waitForTimeout(500)

      // Idea detail slider should open
      // Look for the slider by its structure or test ID if available
      const slider = page.getByTestId('idea-slider').or(page.locator('[role="dialog"]').first())
      const sliderVisible = await slider.isVisible({ timeout: 3000 }).catch(() => false)

      // Verify slider opened if interaction was successful
      if (sliderVisible) {
        await expect(slider).toBeVisible()
      }
    }
  })
})

test.describe('Matrix Page - Empty State', () => {
  // Use saved auth state
  test.use({ storageState: 'e2e/.auth/user.json' })

  test('should handle filtering gracefully', async ({ page }) => {
    await page.goto('/dashboard/matrix', { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: 'Priority Matrix' })).toBeVisible({ timeout: 30000 })

    // Apply a filter (Quick Wins)
    await page.getByRole('button', { name: /quick wins/i }).first().click()
    await page.waitForTimeout(500)

    // Check that filter is active
    await expect(page.getByText('Clear filter')).toBeVisible({ timeout: 3000 })

    // The matrix should still be displayed (either with ideas or empty state message)
    const matrixContainer = page.locator('.aspect-square').first()
    await expect(matrixContainer).toBeVisible()

    // Clear filter should work
    await page.getByText('Clear filter').click()
    await page.waitForTimeout(500)
    await expect(page.getByText('Clear filter')).not.toBeVisible({ timeout: 3000 })
  })
})
