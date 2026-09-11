const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const routes={starling:'Starling',sardine:'PacificSardine',grasshopper:'DesertLocust',ant:'ArmyAnt',bat:'MexicanFreeTailedBat',sheep:'Merino',penguin:'EmperorPenguin',bee:'EasternHoneyBee',firefly:'SynchronousFirefly',spiny_lobster:'CaribbeanSpinyLobster',krill:'AntarcticKrill'};
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{for(const width of [1440,390])for(const[id,route]of Object.entries(routes)){
 const page=await browser.newPage({viewport:{width,height:1000}});
 await page.goto(`http://127.0.0.1:5173/IDS_SwarmBehavior_Animals/${route}/detail`);
 const sprite=page.locator('.detail-book-spread:not(.detail-book-spread--capture) .detail-header-artwork__sprite');
 await sprite.waitFor();await page.waitForTimeout(900);
 await page.mouse.move(1,999);await page.waitForTimeout(100);
 const result=await sprite.evaluate(el=>{
  const spread=el.closest('.detail-book-spread');
  const slot=spread.querySelector('.detail-page-inner--intro > .detail-intro-artwork');
  const copy=el.cloneNode(true);
  for(const p of ['position','left','top','transform-origin','width'])copy.style.removeProperty(p);
  copy.style.transform=el.style.transform.replace(/translate\([^)]*\)\s*/g,'');
  const reference=slot.firstElementChild;
  reference.replaceWith(copy);
  const rect=r=>({x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height});
  const current=rect(el.getBoundingClientRect()),old=rect(copy.getBoundingClientRect());
  const origin=getComputedStyle(el).transformOrigin;
  const stage=el.className.split(' ').at(-1);
  const posed={dx:current.x-old.x,dy:current.y-old.y};
  const transform=el.style.transform;
  el.style.transform='translate(-50%, -50%)';copy.style.transform='none';
  const baseNow=rect(el.getBoundingClientRect()),baseOld=rect(copy.getBoundingClientRect());
  el.style.transform=transform;copy.replaceWith(reference);
  return {stage,origin,current,old,posed,base:{dx:baseNow.x-baseOld.x,dy:baseNow.y-baseOld.y},sizeRatio:baseNow.w/baseOld.w};
 });
 console.log(JSON.stringify({id,width,...result}));await page.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
