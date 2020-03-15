const puppeteer = require('puppeteer');
const path = require('path');

const debug = () => {};
const {
  HEADLESS,
} = process.env;

describe('Login', () => {
  let browser;
  let page;

  before(async () => {
    const pathToExtension = path.join(__dirname, '../../../backbone_client');
    browser = await puppeteer.launch({
      timeout: 10000,
      slowMo: 50,
      headless: HEADLESS && HEADLESS !== 'false',
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    const targets = await browser.targets();
    debug('targets', targets);
    const pageTarget = targets.find((target) => {
      debug('target.type()', target.type());
      // return target.type() === 'background_page'
      return target.type() === 'page';
    });
    page = await pageTarget.page();
  });

  after(async () => {
    await browser.close();
  });

  it.only('should login lingllama sample user', async () => {
    debug(`URL: ${process.env.URL}/corpus.html`);
    await page.goto(`${process.env.URL}/corpus.html`, {
      waitUntil: 'networkidle0',
    });
    await page.screenshot({
      path: 'screenshots/example.png',
    });
  });
});
