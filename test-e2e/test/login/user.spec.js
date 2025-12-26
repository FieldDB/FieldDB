const { test, expect } = require('@playwright/test');

const { BASE_PATH = '' } = process.env;

test('Login: should login a test user', async ({ page }) => {
  // Use baseURL from config; navigate to corpus page.
  await page.goto(`${BASE_PATH}/corpus.html`);
  await page.waitForTimeout(1000); // workaround for redirects until we are logged in as the public user
  await page.goto(`${BASE_PATH}/user.html#login`);

  await page.getByRole('link', { name: 'Click to view user\'s page' }).click();
  await page.getByRole('link', { name: ' Log In' }).click();
  await page.getByRole('textbox').first().click();
  await page.getByRole('textbox').first().fill('testingprototype');
  await page.getByRole('textbox').first().press('Tab');
  await page.locator('#login_modal input[type="password"]').fill('test');

  await page.getByRole('button', { name: 'Log In' }).click();
  await page.waitForURL(`${BASE_PATH}/corpus.html`);

  // workaround for requesting http://localhost:5984/default/testingprototype
  await page.goto(`${BASE_PATH}/user.html`);
  // expect the list of corpus to be empty until we find the bug
  await page.waitForTimeout(1000); // workaround for redirects until we are logged in as the public user
  await page.locator('#user-fullscreen').getByText('Switch to another corpus:');
  const corporaList = page.locator('#user-fullscreen .corpora');
  await expect(corporaList).toHaveText('');
});
