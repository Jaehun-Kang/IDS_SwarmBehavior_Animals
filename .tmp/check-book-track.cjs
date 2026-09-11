const assert = require('node:assert/strict');
const { chromium } = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  for(const width of [1440,390]) {
   const page=await browser.newPage({viewport:{width,height:1000}});
   await page.goto('http://127.0.0.1:5173/IDS_SwarmBehavior_Animals/ArmyAnt/detail');
   await page.waitForTimeout(4000);
   await page.getByRole('button',{name:'다음 페이지',exact:true}).click();
   await page.waitForTimeout(2000);
   const sliders=page.locator('.detail-book-spread:not(.detail-book-spread--capture) input[type=range]');
   for(let i=0;i<await sliders.count();i++) {
    const slider=sliders.nth(i);
    const style=await slider.evaluate(el=>({appearance:getComputedStyle(el).appearance,border:getComputedStyle(el).borderWidth}));
    assert.equal(style.appearance,'none');assert.equal(style.border,'0px');
    await slider.fill(await slider.getAttribute('max'));
    assert.equal(await slider.inputValue(),await slider.getAttribute('max'));
    await slider.focus();await page.keyboard.press('ArrowLeft');
    assert.ok(Number(await slider.inputValue())<Number(await slider.getAttribute('max')));
   }
   await page.screenshot({path:`C:/Users/user/AppData/Local/Temp/book-track-${width}.png`});
   console.log({width,appearance:'none',sliderInteraction:'passed'});
   await page.close();
  }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
