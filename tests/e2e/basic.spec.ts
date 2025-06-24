import { test, expect } from '@playwright/test';

const SIGN_IN_EMAIL = process.env.E2E_EMAIL ?? 'test@example.com';
const SIGN_IN_PASSWORD = process.env.E2E_PASSWORD ?? 'password';

test('sign-in, add plant, rotate device, image loads', async ({ page }) => {
  await page.goto('/');

  // Sign in
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.getByLabel('Email').fill(SIGN_IN_EMAIL);
  await page.getByLabel('Password').fill(SIGN_IN_PASSWORD);
  await page.getByRole('button', { name: /continue/i }).click();

  // Add plant
  await page.waitForURL('**/list');
  await page.getByRole('button', { name: /add/i }).click();
  await page.getByLabel(/plant name/i).fill('E2E Plant');
  await page.getByRole('button', { name: /save/i }).click();
  await expect(page.getByText('E2E Plant')).toBeVisible();

  // Rotate device
  await page.setViewportSize({ width: 667, height: 375 });
  await expect(page.getByText('E2E Plant')).toBeVisible();

  // Check image load
  const img = page.locator('img[alt="Plant avatar - happy"]');
  await expect(img).toHaveAttribute('src', /supabase/);
}); 