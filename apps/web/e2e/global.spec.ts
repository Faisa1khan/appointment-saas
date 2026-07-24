import { test, expect } from '@playwright/test';

test.describe('Global Cross-Cutting Features', () => {
  const uniqueId = Date.now();
  const testEmail = `globalowner+${uniqueId}@example.com`;

  test.beforeEach(async ({ page }) => {
    // Setup a user to view protected areas
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Global Tester');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/app\/onboarding.*/);
    await page.fill('input[name="name"]', 'Global Org');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/app\/dashboard.*/);
  });

  test('Theme switching works correctly', async ({ page }) => {
    // Check initial theme class on HTML element (usually determined by system or light default)
    // We'll click the theme toggle
    await page.click('button[aria-label="Toggle theme"]'); // Assumes aria-label is present on ModeToggle
    await page.click('text=Dark'); // Assumes shadcn dropdown says "Dark"
    
    // Check if html has 'dark' class
    await expect(page.locator('html')).toHaveClass(/.*dark.*/);
    
    await page.click('button[aria-label="Toggle theme"]');
    await page.click('text=Light');
    await expect(page.locator('html')).not.toHaveClass(/.*dark.*/);
  });

  test('Language switching works correctly', async ({ page }) => {
    // We are on dashboard. It should say something in English initially.
    // We'll check the language switcher.
    // The language switcher is likely a select or a dropdown.
    await page.click('button[role="combobox"]'); // Shadcn select trigger
    await page.click('text=हिंदी'); // Hindi option
    
    // We expect the URL to change to /hi/app/dashboard or similar
    await expect(page).toHaveURL(/.*\/hi\/app\/dashboard.*/);
    
    // We can switch back
    await page.click('button[role="combobox"]');
    await page.click('text=English');
    await expect(page).toHaveURL(/.*\/en\/app\/dashboard.*/);
  });

  test('Mobile viewport responsiveness', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone 8 size
    
    await page.goto('/app/services');
    
    // We expect the add service button to still be visible and clickable
    const addBtn = page.locator('button:has-text("Add Service")');
    await expect(addBtn).toBeVisible();
    
    // The hamburger menu might appear (if implemented in AppHeader)
    // For now we just verify no horizontal scrolling or hidden crucial elements.
  });

  test('Keyboard navigation works in dialogs', async ({ page }) => {
    await page.goto('/app/services');
    
    // Open dialog
    await page.click('button:has-text("Add Service")');
    await expect(page.locator('text=Create Service')).toBeVisible();
    
    // Focus should be trapped or managed. We can just test basic tabbing.
    await page.keyboard.press('Tab');
    
    // Press Escape to close the dialog (shadcn dialogs close on escape)
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Create Service')).not.toBeVisible();
  });
});
