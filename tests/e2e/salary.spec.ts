import { expect, test } from '@playwright/test'
import { buildTestEmail, signInTestUser } from './test-utils'

test.describe('Salary Management', () => {
  let userEmail: string

  test.beforeAll(({ }, testInfo) => {
    userEmail = buildTestEmail(testInfo)
  })

  test.beforeEach(async ({ page }) => {
    await signInTestUser(page, userEmail)
    await page.goto('/dashboard')

    // Create a new profile for each test to ensure clean state
    await page.getByRole('button', { name: 'Create Profile' }).click()
    const profileName = `Salary Test ${Date.now()}`
    await page.getByRole('dialog').getByLabel('Profile Name').fill(profileName)
    await page.getByRole('dialog').getByRole('button', { name: 'Create Profile' }).click()
    await page.waitForURL(/profileId=/)
  })

  test('should display Empty when salary is not set', async ({ page }) => {
    // Create application
    const url = new URL(page.url())
    const profileId = url.searchParams.get('profileId')

    await page.request.post('/api/applications', {
      data: {
        profileId,
        companyName: 'Salary Corp',
        jobUrl: 'https://example.com/job',
        description: 'Desc',
        workType: 'remote',
        industry: 'FinTech'
      }
    })

    await page.reload()

    // Check salary cell
    const cell = page.getByRole('cell', { name: 'Empty' })
    await expect(cell).toBeVisible()
  })

  test('should allow editing salary (single value)', async ({ page }) => {
    // Create application
    const url = new URL(page.url())
    const profileId = url.searchParams.get('profileId')

    await page.request.post('/api/applications', {
      data: {
        profileId,
        companyName: 'Single Salary Corp',
        jobUrl: 'https://example.com/job',
        description: 'Desc',
        workType: 'remote'
      }
    })

    await page.reload()

    // Open edit popover
    await page.getByRole('cell', { name: 'Empty' }).click()

    // Fill single value (Default mode is single, label is 'Amount')
    await page.getByLabel('Amount').fill('65000')
    await page.getByRole('button', { name: 'Save changes' }).click()

    // Verify display
    await expect(page.getByRole('cell', { name: '65000 € gross year' })).toBeVisible()
  })

  test('should allow editing salary (range)', async ({ page }) => {
    // Create application
    const url = new URL(page.url())
    const profileId = url.searchParams.get('profileId')

    await page.request.post('/api/applications', {
      data: {
        profileId,
        companyName: 'Range Salary Corp',
        jobUrl: 'https://example.com/job',
        description: 'Desc',
        workType: 'remote'
      }
    })

    await page.reload()

    // Open edit popover
    await page.getByRole('cell', { name: 'Empty' }).click()

    // Enable Range Mode
    await page.getByLabel('Range').click()

    // Fill range
    await page.getByLabel('Min Amount').fill('70000')
    await page.getByLabel('Max Amount').fill('90000')
    await page.getByRole('button', { name: 'Save changes' }).click()

    // Verify display
    await expect(page.getByRole('cell', { name: '70000 - 90000 € gross year' })).toBeVisible()
  })

  test('should allow changing currency, type and period', async ({ page }) => {
    // Create application
    const url = new URL(page.url())
    const profileId = url.searchParams.get('profileId')

    await page.request.post('/api/applications', {
      data: {
        profileId,
        companyName: 'Complex Salary Corp',
        jobUrl: 'https://example.com/job',
        description: 'Desc',
        workType: 'remote'
      }
    })

    await page.reload()

    // Open edit popover
    await page.getByRole('cell', { name: 'Empty' }).click()

    // Fill details
    await page.getByLabel('Amount').fill('5000')

    // Change Currency to USD
    await page.getByLabel('Currency').click()
    await page.getByRole('option', { name: 'USD ($)' }).click()

    // Change Type to Net
    await page.getByLabel('Type').click()
    await page.getByRole('option', { name: 'Net' }).click()

    // Change Period to Month
    await page.getByLabel('Period').click()
    await page.getByRole('option', { name: 'Month' }).click()

    await page.getByRole('button', { name: 'Save changes' }).click()

    // Verify display: 5000 $ net month
    await expect(page.getByRole('cell', { name: '5000 $ net month' })).toBeVisible()
  })

  test('should clear max amount when switching from range to single', async ({ page }) => {
    // Create application
    const url = new URL(page.url())
    const profileId = url.searchParams.get('profileId')

    await page.request.post('/api/applications', {
      data: {
        profileId,
        companyName: 'Range To Single',
        jobUrl: 'https://example.com/job',
        description: 'Desc',
        workType: 'remote'
      }
    })

    await page.reload()

    // 1. Set Range
    await page.getByRole('cell', { name: 'Empty' }).click()
    // Enable range
    await page.getByLabel('Range').click()
    await page.getByLabel('Min Amount').fill('50000')
    await page.getByLabel('Max Amount').fill('60000')
    await page.getByRole('button', { name: 'Save changes' }).click()

    // Verify Range
    await expect(page.getByRole('cell', { name: '50000 - 60000 € gross year' })).toBeVisible()

    // 2. Switch to Single
    await page.getByRole('cell', { name: '50000 - 60000 € gross year' }).click()
    // Disable range (switch off)
    await page.getByLabel('Range').click()
    await page.getByRole('button', { name: 'Save changes' }).click()

    // Verify Single (Max should be gone)
    await expect(page.getByRole('cell', { name: '50000 € gross year' })).toBeVisible()
  })
})
