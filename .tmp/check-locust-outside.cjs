const assert = require('node:assert/strict');
const { chromium } = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto('http://127.0.0.1:5173/IDS_SwarmBehavior_Animals/Grasshopper/detail');
      const sprite = page.locator('.detail-book-spread:not(.detail-book-spread--capture) .sprite_grasshopper');
      await sprite.waitFor();
      await page.waitForTimeout(2000);
      for (const x of [1, width - 1]) {
        await page.mouse.move(x, 1);
        await page.waitForTimeout(150);
        assert.ok(await sprite.evaluate(el => el.classList.contains('grasshopper_fly')));
        await page.mouse.move(x, 999);
        await page.waitForTimeout(150);
        const landed = await sprite.evaluate(el => ({ stage: el.classList.contains('grasshopper_idle') || el.classList.contains('grasshopper_idle_front'), transform: el.style.transform }));
        assert.ok(landed.stage);
        assert.ok(landed.transform.includes('rotate(0deg)'));
      }
      await page.mouse.move(width * 0.74, 999);
      await page.waitForTimeout(150);
      assert.ok(await sprite.evaluate(el => el.classList.contains('grasshopper_idle_front')));
      assert.deepEqual(errors, []);
      console.log({ width, above: 'fly', below: 'horizontal idle', errors });
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
