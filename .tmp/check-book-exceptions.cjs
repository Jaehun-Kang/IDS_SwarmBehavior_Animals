const { chromium } = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on('console', message => { if (message.text().startsWith('SVGERROR')) console.log(message.text()); });
    await page.addInitScript(() => {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
      Object.defineProperty(HTMLImageElement.prototype, 'src', { ...descriptor, set(value) {
        if (value.startsWith('data:image/svg+xml;charset=utf-8,')) {
          const xml = decodeURIComponent(value.split(',').slice(1).join(','));
          const error = new DOMParser().parseFromString(xml, 'image/svg+xml').querySelector('parsererror');
          if (error) console.log('SVGERROR', error.textContent);
        }
        descriptor.set.call(this, value);
      } });
    });
    const session = await page.context().newCDPSession(page);
    await session.send('Debugger.enable');
    await session.send('Debugger.setPauseOnExceptions', { state: 'all' });
    session.on('Debugger.paused', async event => {
      console.log('EXCEPTION', JSON.stringify({ data: event.data, frames: event.callFrames.slice(0, 4).map(f => ({ name: f.functionName, url: f.url, line: f.location.lineNumber })) }));
      await session.send('Debugger.resume');
    });
    await page.goto('http://127.0.0.1:5173/IDS_SwarmBehavior_Animals/Starling/detail');
    await page.waitForTimeout(6000);
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: '다음 페이지', exact: true }).click();
      await page.waitForTimeout(3000);
      console.log('PAGE', await page.locator('[data-page-key]').evaluateAll(nodes => nodes.map(n => n.dataset.pageKey)));
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
