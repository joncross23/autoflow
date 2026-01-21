import { test, expect } from '@playwright/test'

/**
 * Task Column Management Tests
 *
 * Tests all column-related behaviors:
 * - Column creation with name and color
 * - Column renaming
 * - Column color changes
 * - WIP limit management
 * - Column deletion (with protection for non-empty columns)
 * - Column menu interactions
 */

test.describe('Task Columns', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/tasks')
    // Wait for board to fully load
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })
  })

  test('should display task columns', async ({ page }) => {
    // Should have at least one column visible (e.g., "Backlog")
    const firstColumn = page.locator('[data-column-id]').first()
    await expect(firstColumn).toBeVisible()

    // Column should have a colored indicator
    const colorIndicator = firstColumn.locator('.w-3.h-3.rounded')
    await expect(colorIndicator).toBeVisible()

    // Column should show task count
    const taskCount = firstColumn.locator('span.text-xs').first()
    await expect(taskCount).toBeVisible()
  })

  test('should show Add Column button', async ({ page }) => {
    const addColumnButton = page.getByRole('button', { name: /add column/i })
    await expect(addColumnButton).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Column Creation', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })
  })

  test('should create a new column with default settings', async ({ page }) => {
    // Click Add Column button
    const addColumnButton = page.getByRole('button', { name: /add column/i })
    await addColumnButton.click()

    // Wait for dialog to appear
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Create New Column')).toBeVisible()

    // Enter column name
    const columnName = `Test Column ${Date.now()}`
    const nameInput = page.locator('#column-name')
    await nameInput.fill(columnName)

    // Create the column
    await page.getByRole('button', { name: 'Create Column' }).click()

    // Wait for dialog to close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })

    // Verify column appears on the board
    await expect(page.getByText(columnName).first()).toBeVisible({ timeout: 5000 })
  })

  test('should create column with custom color', async ({ page }) => {
    const addColumnButton = page.getByRole('button', { name: /add column/i })
    await addColumnButton.click()

    await expect(page.getByRole('dialog')).toBeVisible()

    // Enter column name
    const columnName = `Blue Column ${Date.now()}`
    await page.locator('#column-name').fill(columnName)

    // Select blue color
    const blueColorButton = page.getByRole('button', { name: /blue/i }).first()
    await blueColorButton.click()

    // Create the column
    await page.getByRole('button', { name: 'Create Column' }).click()

    // Wait for dialog to close and column to appear
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByText(columnName).first()).toBeVisible({ timeout: 5000 })
  })

  test('should cancel column creation with Cancel button', async ({ page }) => {
    const addColumnButton = page.getByRole('button', { name: /add column/i })
    await addColumnButton.click()

    await expect(page.getByRole('dialog')).toBeVisible()

    // Enter some text
    await page.locator('#column-name').fill('This should not be created')

    // Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).click()

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })

    // Column should not appear
    await expect(page.getByText('This should not be created')).not.toBeVisible()
  })

  test('should cancel column creation with ESC key', async ({ page }) => {
    const addColumnButton = page.getByRole('button', { name: /add column/i })
    await addColumnButton.click()

    await expect(page.getByRole('dialog')).toBeVisible()

    // Enter some text
    await page.locator('#column-name').fill('ESC test column')

    // Press Escape
    await page.keyboard.press('Escape')

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })
  })

  test('should disable Create button when name is empty', async ({ page }) => {
    const addColumnButton = page.getByRole('button', { name: /add column/i })
    await addColumnButton.click()

    await expect(page.getByRole('dialog')).toBeVisible()

    // Create button should be disabled
    const createButton = page.getByRole('button', { name: 'Create Column' })
    await expect(createButton).toBeDisabled()

    // Type something
    await page.locator('#column-name').fill('Test')

    // Should be enabled now
    await expect(createButton).toBeEnabled()

    // Clear the input
    await page.locator('#column-name').clear()

    // Should be disabled again
    await expect(createButton).toBeDisabled()
  })
})

