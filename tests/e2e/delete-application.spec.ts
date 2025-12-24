import { expect, test } from '@playwright/test'

const TEST_USER_PASSWORD = 'password123'

async function signInTestUser(page: any, email: string) {
  const response = await page.request.post('/api/test-support/auth', {
    data: {
      email,
      password: TEST_USER_PASSWORD,
    },
  })

  expect(response.ok()).toBeTruthy()
}

test('verifies delete application functionality', async ({ page }) => {
  // 1. Sign in
  const userEmail = `delete-test-${Date.now()}@example.com`
  await signInTestUser(page, userEmail)

  // 2. Go to dashboard and create profile
  await page.goto('/dashboard')
  await page.getByRole('button', { name: 'Create Profile' }).click()
  const profileName = `Delete Test ${Date.now()}`
  await page.getByRole('dialog').getByLabel('Profile Name').fill(profileName)
  await page.getByRole('dialog').getByRole('button', { name: 'Create Profile' }).click()
  await page.waitForURL(/profileId=/)

  const url = new URL(page.url())
  const profileId = url.searchParams.get('profileId')

  // 3. Create an application via API to delete later
  const appName = `Delete Me Corp ${Date.now()}`
  await page.request.post('/api/applications', {
    data: {
      profileId,
      companyName: appName,
      jobUrl: 'https://example.com/delete-me',
      description: 'To be deleted',
      workType: 'remote',
      industry: 'Software'
    }
  })

  await page.reload()

  // 4. Verify application is visible
  await expect(page.getByText(appName)).toBeVisible()

  // 5. Open context menu and click Delete
  // Find the row containing the app name, then find the menu button in it
  const row = page.getByRole('row').filter({ hasText: appName })
  await row.getByRole('button', { name: 'Open menu' }).click()

  // 6. Click Delete in dropdown
  await page.getByRole('menuitem', { name: 'Delete' }).click()

  // 7. Verify Confirmation Dialog appears
  await expect(page.getByRole('alertdialog')).toBeVisible()
  await expect(page.getByText('Are you sure?')).toBeVisible()

  // 8. Confirm Delete
  await page.getByRole('button', { name: 'Delete' }).click()

  // 9. Verify application is gone
  await expect(page.getByText(appName)).not.toBeVisible()
})
