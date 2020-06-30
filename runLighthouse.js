const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const { URL } = require('url');

const runLighthouse = async (url, cookies) => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });

  const newPage = await browser.newPage();
  newPage.setCookie(...cookies);

  const result = await lighthouse(url, {
    port: (new URL(browser.wsEndpoint())).port,
    output: 'html',
    // logLevel: 'info',
    onlyCategories: ['performance'],
  });

  await browser.close();

  return result;
}

module.exports = {
  runLighthouse,
}
