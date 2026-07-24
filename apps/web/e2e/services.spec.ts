import { test, expect } from '@playwright/test';

// In a real scenario we'd use a seeded database. For E2E we'll register a fresh user.
test.describe('Services Flow', () => {
  const uniqueId = Date.now();
  const testEmail = `serviceowner+${uniqueId}@example.com`;

  test.beforeAll(async ({ browser }) => {
    // We could do global setup here, but since playwright tests run in isolated contexts,
    // we'll just let each test run independently or use a shared state.
    // For MVP, we'll do the setup in the first test and reuse the state if needed,
    // or just run a single comprehensive journey test for Services.
  });

  test('Complete Services Journey', async ({ page }) => {
    // 1. Register & Onboard
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Service Tester');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/app\/onboarding.*/);
    await page.fill('input[name="name"]', 'Service Org');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/app\/dashboard.*/);

    // 2. Navigate to Services
    await page.click('text=Services');
    await expect(page).toHaveURL(/.*\/app\/services.*/);
    
    // Verify Empty State
    await expect(page.locator('text=No services found')).toBeVisible();

    // 3. Create a new service
    await page.click('button:has-text("Add Service")');
    await expect(page.locator('text=Create Service')).toBeVisible();
    
    // Test validation boundary
    await page.fill('input[name="name"]', ''); // Empty name
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=String must contain at least 2 character(s)')).toBeVisible();

    // Fill valid data
    await page.fill('input[name="name"]', 'Haircut');
    await page.fill('textarea[name="description"]', 'A standard haircut');
    await page.fill('input[name="price"]', '25.00');
    // Note: duration is pre-filled to 30
    await page.click('button:has-text("Save")');

    // Verify it appears in the list
    await expect(page.locator('text=Service created successfully')).toBeVisible();
    await expect(page.locator('text=Haircut')).toBeVisible();
    await expect(page.locator('text=30 min')).toBeVisible();

    // 4. Edit the service
    await page.click('button:has-text("Edit")');
    await page.fill('input[name="price"]', '30.00');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Service updated successfully')).toBeVisible();

    // 5. Archive the service
    // Accept the confirmation dialog automatically if there is one (we use optimistic UI without confirm in MVP, but let's check)
    await page.click('button:has-text("Archive")');
    
    // Wait for the optimistic update and toast
    await expect(page.locator('text=Service archived')).toBeVisible();
    
    // Should no longer be in the active list
    await expect(page.locator('text=Haircut')).not.toBeVisible();

    // 6. Switch to Archived tab and Restore
    await page.click('text=Archived');
    await expect(page.locator('text=Haircut')).toBeVisible();
    
    await page.click('button:has-text("Restore")');
    await expect(page.locator('text=Service restored')).toBeVisible();
    await expect(page.locator('text=Haircut')).not.toBeVisible(); // Gone from archived

    // Switch back to Active
    await page.click('button[role="tab"]:has-text("Active")');
    await expect(page.locator('text=Haircut')).toBeVisible();

    // 7. Create a second service and test reordering
    await page.click('button:has-text("Add Service")');
    await page.fill('input[name="name"]', 'Beard Trim');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Beard Trim')).toBeVisible();

    // Reorder down
    const reorderBtns = page.locator('button:has-text("Move Down")');
    if (await reorderBtns.count() > 0) {
      await reorderBtns.first().click();
      await expect(page.locator('text=Services reordered successfully')).toBeVisible();
    }
  });
});
