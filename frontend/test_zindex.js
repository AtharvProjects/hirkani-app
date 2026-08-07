const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  
  // Test different mask cutoffs and padding tops
  const tests = [
    { pad: '44%', mask: '33%' },
    { pad: '46%', mask: '35%' },
    { pad: '48%', mask: '37%' },
  ];
  let html = `<html><body style="margin: 0; background: #e0d4f5; display: flex;">`;
  
  for (let t of tests) {
    html += `
      <div style="width: 390px; height: 844px; position: relative; margin-right: 10px;">
        
        <!-- HTML Card (Background) -->
        <div style="position: absolute; top: 0; left: 0; width: 100%; z-index: 0;">
          <div style="width: 100%; padding-left: 20px; padding-right: 20px; padding-top: ${t.pad}; text-align: center; color: white;">
            ${t.pad} / mask: ${t.mask}
            <div style="width: 100%; background: #FCF8FB; border-radius: 36px; height: 500px; box-shadow: 0 20px 50px rgba(0,0,0,0.08);"></div>
          </div>
        </div>

        <!-- Image (Foreground, Masked) -->
        <img src="http://localhost:3000/avatar_original.png" style="width: 100%; height: auto; position: absolute; top: 0; left: 0; z-index: 10; pointer-events: none; -webkit-mask-image: linear-gradient(to bottom, black 0%, black ${t.mask}, transparent ${t.mask}, transparent 100%); mask-image: linear-gradient(to bottom, black 0%, black ${t.mask}, transparent ${t.mask}, transparent 100%);">
        
      </div>
    `;
  }
  html += `</body></html>`;
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'test_zindex.png' });
  await browser.close();
})();
