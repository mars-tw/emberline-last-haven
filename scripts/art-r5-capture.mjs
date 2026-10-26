import {commitBait} from './journey-inputs.mjs';
import {continueJourney} from './journey-inputs.mjs';
import {chromium} from 'playwright';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const phase=process.argv[2]??'after',dir=`docs/art/compare/r5-${phase}`;
await mkdir(dir,{recursive:true});
const sha=b=>createHash('sha256').update(b).digest('hex'),indexSha256=sha(await readFile('dist/index.html'));
const browser=await chromium.launch({headless:true,args:['--mute-audio']}),records=[],errors=[];
const sizes=[['small',320,568],['narrow',360,800],['phone',390,844],['tablet',1032,1376],['landscape',844,390],['desktop',1366,600],['wide',1920,1080]];
try{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true}),p=await context.newPage();
 p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4179');await p.waitForFunction(()=>window.emberlineTelemetry?.().loaded);await p.clock.install({time:new Date('2026-10-18T06:20:00Z')});await p.clock.pauseAt(new Date('2026-10-18T06:21:00Z'));
 const state=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('emberline.campaign.v1'))),step=s=>p.clock.runFor(s*1000);
 async function shot(scene){
  for(const [label,width,height] of sizes){
   await p.setViewportSize({width,height});await step(.08);
   const path=`${dir}/${label}-${scene}.png`;await p.screenshot({path});
   const visual=await p.evaluate(()=>({telemetry:window.emberlineTelemetry(),contact:(()=>{const r=document.getElementById('contact-signal').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})(),canvas:(()=>{const r=document.getElementById('world').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})(),ticket:(()=>{const t=document.querySelector('.ticket'),r=t.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,scroll:t.scrollHeight,client:t.clientHeight,text:['title','story'].map(id=>{const e=document.getElementById(id),r=e.getBoundingClientRect();return {id,text:e.textContent,x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height,scroll:e.scrollHeight,client:e.clientHeight};})};})(),beam:getComputedStyle(document.querySelector('.route'),'::after').content,primary:[...document.querySelectorAll('footer button.primary')].map(e=>e.id)}));
   delete visual.telemetry.frames;
   records.push({path,sha256:sha(await readFile(path)),viewport:{width,height},state:await state(),visual});
  }
  await p.setViewportSize({width:390,height:844});await step(.08);
 }
 await shot('departure');await p.locator('#begin').click();await step(4);await shot('convoy');
 for(let n=0;(await state()).screen==='play';n++){
  assert.ok(n<85);await step(1);const s=await state();if(s.screen!=='play')break;
  const latched=s.progress.enemies.filter(e=>e.slot>=0&&e.state==='attack').length;
  if((latched>=2||(latched&&s.hull<55))&&s.progress.time>=s.progress.cooldown)await p.locator('#drift').click();
 }
 assert.equal((await state()).screen,'report');await continueJourney(p);await shot('bait');
 // R4: divert the first west group, then the final center group; reach the real two-group goal.
 await commitBait(p,'#bait-west');await step(4);await shot('defense-active');
 let crowdCaptured=false;
 for(let n=0;(await state()).screen==='play';n++){
  assert.ok(n<65);await step(1);const s=await state();if(s.screen!=='play')break;
  const visibleEnemies=await p.evaluate(()=>window.emberlineTelemetry().actors.filter(a=>a.id.startsWith('enemy')).length);
  if(!crowdCaptured&&s.progress.time>=30&&visibleEnemies>=7&&visibleEnemies<=9){await shot('defense-crowd');crowdCaptured=true;}
  if(!s.progress.baitLeft&&s.supplies)await commitBait(p,'#bait-center');
 }
 assert.equal(crowdCaptured,true,'retain the seven-to-nine-enemy art stress case before full-group exit');
 assert.equal((await state()).screen,'report');if(await p.locator('#dispatch').evaluate(d=>d.open))await p.locator('#dispatch-close').click();await shot('common-progress');await continueJourney(p);
 await p.locator('#breath').click();await p.locator('#window').click();const cue=await p.locator('#scene-message').innerText();await p.locator(cue.includes('玻璃')?'#seal-window':'#seal-roof').click();await shot('night');
 await p.locator('#pause').click();await shot('journal');await context.close();
}finally{await browser.close();}
assert.deepEqual(errors,[]);assert.equal(sha(await readFile('dist/index.html')),indexSha256);
await writeFile(`${dir}/captures.json`,JSON.stringify({status:'VERIFIED',headless:true,stateInjection:false,indexSha256,records,errors},null,2));
console.log(`VERIFIED ${records.length} R5 ${phase} captures`);
