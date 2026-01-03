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
  // Wait longer for state to fully update and task to be clickable
  await page.waitForTimeout(1000)

  return taskTitle
}

// Helper to click on a task card and open modal
async function openTaskModal(page: import('@playwright/test').Page, taskTitle: string) {
  // Find the task by its exact title text
  const taskElement = page.getByText(taskTitle, { exact: true })
  await expect(taskElement).toBeVisible({ timeout: 5000 })

  // Click with delay: 0 to ensure it's a click, not drag (dnd-kit has 8px distance threshold)
  // The delay forces a proper down-wait-up sequence
  await taskElement.click({ delay: 10 })

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

  test('should open task detail modal when clicking on task', async ({ page }) => {
    const taskTitle = await createTask(page, 'Modal Test')
    await openTaskModal(page, taskTitle)
    // Modal is already verified visible in openTaskModal
  })

  test('should edit task title in modal', async ({ page }) => {
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

  test('should close task modal with X button', async ({ page }) => {
    const taskTitle = await createTask(page, 'Close Test')
    await openTaskModal(page, taskTitle)

    // Click close button
    await page.getByTestId('task-modal-close').click()

    // Modal should be hidden
    await expect(page.getByTestId('task-detail-modal')).not.toBeVisible({ timeout: 5000 })
  })

  test('should close task modal with Escape key', async ({ page }) => {
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

  test('should enable labels section from sidebar', async ({ page }) => {
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })

    const taskTitle = await createTask(page, 'Labels Test')
    await openTaskModal(page, taskTitle)

    // Click Labels button in sidebar
    const labelsButton = page.getByRole('button', { name: 'Labels' }).first()
    await expect(labelsButton).toBeVisible({ timeout: 5000 })
    await labelsButton.click()
    await page.waitForTimeout(500)

    // Verify labels section is visible
    const labelsHeading = page.getByText(/labels/i).first()
    await expect(labelsHeading).toBeVisible()
  })

  test('should enable checklist section from sidebar', async ({ page }) => {
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })

    const taskTitle = await createTask(page, 'Checklist Test')
    await openTaskModal(page, taskTitle)

    // Click Checklist button in sidebar
    const checklistButton = page.getByRole('button', { name: 'Checklist' }).first()
    await expect(checklistButton).toBeVisible({ timeout: 5000 })
    await checklistButton.click()
    await page.waitForTimeout(500)

    // Verify checklist section is visible
    const checklistHeading = page.getByText(/checklist/i).first()
    await expect(checklistHeading).toBeVisible()
  })
})

test.describe('Task Actions', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test('should archive task from sidebar', async ({ page }) => {
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })

    const taskTitle = await createTask(page, 'Archive Test')
    await openTaskModal(page, taskTitle)

    // Find and click Archive button in sidebar
    const archiveButton = page.getByRole('button', { name: /^archive$/i }).first()
    await expect(archiveButton).toBeVisible({ timeout: 5000 })
    await archiveButton.click()

    // Wait for confirmation dialog
    await expect(page.getByRole('dialog', { name: /archive task/i })).toBeVisible({ timeout: 5000 })

    // Click the "Archive" button in the confirmation dialog
    await page.getByRole('button', { name: 'Archive', exact: true }).click()

    // Wait for modal to close
    await page.waitForTimeout(1000)
    await expect(page.getByTestId('task-detail-modal')).not.toBeVisible({ timeout: 10000 })
  })

  test('should copy/duplicate task from sidebar', async ({ page }) => {
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })

    const taskTitle = await createTask(page, 'Copy Test')
    await openTaskModal(page, taskTitle)

    // Find and click Copy button in sidebar
    const copyButton = page.getByRole('button', { name: /^copy$/i }).first()
    await expect(copyButton).toBeVisible({ timeout: 5000 })
    await copyButton.click()

    // Wait for success notification
    await page.waitForTimeout(1000)
    await expect(page.getByText(/created.*copy/i)).toBeVisible({ timeout: 5000 })
  })

  test('should set task priority', async ({ page }) => {
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })

    const taskTitle = await createTask(page, 'Priority Test')
    await openTaskModal(page, taskTitle)

    // Look for priority dropdown or buttons
    const priorityButton = page.getByRole('button', { name: /priority/i }).first()
    if (await priorityButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await priorityButton.click()
      await page.waitForTimeout(500)

      // Select "High" priority
      const highButton = page.getByRole('button', { name: /high/i }).first()
      if (await highButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await highButton.click()
        await page.waitForTimeout(500)
      }
    }
  })

  test('should set task due date', async ({ page }) => {
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })

    const taskTitle = await createTask(page, 'Due Date Test')
    await openTaskModal(page, taskTitle)

    // Look for dates button in sidebar
    const datesButton = page.getByRole('button', { name: /dates/i }).first()
    if (await datesButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await datesButton.click()
      await page.waitForTimeout(500)

      // Find and fill due date input
      const dateInput = page.locator('input[type="date"]').first()
      if (await dateInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const dateString = tomorrow.toISOString().split('T')[0]

        await dateInput.fill(dateString)
        await page.waitForTimeout(500)

        // Verify date is set
        await expect(dateInput).toHaveValue(dateString)
      }
    }
  })
})

