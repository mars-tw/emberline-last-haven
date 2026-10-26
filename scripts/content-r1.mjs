import {nightSignal} from './journey-inputs.mjs';
import {commitBait} from './journey-inputs.mjs';
import {assignRole} from './journey-inputs.mjs';
import {startServer} from './server.mjs';
import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dir='docs/content/r15/regression/r1';await mkdir(dir,{recursive:true});
const sha=b=>createHash('sha256').update(b).digest('hex'),indexSha256=sha(await readFile('dist/index.html'));
const checks=[],errors=[],external=[],captures=[];
const state=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('emberline.campaign.v1')));
const step=(p,s)=>p.clock.runFor(s*1000);
// Native WebKit dialog cancellation settles on the UI event loop. Advance one
// virtual frame before the original exact closed-dialog / closed-book assertions.
async function snap(p,path){await p.screenshot({path});const b=await readFile(path);captures.push({path,sha256:sha(b),dimensions:[b.readUInt32BE(16),b.readUInt32BE(20)],state:await state(p)});}
async function geometry(p,label){
 assert.equal(await p.locator('#dispatch').evaluate(d=>d.scrollHeight<=d.clientHeight+1),true,`${label}: all planning controls must fit without scrolling`);const result=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight,targets:[...document.querySelectorAll('dialog[open] button,dialog[open] select')].map(e=>{const r=e.getBoundingClientRect();return {id:e.id,w:r.width,h:r.height};}).filter(t=>t.w>0&&t.h>0)}));
 assert.equal(result.overflow,false,label);for(const t of result.targets){assert.ok(t.w>=44&&t.h>=44,`${label} ${JSON.stringify(t)}`);const el=p.locator('#'+t.id);assert.equal(await el.evaluate(e=>{const r=e.getBoundingClientRect(),top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.x>=0&&r.right<=innerWidth+.5&&r.y>=0&&r.bottom<=innerHeight+.5&&(e===top||e.contains(top));}),true,`${label}: covered ${t.id}`);}checks.push({test:`${label}: planning controls fit, all >=44px and hittable`,status:'VERIFIED'});
}
async function open(p,url='http://127.0.0.1:4179'){p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(!r.url().startsWith(url))external.push(r.url());});await p.goto(url);await p.waitForFunction(()=>window.emberlineTelemetry?.().loaded);await p.clock.install();await p.clock.pauseAt(Date.now()+1000);}
async function plan(p,relayChoice,shoot){
 if(!await p.locator('#dispatch').evaluate(d=>d.open))await p.locator('#dispatch-open').click();let s=await state(p);
 if(relayChoice){assert.equal(await p.locator('#next').isDisabled(),true);await p.locator('#relay-'+relayChoice).click();await p.locator('#relay-depart').click();s=await state(p);assert.equal(s.relay[String(Math.floor(s.segment/3))],relayChoice);assert.equal(await p.locator('#relay-repair').count(),0);assert.match(await p.locator('.relay-receipt').innerText(),/不能再領/);}
 const watch=s.crew.rested??1;await assignRole(p,'watch',watch);s=await state(p);
 const driver=[0,1,2].filter(i=>i!==watch).sort((a,b)=>s.crew.fatigue[a]-s.crew.fatigue[b])[0];await assignRole(p,'driver',driver);
 s=await state(p);assert.equal(new Set(Object.values(s.crew.plan)).size,3);
 if(shoot)await snap(p,shoot);await p.locator('#dispatch-close').click();return s;
}
async function convoy(p){await p.keyboard.down('ArrowLeft');await step(p,.6);await p.keyboard.up('ArrowLeft');await p.keyboard.down('ArrowRight');await step(p,1.2);await p.keyboard.up('ArrowRight');let n=0;while((await state(p)).screen==='play'){assert.ok(++n<85);await step(p,1);const s=await state(p);if(s.screen!=='play')break;if(s.progress.enemies.some(e=>e.slot>=0&&e.state==='attack')&&s.progress.time>=s.progress.cooldown)await p.locator('#drift').click();}assert.equal((await state(p)).screen,'report');}
async function defense(p,engine){
 const preview=await p.locator('#contact-signal').innerText();await snap(p,`${dir}/${engine}-flank-${(await state(p)).segment}-preview.png`);assert.match(preview,/偵察/);assert.match(preview,/0 秒/);checks.push({test:`${engine}: chapter ${Math.floor((await state(p)).segment/3)+1} full raid preview`,preview,status:'VERIFIED'});
 // Decide using the same published forecast shown to the player.
 const cues=[...preview.matchAll(/(\d+) 秒 ((?:(?:西側|東側|中央) \d+ 隻)(?:＋(?:西側|東側|中央) \d+ 隻)?)/g)].map(m=>({at:Number(m[1]),side:m[2].startsWith('西側')?'west':m[2].startsWith('東側')?'east':'center'}));assert.equal(cues.length,3);
 await commitBait(p,'#bait-'+cues[0].side);await step(p,3);await snap(p,`${dir}/${engine}-flank-${(await state(p)).segment}-active.png`);const before=await state(p);await p.reload();await p.waitForFunction(()=>window.emberlineTelemetry?.().loaded);await p.locator('#resume').click();const after=await state(p);assert.equal(after.progress.defenseBatch,before.progress.defenseBatch);assert.equal(after.progress.serial,before.progress.serial);checks.push({test:`${engine}: exact raid cursor restored`,status:'VERIFIED'});
 let n=0;while((await state(p)).screen==='play'){assert.ok(++n<65);await step(p,1);const s=await state(p);if(s.screen!=='play')break;if(!s.progress.baitLeft){const cue=[...cues].reverse().find(x=>x.at<=s.progress.time)??cues[0];await commitBait(p,'#bait-'+cue.side);}}
 const end=await state(p);assert.equal(end.screen,'report');assert.ok(end.progress.attracted>=2);assert.equal(end.progress.defenseBatch,3);return end;
}
async function night(p,block){await p.locator('#breath').click();await p.locator('#window').click();const cue=await p.locator('#scene-message').innerText();await p.locator(cue.includes('玻璃')?'#seal-window':'#seal-roof').click();if(block){const s=await state(p);assert.equal(s.crew.shield,1);await p.locator('#brace').click();const after=await state(p);assert.equal(after.hull,s.hull);assert.equal(after.crew.shield,0);checks.push({test:'rested watcher absorbs exactly one real night impact',status:'VERIFIED'});}for(let i=block?1:0;i<3;i++){const signal=await nightSignal(p);await p.locator(signal.includes('玻璃')?'#counter-window':'#counter-roof').click();}assert.equal((await state(p)).screen,'report');}
for(const engine of ['chromium','webkit']){
 const server=engine==='webkit'?await startServer():null,url=server?.url??'http://127.0.0.1:4179';const browser=await ({chromium,webkit}[engine]).launch({headless:true,args:['--mute-audio']});
 try{
  const ctx=await browser.newContext({viewport:{width:430,height:932},deviceScaleFactor:3,hasTouch:true}),p=await ctx.newPage();await open(p,url);
  if(!await p.locator('#dispatch').evaluate(d=>d.open))await p.locator('#dispatch-open').click();await p.keyboard.press('Escape');await step(p,.08);assert.equal(await p.locator('#dispatch').evaluate(d=>d.open),false);assert.equal(await p.locator('#book').evaluate(d=>d.open),false);if(!await p.locator('#dispatch').evaluate(d=>d.open))await p.locator('#dispatch-open').click();for(const [w,h] of [[320,568],[390,844],[844,390],[1032,1376],[1376,1032],[1366,600],[1280,640]]){await p.setViewportSize({width:w,height:h});await geometry(p,`${engine} roster ${w}x${h}`);if(engine==='chromium')await snap(p,`${dir}/roster-${w}x${h}.png`);}await p.setViewportSize({width:430,height:932});await p.locator('#dispatch-close').click();
  await plan(p);await p.locator('#begin').click();
  for(let segment=0;segment<(engine==='chromium'?9:3);segment++){
   assert.equal((await state(p)).segment,segment);if(segment%3===0){const s=await state(p);assert.ok((await p.locator('#scene-label').innerText()).startsWith(['老席','熹','安'][s.crew.plan.driver]));}
   console.log(engine,'segment',segment,'hull',(await state(p)).hull);if(segment%3===0){await convoy(p);if(!await p.locator('#upgrade').isDisabled())await p.locator('#upgrade').click();}
   if(segment%3===1){await defense(p,engine);if(!await p.locator('#dispatch').evaluate(d=>d.open))await p.locator('#dispatch-open').click();await p.keyboard.press('Escape');await step(p,.08);assert.equal(await p.locator('#dispatch').evaluate(d=>d.open),false);assert.equal(await p.locator('#book').evaluate(d=>d.open),false);if(!await p.locator('#dispatch').evaluate(d=>d.open))await p.locator('#dispatch-open').click();for(const [w,h] of [[320,568],[844,390],[1032,1376],[1376,1032],[1366,600],[1280,640]]){await p.setViewportSize({width:w,height:h});await geometry(p,`${engine} relay ${w}x${h}`);if(engine==='chromium'&&segment===1)await snap(p,`${dir}/relay-${w}x${h}.png`);}await p.setViewportSize({width:430,height:932});await snap(p,`${dir}/${engine}-relay-${segment}-before-choice.png`);await p.locator('#dispatch-close').click();const pending=await state(p);await p.reload();await p.waitForFunction(()=>window.emberlineTelemetry?.().loaded);assert.equal((await state(p)).supplies,pending.supplies);assert.equal(await p.locator('#next').isDisabled(),true);}
   if(segment%3===2)await night(p,true);
   const report=await state(p);assert.equal(report.crew.history.length,segment+1);assert.equal(report.receipts.length,segment+1);
   if(segment===8){await p.locator('#next').click();break;}
   const choice=segment%3===1?(segment===4?'repair':'rescue'):undefined;
   const planned=await plan(p,choice,segment%3===1?`${dir}/${engine}-crew-${segment}-after-choice.png`:undefined);
   if(segment===1&&engine==='chromium'){
    if(!await p.locator('#dispatch').evaluate(d=>d.open))await p.locator('#dispatch-open').click();await snap(p,'docs/store/screenshots/phone-06-content-r1.png');await p.setViewportSize({width:1032,height:1376});await step(p,.08);await snap(p,'docs/store/screenshots/tablet-06-content-r1.png');
    // Tablet screenshot uses a separate DPR-2 context restored through the ordinary file chooser below.
    await p.setViewportSize({width:430,height:932});await p.locator('#dispatch-close').click();
   }
   const before=await state(p);await p.reload();await p.waitForFunction(()=>window.emberlineTelemetry?.().loaded);assert.deepEqual((await state(p)).crew,before.crew);assert.deepEqual((await state(p)).relay,before.relay);
   await p.locator('#next').click();assert.equal((await state(p)).crew.applied,segment+1);if(segment===1){assert.equal((await state(p)).crew.shield,1);checks.push({test:`${engine}: relay choice, saved roster and fatigue carry into the train`,status:'VERIFIED'});}assert.equal(new Set(Object.values(planned.crew.plan)).size,3);
  }
  if(engine==='chromium'){const ending=await state(p);assert.equal(ending.screen,'ending');assert.equal(ending.crew.history.length,9);assert.equal(Object.keys(ending.relay).length,3);await snap(p,`${dir}/ending.png`);await writeFile(`${dir}/normal-input-ending.json`,JSON.stringify(ending,null,2));}
  await p.evaluate(async()=>{await navigator.serviceWorker.ready;});await p.waitForFunction(()=>!!navigator.serviceWorker.controller);const durable=await state(p);if(server)await server.stop();else await ctx.setOffline(true);const offline=await ctx.newPage();await offline.goto(url);await offline.waitForFunction(()=>window.emberlineTelemetry?.().loaded);assert.deepEqual((await state(offline)).crew,durable.crew);assert.deepEqual((await state(offline)).relay,durable.relay);checks.push({test:`${engine}: offline reload retains crew and relay`,status:'VERIFIED'});await ctx.close();
  if(engine==='chromium'){
   const fixture=captures.find(r=>r.path.endsWith('chromium-crew-1-after-choice.png')).state;await writeFile(`${dir}/store-roster-fixture.json`,JSON.stringify(fixture,null,2));
   const tablet=await browser.newContext({viewport:{width:1032,height:1376},deviceScaleFactor:2,hasTouch:true}),t=await tablet.newPage();await open(t);await t.locator('#old-save').click();await t.locator('#source').selectOption('emberline');await t.locator('#legacy').setInputFiles(`${dir}/store-roster-fixture.json`);await t.locator('#confirm-import').click();await t.locator('#close').click();await t.locator('#dispatch-open').click();await step(t,.08);await snap(t,'docs/store/screenshots/tablet-06-content-r1.png');await tablet.close();
  }
 }catch(e){await writeFile('docs/content/r15/regression/r1/failure.txt',e.stack);throw e;}finally{await browser.close();if(server)await server.stop();}
}
assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
// Deduplicate the tablet preview record: final authoritative capture is DPR 2.
const finalCaptures=captures.filter((c,i)=>captures.findLastIndex(x=>x.path===c.path)===i);
for(const c of finalCaptures.filter(c=>c.path.includes('/screenshots/')))assert.deepEqual(c.dimensions,c.path.includes('phone-')?[1290,2796]:[2064,2752]);
await writeFile(`${dir}/receipt.json`,JSON.stringify({status:'VERIFIED',headless:true,stateInjection:false,clock:'Playwright virtual clock; all decisions through normal UI, not a real-time play-duration study',indexSha256,checks,captures:finalCaptures,errors,externalRequests:external},null,2));
console.log(`VERIFIED R1: ${checks.length} checks, nine normal-input segments, three carry choices, all roster saves; Chromium + WebKit`);
