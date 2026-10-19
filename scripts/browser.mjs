import {commitBait} from './journey-inputs.mjs';
import {continueJourney} from './journey-inputs.mjs';
import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {startServer} from './server.mjs';
const out='docs/evidence',shots='docs/store/screenshots';await mkdir(out,{recursive:true});await mkdir(shots,{recursive:true});
const gameServer=await startServer(),url=gameServer.url;
const results=[],screenshots=[],errors=[],requests=[];
const sizes=[[320,568],[375,667],[390,844],[430,932],[844,390],[768,1024],[1024,768],[1032,1376],[1376,1032],[1366,600],[1280,640]];
async function state(page){return page.evaluate(()=>JSON.parse(localStorage.getItem('emberline.campaign.v1')));}
async function snap(page,path){await page.screenshot({path});const b=await readFile(path);screenshots.push({path,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length});}
async function hit(page,label){const geometry=await page.evaluate(()=>{const visible=Array.from(document.querySelectorAll('button,select,input')).filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&!e.closest('[hidden]')&&(!e.closest('dialog')||e.closest('dialog').open)&&(!document.querySelector('dialog[open]')||e.closest('dialog'));});return {overflow:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight,buttons:visible.map(e=>{const r=e.getBoundingClientRect(),top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {id:e.id||e.textContent.trim(),w:r.width,h:r.height,x:r.x,y:r.y,bottom:r.bottom,right:r.right,visible:r.x>=0&&r.y>=0&&r.right<=innerWidth+.5&&r.bottom<=innerHeight+.5,hit:e===top||e.contains(top)};})};});assert.equal(geometry.overflow,false,`${label}: overflow`);for(const b of geometry.buttons){assert.ok(b.w>=44&&b.h>=44,`${label}: target ${b.id} ${b.w}×${b.h}`);assert.ok(b.visible&&b.hit,`${label}: clipped/covered ${JSON.stringify(b)}`);}results.push({test:label,status:'VERIFIED',...geometry});}
async function responsive(page,label,all=true){for(const [width,height] of (all?sizes:[[430,932],[844,390],[1366,600]])){await page.setViewportSize({width,height});await page.clock.runFor(60);await hit(page,`${label}-${width}x${height}`);assert.deepEqual(await page.evaluate(()=>Array.from(document.images).filter(im=>im.getBoundingClientRect().width>0&&(!im.complete||im.naturalWidth===0)).map(im=>im.getAttribute('src'))),[],`${label}: visible art must load`);if(label==='convoy'&&width<=700)assert.doesNotMatch(await page.locator('#scene-message').innerText(),/方向鍵|空白鍵|A D/,'touch view must describe touch controls');}await page.setViewportSize({width:430,height:932});}
async function open(page){page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(url))requests.push(r.url());});await page.goto(url);await page.waitForFunction(()=>window.emberlineTelemetry?.().loaded);await page.clock.install({time:new Date('2026-10-16T06:20:00Z')});await page.clock.pauseAt(new Date('2026-10-16T06:21:00Z'));}
async function forward(page,seconds){await page.clock.runFor(seconds*1000);}
async function drive(page,capture=false){
 const initial=await state(page);console.log('escort start',JSON.stringify({segment:initial.segment,hull:initial.hull,level:initial.level,time:initial.progress.time}));
 await page.keyboard.down('ArrowLeft');await forward(page,.6);await page.keyboard.up('ArrowLeft');await page.keyboard.down('ArrowRight');await forward(page,1.2);await page.keyboard.up('ArrowRight');
 let steps=0;
 while((await state(page)).screen==='play'){
  await forward(page,1);const s=await state(page);steps++;assert.ok(steps<85,'convoy must finish or lose within documented limit');if(s.screen!=='play')break;
  const latched=s.progress.enemies.filter(e=>e.slot>=0&&e.state==='attack').length;
  if((latched>=2||(latched>=1&&s.hull<55))&&s.progress.time>=s.progress.cooldown){const target=await page.locator('#drift').boundingBox();assert.ok(target);await page.mouse.click(target.x+target.width/2,target.y+target.height/2);assert.ok((await state(page)).progress.flung>s.progress.flung,'real pointer drift must fling actual latched enemies');if(capture){await snap(page,`${out}/convoy-fling.png`);capture=false;}}
 }
 const s=await state(page);console.log('escort outcome',JSON.stringify({segment:s.segment,hull:s.hull,level:s.level,time:s.progress.time,flung:s.progress.flung,screen:s.screen}));if(s.screen!=='report')await writeFile(`${out}/last-campaign-failure.json`,JSON.stringify(s,null,2));assert.equal(s.screen,'report','convoy must survive normal steering + drift');assert.ok(s.progress.flung>=2,'signature was actually executed');return s;
}
async function defend(page){await commitBait(page,'#bait-center');let n=0;while((await state(page)).screen==='play'){await forward(page,1);const s=await state(page);if(s.screen!=='play')break;if(s.progress.baitLeft===0&&s.supplies>0)await commitBait(page,'#bait-center');assert.ok(++n<65);}const s=await state(page);assert.equal(s.screen,'report');assert.ok(s.progress.attracted>=2);return s;}
async function night(page,shotPrefix){await page.locator('#breath').click();await page.locator('#window').click();const message=await page.locator('#scene-message').innerText();await page.locator(message.includes('玻璃')?'#seal-window':'#seal-roof').click();if(shotPrefix)await snap(page,shotPrefix);for(let n=0;n<3;n++){await forward(page,.2);
  // Use visible text/canvas accessible signal, never the hidden engine threat selector.
  const actual=await page.locator('#contact-signal').innerText();
  await page.locator(actual.includes('玻璃')?'#counter-window':'#counter-roof').click();
 }const s=await state(page);assert.equal(s.screen,'report');assert.equal(s.progress.countered,3);return s;}

