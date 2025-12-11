const debug = require('debug');
const {
  expect,
} = require('chai');
const supertest = require('supertest');
const path = require('path');
const puppeteer = require('puppeteer');

const service = require('../../backbone_client/bin/https-server.js');

const debugBrowserConsole = debug('browser:console');
const debugBrowserRequest = debug('browser:request');
const {
  HEADLESS,
  URL,
} = process.env;
let browser;
let page;

before((done) => {
  if (URL) {
    done();
    return;
  }

  service.listen(0, () => {
    process.env.URL = `https://localhost:${service.address().port}`;
    supertest(process.env.URL)
      .get('/user.html')
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        // eslint-disable-next-line no-console
        console.log('Server started', process.env.URL);
        expect(res.text).to.contain('user_online_dashboard');
        done();
      });
  });
});

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
  const context = await browser.createIncognitoBrowserContext();
  page = await context.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
  });
  await page.setRequestInterception(true);
  page
    .on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();
      if (url.endsWith('.png') || url.endsWith('.jpg')) {
      // eslint-disable-next-line no-console
        console.log(`Aborting ${url}`);
        interceptedRequest.abort();
      } else if (url.includes('google-analytics.com')) {
      // eslint-disable-next-line no-console
        console.log(`Aborting ${url}`);
        interceptedRequest.abort();
      } else {
      // debugBrowserRequest(`Continuing ${url}`);
        interceptedRequest.continue();
      }
    })
    .on('console', (message) => {
    /* eslint-disable no-underscore-dangle */
      const level = `${message.type().substr(0, 3).toUpperCase()}`;
      const location = `${message._location.url}:${message._location.lineNumber}:${message._location.columnNumber}`;
      const description = message._args && message._args.map((arg, index) => arg._remoteObject.description && `arg ${index} ${arg._remoteObject.description}`).filter((a) => !!a).join('\n');
      /* eslint-enable no-underscore-dangle */
      debugBrowserConsole(level, location, description || message.text());
    })
    .on('pageerror', (
      message,
      ...args
    // eslint-disable-next-line no-console
    ) => console.log(message, args))
    // .on("error", (err) => { console.log("Error: " , err.toString()) })
    // eslint-disable-next-line no-underscore-dangle
    .on('response', (response) => debugBrowserRequest(`${response.status()} ${response._request.method()} ${response.url()}`))
    .on('requestfailed', (request) => debugBrowserRequest(`${request.failure().errorText} ${request.method()} ${request.url()}`));

  global.reusedPage = page;
});

afterEach(async function afterEachTest() {
  const curentUrl = await page.url();
  debugBrowserRequest('clear page data', curentUrl);
  if (!curentUrl.includes('localhost')) {
    return;
  }

  // Take a screenshot
  const title = this.currentTest.fullTitle().replace(/[^a-zA-Z0-9]/g, '_');
  await page.screenshot({
    path: path.join(__dirname, `../screenshots/${title}.png`),
  });

  // Clear cache/cookies
  await expect(await page.evaluate(() => localStorage.clear())).to.equal(undefined);
  const cookies = await page.cookies(process.env.URL, 'https://auth.lingsync.org', 'https://corpus.lingsync.org');
  debugBrowserRequest('cookies', cookies);
  await page.deleteCookie(...cookies);
  await page.goto('about:blank');
  const finalUrl = await page.url();
  debugBrowserRequest('finalUrl', finalUrl);
});

after(async () => {
  service.close();
  // eslint-disable-next-line no-console
  console.log('Done');
  await browser.close();
});