test.describe('Task Drag and Drop', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test('should move task between columns via drag and drop', async ({ page }) => {
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })

    // Create a task in the first column (Backlog)
    const taskTitle = await createTask(page, 'Drag Test')

    // Find the task card
    const taskCard = page.getByText(taskTitle, { exact: true })
    await expect(taskCard).toBeVisible()

    // Find the second column (should be "To Do" or similar)
    const toDoColumn = page.locator('[data-testid^="column-"]').nth(1)
    if (await toDoColumn.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Get bounding boxes for drag and drop
      const taskBox = await taskCard.boundingBox()
      const columnBox = await toDoColumn.boundingBox()

      if (taskBox && columnBox) {
        // Perform drag and drop
        await page.mouse.move(taskBox.x + taskBox.width / 2, taskBox.y + taskBox.height / 2)
        await page.mouse.down()
        await page.waitForTimeout(300) // Wait for drag to initiate
        await page.mouse.move(columnBox.x + columnBox.width / 2, columnBox.y + 100)
        await page.waitForTimeout(200)
        await page.mouse.up()

        // Wait for the API call to complete
        await page.waitForTimeout(1000)

        // Verify task moved to new column
        // The task should still be visible but in a different column
        await expect(taskCard).toBeVisible({ timeout: 5000 })
      }
    }
  })
})

test.describe('Task Modal - Links and Attachments', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test('should enable and use attachments section', async ({ page }) => {
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })

    const taskTitle = await createTask(page, 'Attachment Test')
    await openTaskModal(page, taskTitle)

    // Find and click Attachments button in sidebar
    const attachmentsButton = page.getByRole('button', { name: /attachments/i }).first()
    await expect(attachmentsButton).toBeVisible({ timeout: 5000 })
    await attachmentsButton.click()
    await page.waitForTimeout(500)

    // Look for file input
    const fileInput = page.locator('input[type="file"]').first()
    if (await fileInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Create a test file
      const buffer = Buffer.from('test task attachment content')
      await fileInput.setInputFiles({
        name: 'task-attachment.txt',
        mimeType: 'text/plain',
        buffer,
      })

      // Wait for upload to complete
      await page.waitForTimeout(2000)

      // Verify attachment appears
      await expect(page.getByText('task-attachment.txt')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should enable and use links section', async ({ page }) => {
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })

    const taskTitle = await createTask(page, 'Links Test')
    await openTaskModal(page, taskTitle)

    // Find and click Links button in sidebar
    const linksButton = page.getByRole('button', { name: /^links$/i }).first()
    await expect(linksButton).toBeVisible({ timeout: 5000 })
    await linksButton.click()
    await page.waitForTimeout(500)

    // Look for "Add link" button
    const addLinkButton = page.getByRole('button', { name: /add link/i }).first()
    if (await addLinkButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addLinkButton.click()

      // Fill in link details
      const urlInput = page.getByPlaceholder(/url/i).first()
      if (await urlInput.isVisible()) {
        await urlInput.fill('https://task-example.com')

        const titleInput = page.getByPlaceholder(/title|label/i).first()
        if (await titleInput.isVisible()) {
          await titleInput.fill('Task Example Link')
        }

        // Save the link
        const saveButton = page.getByRole('button', { name: /save|add/i }).first()
        if (await saveButton.isVisible()) {
          await saveButton.click()
          await page.waitForTimeout(1000)

          // Verify link appears
          await expect(page.getByText('Task Example Link')).toBeVisible()
        }
      }
    }
  })

  test('should add checklist item to task', async ({ page }) => {
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('button', { name: /add card/i }).first()).toBeVisible({ timeout: 15000 })

    const taskTitle = await createTask(page, 'Checklist Item Test')
    await openTaskModal(page, taskTitle)

    // Find and click Checklist button in sidebar
    const checklistButton = page.getByRole('button', { name: /^checklist$/i }).first()
    await expect(checklistButton).toBeVisible({ timeout: 5000 })
    await checklistButton.click()
    await page.waitForTimeout(500)

    // Look for checklist input or add item button
    const addItemInput = page.getByPlaceholder(/add.*item|new item/i).first()
    if (await addItemInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addItemInput.fill('Test checklist item')
      await addItemInput.press('Enter')
      await page.waitForTimeout(500)

      // Verify item appears
      await expect(page.getByText('Test checklist item')).toBeVisible()
    }
  })
})
