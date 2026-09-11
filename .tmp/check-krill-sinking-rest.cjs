const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.addInitScript(()=>{window.draws=0;const original=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(...args){if(this.canvas.matches('.rule-preview__canvas')&&!this.canvas.closest('.detail-book-spread--capture'))window.draws++;return original.apply(this,args);};});
  await page.goto('http://127.0.0.1:5173/IDS_SwarmBehavior_Animals/AntarcticKrill/detail');await page.waitForTimeout(3000);
  for(let i=0;i<4;i++){await page.getByRole('button',{name:'다음 페이지',exact:true}).click();await page.waitForTimeout(1800);}
  const ranges=page.locator('.detail-book-spread:not(.detail-book-spread--capture) input[type=range]');
  await ranges.nth(0).fill('0');await ranges.nth(1).fill('50');await ranges.nth(2).fill('50');
  await page.waitForTimeout(5000);await page.evaluate(()=>{window.draws=0;});await page.waitForTimeout(700);
  assert.equal(await page.evaluate(()=>window.draws),0);
  await ranges.first().fill('100');await page.waitForTimeout(500);assert.ok(await page.evaluate(()=>window.draws>0));
  console.log({sinkingStopDraws:0,sinkingResumes:true});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
