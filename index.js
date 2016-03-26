/* global process */
'use strict';
const request = require('request');
const cheerio = require('cheerio');
const notifier = require('node-notifier');
const cron = require('cron');
const args = process.argv;
const Job = cron.CronJob;
const os = require('os');
const open = require('open');
let requestUrl, searchKey;
args.forEach((x, i) => {
   if (x.indexOf('=') > -1 && i > 1) {
      let splitVal = x.split('=');
      if (splitVal[0] === 'url') {
          requestUrl = splitVal[1];
      }
      if (splitVal[0] === 'query') {
          searchKey = splitVal[1];
      }
   } 
});

if (!requestUrl) {
    console.error('Request URL cannot be empty');
    process.exit(0);
}
if (!searchKey) {
    console.log('Search query cannot be empty');
    process.exit(0);
}
// const requestUrl = 'https://in.bookmyshow.com/buytickets/batman-v-superman-dawn-of-justice-3d-hyderabad/movie-hyd-ET00030143-MT/20160326';
// const searchKey = 'PVR;Inorbit;Forum Sujana';

var job = new Job('*/30 * * * * *', () => {
    console.log(`Searching for ${searchKey}...`);
    let url = `${requestUrl}/${Math.random() * 1000}`;
    request(`${url}`, (err, response, html) => {
        console.log(`Searching in ${url}..`);
        if (err) {
            return console.error(err);
        }
        let $ = cheerio.load(html);
        let keys = searchKey.split(',');

        let query = keys.map(x => `a:contains("${x}")`).join(',');
        console.log(query);
        let result = $(query);
        if (result.length) {
            console.log('Found something!!');
            return job.stop();
        } else {
            console.log(`Shucks, din't find anything..`);
        }
    });
}, () => {
    notifier.on('click', (obj, opts) => {
      open(requestUrl);
    });
    let message = `Found a match, for keywords ${searchKey} ${os.type() != 'Windows_NT' ? `, <a href="${requestUrl}">Go</a>` : '' }` 
    notifier.notify({
        title: 'Found something!',
        message: message,
        sound: true, 
        wait: true
    });
}, true);
