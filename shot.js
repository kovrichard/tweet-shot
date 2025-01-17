#!/usr/bin/env node

const puppeteer = require("puppeteer");
const sharp = require('sharp');
const fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));

const run = async () => {
  if (argv.t !== undefined) {
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en'
    });
    console.log('Setting up viewport...');

    await page.setViewport({
      width: 800,
      height: 5000
    });

    await page.goto(argv.t);
    const split = argv.t.split('/');
    const filename = process.cwd() + '/shots/' + split[3] + '/' + split[5] + '.png';

    if (!fs.existsSync(process.cwd() + '/shots/')) {
      fs.mkdirSync(process.cwd() + '/shots/');
    }

    if (!fs.existsSync(process.cwd() + '/shots/' + split[3])) {
      fs.mkdirSync(process.cwd() + '/shots/' + split[3]);
    }

    console.log('Loading tweet #' + split[5] + ' from @' + split[3] + '...');

    setTimeout(async function () {
      let element = await page.$("article[tabindex='-1'");
      let coordinates = await element.boundingBox();

      if (argv.m == 'dark')
        await page.emulateMediaFeatures([{
          name: 'prefers-color-scheme', value: 'dark' }]);

      await page.screenshot({
        path: filename,
        fullPage: false
      });
      //await element.screenshot({path:filename,fullPage:false})

      await browser.close();

      let buf = fs.readFileSync(filename);
      let maxh = parseInt(coordinates.height.toFixed(0)) - 50;

      sharp(buf).extract({ left: 130, top: 55, width: 590, height: maxh })
        .toFile(filename, (err, info) => {
          console.log('Tweet picture created successfully at ' + filename);
        });
    }, 5000);
  } else {
    console.log('PROVIDE TWEET URL WITH -t PARAM LIKE: node shot -t=https://twitter.com/turinglabsorg/status/1355191990728749057');
  }
};

run();