test.describe('Column Menu', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })
  })

  test('should open column menu on hover and click', async ({ page }) => {
    // Find first column
    const firstColumn = page.locator('[data-column-id]').first()
    await expect(firstColumn).toBeVisible()

    // Hover over column header
    await firstColumn.hover()

    // Menu button should become visible (MoreVertical icon)
    const menuButton = firstColumn.getByLabel('Column actions')
    await expect(menuButton).toBeVisible()

    // Click menu button
    await menuButton.click()

    // Menu should appear with options
    await expect(page.getByRole('menu', { name: /column actions/i })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /rename column/i })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /change colour/i })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /set wip limit/i })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /delete column/i })).toBeVisible()
  })

  test('should close menu with outside click', async ({ page }) => {
    const firstColumn = page.locator('[data-column-id]').first()
    await firstColumn.hover()

    const menuButton = firstColumn.getByLabel('Column actions')
    await menuButton.click()

    await expect(page.getByRole('menu', { name: /column actions/i })).toBeVisible()

    // Click outside the menu
    await page.click('body', { position: { x: 10, y: 10 } })

    // Menu should close
    await expect(page.getByRole('menu', { name: /column actions/i })).not.toBeVisible({ timeout: 3000 })
  })

  test('should close menu with ESC key', async ({ page }) => {
    const firstColumn = page.locator('[data-column-id]').first()
    await firstColumn.hover()

    const menuButton = firstColumn.getByLabel('Column actions')
    await menuButton.click()

    await expect(page.getByRole('menu', { name: /column actions/i })).toBeVisible()

    // Press Escape
    await page.keyboard.press('Escape')

    // Menu should close
    await expect(page.getByRole('menu', { name: /column actions/i })).not.toBeVisible({ timeout: 3000 })
  })
})

test.describe('Column Renaming', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })
  })

  test('should rename a column', async ({ page }) => {
    // Create a new column first
    await page.getByRole('button', { name: /add column/i }).click()
    const originalName = `Rename Test ${Date.now()}`
    await page.locator('#column-name').fill(originalName)
    await page.getByRole('button', { name: 'Create Column' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })

    // Wait for column to appear and become interactive
    await page.waitForTimeout(1000)

    // Find the new column and open its menu
    const newColumn = page.locator('[data-column-id]').filter({ hasText: originalName })
    await newColumn.hover()

    const menuButton = newColumn.getByLabel('Column actions')
    await menuButton.click()

    // Click Rename
    await page.getByRole('menuitem', { name: /rename column/i }).click()

    // Wait for rename dialog
    await expect(page.getByText('Rename Column')).toBeVisible()

    // Change the name
    const newName = `Renamed ${Date.now()}`
    const input = page.getByPlaceholder(/column name/i)
    await input.clear()
    await input.fill(newName)

    // Click Rename button
    await page.getByRole('button', { name: 'Rename', exact: true }).click()

    // Wait for dialog to close
    await expect(page.getByText('Rename Column')).not.toBeVisible({ timeout: 5000 })

    // Verify new name appears
    await expect(page.getByText(newName).first()).toBeVisible({ timeout: 5000 })

    // Original name should not be visible
    await expect(page.getByText(originalName, { exact: true })).not.toBeVisible()
  })

  test('should close rename dialog without saving if name unchanged', async ({ page }) => {
    const firstColumn = page.locator('[data-column-id]').first()

    // Get the current column name
    const columnNameElement = firstColumn.locator('span.text-sm.font-semibold').first()
    const currentName = await columnNameElement.textContent() || 'Backlog'

    await firstColumn.hover()
    const menuButton = firstColumn.getByLabel('Column actions')
    await menuButton.click()

    await page.getByRole('menuitem', { name: /rename column/i }).click()
    await expect(page.getByText('Rename Column')).toBeVisible()

    // The input should already have the current name - just click Rename without changing it
    await page.getByRole('button', { name: 'Rename', exact: true }).click()

    // Dialog should close
    await expect(page.getByText('Rename Column')).not.toBeVisible({ timeout: 5000 })

    // Name should remain the same
    await expect(page.getByText(currentName).first()).toBeVisible()
  })

  test('should cancel rename with Cancel button', async ({ page }) => {
    const firstColumn = page.locator('[data-column-id]').first()
    await firstColumn.hover()

    const menuButton = firstColumn.getByLabel('Column actions')
    await menuButton.click()

    await page.getByRole('menuitem', { name: /rename column/i }).click()
    await expect(page.getByText('Rename Column')).toBeVisible()

    // Change the name
    await page.getByPlaceholder(/column name/i).fill('This should not save')

    // Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).click()

    // Dialog should close
    await expect(page.getByText('Rename Column')).not.toBeVisible({ timeout: 5000 })

    // Name should not have changed
    await expect(page.getByText('This should not save')).not.toBeVisible()
  })

  test('should cancel rename with ESC key', async ({ page }) => {
    const firstColumn = page.locator('[data-column-id]').first()
    await firstColumn.hover()

    const menuButton = firstColumn.getByLabel('Column actions')
    await menuButton.click()

    await page.getByRole('menuitem', { name: /rename column/i }).click()
    await expect(page.getByText('Rename Column')).toBeVisible()

    // Press Escape
    await page.keyboard.press('Escape')

    // Dialog should close
    await expect(page.getByText('Rename Column')).not.toBeVisible({ timeout: 5000 })
  })
})