for(const engine of ['chromium','webkit']){
 const browser=await ({chromium,webkit}[engine]).launch({headless:true});
 try {
 const context=await browser.newContext({viewport:{width:430,height:932},deviceScaleFactor:3,hasTouch:true});const page=await context.newPage();await open(page);
 if(engine==='chromium'){await snap(page,`${shots}/phone-01-departure.png`);await responsive(page,'intro');}
 await page.locator('#begin').click();if(engine==='chromium'){await responsive(page,'convoy');await snap(page,`${shots}/phone-02-convoy.png`);}
 // Pause must freeze real simulation and keep a single resume route.
 await page.locator('#pause').click();const frozen=await state(page);await forward(page,2);assert.deepEqual((await state(page)).progress,frozen.progress);await hit(page,`${engine}-pause`);
 if(engine==='chromium')for(const tab of ['settings','import','journal']){await page.locator(`[data-tab="${tab}"]`).click();await responsive(page,`book-${tab}`);}
 await page.locator('#return').click();const returned=await state(page);await forward(page,2);assert.deepEqual((await state(page)).progress,returned.progress,'return cover must remain paused until manual resume');await page.locator('#resume').click();const convoy=await drive(page,engine==='chromium');
 assert.ok(convoy.people>3);assert.ok(convoy.supplies>8);const people=convoy.people;
 await page.locator('#upgrade').click();assert.equal((await state(page)).level,1);assert.equal((await state(page)).supplies,convoy.supplies-4);
 await continueJourney(page);if(engine==='chromium'){await responsive(page,'defense');await snap(page,`${shots}/phone-03-bait.png`);}
 assert.equal((await state(page)).people,people);const supply=(await state(page)).supplies;await commitBait(page,'#bait-west');assert.equal((await state(page)).supplies,supply-1);await forward(page,12.1);const defense=await defend(page);assert.equal(defense.people,people);
 if(await page.locator('#dispatch').evaluate(d=>d.open))await page.locator('#dispatch-close').click();if(engine==='chromium')await snap(page,`${shots}/phone-04-common-progress.png`);
 await continueJourney(page);if(engine==='chromium')await responsive(page,'train-observe');
 await page.locator('#breath').click();await page.locator('#window').click();const ev=await page.locator('#scene-message').innerText();await page.locator(ev.includes('玻璃')?'#seal-window':'#seal-roof').click();
 if(engine==='chromium'){await responsive(page,'train-counters');await snap(page,`${shots}/phone-05-night.png`);}
 const before=await state(page);await page.reload();await page.waitForFunction(()=>window.emberlineTelemetry?.().loaded);await page.locator('#resume').click();const after=await state(page);for(const k of ['supplies','people','level','segment','hull'])assert.equal(after[k],before[k]);assert.deepEqual(after.receipts,before.receipts);assert.equal(after.progress.wave,1);assert.equal(after.progress.started,true);
 for(let i=0;i<3;i++){const cue=await page.locator('#contact-signal').innerText();await page.locator(cue.includes('玻璃')?'#counter-window':'#counter-roof').click();}
 const firstChapter=await state(page);assert.equal(firstChapter.screen,'report');assert.equal(firstChapter.progress.countered,3);assert.equal(firstChapter.receipts.length,3);console.log(`${engine}: first chapter and reload verified`);
 // Chromium completes all three chapters through ordinary controls; WebKit covers the first cycle.
 if(engine==='chromium'){
 for(let chapter=1;chapter<3;chapter++){await continueJourney(page);await drive(page);if(!(await page.locator('#upgrade').isDisabled()))await page.locator('#upgrade').click();await continueJourney(page);await defend(page);await continueJourney(page);await night(page);}
  await continueJourney(page);assert.equal((await state(page)).screen,'ending');assert.equal((await state(page)).receipts.length,9);await snap(page,`${out}/ending.png`);
 }
 results.push({test:`${engine}-normal-input-campaign`,status:'VERIFIED',segments:engine==='chromium'?9:3,people:firstChapter.people,countered:firstChapter.progress.countered});
 // Offline fresh tab (not reload cache), retaining the same durable campaign.
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.waitForFunction(()=>!!navigator.serviceWorker.controller);const savedState=await state(page);if(engine==='webkit')await gameServer.stop();else await context.setOffline(true);const offline=await context.newPage();await offline.goto(url);await offline.waitForFunction(()=>window.emberlineTelemetry?.().loaded);assert.equal((await state(offline)).segment,savedState.segment);assert.equal((await state(offline)).supplies,savedState.supplies);results.push({test:`${engine}-offline-new-tab`,status:'VERIFIED',method:engine==='webkit'?'HTTP server stopped and all its sockets closed':'browser transport offline'});if(engine==='chromium')await context.setOffline(false);
 await context.close();
 // Tablet store images, obtained from a normal fresh campaign.
 if(engine==='chromium'){
  const tablet=await browser.newContext({viewport:{width:1032,height:1376},deviceScaleFactor:2,hasTouch:true});const p=await tablet.newPage();await open(p);await snap(p,`${shots}/tablet-01-departure.png`);await p.locator('#begin').click();await snap(p,`${shots}/tablet-02-convoy.png`);await drive(p);await continueJourney(p);await snap(p,`${shots}/tablet-03-bait.png`);await defend(p);await snap(p,`${shots}/tablet-04-common-progress.png`);await continueJourney(p);await p.locator('#breath').click();await p.locator('#window').click();const cue=await p.locator('#scene-message').innerText();await p.locator(cue.includes('玻璃')?'#seal-window':'#seal-roof').click();await snap(p,`${shots}/tablet-05-night.png`);const contact=await state(p);await forward(p,contact.progress.warning+.1);const expired=await state(p);assert.equal(expired.progress.wave,2);assert.equal(expired.progress.impacts,1);assert.equal(expired.hull,contact.hull-7);results.push({test:'natural contact expiry applies one impact and advances through normal runtime',status:'VERIFIED'});await tablet.close();
 }
 } catch(e){await writeFile(`${out}/browser-failure-${engine}.txt`,e.stack);throw e;} finally {await browser.close();}
}
assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
assert.equal(createHash('sha256').update(await readFile('dist/index.html')).digest('hex'),gameServer.indexSha256,'build changed during browser run');
await gameServer.stop();
// R4 store journey keeps the same ordinary-input proofs and waits for readable action.
const {captureR5Store}=await import('./art-r5-store.mjs');
for(const shot of await captureR5Store()){const i=screenshots.findIndex(s=>s.path===shot.path);assert.ok(i>=0);screenshots[i]=shot;}
await writeFile(`${out}/browser.json`,JSON.stringify({status:'VERIFIED',headless:true,stateInjection:false,indexSha256:gameServer.indexSha256,results,errors,externalRequests:requests},null,2));await writeFile(`${shots}/manifest.json`,JSON.stringify({status:'VERIFIED',indexSha256:gameServer.indexSha256,screenshots},null,2));
console.log(`VERIFIED: ${results.length} browser cases; ${screenshots.length} screenshots; no runtime errors or external requests`);
