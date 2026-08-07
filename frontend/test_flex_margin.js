const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(`
    <style>
      .flex-col { display: flex; flex-direction: column; width: 400px; }
      .box1 { width: 100%; height: 600px; background: red; }
      .box2 { width: 100%; height: 200px; background: blue; margin-top: -50%; }
    </style>
    <div class="flex-col" id="container">
      <div class="box1" id="b1"></div>
      <div class="box2" id="b2"></div>
    </div>
  `);
  const b1 = await page.$eval('#b1', el => el.getBoundingClientRect());
  const b2 = await page.$eval('#b2', el => el.getBoundingClientRect());
  console.log('b1 top:', b1.top, 'bottom:', b1.bottom);
  console.log('b2 top:', b2.top, 'bottom:', b2.bottom);
  await browser.close();
})();