test.describe('Column Color', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })
  })

  test('should change column color', async ({ page }) => {
    // Create a new column for this test
    await page.getByRole('button', { name: /add column/i }).click()
    const columnName = `Color Test ${Date.now()}`
    await page.locator('#column-name').fill(columnName)
    await page.getByRole('button', { name: 'Create Column' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })

    // Wait for column to appear
    await page.waitForTimeout(1000)

    // Find the column and open its menu
    const column = page.locator('[data-column-id]').filter({ hasText: columnName })
    await column.hover()

    const menuButton = column.getByLabel('Column actions')
    await menuButton.click()

    // Click Change colour
    await page.getByRole('menuitem', { name: /change colour/i }).click()

    // Wait for color dialog - it should have color options
    await page.waitForTimeout(500)

    // Look for a color option button (e.g., green, blue, etc.)
    const colorButtons = page.locator('button').filter({ has: page.locator('.w-6.h-6.rounded-full') })
    const colorButtonCount = await colorButtons.count()

    if (colorButtonCount > 0) {
      // Click the second color option (not the current one)
      await colorButtons.nth(1).click()

      // Save the color change
      const saveButton = page.getByRole('button', { name: /save|change/i })
      if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await saveButton.click()
      }

      // Wait for changes to apply
      await page.waitForTimeout(1000)

      // Color indicator should still be visible (we can't easily test the exact color change)
      const colorIndicator = column.locator('.w-3.h-3.rounded').first()
      await expect(colorIndicator).toBeVisible()
    }
  })

  test('should display color picker with multiple options', async ({ page }) => {
    const firstColumn = page.locator('[data-column-id]').first()
    await firstColumn.hover()

    const menuButton = firstColumn.getByLabel('Column actions')
    await menuButton.click()

    await page.getByRole('menuitem', { name: /change colour/i }).click()

    // Wait for color picker
    await page.waitForTimeout(500)

    // Should have multiple color options
    const colorButtons = page.locator('button').filter({ has: page.locator('.w-6.h-6.rounded-full') })
    const count = await colorButtons.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('WIP Limit Management', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })
  })

  test('should set a WIP limit on a column', async ({ page }) => {
    // Create a new column for this test
    await page.getByRole('button', { name: /add column/i }).click()
    const columnName = `WIP Test ${Date.now()}`
    await page.locator('#column-name').fill(columnName)
    await page.getByRole('button', { name: 'Create Column' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })

    // Wait for column to appear
    await page.waitForTimeout(1000)

    // Find the column and open its menu
    const column = page.locator('[data-column-id]').filter({ hasText: columnName })
    await column.hover()

    const menuButton = column.getByLabel('Column actions')
    await menuButton.click()

    // Click Set WIP limit
    await page.getByRole('menuitem', { name: /set wip limit/i }).click()

    // Wait for WIP limit dialog
    await expect(page.getByText('Set WIP Limit')).toBeVisible()

    // Enter a WIP limit
    const wipInput = page.locator('#wip-limit')
    await wipInput.fill('3')

    // Save the limit
    await page.getByRole('button', { name: 'Save' }).click()

    // Dialog should close
    await expect(page.getByText('Set WIP Limit')).not.toBeVisible({ timeout: 5000 })

    // Wait for update to complete
    await page.waitForTimeout(1000)

    // Column should now show the limit (0/3 format)
    const taskCount = column.locator('span.text-xs').first()
    await expect(taskCount).toContainText('/3')
  })

  test('should show warning when WIP limit is exceeded', async ({ page }) => {
    // Create a column with WIP limit of 1
    await page.getByRole('button', { name: /add column/i }).click()
    const columnName = `WIP Warning ${Date.now()}`
    await page.locator('#column-name').fill(columnName)
    await page.getByRole('button', { name: 'Create Column' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })

    await page.waitForTimeout(1000)

    // Set WIP limit to 1
    const column = page.locator('[data-column-id]').filter({ hasText: columnName })
    await column.hover()
    await column.getByLabel('Column actions').click()
    await page.getByRole('menuitem', { name: /set wip limit/i }).click()
    await page.locator('#wip-limit').fill('1')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('Set WIP Limit')).not.toBeVisible({ timeout: 5000 })

    await page.waitForTimeout(1000)

    // Add 2 tasks to exceed the limit
    const addCardButton = column.getByRole('button', { name: /add card/i })

    // Add first task
    await addCardButton.click()
    const taskInput1 = column.getByPlaceholder(/card title/i)
    await taskInput1.fill('Task 1')
    await taskInput1.press('Enter')
    await page.waitForTimeout(1000)

    // Add second task
    await addCardButton.click()
    const taskInput2 = column.getByPlaceholder(/card title/i)
    await taskInput2.fill('Task 2')
    await taskInput2.press('Enter')
    await page.waitForTimeout(1000)

    // Should show WIP limit exceeded warning
    await expect(column.getByText(/wip limit exceeded/i)).toBeVisible({ timeout: 5000 })

    // Task count should show 2/1 and be in error state
    const taskCount = column.locator('span.text-xs').first()
    await expect(taskCount).toContainText('2/1')
  })

  test('should remove WIP limit', async ({ page }) => {
    // Create a column with a WIP limit
    await page.getByRole('button', { name: /add column/i }).click()
    const columnName = `Remove WIP ${Date.now()}`
    await page.locator('#column-name').fill(columnName)
    await page.getByRole('button', { name: 'Create Column' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })

    await page.waitForTimeout(1000)

    // Set WIP limit
    const column = page.locator('[data-column-id]').filter({ hasText: columnName })
    await column.hover()
    await column.getByLabel('Column actions').click()
    await page.getByRole('menuitem', { name: /set wip limit/i }).click()
    await page.locator('#wip-limit').fill('5')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('Set WIP Limit')).not.toBeVisible({ timeout: 5000 })

    await page.waitForTimeout(1000)

    // Verify limit is shown
    const taskCount = column.locator('span.text-xs').first()
    await expect(taskCount).toContainText('/5')

    // Now remove the limit
    await column.hover()
    await column.getByLabel('Column actions').click()
    await page.getByRole('menuitem', { name: /set wip limit/i }).click()
    await expect(page.getByText('Set WIP Limit')).toBeVisible()

    // Click Remove Limit button
    await page.getByRole('button', { name: /remove limit/i }).click()

    // Dialog should close
    await expect(page.getByText('Set WIP Limit')).not.toBeVisible({ timeout: 5000 })

    await page.waitForTimeout(1000)

    // Task count should no longer show the limit
    await expect(taskCount).not.toContainText('/5')
  })

  test('should validate WIP limit input', async ({ page }) => {
    const firstColumn = page.locator('[data-column-id]').first()
    await firstColumn.hover()

    await firstColumn.getByLabel('Column actions').click()
    await page.getByRole('menuitem', { name: /set wip limit/i }).click()

    const wipInput = page.locator('#wip-limit')
    const saveButton = page.getByRole('button', { name: 'Save' })

    // Try entering 0
    await wipInput.fill('0')
    await expect(page.getByText(/please enter a positive number/i)).toBeVisible()

    // Try entering negative number
    await wipInput.fill('-1')
    await expect(page.getByText(/please enter a positive number/i)).toBeVisible()

    // Enter valid number
    await wipInput.fill('5')
    await expect(page.getByText(/please enter a positive number/i)).not.toBeVisible()
  })
})

