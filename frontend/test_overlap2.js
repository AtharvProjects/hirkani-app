const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  
  const paddings = ['48%', '50%', '52%', '55%'];
  let html = `<html><body style="margin: 0; background: #e0d4f5; display: flex;">`;
  
  for (let p of paddings) {
    html += `
      <div style="width: 390px; height: 844px; position: relative; margin-right: 10px;">
        <img src="http://localhost:3000/avatar_original.png" style="width: 100%; height: auto; position: absolute; top: 0; left: 0; opacity: 0.5;">
        <div style="position: absolute; top: 0; left: 0; width: 100%;">
          <div style="width: 100%; padding-left: 20px; padding-right: 20px; padding-top: ${p}; text-align: center; color: white;">
            ${p}
            <div style="width: 100%; background: rgba(255, 0, 0, 0.5); border-radius: 36px; height: 400px;"></div>
          </div>
        </div>
      </div>
    `;
  }
  html += `</body></html>`;
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'test_overlap2.png' });
  await browser.close();
})();
