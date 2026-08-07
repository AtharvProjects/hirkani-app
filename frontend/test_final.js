const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  
  let html = `
    <html><body style="margin: 0; background: #e0d4f5; display: flex;">
      <div style="width: 390px; height: 844px; position: relative; margin-right: 10px;">
        <!-- Original Image -->
        <img src="http://localhost:3000/avatar_original.png" style="width: 100%; height: auto; position: absolute; top: 0; left: 0; z-index: 0; pointer-events: none;">
        
        <!-- HTML Card container (No px-5, full width) -->
        <div style="position: absolute; top: 0; left: 0; width: 100%; z-index: 10; padding-top: 46%;">
          <div style="width: 100%; background: #FCF8FB; border-radius: 36px; height: 500px; padding-top: 64px; text-align: center;">
            <h1 style="color: #2E295E; font-size: 26px; font-weight: 800; margin: 0;">Welcome Back!</h1>
          </div>
        </div>
      </div>
    </body></html>
  `;
  
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'test_final.png' });
  await browser.close();
})();
