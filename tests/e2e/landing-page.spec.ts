import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load the landing page and take a screenshot', async ({ page }) => {
    await page.goto('/');

    // Wait for the main content to be visible
    await expect(page.locator('h1')).toContainText('Track Your Job Applications Efficiently');

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'landing-page.png', fullPage: true });
  });

  test('should redirect to login page when clicking "Log In" button', async ({ page }) => {
    await page.goto('/');

    // Click the Log In button in the header
    // Using text selector which is robust for this simple page
    await page.getByRole('link', { name: 'Log In' }).click();

    // Verify redirection to login page
    await expect(page).toHaveURL(/\/login/);

    // Optional: Verify login page content
    await expect(page.getByText('Sign in to your Job Tracker account')).toBeVisible();
  });

  test('should redirect to login page when clicking "Get Started" button', async ({ page }) => {
    await page.goto('/');

    // Click the Get Started button in the hero section
    await page.getByRole('link', { name: 'Get Started' }).first().click();

    // Verify redirection to login page
    await expect(page).toHaveURL(/\/login/);
  });
});
