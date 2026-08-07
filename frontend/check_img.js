const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  
  let html = `
    <html><body style="margin: 0; background: red;">
      <img src="http://localhost:3000/avatar_original.png" style="width: 100%; height: auto;">
    </body></html>
  `;
  
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'check_img.png' });
  await browser.close();
})();
