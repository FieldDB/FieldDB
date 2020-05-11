const { expect } = require('chai');

describe('Login', () => {
  let page;

  before(async () => {
    page = global.reusedPage;
  });

  it('should login lingllama sample user', async () => {
    await page.goto(`${process.env.URL}/corpus.html`, {
      waitUntil: 'networkidle0',
    });
    // TODO handle the redirects
    await page.waitFor(3000);
    const publicAvatarLink = await page.$eval('#user_drop_down_trigger a', (el) => el.href);
    expect(publicAvatarLink).to.contain('#user/public');

    await page.click('#login_register_button');
    await page.waitFor(100);
    await page.click('.sync-lingllama-data');
    // TODO handle the redirects
    await page.waitFor(3000);

    const userAvatarLink = await page.$eval('#user_drop_down_trigger a', (el) => el.href);
    expect(userAvatarLink).to.contain('#user/lingllama');
  });
});
