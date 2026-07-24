# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: services.spec.ts >> Services Flow >> Complete Services Journey
- Location: e2e/services.spec.ts:15:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="name"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - button "Switch language" [ref=e4] [cursor=pointer]:
        - img
        - generic [ref=e5]: Switch language
      - button "Toggle theme" [ref=e6]:
        - img
        - generic [ref=e7]: Toggle theme
    - link "A Arrivo" [ref=e9] [cursor=pointer]:
      - /url: /
      - generic [ref=e10]: A
      - text: Arrivo
    - generic [ref=e12]:
      - generic [ref=e13]:
        - heading "Create an account" [level=1] [ref=e14]
        - paragraph [ref=e15]: Enter your details below to create your owner account and organization
      - generic [ref=e16]:
        - generic [ref=e17]:
          - generic [ref=e18]:
            - generic [ref=e19]: First Name
            - textbox "First Name" [ref=e20]:
              - /placeholder: John
          - generic [ref=e21]:
            - generic [ref=e22]: Last Name
            - textbox "Last Name" [ref=e23]:
              - /placeholder: Doe
        - generic [ref=e24]:
          - generic [ref=e25]: Email
          - textbox "Email" [ref=e26]:
            - /placeholder: m@example.com
        - generic [ref=e27]:
          - generic [ref=e28]: Password
          - generic [ref=e29]:
            - textbox "Password" [ref=e30]:
              - /placeholder: "********"
            - button "Show password" [ref=e31]:
              - img [ref=e32]
              - generic [ref=e35]: Show password
        - button "Create account" [ref=e36]
        - generic [ref=e37]:
          - text: Already have an account?
          - link "Sign In" [ref=e38] [cursor=pointer]:
            - /url: /login
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // In a real scenario we'd use a seeded database. For E2E we'll register a fresh user.
  4  | test.describe('Services Flow', () => {
  5  |   const uniqueId = Date.now();
  6  |   const testEmail = `serviceowner+${uniqueId}@example.com`;
  7  | 
  8  |   test.beforeAll(async ({ browser }) => {
  9  |     // We could do global setup here, but since playwright tests run in isolated contexts,
  10 |     // we'll just let each test run independently or use a shared state.
  11 |     // For MVP, we'll do the setup in the first test and reuse the state if needed,
  12 |     // or just run a single comprehensive journey test for Services.
  13 |   });
  14 | 
  15 |   test('Complete Services Journey', async ({ page }) => {
  16 |     // 1. Register & Onboard
  17 |     await page.goto('/register');
> 18 |     await page.fill('input[name="name"]', 'Service Tester');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  19 |     await page.fill('input[name="email"]', testEmail);
  20 |     await page.fill('input[name="password"]', 'Password123!');
  21 |     await page.click('button[type="submit"]');
  22 | 
  23 |     await expect(page).toHaveURL(/.*\/app\/onboarding.*/);
  24 |     await page.fill('input[name="name"]', 'Service Org');
  25 |     await page.click('button[type="submit"]');
  26 |     await expect(page).toHaveURL(/.*\/app\/dashboard.*/);
  27 | 
  28 |     // 2. Navigate to Services
  29 |     await page.click('text=Services');
  30 |     await expect(page).toHaveURL(/.*\/app\/services.*/);
  31 |     
  32 |     // Verify Empty State
  33 |     await expect(page.locator('text=No services found')).toBeVisible();
  34 | 
  35 |     // 3. Create a new service
  36 |     await page.click('button:has-text("Add Service")');
  37 |     await expect(page.locator('text=Create Service')).toBeVisible();
  38 |     
  39 |     // Test validation boundary
  40 |     await page.fill('input[name="name"]', ''); // Empty name
  41 |     await page.click('button:has-text("Save")');
  42 |     await expect(page.locator('text=String must contain at least 2 character(s)')).toBeVisible();
  43 | 
  44 |     // Fill valid data
  45 |     await page.fill('input[name="name"]', 'Haircut');
  46 |     await page.fill('textarea[name="description"]', 'A standard haircut');
  47 |     await page.fill('input[name="price"]', '25.00');
  48 |     // Note: duration is pre-filled to 30
  49 |     await page.click('button:has-text("Save")');
  50 | 
  51 |     // Verify it appears in the list
  52 |     await expect(page.locator('text=Service created successfully')).toBeVisible();
  53 |     await expect(page.locator('text=Haircut')).toBeVisible();
  54 |     await expect(page.locator('text=30 min')).toBeVisible();
  55 | 
  56 |     // 4. Edit the service
  57 |     await page.click('button:has-text("Edit")');
  58 |     await page.fill('input[name="price"]', '30.00');
  59 |     await page.click('button:has-text("Save")');
  60 |     await expect(page.locator('text=Service updated successfully')).toBeVisible();
  61 | 
  62 |     // 5. Archive the service
  63 |     // Accept the confirmation dialog automatically if there is one (we use optimistic UI without confirm in MVP, but let's check)
  64 |     await page.click('button:has-text("Archive")');
  65 |     
  66 |     // Wait for the optimistic update and toast
  67 |     await expect(page.locator('text=Service archived')).toBeVisible();
  68 |     
  69 |     // Should no longer be in the active list
  70 |     await expect(page.locator('text=Haircut')).not.toBeVisible();
  71 | 
  72 |     // 6. Switch to Archived tab and Restore
  73 |     await page.click('text=Archived');
  74 |     await expect(page.locator('text=Haircut')).toBeVisible();
  75 |     
  76 |     await page.click('button:has-text("Restore")');
  77 |     await expect(page.locator('text=Service restored')).toBeVisible();
  78 |     await expect(page.locator('text=Haircut')).not.toBeVisible(); // Gone from archived
  79 | 
  80 |     // Switch back to Active
  81 |     await page.click('button[role="tab"]:has-text("Active")');
  82 |     await expect(page.locator('text=Haircut')).toBeVisible();
  83 | 
  84 |     // 7. Create a second service and test reordering
  85 |     await page.click('button:has-text("Add Service")');
  86 |     await page.fill('input[name="name"]', 'Beard Trim');
  87 |     await page.click('button:has-text("Save")');
  88 |     await expect(page.locator('text=Beard Trim')).toBeVisible();
  89 | 
  90 |     // Reorder down
  91 |     const reorderBtns = page.locator('button:has-text("Move Down")');
  92 |     if (await reorderBtns.count() > 0) {
  93 |       await reorderBtns.first().click();
  94 |       await expect(page.locator('text=Services reordered successfully')).toBeVisible();
  95 |     }
  96 |   });
  97 | });
  98 | 
```