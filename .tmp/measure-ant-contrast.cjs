const { chromium } = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
// APCA 0.0.98G-4g reference equations: https://apcaw3.myndex.com/docs/APCA-W3-LaTeX.html
function lc(fg,bg) {
  const y = rgb => rgb.reduce((s,c,i)=>s+(c/255)**2.4*[.2126729,.7151522,.072175][i],0);
  const soft = v => v>=.022?v:v+(.022-v)**1.414;
  const t=soft(y(fg)),b=soft(y(bg));
  if(Math.abs(t-b)<.0005)return 0;
  const s=b>t?(b**.56-t**.57)*1.14:(b**.65-t**.62)*1.14;
  return Math.abs(s)<.1?0:(s+(s>0?-.027:.027))*100;
}
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto('http://127.0.0.1:5173/IDS_SwarmBehavior_Animals/ArmyAnt/');
 await page.waitForTimeout(8000);
 await page.mouse.click(980,750);
 await page.waitForTimeout(5000);
 await page.screenshot({path:'C:/Users/user/AppData/Local/Temp/ant-signal-green.png'});
 await page.goto('http://127.0.0.1:5173/IDS_SwarmBehavior_Animals/ArmyAnt/detail');
 await page.waitForTimeout(6000);
 for(let i=0;i<2;i++) {
   await page.getByRole('button',{name:'다음 페이지',exact:true}).click();
   await page.waitForTimeout(2000);
 }
 await page.screenshot({path:'C:/Users/user/AppData/Local/Temp/ant-book-signal.png'});
 await page.addStyleTag({content:'canvas { visibility:hidden !important; }'});
 const buffer=await page.screenshot();
 const {data,info}=await sharp(buffer).extract({left:100,top:250,width:500,height:400}).raw().toBuffer({resolveWithObject:true});
 const bg=[0,0,0];for(let i=0;i<data.length;i+=info.channels)for(let j=0;j<3;j++)bg[j]+=data[i+j]/(info.width*info.height);
 console.log('background',bg);
 for(const [color,alpha] of [[[0,104,36],102/255]]){
 const composite=color.map((c,i)=>c*alpha+bg[i]*(1-alpha));console.log({color,alpha,lc:lc(composite,bg)});
 }
 const soil=[210.936065,146.49046,62.63596];
 for(const [color,alpha] of [[[0,104,36],209/255],[[166,0,73],217/255]]) {
 console.log({color,alpha,soilLc:lc(color.map((c,i)=>c*alpha+soil[i]*(1-alpha)),soil)});
 }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
