const { test, expect } = require('@playwright/test');

test('Login: should login lingllama sample user', async ({ page }) => {
  // Use baseURL from config; navigate to corpus page.
  await page.goto('/corpus.html');

  const userDropdownLink = page.locator('#user_drop_down_trigger a');
  await expect(userDropdownLink).toHaveAttribute('href', /#user\/public/);

  // Trigger login/register flow.
  await page.locator('#login_register_button').click();
  await page.locator('.sync-lingllama-data').click();

  // Wait for user to be logged in and avatar to point to lingllama.
  await expect(userDropdownLink).toHaveAttribute('href', /#user\/lingllama/);
});
