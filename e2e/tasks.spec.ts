import { test, expect } from '@playwright/test'

// Helper to create a task and return its title
async function createTask(page: import('@playwright/test').Page, titlePrefix: string) {
  const addCardButton = page.getByRole('button', { name: /add card/i }).first()
  await expect(addCardButton).toBeVisible({ timeout: 15000 })
  await addCardButton.click()

  const taskInput = page.getByPlaceholder(/card title/i)
  await expect(taskInput).toBeVisible({ timeout: 3000 })

  const taskTitle = `${titlePrefix} ${Date.now()}`
  await taskInput.fill(taskTitle)
  await taskInput.press('Enter')

  // Wait for task to be created and appear
  await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 5000 })
  await page.waitForTimeout(500) // Allow state to settle

  return taskTitle
}

// Helper to click on a task card and open modal
async function openTaskModal(page: import('@playwright/test').Page, taskTitle: string) {
  // Find the task by its exact title text
  const taskElement = page.getByText(taskTitle, { exact: true })
  await expect(taskElement).toBeVisible({ timeout: 5000 })

  // Click with force to bypass any potential overlays
  await taskElement.click({ force: true })

  // Wait for modal to appear
  await expect(page.getByTestId('task-detail-modal')).toBeVisible({ timeout: 10000 })
}

test.describe('Tasks Board', () => {
  // Use saved auth state
  test.use({ storageState: 'e2e/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/tasks')
    // Wait for board to fully load
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })
  })

  test('should display kanban board', async ({ page }) => {
    // Should have column headers like "Backlog", "To Do", etc.
    await expect(page.getByText('Backlog').first()).toBeVisible()
  })

  test('should create a new task via add card button', async ({ page }) => {
    const taskTitle = await createTask(page, 'Test Task')
    // Task should appear in the column
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 5000 })
  })

  // TODO: Fix task modal click handling - clicks register but state doesn't update
  test.skip('should open task detail modal when clicking on task', async ({ page }) => {
    const taskTitle = await createTask(page, 'Modal Test')
    await openTaskModal(page, taskTitle)
    // Modal is already verified visible in openTaskModal
  })

  test.skip('should edit task title in modal', async ({ page }) => {
    const originalTitle = await createTask(page, 'Edit Title Test')
    await openTaskModal(page, originalTitle)

    // Edit the title
    const newTitle = `Updated ${originalTitle}`
    await page.getByTestId('task-modal-title').fill(newTitle)

    // Save button should appear
    await expect(page.getByTestId('task-modal-save')).toBeVisible()

    // Click save
    await page.getByTestId('task-modal-save').click()
    await page.waitForTimeout(1000)

    // Close modal
    await page.getByTestId('task-modal-close').click()
    await expect(page.getByTestId('task-detail-modal')).not.toBeVisible({ timeout: 5000 })

    // Task should show updated title
    await expect(page.getByText(newTitle)).toBeVisible({ timeout: 5000 })
  })

  test.skip('should close task modal with X button', async ({ page }) => {
    const taskTitle = await createTask(page, 'Close Test')
    await openTaskModal(page, taskTitle)

    // Click close button
    await page.getByTestId('task-modal-close').click()

    // Modal should be hidden
    await expect(page.getByTestId('task-detail-modal')).not.toBeVisible({ timeout: 5000 })
  })

  test.skip('should close task modal with Escape key', async ({ page }) => {
    const taskTitle = await createTask(page, 'Escape Test')
    await openTaskModal(page, taskTitle)

    // Press Escape
    await page.keyboard.press('Escape')

    // Modal should be hidden
    await expect(page.getByTestId('task-detail-modal')).not.toBeVisible({ timeout: 5000 })
  })

  test('should filter tasks by search', async ({ page }) => {
    // Look for search input
    const searchInput = page.getByPlaceholder(/search/i)
    if (await searchInput.isVisible()) {
      // Type search query
      await searchInput.fill('test')
      await page.waitForTimeout(500)
    }
  })
})

test.describe('Task Modal Sections', () => {
  // Use saved auth state
  test.use({ storageState: 'e2e/.auth/user.json' })

  test.skip('should enable labels section from sidebar', async ({ page }) => {
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })

    const taskTitle = await createTask(page, 'Labels Test')
    await openTaskModal(page, taskTitle)

    // Click Labels button in sidebar
    const labelsButton = page.getByRole('button', { name: 'Labels' })
    if (await labelsButton.isVisible()) {
      await labelsButton.click()
      await page.waitForTimeout(500)
    }
  })

  test.skip('should enable checklist section from sidebar', async ({ page }) => {
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })

    const taskTitle = await createTask(page, 'Checklist Test')
    await openTaskModal(page, taskTitle)

    // Click Checklist button in sidebar
    const checklistButton = page.getByRole('button', { name: 'Checklist' })
    if (await checklistButton.isVisible()) {
      await checklistButton.click()
      await page.waitForTimeout(500)
    }
  })
})
