import {chromium} from 'playwright';
import {writeFile,readFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const results=[],browser=await chromium.launch({headless:true,args:['--mute-audio']}),fixtureDir='docs/evidence/performance-scenarios';
await mkdir(fixtureDir,{recursive:true});
const capture=JSON.parse(await readFile('docs/art/compare/r5-after/captures.json','utf8')),fixtures={};
for(const [mode,scene] of [['defense','defense-active'],['train','night']]){
 const record=capture.records.find(r=>r.path.endsWith(`/phone-${scene}.png`));assert.ok(record?.state&&record.state.screen==='play');
 const path=`${fixtureDir}/${mode}.json`,bytes=Buffer.from(JSON.stringify(record.state,null,2));await writeFile(path,bytes);fixtures[mode]={path,sha256:createHash('sha256').update(bytes).digest('hex'),sourcePath:record.path,sourceIndexSha256:capture.indexSha256};
}
const p95=a=>[...a].sort((x,y)=>x-y)[Math.floor(a.length*.95)];
try{for(const viewport of [{width:1366,height:600},{width:390,height:844}])for(const mode of ['convoy','defense','train']){
 const runs=[];
 for(let n=0;n<3;n++){
  const context=await browser.newContext({viewport,deviceScaleFactor:1}),p=await context.newPage();
  await p.goto('http://127.0.0.1:4179');await p.waitForFunction(()=>window.emberlineTelemetry?.().loaded);
  if(mode==='convoy')await p.locator('#begin').click();
  else{
   // Restore a real, unedited ordinary-input saved state through the product UI.
   // No direct localStorage writes or engine mutation in this performance harness.
   await p.locator('#old-save').click();await p.locator('#source').selectOption('emberline');await p.locator('#legacy').setInputFiles(fixtures[mode].path);await p.locator('#confirm-import').click();await p.locator('#close').click();
  }
  assert.equal(await p.evaluate(()=>window.emberlineTelemetry().mode),mode);
  await p.waitForTimeout(1500);const offset=await p.evaluate(()=>window.emberlineTelemetry().frames.length);
  const intervals=await p.evaluate(()=>new Promise(resolve=>{const values=[];let first=0,last=0;function frame(now){if(!first)first=now;if(last)values.push(now-last);last=now;if(now-first>=5500)resolve(values);else requestAnimationFrame(frame);}requestAnimationFrame(frame);}));
  const telemetry=await p.evaluate(()=>window.emberlineTelemetry()),frames=telemetry.frames.slice(offset);assert.ok(frames.length>=200);assert.equal(telemetry.mode,mode);assert.equal(telemetry.paused,false);
  runs.push({p95:p95(frames),frameIntervalP95:p95(intervals),sampleCount:frames.length,entities:telemetry.entities});await context.close();
 }
 const median=[...runs.map(r=>r.p95)].sort((a,b)=>a-b)[1],frameMedian=[...runs.map(r=>r.frameIntervalP95)].sort((a,b)=>a-b)[1];
 results.push({viewport,mode,runs,medianP95:median,medianFrameIntervalP95:frameMedian,thresholdMs:18,pass:median<=18&&frameMedian<=18});console.log(viewport,mode,median,frameMedian);
}}finally{await browser.close();}
await writeFile('docs/evidence/performance.json',JSON.stringify({status:results.every(r=>r.pass)?'VERIFIED':'BLOCKED',context:'並發載量測，僅供參考',metric:'synchronous simulation + canvas rendering + HUD work per requestAnimationFrame; no screenshots during sample',device:'headless Chromium on shared Windows host; viewport emulation, not physical mobile',shippingQualified:false,stateRestoration:{method:'unchanged normal-input persisted snapshots imported through the ordinary file chooser; no engine injection',fixtures},results},null,2));
assert.ok(results.every(r=>r.pass),'all three modes, desktop/mobile, three-run median p95 must remain <=18ms');
