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

for (const route of ['/#/verify', '/#/members', '/#/login']) {
  test(`${route} renders meaningful content`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('main, section').first()).toBeVisible();
  });
}
