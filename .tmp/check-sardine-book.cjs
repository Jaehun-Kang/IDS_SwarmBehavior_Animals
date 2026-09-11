const assert = require('node:assert/strict');
const { chromium } = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const ruleIndex = Number(process.argv[2] || 0);
  const animal = process.argv[3] || 'Sardine';
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => {
        window.previewDraws = 0;
        window.previewStrokes = 0;
        const stroke = CanvasRenderingContext2D.prototype.stroke;
        CanvasRenderingContext2D.prototype.stroke = function(...args) {
          if (this.canvas.matches('.rule-preview__canvas') && this.strokeStyle === '#98424a') window.previewStrokes++;
          return stroke.apply(this, args);
        };
        const original = CanvasRenderingContext2D.prototype.drawImage;
        CanvasRenderingContext2D.prototype.drawImage = function(...args) {
          if (this.canvas.matches('.rule-preview__canvas') &&
              !this.canvas.closest('.detail-book-spread--capture')) window.previewDraws++;
          return original.apply(this, args);
        };
      });
      await page.goto(`http://127.0.0.1:5173/IDS_SwarmBehavior_Animals/${animal}/detail`);
      await page.waitForTimeout(5000);
      for (let i = 0; i <= ruleIndex; i++) {
        await page.getByRole('button', { name: '다음 페이지', exact: true }).click();
        await page.waitForTimeout(2500);
      }
      const spread = page.locator('.detail-book-spread:not(.detail-book-spread--capture)');
      const controlCount = animal === 'Bat' && ruleIndex === 3 ? 2 : 3;
      assert.equal(await spread.locator('input[type=range]').count(), controlCount);
      const canvas = spread.locator('.rule-preview__canvas');
      const sample = () => canvas.evaluate(c => {
        const data = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
        let pixels = 0, checksum = 0;
        for(let i=3;i<data.length;i+=4) if(data[i]) { pixels++; checksum=(checksum+i*data[i])%1000000007; }
        return { pixels, checksum };
      });
      const before = await sample();
      await page.waitForTimeout(500);
      let after = await sample();
      if (animal === 'EmperorPenguin' && ruleIndex === 2) {
        for (let i=0;i<30 && after.checksum===before.checksum;i++) {
          await page.waitForTimeout(500); after=await sample();
        }
      }
      assert.ok(before.pixels > 0 && after.pixels > 0);
      assert.notEqual(before.checksum, after.checksum);
      for (let index = 0; index < controlCount; index++) {
        const slider = spread.locator('input[type=range]').nth(index);
        const value = await slider.getAttribute('max');
        await slider.fill(value);
        assert.equal(await slider.inputValue(), value);
      }
      const lastValue = await spread.locator('input[type=range]').last().inputValue();
      if (animal === 'Starling' && ruleIndex === 3) {
        const bounds = () => canvas.evaluate(c => {
          const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
          let minX = c.width, maxX = 0, minY = c.height, maxY = 0;
          for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
            if (d[(y * c.width + x) * 4 + 3] > 20) {
              minX = Math.min(minX, x); maxX = Math.max(maxX, x);
              minY = Math.min(minY, y); maxY = Math.max(maxY, y);
            }
          }
          return { minX, maxX, minY, maxY, width: c.width, height: c.height, extent: maxY - minY };
        });
        await spread.locator('input[type=range]').last().fill('0');
        await page.waitForTimeout(2000);
        const side = await bounds();
        await page.screenshot({ path: `C:/Users/user/AppData/Local/Temp/Starling-shape-side-${width}.png` });
        await spread.locator('input[type=range]').last().fill('90');
        await page.waitForTimeout(2000);
        const top = await bounds();
        assert.ok(top.extent > side.extent * 1.5);
        for (const b of [side, top]) assert.ok(b.minX > 0 && b.minY > 0 && b.maxX < b.width - 1 && b.maxY < b.height - 1);
        console.log('SHAPE PROJECTION', { width, side, top });
      }
      if (ruleIndex === 2 && animal === 'Sardine') {
        await spread.locator('input[type=range]').first().fill('0');
        await page.waitForTimeout(4000);
      }
      if (ruleIndex === 3 && ['Sardine', 'Bat', 'Sheep'].includes(animal)) {
        const box = await canvas.boundingBox();
        await page.evaluate(() => { window.previewStrokes = 0; });
        await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
        await page.waitForTimeout(1000);
        assert.ok(await page.evaluate(() => window.previewStrokes > 0));
      }
      await page.waitForTimeout(1000);
      if (animal === 'Bat' && (ruleIndex === 1 || ruleIndex === 2)) await page.waitForTimeout(20000);
      await page.screenshot({ path: `C:/Users/user/AppData/Local/Temp/${animal}-book-${width}-${ruleIndex}.png` });
      if (ruleIndex === 3 && ['Sardine', 'Bat', 'Sheep'].includes(animal)) {
        await page.mouse.move(0, 0);
        await page.waitForTimeout(200);
        await page.evaluate(() => { window.previewStrokes = 0; });
        await page.waitForTimeout(300);
        assert.equal(await page.evaluate(() => window.previewStrokes), 0);
      }
      await canvas.evaluate(c => { c.style.transform = 'translateX(200vw)'; });
      await page.waitForTimeout(300);
      await page.evaluate(() => { window.previewDraws = 0; });
      await page.waitForTimeout(300);
      assert.equal(await page.evaluate(() => window.previewDraws), 0);
      await canvas.evaluate(c => { c.style.transform = ''; });
      await page.getByRole('button', { name: '이전 페이지', exact: true }).click();
      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: '다음 페이지', exact: true }).click();
      await page.waitForTimeout(2000);
      assert.equal(await spread.locator('input[type=range]').last().inputValue(), lastValue);
      assert.deepEqual(errors, []);
      console.log('SARDINE BOOK', { width, ruleIndex, before, after, offscreenDraws: 0, errors });
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
