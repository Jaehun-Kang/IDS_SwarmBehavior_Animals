const { chromium } = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', error => console.log('PAGEERROR', error.message));
  await page.goto('http://127.0.0.1:5173/IDS_SwarmBehavior_Animals/Starling/detail');
  await page.waitForTimeout(8000);
  await page.getByRole('button', { name: '다음 페이지', exact: true }).click();
  await page.waitForTimeout(8000);
  if (await page.locator('.rule-preview__canvas').count() === 0) {
    console.log('PAGE STATE', await page.locator('[data-page-key]').evaluateAll(nodes => nodes.map(node => ({ key: node.dataset.pageKey, class: node.className }))));
    await page.getByRole('button', { name: '다음 페이지', exact: true }).click();
    await page.waitForTimeout(8000);
  }
  await page.screenshot({ path: 'C:/Users/user/AppData/Local/Temp/starling-flight-state.png' });
  console.log((await page.locator('body').innerText()).slice(-2500));
  const canvas = page.locator('.detail-book-spread:not(.detail-book-spread--capture) .rule-preview__canvas').first();
  console.log('CANVASES', await page.locator('.rule-preview__canvas').count());
  console.log('PIXELS', await canvas.evaluate(canvas => {
    const p = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let opaque = 0; for (let i = 3; i < p.length; i += 4) if (p[i] > 0) opaque++;
    return { width: canvas.width, height: canvas.height, opaque };
  }));
  await page.screenshot({ path: 'C:/Users/user/AppData/Local/Temp/starling-flight-desktop.png' });
  await page.getByRole('slider', { name: '반응 시간 반응 시간', exact: true }).fill('0.12');
  await page.getByRole('slider', { name: '비행 속도 비행 속도', exact: true }).fill('12');
  await page.waitForTimeout(1500);
  console.log('VALUES', await page.locator('.detail-parameter-row__value').allTextContents());
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/user/AppData/Local/Temp/starling-flight-mobile.png' });
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
