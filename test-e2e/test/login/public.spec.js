const { expect } = require('chai');

describe('Login', () => {
  let page;

  before(async () => {
    page = global.reusedPage;
  });

  it('should login the public user', async () => {
    await page.goto(`${process.env.URL}/corpus.html`, {
      waitUntil: 'networkidle0',
    });

    // TODO handle the redirects
    await page.waitFor(3000);

    const searchValue = await page.$eval('#search_box', (el) => el.value);
    expect(searchValue).to.equal('jeju');

    const dataListTitle = await page.$eval('#data-list-quickview-header h4', (el) => el.innerText);
    expect(dataListTitle).to.contain('Data from sample_filemaker.csv');

    const corpusTitle = await page.$eval('#corpus_dropdown_trigger', (el) => el.innerText);
    expect(corpusTitle).to.contain('Community Corpus');
    expect(corpusTitle).to.contain('Practice Elicitatio...');
  });
});
