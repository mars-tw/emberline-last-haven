import {nightSignal} from './journey-inputs.mjs';
import {commitBait} from './journey-inputs.mjs';
import {chromium} from 'playwright';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const phase=process.argv[2]||'after',dir=`docs/art/compare/${phase}`;
const sha=b=>createHash('sha256').update(b).digest('hex'),indexSha256=sha(await readFile('dist/index.html'));
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--mute-audio']}),records=[];
const state=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('emberline.campaign.v1')));
const step=(p,s)=>p.clock.runFor(s*1000);
const viewports=[['phone',390,844],['tablet',1032,1376],['desktop',1366,768],['landscape',844,390],['wide',1920,1080]];
try {
// R2 reuses one ordinary-input journey and resizes at each scene, saving RAM/time.
for(const [label,width,height] of (phase==='r2-after'?viewports.slice(0,1):viewports)){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,hasTouch:label!=='desktop'&&label!=='wide'}),p=await context.newPage();
 await p.goto('http://127.0.0.1:4179');await p.waitForFunction(()=>window.emberlineTelemetry?.().loaded);await p.clock.install();
 async function shot(scene){for(const [shotLabel,shotWidth,shotHeight] of (phase==='r2-after'?viewports:[[label,width,height]])){await p.setViewportSize({width:shotWidth,height:shotHeight});await step(p,.1);const path=`${dir}/${shotLabel}-${scene}.png`;await p.screenshot({path});const bytes=await readFile(path);assert.equal(bytes.readUInt32BE(16),shotWidth);assert.equal(bytes.readUInt32BE(20),shotHeight);const current=await state(p),visual=await p.evaluate(()=>{const t=window.emberlineTelemetry();return{actors:t.actors??[],artPaths:t.artPaths??[]};});if(phase==='r2-after'&&shotWidth===390){for(const a of visual.actors.filter(a=>a.action!=='death'))assert.ok(a.visibleWidth>=39.99&&a.visibleHeight>=39.99,`390px visible actor too small: ${JSON.stringify(a)}`);if(scene==='convoy'){assert.ok(current.progress.enemies.length>0);assert.ok(current.progress.time<10);}}records.push({path,sha256:sha(bytes),viewport:{width:shotWidth,height:shotHeight},state:current,visual});}await p.setViewportSize({width,height});await step(p,.1);}
 await shot('departure');await p.locator('#begin').click();await step(p,4);await shot('convoy');
 let n=0;while((await state(p)).screen==='play'){await step(p,1);const s=await state(p);if(s.screen!=='play')break;const latched=s.progress.enemies.filter(e=>e.slot>=0&&e.state==='attack').length;if((latched>=2||(latched&&s.hull<55))&&s.progress.time>=s.progress.cooldown)await p.locator('#drift').click();assert.ok(++n<80);}
 assert.equal((await state(p)).screen,'report');await p.locator('#next').click();await commitBait(p,'#bait-center');await step(p,4);await shot('bait');
 n=0;while((await state(p)).screen==='play'){await step(p,1);const s=await state(p);if(s.screen!=='play')break;if(!s.progress.baitLeft&&s.supplies)await commitBait(p,'#bait-center');assert.ok(++n<65);}
 await p.locator('#next').click();
 if(phase==='r2-after'&&label==='phone'){
  const rect=await p.locator('#world').boundingBox(),s=Math.min(rect.width/360,rect.height/560),ox=(rect.width-360*s)/2,oy=(rect.height-560*s)/2;
  const clickWorld=(x,y)=>p.mouse.click(rect.x+ox+x*s,rect.y+oy+y*s);
  await clickWorld(200,350);await clickWorld(60,250);
  assert.equal((await state(p)).progress.night.voyage.inspectedIds.length,2,'diegetic passenger/window observations use real input');
  await shot('night');await p.locator('#seal-window').click();const cue=await nightSignal(p),before=await state(p);await clickWorld(cue.includes('玻璃')?60:200,cue.includes('玻璃')?250:90);assert.equal((await state(p)).progress.countered,before.progress.countered+1,'diegetic threat hotspot uses actual counter rule');
 }else{await p.locator('#breath').click();await p.locator('#window').click();await shot('night');}
 await p.locator('#pause').click();await shot('journal');
 const geometry=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight}));assert.equal(geometry.overflow,false);
 await context.close();
}
}finally{await browser.close();}
assert.equal(sha(await readFile('dist/index.html')),indexSha256,'build must remain fixed while capturing');
await writeFile(`${dir}/captures.json`,JSON.stringify({status:'VERIFIED',headless:true,stateInjection:false,indexSha256,records},null,2));
console.log(`VERIFIED ${records.length} ${phase} captures`);
