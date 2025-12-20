import { expect, test, type Page, type TestInfo } from '@playwright/test'

const DEFAULT_TEST_USER_EMAIL = 'test@example.com'
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'password123'

function buildTestEmail(testInfo: TestInfo) {
  const projectPart =
    testInfo.project.name.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'proj'
  const workerPart = testInfo.workerIndex ?? 0
  const base = process.env.TEST_USER_EMAIL || DEFAULT_TEST_USER_EMAIL
  const [local, domain] = base.split('@')
  return `${local}+${projectPart}-w${workerPart}@${domain || 'example.com'}`
}

async function signInTestUser(page: Page, email: string) {
  const response = await page.request.post('/api/test-support/auth', {
    data: {
      email,
      password: TEST_USER_PASSWORD,
    },
  })

  expect(response.ok()).toBeTruthy()
}

test.describe('Dashboard', () => {
  let userEmail: string

  test.beforeAll(({ }, testInfo) => {
    userEmail = buildTestEmail(testInfo)
  })

  test('redirects guests to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByText('Welcome back')).toBeVisible()
    await expect(
      page.getByRole('button', { name: /sign in with google/i }),
    ).toBeVisible()
  })

  test('shows zero state for new user', async ({ page }) => {
    await signInTestUser(page, userEmail)

    await page.goto('/dashboard')

    await expect(page.getByText('You have no profiles yet')).toBeVisible()
  })

  test('creates a profile and displays it in sidebar and header', async ({
    page,
  }) => {
    await signInTestUser(page, userEmail)

    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Create Profile' }).click()

    const profileName = `Frontend ${Date.now()}`
    const dialog = page.getByRole('dialog')

    await dialog.getByLabel('Profile Name').fill(profileName)
    await dialog.getByRole('button', { name: 'Create Profile' }).click()

    await page.waitForURL(/profileId=/)

    await expect(
      page.getByRole('heading', { level: 1, name: profileName }),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: profileName })).toBeVisible()
  })

  test('shows Sign Out button for authenticated user', async ({ page }) => {
    await signInTestUser(page, userEmail)

    await page.goto('/dashboard')

    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible()
  })

  test('sign out button logs user out', async ({ page }) => {
    await signInTestUser(page, userEmail)

    await page.goto('/dashboard')
    await page.getByRole('button', { name: /sign out/i }).click()

    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByText('Welcome back')).toBeVisible()
  })
})
