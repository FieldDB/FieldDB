const path = require('path');
const puppeteer = require('puppeteer');

const debug = () => {};
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
    });
    page = await browser.newPage();
  });

  after(async () => {
    await browser.close();
  });

  it('should login lingllama sample user', async () => {
    debug(`URL: ${process.env.URL}/corpus.html`);
    await page.goto(`${process.env.URL}/corpus.html`, {
      waitUntil: 'networkidle0',
    });
    await page.screenshot({
      path: path.join(__dirname, '../../screenshots/example.png'),
    });
  });
});
