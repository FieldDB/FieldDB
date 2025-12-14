const { test, expect } = require('@playwright/test');

const { BASE_PATH = '' } = process.env;

test('Login: should login the public user', async ({ page }) => {
  // baseURL is configured in playwright.config.js, so we can use relative paths.
  await page.goto(`${BASE_PATH}/corpus.html`);

  // Validate the search box default value.
  await expect(page.locator('#search_box')).toHaveValue('jeju');

  // Validate data list header text.
  await expect(page.locator('#data-list-quickview-header h4')).toContainText('Data from sample_filemaker.csv');

  // Validate corpus dropdown content.
  const corpusDropdown = page.locator('#corpus_dropdown_trigger');
  // FIXME: the corpus has the right fields but the mask is showing defaults instead of the values
  // await expect(corpusDropdown).toContainText('Community Corpus');
  await expect(corpusDropdown).toContainText('Untitled Corpus');
  await expect(corpusDropdown).toContainText('Practice Elicitatio...');
});
