const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
function lc(fg,bg){const y=rgb=>rgb.reduce((s,c,i)=>s+(c/255)**2.4*[.2126729,.7151522,.072175][i],0);const soft=v=>v>=.022?v:v+(.022-v)**1.414;const t=soft(y(fg)),b=soft(y(bg));if(Math.abs(t-b)<.0005)return 0;const s=b>t?(b**.56-t**.57)*1.14:(b**.65-t**.62)*1.14;return Math.abs(s)<.1?0:(s+(s>0?-.027:.027))*100;}
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.addInitScript(()=>{window.draws=0;const original=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(...args){if(this.canvas.matches('.rule-preview__canvas')&&!this.canvas.closest('.detail-book-spread--capture'))window.draws++;return original.apply(this,args);};});
  await page.goto('http://127.0.0.1:5173/IDS_SwarmBehavior_Animals/CaribbeanSpinyLobster/detail');await page.waitForTimeout(3000);
  for(let i=0;i<4;i++){await page.getByRole('button',{name:'다음 페이지',exact:true}).click();await page.waitForTimeout(1800);}
  await page.waitForTimeout(5000);
  const canvas=page.locator('.detail-book-spread:not(.detail-book-spread--capture) .rule-preview__canvas');
  const peak=await canvas.evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;const out=[0,0];for(let y=0;y<c.height;y++)for(let x=0;x<c.width*.63;x++){const i=(y*c.width+x)*4;out[y<c.height/2?0:1]=Math.max(out[y<c.height/2?0:1],d[i+3]);}return out;});
  await canvas.evaluate(c=>{c.style.visibility='hidden';});const png=await page.screenshot();await canvas.evaluate(c=>{c.style.visibility='';});
  const {data,info}=await sharp(png).extract({left:100,top:250,width:400,height:400}).raw().toBuffer({resolveWithObject:true});
  const bg=[0,0,0];for(let i=0;i<data.length;i+=info.channels)for(let j=0;j<3;j++)bg[j]+=data[i+j]/160000;
  console.log({background:bg,peakAlpha:peak,contrast:[[0,96,138],[138,0,62]].map((rgb,k)=>lc(rgb.map((v,i)=>v*peak[k]/255+bg[i]*(1-peak[k]/255)),bg))});
  const ranges=page.locator('.detail-book-spread:not(.detail-book-spread--capture) input[type=range]');
  await ranges.first().fill('0');await page.waitForTimeout(1000);await page.evaluate(()=>{window.draws=0;});await page.waitForTimeout(700);assert.ok(await page.evaluate(()=>window.draws>0));
  await page.waitForTimeout(55000);await page.evaluate(()=>{window.draws=0;});await page.waitForTimeout(700);assert.equal(await page.evaluate(()=>window.draws),0);
  await ranges.first().fill('100');await page.waitForTimeout(3000);assert.ok(await page.evaluate(()=>window.draws>0));
  console.log({residualKeepsDrawing:true,fullyFadedDraws:0,releaseResumes:true});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
