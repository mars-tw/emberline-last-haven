import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const results=[],browser=await chromium.launch({headless:true});
const p95=a=>[...a].sort((x,y)=>x-y)[Math.floor(a.length*.95)];
try{for(const viewport of [{width:1366,height:600},{width:390,height:844}]){const runs=[];for(let n=0;n<3;n++){
 const context=await browser.newContext({viewport,deviceScaleFactor:1});const p=await context.newPage();await p.goto('http://127.0.0.1:4179');await p.waitForFunction(()=>window.emberlineTelemetry?.().loaded);await p.locator('#begin').click();await p.waitForTimeout(1500);const offset=await p.evaluate(()=>window.emberlineTelemetry().frames.length);const intervals=await p.evaluate(()=>new Promise(resolve=>{const values=[];let first=0,last=0;function frame(now){if(!first)first=now;if(last)values.push(now-last);last=now;if(now-first>=5500)resolve(values);else requestAnimationFrame(frame);}requestAnimationFrame(frame);}));const telemetry=await p.evaluate(()=>window.emberlineTelemetry());const frames=telemetry.frames.slice(offset);assert.ok(frames.length>=200);const s={p95:p95(frames),frameIntervalP95:p95(intervals),sampleCount:frames.length,entities:telemetry.entities};runs.push(s);await context.close();}
 const median=[...runs.map(r=>r.p95)].sort((a,b)=>a-b)[1],frameMedian=[...runs.map(r=>r.frameIntervalP95)].sort((a,b)=>a-b)[1];results.push({viewport,runs,medianP95:median,medianFrameIntervalP95:frameMedian,thresholdMs:18,pass:median<=18&&frameMedian<=18});console.log(viewport,median,frameMedian);
}}finally{await browser.close();}
await writeFile('docs/evidence/performance.json',JSON.stringify({status:results.every(r=>r.pass)?'VERIFIED':'BLOCKED',context:'並發載量測，僅供參考',metric:'synchronous simulation + canvas rendering + HUD work per requestAnimationFrame; no screenshots during sample',device:'headless Chromium on shared Windows host; viewport emulation, not physical mobile',shippingQualified:false,results},null,2));
assert.ok(results.every(r=>r.pass),'three-run median p95 must remain <=18ms');
