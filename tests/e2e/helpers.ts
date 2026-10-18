import { expect, type Locator, type Page } from '@playwright/test';

/** Fails the test if the page logs any console error or uncaught exception. */
export function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  return () => expect(errors, 'console errors').toEqual([]);
}

export async function freshStart(page: Page) {
  await page.goto('/#/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

export async function sendGuest(page: Page, text: string) {
  await page.getByTestId('guest-input').fill(text);
  await page.getByTestId('guest-send').click();
  await expect(page.getByTestId('typing')).toHaveCount(0, { timeout: 8000 });
}

/** The newest card for a guest's ticket on the staff board. */
export function boardCard(page: Page | Locator, text: string | RegExp) {
  return page.locator('[data-ticket]').filter({ hasText: text }).filter({ hasText: '1207' }).last();
}

/** Signs a guest in on the guest app, as they would on their own phone. */
export async function signIn(page: Page, room = '1207', surname = 'Mitchell') {
  await page.goto(`/#/guest?room=${room}`);
  // Another tab on the same device may already be signed in as someone else.
  await expect(page.getByTestId('guest-sign-in').or(page.getByTestId('guest-app'))).toBeVisible();
  if (await page.getByTestId('guest-app').isVisible())
    await page.getByTestId('guest-sign-out').click();
  await page.locator('#si-room').fill(room);
  await page.locator('#si-surname').fill(surname);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /^(Start|ابدأ)/ }).click();
  await expect(page.getByTestId('guest-app')).toBeVisible();
}