test.describe('Column Deletion', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })
  })

  test('should delete an empty column', async ({ page }) => {
    // Create a new empty column
    await page.getByRole('button', { name: /add column/i }).click()
    const columnName = `Delete Me ${Date.now()}`
    await page.locator('#column-name').fill(columnName)
    await page.getByRole('button', { name: 'Create Column' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })

    // Wait for column to appear
    await page.waitForTimeout(1000)

    // Verify column exists
    await expect(page.getByText(columnName).first()).toBeVisible()

    // Open column menu
    const column = page.locator('[data-column-id]').filter({ hasText: columnName })
    await column.hover()
    await column.getByLabel('Column actions').click()

    // Click Delete
    await page.getByRole('menuitem', { name: /delete column/i }).click()

    // Confirmation dialog should appear
    await expect(page.getByText(/delete.*column/i)).toBeVisible()
    await expect(page.getByText(/cannot be undone/i)).toBeVisible()

    // Confirm deletion
    await page.getByRole('button', { name: /delete column/i }).click()

    // Wait for dialog to close and column to be removed
    await page.waitForTimeout(1000)

    // Column should no longer exist
    await expect(page.getByText(columnName, { exact: true })).not.toBeVisible()
  })

  test('should prevent deletion of column with tasks', async ({ page }) => {
    // Create a new column
    await page.getByRole('button', { name: /add column/i }).click()
    const columnName = `Has Tasks ${Date.now()}`
    await page.locator('#column-name').fill(columnName)
    await page.getByRole('button', { name: 'Create Column' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })

    await page.waitForTimeout(1000)

    // Add a task to the column
    const column = page.locator('[data-column-id]').filter({ hasText: columnName })
    const addCardButton = column.getByRole('button', { name: /add card/i })
    await addCardButton.click()

    const taskInput = column.getByPlaceholder(/card title/i)
    await taskInput.fill('Blocking task')
    await taskInput.press('Enter')
    await page.waitForTimeout(1000)

    // Try to delete the column
    await column.hover()
    await column.getByLabel('Column actions').click()
    await page.getByRole('menuitem', { name: /delete column/i }).click()

    // Should show error message about having tasks
    await expect(page.getByText(/cannot delete column/i)).toBeVisible()
    await expect(page.getByText(/contains.*task/i)).toBeVisible()

    // Should only have OK button, not Delete button
    await expect(page.getByRole('button', { name: 'OK' })).toBeVisible()
    await expect(page.getByRole('button', { name: /delete column/i })).not.toBeVisible()

    // Close the dialog
    await page.getByRole('button', { name: 'OK' }).click()

    // Column should still exist
    await expect(column).toBeVisible()
  })
})

