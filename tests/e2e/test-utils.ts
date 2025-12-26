import { expect, type Page, type TestInfo } from '@playwright/test'

export const DEFAULT_TEST_USER_EMAIL = 'test@example.com'
export const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'password123'

export function buildTestEmail(testInfo: TestInfo) {
  const projectPart =
    testInfo.project.name.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'proj'
  const workerPart = testInfo.workerIndex ?? 0
  const base = process.env.TEST_USER_EMAIL || DEFAULT_TEST_USER_EMAIL
  const [local, domain] = base.split('@')
  return `${local}+${projectPart}-w${workerPart}@${domain || 'example.com'}`
}

export async function signInTestUser(page: Page, email: string) {
  const response = await page.request.post('/api/test-support/auth', {
    data: {
      email,
      password: TEST_USER_PASSWORD,
    },
  })

  expect(response.ok()).toBeTruthy()
}
