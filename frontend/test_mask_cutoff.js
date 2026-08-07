const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  
  const masks = ['42%', '45%', '48%', '51%'];
  let html = `<html><body style="margin: 0; background: #e0d4f5; display: flex;">`;
  
  for (let m of masks) {
    html += `
      <div style="width: 390px; height: 844px; position: relative; margin-right: 10px;">
        <div style="position: absolute; top: 0; left: 0; width: 100%; z-index: 0; padding-top: 48%;">
          <div style="width: 100%; background: #FCF8FB; border-radius: 36px; height: 500px;"></div>
        </div>
        <img src="http://localhost:3000/avatar_original.png" style="width: 100%; height: auto; position: absolute; top: 0; left: 0; z-index: 10; pointer-events: none; -webkit-mask-image: linear-gradient(to bottom, black 0%, black ${m}, transparent ${m}, transparent 100%);">
        <div style="position: absolute; top: 5px; left: 5px; background: black; color: white; padding: 5px; z-index: 20;">${m}</div>
      </div>
    `;
  }
  html += `</body></html>`;
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'test_mask_cutoff.png' });
  await browser.close();
})();
