import { expect, test } from '@playwright/test';

const onePixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
);

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('401 (Unauthorized)')) errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.__errors = errors;
});

test.afterEach(async ({ page }) => {
  expect(page.__errors, `browser errors: ${page.__errors.join('\n')}`).toEqual([]);
});

test('Apply page renders its hero image and keeps a selected pet photo preview', async ({ page }, testInfo) => {
  await page.goto('/#/apply');
  await expect(page.getByRole('heading', { name: /Service Animal Registration Application/i })).toBeVisible();

  const heroImage = page.getByAltText('Service Dog');
  if (testInfo.project.name === 'desktop-chromium') await expect(heroImage).toBeVisible();
  await expect.poll(() => heroImage.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);

  const petPhotoInput = page.locator('input[type="file"][accept="image/jpeg,image/png,image/webp"]');
  await petPhotoInput.setInputFiles({ name: 'pet.png', mimeType: 'image/png', buffer: onePixelPng });
  const preview = page.getByAltText('Preview');
  await expect(preview).toBeVisible();
  await expect.poll(() => preview.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('apply.png'), fullPage: false });
});

test('successful admin login is not redirected back to the login page', async ({ page }) => {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ success: false }) });
  });
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, user: { id: 1, name: 'Admin', role: 'admin' } })
    });
  });

  await page.goto('/#/login');
  await page.getByRole('button', { name: 'Admin Login' }).click();
  await page.getByPlaceholder('e.g. admin@adi.org').fill('admin@example.com');
  await page.getByPlaceholder('••••••••').fill('valid-password');
  await page.getByRole('button', { name: 'Admin Portal Login' }).click();

  await expect(page).toHaveURL(/#\/admin\/dashboard$/);
  await expect(page.getByText('Dashboard Overview', { exact: true })).toBeVisible();
});

for (const route of ['/#/verify', '/#/members', '/#/login']) {
  test(`${route} renders meaningful content`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('main, section').first()).toBeVisible();
  });
}
