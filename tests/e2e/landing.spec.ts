import { test, expect } from '@playwright/test';

test('landing page has log in button and redirects to login', async ({ page }) => {
  // 1. Visit the root URL
  await page.goto('/');

  // 2. Check for the "Log In" link
  const loginButton = page.getByRole('link', { name: 'Log In' });
  await expect(loginButton).toBeVisible();

  // 3. Click the "Log In" button
  await loginButton.click();

  // 4. Verify redirection to /login
  await expect(page).toHaveURL(/\/login/);
  
  // 5. Verify login page content (basic check)
  await expect(page.getByText('Welcome back')).toBeVisible();
});
