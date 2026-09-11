const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.addInitScript(()=>{window.draws=0;const original=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(...args){if(this.canvas.matches('.rule-preview__canvas')&&!this.canvas.closest('.detail-book-spread--capture'))window.draws++;return original.apply(this,args);};});
  await page.goto('http://127.0.0.1:5173/IDS_SwarmBehavior_Animals/AntarcticKrill/detail');await page.waitForTimeout(3000);
  await page.getByRole('button',{name:'다음 페이지',exact:true}).click();await page.waitForTimeout(1800);
  const ranges=page.locator('.detail-book-spread:not(.detail-book-spread--capture) input[type=range]');
  await ranges.first().fill('0');await page.waitForTimeout(3000);await page.evaluate(()=>{window.draws=0;});await page.waitForTimeout(700);
  assert.equal(await page.evaluate(()=>window.draws),0);
  await ranges.first().fill('1');await page.waitForTimeout(500);assert.ok(await page.evaluate(()=>window.draws>0));
  console.log({feedingStopDraws:0,feedingResumes:true});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
