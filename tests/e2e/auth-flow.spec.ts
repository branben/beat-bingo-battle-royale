
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const uniqueUser = `testuser_${Date.now()}@example.com`;
  const password = 'password123';
  const username = `testuser_${Date.now()}`;

  test('should allow a user to sign up and see the connected screen', async ({ page }) => {
    // Sign Up
    await page.goto('/signup');
    await expect(page.locator('h2:has-text("Create your account")')).toBeVisible();
    
    await page.fill('input[placeholder="Username"]', username);
    await page.fill('input[placeholder="Email address"]', uniqueUser);
    await page.fill('input[placeholder="Password"]', password);
    await page.click('button:has-text("Sign up")');

    // After sign up, user should be redirected to the main page and see the connected state
    await page.waitForURL('/');
    await expect(page.locator('h2:has-text("Connected!")')).toBeVisible();
    await expect(page.locator(`text=${username}`)).toBeVisible();

    // Log Out to clean up the session
    await page.click('button:has-text("Sign Out")');
    await expect(page.locator('button:has-text("Connect Discord")')).toBeVisible();
  });
});
