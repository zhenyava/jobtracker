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

  test('shows empty state when profile has no applications', async ({ page }) => {
    await signInTestUser(page, userEmail)

    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Create Profile' }).click()
    const profileName = `Empty State ${Date.now()}`
    await page.getByRole('dialog').getByLabel('Profile Name').fill(profileName)
    await page.getByRole('dialog').getByRole('button', { name: 'Create Profile' }).click()
    await page.waitForURL(/profileId=/)

    await expect(page.getByText('No applications for this profile yet')).toBeVisible()
    await expect(page.getByText('Total Applications')).toBeVisible()
    await expect(page.getByText('0', { exact: true })).toBeVisible()
  })

  test('displays applications list', async ({ page }) => {
    await signInTestUser(page, userEmail)

    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Create Profile' }).click()
    const profileName = `List Test ${Date.now()}`
    await page.getByRole('dialog').getByLabel('Profile Name').fill(profileName)
    await page.getByRole('dialog').getByRole('button', { name: 'Create Profile' }).click()
    await page.waitForURL(/profileId=/)

    const url = new URL(page.url())
    const profileId = url.searchParams.get('profileId')
    
    // Seed Data
    await page.request.post('/api/applications', {
      data: {
        profileId,
        companyName: 'Display Corp',
        jobUrl: 'https://example.com/job',
        description: 'Desc',
        workType: 'remote',
        industry: 'FinTech' // Standard option
      }
    })

    await page.reload()

    await expect(page.getByRole('cell', { name: 'Display Corp' })).toBeVisible()
    
    // Verify Industry Dropdown exists
    await expect(page.getByRole('combobox').filter({ hasText: 'FinTech' })).toBeVisible()
    
    await expect(page.getByRole('cell', { name: 'Remote' })).toBeVisible()
    
    // Verify Status Dropdown exists
    await expect(page.getByRole('combobox').filter({ hasText: 'HR Screening' })).toBeVisible()
  })

  test('verifies delete application functionality', async ({ page }) => {
    // 1. Sign in
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

  test('renames a profile', async ({ page }) => {
    await signInTestUser(page, userEmail)

    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Create Profile' }).click()

    const originalName = `To Rename ${Date.now()}`
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Profile Name').fill(originalName)
    await dialog.getByRole('button', { name: 'Create Profile' }).click()

    await page.waitForURL(/profileId=/)
    await expect(page.getByRole('heading', { level: 1, name: originalName })).toBeVisible()

    // Find the sidebar item container that matches the profile name
    // The sidebar structure: <div class="group ..."><Link>Name</Link> ... <Dropdown>...</div>
    const sidebarItem = page.locator('.group').filter({ hasText: originalName })

    // Hover to reveal the menu button (since it has opacity-0 group-hover:opacity-100)
    await sidebarItem.hover()

    // Click the menu button
    await sidebarItem.getByRole('button', { name: 'Menu' }).click()

    // Click Rename option
    await page.getByRole('menuitem', { name: 'Rename' }).click()

    // Verify Rename Dialog appears
    const renameDialog = page.getByRole('dialog')
    await expect(renameDialog).toBeVisible()
    await expect(renameDialog.getByRole('heading', { name: 'Rename Job Profile' })).toBeVisible()

    // Enter new name
    const newName = `Renamed ${Date.now()}`
    await renameDialog.getByLabel('Profile Name').fill(newName)
    await renameDialog.getByRole('button', { name: 'Save Changes' }).click()

    // Verify new name is visible in sidebar and header
    await expect(page.getByRole('heading', { level: 1, name: newName })).toBeVisible()
    await expect(page.getByRole('link', { name: newName })).toBeVisible()

    // Verify old name is not visible (unless it's part of the new name, which it isn't here)
    // Note: getByRole('link', { name: originalName }) might still match if newName contains originalName
    // so we chose distinct names.
    await expect(page.getByRole('link', { name: originalName })).not.toBeVisible()
  })

  test('deletes a profile and redirects to another profile', async ({ page }) => {
    await signInTestUser(page, userEmail)

    await page.goto('/dashboard')

    // Create Profile A
    await page.getByRole('button', { name: 'Create Profile' }).click()
    const profileA = `Profile A ${Date.now()}`
    await page.getByRole('dialog').getByLabel('Profile Name').fill(profileA)
    await page.getByRole('dialog').getByRole('button', { name: 'Create Profile' }).click()
    await page.waitForURL(/profileId=/)

    // Create Profile B
    await page.getByRole('button', { name: 'Create Profile' }).click()
    const profileB = `Profile B ${Date.now()}`
    await page.getByRole('dialog').getByLabel('Profile Name').fill(profileB)
    await page.getByRole('dialog').getByRole('button', { name: 'Create Profile' }).click()
    await page.waitForURL(/profileId=/)

    // Select Profile A
    await page.getByRole('link', { name: profileA }).click()
    await expect(page.getByRole('heading', { level: 1, name: profileA })).toBeVisible()

    // Delete Profile A
    const sidebarItem = page.locator('.group').filter({ hasText: profileA })
    await sidebarItem.hover()
    await sidebarItem.getByRole('button', { name: 'Menu' }).click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()

    // Confirm Delete
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await page.getByRole('button', { name: 'Delete' }).click()

    // Verify Redirect to Profile B (or the remaining profile)
    await expect(page.getByRole('heading', { level: 1, name: profileB })).toBeVisible()
    await expect(page.getByRole('link', { name: profileA })).not.toBeVisible()
  })

  test('deletes the last profile and shows empty state', async ({ page }) => {
    // Note: This test assumes the user starts fresh or we clean up.
    // Since we reuse the user across tests in this file, we might have leftover profiles.
    // Ideally we should delete all profiles first or use a new user.
    // Given the test structure, 'userEmail' is created per worker, so it's fresh per worker but reused across tests in the file?
    // "test.beforeAll(({ }, testInfo) => { userEmail = buildTestEmail(testInfo) })"
    // Yes, reused across tests. So we might have profiles from previous tests.
    // We should delete all profiles loop until empty state.

    await signInTestUser(page, userEmail)
    await page.goto('/dashboard')

    // Helper to delete current profile
    const deleteCurrentProfile = async () => {
      // We assume we are on a profile page
      // Get the profile name from header
      const header = page.getByRole('heading', { level: 1 })
      const name = await header.innerText()
      if (name === 'Dashboard' || name === 'You have no profiles yet') return false

      const sidebarItem = page.locator('.group').filter({ hasText: name }).first()
      // If we can't find it in sidebar, maybe something is wrong or it's not loaded
      if (await sidebarItem.count() === 0) return false

      await sidebarItem.hover()
      await sidebarItem.getByRole('button', { name: 'Menu' }).click()
      await page.getByRole('menuitem', { name: 'Delete' }).click()
      await page.getByRole('button', { name: 'Delete' }).click()
      return true
    }

    // Keep deleting until we see empty state
    // Limit iterations to avoid infinite loop
    for (let i = 0; i < 20; i++) {
        try {
            // Check if we are in empty state
            if (await page.getByText('You have no profiles yet').isVisible()) {
                break
            }
            // If not, try to delete current
            const deleted = await deleteCurrentProfile()
            if (!deleted) {
                // Try creating one if we are somehow stuck but not in empty state?
                // Or maybe we are redirected to another profile.
                // Just continue loop, page should update.
                await page.waitForTimeout(500)
            }
            await page.waitForTimeout(500) // Wait for transition
        } catch (e) {
            console.log('Error in cleanup loop', e)
        }
    }

    // Now create ONE profile to test the "delete last profile" scenario specifically
    await page.getByRole('button', { name: 'Create Profile' }).click()
    const lastProfile = `Last One ${Date.now()}`
    await page.getByRole('dialog').getByLabel('Profile Name').fill(lastProfile)
    await page.getByRole('dialog').getByRole('button', { name: 'Create Profile' }).click()
    await page.waitForURL(/profileId=/)

    await expect(page.getByRole('heading', { level: 1, name: lastProfile })).toBeVisible()

    // Delete it
    const sidebarItem = page.locator('.group').filter({ hasText: lastProfile })
    await sidebarItem.hover()
    await sidebarItem.getByRole('button', { name: 'Menu' }).click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Delete' }).click()

    // Verify empty state
    await expect(page.getByText('You have no profiles yet')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Profile' })).toBeVisible()
  })
})
