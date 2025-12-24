import { expect, test } from '@playwright/test'

test.describe('Landing Page', () => {
  test('shows Log In button', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('link', { name: /log in/i }),
    ).toBeVisible()
  })
})
