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
      await page.waitForTimeout(1500);
      const sample = () => sprite.evaluate(el => {
        const m = el.style.transform.match(/translate\(([-\d.e]+)px, ([-\d.e]+)px\)/);
        return { x: +m[1], y: +m[2], stage: [...el.classList].find(c => c.startsWith('grasshopper_')) };
      });
      assert.ok(Math.hypot((await sample()).x, (await sample()).y) < 1);
      await page.mouse.move(width * 0.3, 500);
      await page.waitForTimeout(100);
      const stages = new Set();
      for (let i = 0; i < 50; i++) {
        stages.add((await sample()).stage);
        await page.waitForTimeout(100);
      }
      assert.ok(stages.has('grasshopper_jump'));
      assert.ok(stages.has('grasshopper_idle') || stages.has('grasshopper_idle_front'));
      assert.ok(!stages.has('grasshopper_fly'));
      await page.mouse.move(1, 1);
      await page.waitForTimeout(12000);
      const home = await sample();
      assert.ok(Math.hypot(home.x, home.y) < 1, JSON.stringify(home));
      assert.equal(home.stage, 'grasshopper_fly');
      const firstFrame = await sprite.evaluate(el => el.style.backgroundPosition);
      let changed = false;
      for (let i = 0; i < 8; i++) {
        await page.waitForTimeout(40);
        changed ||= await sprite.evaluate(el => el.style.backgroundPosition) !== firstFrame;
      }
      assert.ok(changed, 'outside-book flight frames must animate');
      await page.waitForTimeout(3500);
      assert.ok(Math.hypot((await sample()).x, (await sample()).y) < 1);
      assert.deepEqual(errors, []);
      await page.screenshot({ path: `C:/Users/user/AppData/Local/Temp/locust-intro-${width}.png` });
      console.log({ width, stages: [...stages], home, errors });
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