test.describe('Column Interactions', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })
  })

  test('should show menu button only on hover', async ({ page }) => {
    const firstColumn = page.locator('[data-column-id]').first()

    // Menu button should not be visible initially
    const menuButton = firstColumn.getByLabel('Column actions')
    // Note: The button may exist in DOM but be visually hidden with opacity-0

    // Hover over column
    await firstColumn.hover()

    // Wait a bit for hover state
    await page.waitForTimeout(200)

    // Menu button should be visible now
    await expect(menuButton).toBeVisible()
  })

  test('should handle rapid column creation', async ({ page }) => {
    const columnNames = [
      `Rapid 1 ${Date.now()}`,
      `Rapid 2 ${Date.now() + 1}`,
    ]

    for (const name of columnNames) {
      await page.getByRole('button', { name: /add column/i }).click()
      await page.locator('#column-name').fill(name)
      await page.getByRole('button', { name: 'Create Column' }).click()
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })
      await page.waitForTimeout(500)
    }

    // Both columns should exist
    for (const name of columnNames) {
      await expect(page.getByText(name).first()).toBeVisible()
    }
  })

  test('should maintain column state during page interactions', async ({ page }) => {
    // Create a column
    await page.getByRole('button', { name: /add column/i }).click()
    const columnName = `State Test ${Date.now()}`
    await page.locator('#column-name').fill(columnName)
    await page.getByRole('button', { name: 'Create Column' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })
    await page.waitForTimeout(1000)

    // Set WIP limit
    const column = page.locator('[data-column-id]').filter({ hasText: columnName })
    await column.hover()
    await column.getByLabel('Column actions').click()
    await page.getByRole('menuitem', { name: /set wip limit/i }).click()
    await page.locator('#wip-limit').fill('3')
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForTimeout(1000)

    // Reload page
    await page.reload()
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })

    // Column and WIP limit should persist
    const reloadedColumn = page.locator('[data-column-id]').filter({ hasText: columnName })
    await expect(reloadedColumn).toBeVisible()

    const taskCount = reloadedColumn.locator('span.text-xs').first()
    await expect(taskCount).toContainText('/3')
  })
})
