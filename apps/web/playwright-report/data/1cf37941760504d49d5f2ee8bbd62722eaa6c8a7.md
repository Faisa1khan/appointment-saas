# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flow >> should register a new owner, onboard, and reach dashboard
- Location: e2e/auth.spec.ts:18:7

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
  - button "Open Next.js Dev Tools" [ref=e44] [cursor=pointer]:
    - img [ref=e45]
  - alert [ref=e48]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication Flow', () => {
  4  |   // Use a unique email for each test run to ensure clean state
  5  |   const uniqueId = Date.now();
  6  |   const testEmail = `owner+${uniqueId}@example.com`;
  7  |   const testPassword = 'Password123!';
  8  | 
  9  |   test('should redirect unauthenticated user to login', async ({ page }) => {
  10 |     // Attempt to access a protected route
  11 |     await page.goto('/app/dashboard');
  12 |     
  13 |     // Should be redirected to login page
  14 |     await expect(page).toHaveURL(/.*\/login.*/);
  15 |     await expect(page.locator('h1')).toContainText(/Sign in|Login/i);
  16 |   });
  17 | 
  18 |   test('should register a new owner, onboard, and reach dashboard', async ({ page }) => {
  19 |     // 1. Go to Registration
  20 |     await page.goto('/register');
  21 |     
  22 |     // 2. Fill registration form
> 23 |     await page.fill('input[name="name"]', 'Playwright Owner');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  24 |     await page.fill('input[name="email"]', testEmail);
  25 |     await page.fill('input[name="password"]', testPassword);
  26 |     
  27 |     // Submit registration
  28 |     await page.click('button[type="submit"]');
  29 | 
  30 |     // 3. Verify we reach the Onboarding screen
  31 |     await expect(page).toHaveURL(/.*\/app\/onboarding.*/);
  32 |     
  33 |     // 4. Fill onboarding form
  34 |     await page.fill('input[name="name"]', 'Playwright Org');
  35 |     // Slug usually auto-generates, just click submit
  36 |     await page.click('button[type="submit"]');
  37 |     
  38 |     // 5. Verify we reach the dashboard
  39 |     await expect(page).toHaveURL(/.*\/app\/dashboard.*/);
  40 |     await expect(page.locator('text=Playwright Org')).toBeVisible();
  41 |   });
  42 | 
  43 |   test('should login and logout successfully', async ({ page }) => {
  44 |     // Pre-requisite: we need an account. We'll use the UI to log in.
  45 |     // For simplicity, we assume an account `e2e@example.com` exists or we use the API to seed it.
  46 |     // But since tests run in parallel, using the UI to register is safer if we don't have a seed.
  47 |     // We will skip this in MVP if seed doesn't exist, but let's mock the login for now:
  48 |     await page.goto('/login');
  49 |     
  50 |     // If we had a seeded user, we would log in here. 
  51 |     // Since we don't guarantee one, we will just verify the login form is present and functional.
  52 |     const emailInput = page.locator('input[name="email"]');
  53 |     await expect(emailInput).toBeVisible();
  54 |     await page.fill('input[name="email"]', 'test@example.com');
  55 |     await page.fill('input[name="password"]', 'WrongPassword123!');
  56 |     await page.click('button[type="submit"]');
  57 |     
  58 |     // Verify error state (assumes sonner toast or inline error)
  59 |     await expect(page.locator('text=Invalid login credentials')).toBeVisible();
  60 |   });
  61 | });
  62 | 
```