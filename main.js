const fs = require('fs');

const { collectData } = require('./collectData');

const { ctnlCookies, dwCookies } = require('./cookie');

const url = 'https://www.cheaptickets.nl/';

(async () => {
  await collectData(url, 50, ctnlCookies, true, true, true);
  // await collectData(url, 50, dwCookies, true, true, true);
})();
