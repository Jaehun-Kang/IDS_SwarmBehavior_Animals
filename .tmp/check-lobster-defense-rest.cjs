const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.addInitScript(()=>{window.draws=0;const original=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(...args){if(this.canvas.matches('.rule-preview__canvas')&&!this.canvas.closest('.detail-book-spread--capture'))window.draws++;return original.apply(this,args);};});
  await page.goto('http://127.0.0.1:5173/IDS_SwarmBehavior_Animals/CaribbeanSpinyLobster/detail');await page.waitForTimeout(3000);
  for(let i=0;i<5;i++){await page.getByRole('button',{name:'다음 페이지',exact:true}).click();await page.waitForTimeout(1800);}
  await page.waitForTimeout(25000);await page.evaluate(()=>{window.draws=0;});await page.waitForTimeout(700);assert.equal(await page.evaluate(()=>window.draws),0);
  await page.screenshot({path:'C:/Users/user/AppData/Local/Temp/lobster-defense-settled.png'});
  const ranges=page.locator('.detail-book-spread:not(.detail-book-spread--capture) input[type=range]');
  await ranges.last().fill('0');await page.waitForTimeout(500);assert.ok(await page.evaluate(()=>window.draws>0));
  console.log({settledDraws:0,threatReleaseResumes:true});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
