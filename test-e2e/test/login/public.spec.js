const { expect } = require('chai');
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
        debug(`Continuing ${url}`);
        interceptedRequest.continue();
      }
    });
    page
      .on('console', (message) => console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
      .on('pageerror', ({
        message,
      }) => console.log(message))
      .on('response', (response) => console.log(`${response.status()} ${response.url()}`))
      .on('requestfailed', (request) => console.log(`${request.failure().errorText} ${request.url()}`));
  });

  after(async () => {
    await browser.close();
  });

  it('should login the public user', async () => {
    debug(`URL: ${process.env.URL}/corpus.html`);
    await page.goto(`${process.env.URL}/corpus.html`, {
      waitUntil: 'networkidle0',
    });

    // TODO handle the redirects
    await page.waitFor(3000);

    const searchValue = await page.$eval('#search_box', el => el.value)
    expect(searchValue).to.equal('jeju');

    const dataListTitle = await page.$eval('#data-list-quickview-header h4', el => el.innerText)
    expect(dataListTitle).to.contain('Data from sample_filemaker.csv');

    const corpusTitle = await page.$eval('#corpus_dropdown_trigger', el => el.innerText)
    expect(corpusTitle).to.contain('Community Corpus');
    expect(corpusTitle).to.contain('Practice Elicitatio...');

    await page.screenshot({
      path: path.join(__dirname, '../../screenshots/public.png'),
    });
  });
});
