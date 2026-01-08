import { test, expect } from '@playwright/test'

test.describe('Guided Capture Debug', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test('debug idea creation process', async ({ page }) => {
    // Listen for console messages
    const consoleMessages: string[] = []
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`)
    })

    // Listen for network requests
    const requests: string[] = []
    page.on('request', request => {
      if (request.url().includes('/ideas')) {
        requests.push(`${request.method()} ${request.url()}`)
      }
    })

    // Listen for responses
    const responses: { url: string; status: number; body?: any }[] = []
    page.on('response', async response => {
      if (response.url().includes('/ideas')) {
        let body
        try {
          body = await response.json()
        } catch (e) {
          body = await response.text()
        }
        responses.push({
          url: response.url(),
          status: response.status(),
          body
        })
      }
    })

    await page.goto('/dashboard/ideas/capture')
    await page.waitForTimeout(1000)

    // Answer all questions
    for (let i = 0; i < 4; i++) {
      await page.locator('textarea').fill(`Answer ${i + 1} with sufficient characters`)
      const button = i === 3
        ? page.getByRole('button', { name: /review/i })
        : page.getByRole('button', { name: /next question/i })
      await button.click()
      await page.waitForTimeout(300)
    }

    // Set title
    await page.getByLabel(/idea title/i).fill('Debug Test Idea')

    // Click Create Idea and wait a bit
    await page.getByRole('button', { name: /create idea/i }).click()
    await page.waitForTimeout(5000)

    // Log all collected data
    console.log('\n=== CONSOLE MESSAGES ===')
    console.log(consoleMessages.join('\n'))

    console.log('\n=== REQUESTS ===')
    console.log(requests.join('\n'))

    console.log('\n=== RESPONSES ===')
    console.log(JSON.stringify(responses, null, 2))

    console.log('\n=== FINAL URL ===')
    console.log(page.url())

    // Check for toast messages
    const errorToast = page.getByText(/failed to create/i)
    const successToast = page.getByText(/idea created/i)

    if (await errorToast.isVisible().catch(() => false)) {
      console.log('\n=== ERROR TOAST VISIBLE ===')
    }

    if (await successToast.isVisible().catch(() => false)) {
      console.log('\n=== SUCCESS TOAST VISIBLE ===')
    }
  })
})
