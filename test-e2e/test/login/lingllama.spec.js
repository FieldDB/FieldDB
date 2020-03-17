const debug = require('debug');
const { expect } = require('chai');
const path = require('path');
const puppeteer = require('puppeteer');

const debugBrowserConsole = debug('browser:console');
const debugBrowserRequest = debug('browser:request');
const {
  HEADLESS,
} = process.env;

describe('Login', () => {
  let browser;
  let page;

  before(async () => {
    browser = await puppeteer.launch({
      timeout: 10000,
      slowMo: 50,
      headless: HEADLESS && HEADLESS !== 'false',
      ignoreHTTPSErrors: true,
      args: [
        '--window-size=1000,1080',
        '--auto-open-devtools-for-tabs',
      ],
    });
    page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080
    });
    await page.setRequestInterception(true);
    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();
      if (url.endsWith('.png') || url.endsWith('.jpg')) {
        console.log(`Aborting ${url}`);
        interceptedRequest.abort();
      } else if (url.includes('google-analytics.com')) {
        console.log(`Aborting ${url}`);
        interceptedRequest.abort();
      } else {
        debugBrowserRequest(`Continuing ${url}`);
        interceptedRequest.continue();
      }
    });
    page
      .on('console', (message) => debugBrowserConsole(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
      .on('pageerror', ({
        message,
      }) => console.log(message))
      .on('response', (response) => debugBrowserRequest(`${response.status()} ${response.url()}`))
      .on('requestfailed', (request) => debugBrowserRequest(`${request.failure().errorText} ${request.url()}`));
  });

  after(async () => {
    await page.screenshot({
      path: path.join(__dirname, '../../screenshots/lingllama.png'),
    });
    await page.close();
    await browser.close();
  });

  it('should login lingllama sample user', async () => {
    await page.goto(`${process.env.URL}/corpus.html`, {
      waitUntil: 'networkidle0',
    });
    // TODO handle the redirects
    await page.waitFor(3000);
    const publicAvatarLink = await page.$eval('#user_drop_down_trigger a', el => el.href)
    expect(publicAvatarLink).to.equal('#user/public');

    await page.click('#login_register_button');
    await page.waitFor(100);
    await page.click('.sync-lingllama-data');
    // TODO handle the redirects
    await page.waitFor(3000);

    const userAvatarLink = await page.$eval('#user_drop_down_trigger a', el => el.href)
    expect(userAvatarLink).to.equal('#user/public');
  });
});
