const { chromium } = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const ruleIndex = Number(process.argv[2] || 0);
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.addInitScript(() => {
      window.flightMetrics = { glDraws: 0, positions: [], layoutReads: 0 };
      const draw = WebGLRenderingContext.prototype.drawArrays;
      WebGLRenderingContext.prototype.drawArrays = function(...args) {
        window.flightMetrics.glDraws++;
        return draw.apply(this, args);
      };
      const translate = CanvasRenderingContext2D.prototype.translate;
      CanvasRenderingContext2D.prototype.translate = function(x,y) {
        if (this.canvas.closest('#flight-test')) window.flightMetrics.positions.push([x,y]);
        return translate.call(this,x,y);
      };
      const bounds = Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect = function() {
        if (this.closest('#flight-test')) window.flightMetrics.layoutReads++;
        return bounds.call(this);
      };
    });
    page.on('pageerror', error => console.log('PAGEERROR', error.message));
    await page.goto('http://127.0.0.1:5173/IDS_SwarmBehavior_Animals/Starling/detail');
    await page.waitForTimeout(1500);
    await page.evaluate(async ruleIndex => {
      const base = '/IDS_SwarmBehavior_Animals/';
      const React = (await import(base + 'node_modules/.vite/deps/react.js')).default;
      const { createRoot } = (await import(base + 'node_modules/.vite/deps/react-dom_client.js')).default;
      const Preview = (await import(base + 'src/components/RulePreview.jsx')).default;
      const Panel = (await import(base + 'src/components/BookBehaviorPanel.jsx')).default;
      const { STARLING_DETAILS } = await import(base + 'src/behaviors/details/starling.js');
      const { resolveRuleControls } = await import(base + 'src/utils/bookControls.js');
      const rule = STARLING_DETAILS.rules[ruleIndex];
      const host = document.createElement('div');
      host.id = 'flight-test';
      host.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#fff;overflow:auto;';
      document.body.appendChild(host);
      function Test() {
        const [values, setValues] = React.useState(resolveRuleControls(rule));
        return React.createElement('div', {style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'24px',padding:'24px'}},
          React.createElement('div', {className:'detail-book-page--simulation',style:{height:'600px'}},
            React.createElement(Preview, {animalId:'starling',ruleGroup:rule,previewControls:values})),
          React.createElement(Panel, {ruleGroup:rule,controls:values,accentColor:'rgb(27 81 108)',onChange:(id,value)=>setValues(old=>({...old,[id]:value}))}));
      }
      createRoot(host).render(React.createElement(Test));
    }, ruleIndex);
    await page.waitForTimeout(2000);
    console.log('PERF', await page.evaluate(async () => {
      window.flightMetrics = {glDraws:0,positions:[],layoutReads:0};
      const intervals=[]; let previous;
      for(let i=0;i<121;i++) {
        const now=await new Promise(requestAnimationFrame);
        if(previous!==undefined) intervals.push(now-previous);
        previous=now;
      }
      const points=window.flightMetrics.positions.filter((_,i)=>i%24===0);
      const changes=points.slice(1).filter((p,i)=>p[0]!==points[i][0]||p[1]!==points[i][1]).length;
      intervals.sort((a,b)=>a-b);
      return {frames:points.length,changes,glDraws:window.flightMetrics.glDraws,layoutReads:window.flightMetrics.layoutReads,p95:intervals[114]};
    }));
    const canvas = page.locator('#flight-test canvas');
    const sample = () => canvas.evaluate(c => {
      const data = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
      let count=0, checksum=0;
      for(let i=3;i<data.length;i+=4) if(data[i]) {count++;checksum=(checksum+i*data[i])%1000000007;}
      return {width:c.width,height:c.height,count,checksum};
    });
    const before=await sample(); await page.waitForTimeout(500); const after=await sample();
    console.log('PIXELS', {before,after,moving:before.checksum!==after.checksum});
    await page.screenshot({path:'C:/Users/user/AppData/Local/Temp/starling-flight-desktop.png'});
    for(const [name,value] of (ruleIndex === 2 ? [['회전 경로 회전 반경','5'],['몸 기울이기 기울기 각도','60'],['회전의 전달 회전 전달 속도','40']] : ruleIndex === 0 ? [['비행 속도 비행 속도','12'],['반응 시간 반응 시간','0.12'],['충돌을 피하는 거리 최소 간격','0.6'],['이웃의 위치 측면 이웃의 영향','100']] : [['참고하는 이웃 수 참고 이웃 수','10'],['가까운 이웃 피하기 회피 강도','100'],['방향 맞추기 방향 맞추기 강도','100'],['무리에서 떨어지지 않기 이웃 접근 강도','100']])) {
      await page.locator('#flight-test').getByRole('slider',{name,exact:true}).fill(value);
    }
    console.log('VALUES',await page.locator('#flight-test .detail-parameter-row__value').allTextContents());
    await page.locator('#flight-test').evaluate(host => {host.style.transform='translateX(200vw)';});
    await page.waitForTimeout(200);
    await page.evaluate(()=>{window.flightMetrics.positions=[];});
    await page.waitForTimeout(250);
    console.log('OFFSCREEN DRAWS', await page.evaluate(()=>window.flightMetrics.positions.length));
    await page.locator('#flight-test').evaluate(host => {host.style.transform='';});
    await page.setViewportSize({width:390,height:844});
    await page.waitForTimeout(1500);
    console.log('MOBILE PIXELS',await sample());
    await page.screenshot({path:'C:/Users/user/AppData/Local/Temp/starling-flight-mobile.png',fullPage:true});
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
