const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.addInitScript(()=>{window.draws=0;const original=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(...args){if(this.canvas.matches('.rule-preview__canvas')&&!this.canvas.closest('.detail-book-spread--capture'))window.draws++;return original.apply(this,args);};});
  await page.goto('http://127.0.0.1:5173/IDS_SwarmBehavior_Animals/EmperorPenguin/detail');
  await page.waitForTimeout(3000);
  for(let i=0;i<3;i++){await page.getByRole('button',{name:'다음 페이지',exact:true}).click();await page.waitForTimeout(2000);}
  let quiet=false;
  for(let i=0;i<40;i++){
   await page.evaluate(()=>{window.draws=0;});await page.waitForTimeout(300);
   if(await page.evaluate(()=>window.draws===0)){quiet=true;break;}
  }
  assert.ok(quiet,'wave rest should not redraw');
  await page.evaluate(()=>{window.draws=0;});await page.waitForTimeout(9000);
  assert.ok(await page.evaluate(()=>window.draws>0),'next wave must resume rendering');
  console.log({idleDraws:0,nextWaveResumes:true});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
