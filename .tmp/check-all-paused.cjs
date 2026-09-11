const { chromium } = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const animals = ['01_Starling','02_Sardine','03_Grasshopper','04_Ant','05_Bat','06_Sheep','07_Penguin','08_Bee','09_Firefly','10_SpinyLobster','11_Krill'];
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({viewport:{width:900,height:650}});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto('http://127.0.0.1:5173/IDS_SwarmBehavior_Animals/Starling/detail');
    await page.evaluate(async () => {
      const base='/IDS_SwarmBehavior_Animals/';
      window.testReact=(await import(base+'node_modules/.vite/deps/react.js')).default;
      const {createRoot}=(await import(base+'node_modules/.vite/deps/react-dom_client.js')).default;
      const host=document.createElement('div'); host.id='paused-test';
      host.style.cssText='position:fixed;inset:0;z-index:99999;background:white;';
      document.body.appendChild(host); window.pauseRoot=createRoot(host);
      window.paintCount=0;
      for(const [proto,name] of [[CanvasRenderingContext2D.prototype,'clearRect'],[WebGLRenderingContext.prototype,'drawArrays']]) {
        const original=proto[name];
        proto[name]=function(...args){if(this.canvas.closest('#paused-test'))window.paintCount++;return original.apply(this,args);};
      }
    });
    for(const animal of animals) {
      await page.evaluate(async name=>{
        const {App}=await import('/IDS_SwarmBehavior_Animals/src/behaviors/swarm/'+name+'.jsx');
        window.renderPauseTest=paused=>window.pauseRoot.render(window.testReact.createElement(App,{
          key:name,controls:App.ui?.defaultControlState,isPaused:paused,
        }));
        window.renderPauseTest(true);
      },animal);
      await page.waitForTimeout(1800);
      await page.evaluate(()=>{window.paintCount=0;});
      await page.waitForTimeout(250);
      const paused=await page.evaluate(()=>window.paintCount);
      const viewport=page.viewportSize();
      await page.setViewportSize({width:viewport.width===900?910:900,height:650});
      await page.waitForTimeout(200);
      const resize=await page.evaluate(()=>{const count=window.paintCount;window.paintCount=0;return count;});
      await page.waitForTimeout(200);
      const resizeSettled=await page.evaluate(()=>window.paintCount);
      await page.evaluate(()=>{window.paintCount=0;window.renderPauseTest(false);});
      await page.waitForTimeout(400);
      const resumed=await page.evaluate(()=>window.paintCount);
      await page.evaluate(()=>window.renderPauseTest(true));
      await page.waitForTimeout(200);
      await page.evaluate(()=>{window.paintCount=0;});
      await page.waitForTimeout(200);
      const repaused=await page.evaluate(()=>window.paintCount);
      console.log(JSON.stringify({animal,paused,resize,resizeSettled,resumed,repaused,errors:errors.splice(0)}));
    }
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
