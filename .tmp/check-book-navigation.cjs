const assert = require('node:assert/strict');
const { chromium } = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://127.0.0.1:5173/IDS_SwarmBehavior_Animals/Starling/detail');
      const spread = page.locator('.detail-book-spread:not(.detail-book-spread--capture)');
      await page.waitForTimeout(5000);
      for (let i = 0; i < 3; i++) {
        await page.getByRole('button', { name: '다음 페이지', exact: true }).click();
        await page.waitForTimeout(2000);
        assert.equal(await spread.locator('input[type=range]').count(), i === 2 ? 3 : 4);
        const canvas = spread.locator('.rule-preview__canvas');
        const count = await canvas.evaluate(c => {
          const data = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
          let n = 0; for (let j=3;j<data.length;j+=4) if(data[j])n++;
          return n;
        });
        assert.ok(count > 0);
        const slider = spread.locator('input[type=range]').last();
        const value = i === 2 ? '40' : '100';
        await slider.fill(value);
        assert.equal(await slider.inputValue(), value);
        console.log('BOOK', { width, key: await spread.getAttribute('data-page-key'), pixels: count });
        await page.screenshot({ path: `C:/Users/user/AppData/Local/Temp/starling-book-${width}-${i}.png` });
      }
      await page.getByRole('button', { name: '이전 페이지', exact: true }).click();
      await page.waitForTimeout(2000);
      assert.equal(await spread.locator('input[type=range]').last().inputValue(), '100');
      assert.deepEqual(errors, []);
      console.log('BACK', { width, key: await spread.getAttribute('data-page-key'), errors });
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
