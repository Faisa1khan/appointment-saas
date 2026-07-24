# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: global.spec.ts >> Global Cross-Cutting Features >> Mobile viewport responsiveness
- Location: e2e/global.spec.ts:51:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="name"]')
    - waiting for" http://localhost:3001/register" navigation to finish...
    - navigated to "http://localhost:3001/register"

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
  3  | test.describe('Global Cross-Cutting Features', () => {
  4  |   const uniqueId = Date.now();
  5  |   const testEmail = `globalowner+${uniqueId}@example.com`;
  6  | 
  7  |   test.beforeEach(async ({ page }) => {
  8  |     // Setup a user to view protected areas
  9  |     await page.goto('/register');
> 10 |     await page.fill('input[name="name"]', 'Global Tester');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  11 |     await page.fill('input[name="email"]', testEmail);
  12 |     await page.fill('input[name="password"]', 'Password123!');
  13 |     await page.click('button[type="submit"]');
  14 | 
  15 |     await expect(page).toHaveURL(/.*\/app\/onboarding.*/);
  16 |     await page.fill('input[name="name"]', 'Global Org');
  17 |     await page.click('button[type="submit"]');
  18 |     await expect(page).toHaveURL(/.*\/app\/dashboard.*/);
  19 |   });
  20 | 
  21 |   test('Theme switching works correctly', async ({ page }) => {
  22 |     // Check initial theme class on HTML element (usually determined by system or light default)
  23 |     // We'll click the theme toggle
  24 |     await page.click('button[aria-label="Toggle theme"]'); // Assumes aria-label is present on ModeToggle
  25 |     await page.click('text=Dark'); // Assumes shadcn dropdown says "Dark"
  26 |     
  27 |     // Check if html has 'dark' class
  28 |     await expect(page.locator('html')).toHaveClass(/.*dark.*/);
  29 |     
  30 |     await page.click('button[aria-label="Toggle theme"]');
  31 |     await page.click('text=Light');
  32 |     await expect(page.locator('html')).not.toHaveClass(/.*dark.*/);
  33 |   });
  34 | 
  35 |   test('Language switching works correctly', async ({ page }) => {
  36 |     // We are on dashboard. It should say something in English initially.
  37 |     // We'll check the language switcher.
  38 |     // The language switcher is likely a select or a dropdown.
  39 |     await page.click('button[role="combobox"]'); // Shadcn select trigger
  40 |     await page.click('text=हिंदी'); // Hindi option
  41 |     
  42 |     // We expect the URL to change to /hi/app/dashboard or similar
  43 |     await expect(page).toHaveURL(/.*\/hi\/app\/dashboard.*/);
  44 |     
  45 |     // We can switch back
  46 |     await page.click('button[role="combobox"]');
  47 |     await page.click('text=English');
  48 |     await expect(page).toHaveURL(/.*\/en\/app\/dashboard.*/);
  49 |   });
  50 | 
  51 |   test('Mobile viewport responsiveness', async ({ page }) => {
  52 |     // Set viewport to mobile size
  53 |     await page.setViewportSize({ width: 375, height: 667 }); // iPhone 8 size
  54 |     
  55 |     await page.goto('/app/services');
  56 |     
  57 |     // We expect the add service button to still be visible and clickable
  58 |     const addBtn = page.locator('button:has-text("Add Service")');
  59 |     await expect(addBtn).toBeVisible();
  60 |     
  61 |     // The hamburger menu might appear (if implemented in AppHeader)
  62 |     // For now we just verify no horizontal scrolling or hidden crucial elements.
  63 |   });
  64 | 
  65 |   test('Keyboard navigation works in dialogs', async ({ page }) => {
  66 |     await page.goto('/app/services');
  67 |     
  68 |     // Open dialog
  69 |     await page.click('button:has-text("Add Service")');
  70 |     await expect(page.locator('text=Create Service')).toBeVisible();
  71 |     
  72 |     // Focus should be trapped or managed. We can just test basic tabbing.
  73 |     await page.keyboard.press('Tab');
  74 |     
  75 |     // Press Escape to close the dialog (shadcn dialogs close on escape)
  76 |     await page.keyboard.press('Escape');
  77 |     await expect(page.locator('text=Create Service')).not.toBeVisible();
  78 |   });
  79 | });
  80 | 
```