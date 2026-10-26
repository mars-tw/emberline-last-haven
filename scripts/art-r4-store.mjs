import {commitBait} from './journey-inputs.mjs';
import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {startServer} from './server.mjs';
export async function captureR4Store(){
 const server=await startServer(),browser=await chromium.launch({headless:true,args:['--mute-audio']}),screenshots=[],errors=[];
 const dir='docs/store/screenshots';await mkdir('docs/evidence/art-r4',{recursive:true});
 try{
  for(const [label,width,height,dpr] of [['phone',430,932,3],['tablet',1032,1376,2]]){
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:true}),p=await context.newPage();
   p.on('pageerror',e=>errors.push(e.message));await p.goto(server.url);await p.waitForFunction(()=>window.emberlineTelemetry?.().loaded);
   await p.clock.install({time:new Date('2026-10-18T06:20:00Z')});await p.clock.pauseAt(new Date('2026-10-18T06:21:00Z'));
   const state=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('emberline.campaign.v1'))),step=s=>p.clock.runFor(s*1000);
   async function shot(name){
    const path=`${dir}/${label}-${name}.png`;await p.screenshot({path});const b=await readFile(path);
    const telemetry=await p.evaluate(()=>{const t=window.emberlineTelemetry();delete t.frames;return t;});
    const route=await p.evaluate(()=>{const route=document.querySelector('.route'),node=route.querySelector('[data-active=true]'),r=route.getBoundingClientRect(),a=node.getBoundingClientRect();return {beamWidth:parseFloat(getComputedStyle(route).getPropertyValue('--beam-width')),expected:r.right-16-a.x-a.width/2,opacity:getComputedStyle(route,'::after').opacity,ticketHeight:document.querySelector('.ticket').getBoundingClientRect().height};});
    assert.ok(Math.abs(route.beamWidth-route.expected)<1);assert.equal(route.opacity,'1');
    screenshots.push({path,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length,dimensions:[b.readUInt32BE(16),b.readUInt32BE(20)],state:await state(),telemetry,route});
   }
   await step(.08);await shot('01-departure');await p.locator('#begin').click();
   // Wait for actual simultaneous latches. Never add cosmetic enemies or alter a save.
   let s,n=0;
   do{await step(.2);s=await state();assert.ok(++n<100&&s.screen==='play','three natural climbers must be reached while surviving');}while(s.progress.enemies.filter(e=>e.slot>=0&&e.state==='attack').length<3);
   // Durable campaign snapshots update once/second. Read live render frames to
   // catch the 60ms impact window, without exposing or mutating engine state.
   for(let i=0;!await p.evaluate(()=>window.emberlineTelemetry().actors.some(a=>a.path==='r4/climber-attack.png'&&a.frame===2));i++){assert.ok(i<50);await step(.02);s=await state();}
   await shot('02-convoy');assert.ok(s.progress.enemies.some(e=>e.slot%2===0)&&s.progress.enemies.some(e=>e.slot%2===1)&&s.progress.enemies.some(e=>e.slot>=2));
   assert.ok(screenshots.at(-1).telemetry.actors.some(a=>a.path==='r4/climber-attack.png'&&a.frame===2),'store screenshot captures a real attack impact frame');
   await p.locator('#drift').click();await step(.12);await p.screenshot({path:`docs/evidence/art-r4/${label}-fling.png`});
   for(let i=0;(await state()).screen==='play';i++){
    assert.ok(i<85);await step(1);s=await state();if(s.screen!=='play')break;
    if(s.progress.enemies.some(e=>e.slot>=0&&e.state==='attack')&&s.progress.time>=s.progress.cooldown)await p.locator('#drift').click();
   }
   assert.equal((await state()).screen,'report');await p.locator('#next').click();await step(.08);await shot('03-bait');
   await commitBait(p,'#bait-center');await step(4);await p.screenshot({path:`docs/evidence/art-r4/${label}-attack.png`});
   for(let i=0;(await state()).screen==='play';i++){
    assert.ok(i<65);await step(1);s=await state();if(s.screen!=='play')break;
    if(!s.progress.baitLeft&&s.supplies)await commitBait(p,'#bait-center');
   }
   assert.equal((await state()).screen,'report');await shot('04-common-progress');await p.locator('#next').click();
   await p.locator('#breath').click();await p.locator('#window').click();const cue=await p.locator('#scene-message').innerText();await p.locator(cue.includes('玻璃')?'#seal-window':'#seal-roof').click();await step(.12);await shot('05-night');
   await context.close();
  }
 }finally{await browser.close();await server.stop();}
 assert.deepEqual(errors,[]);await writeFile('docs/evidence/art-r4/store-captures.json',JSON.stringify({status:'VERIFIED',headless:true,stateInjection:false,indexSha256:server.indexSha256,screenshots,errors},null,2));return screenshots;
}
if(process.argv[1]?.endsWith('art-r4-store.mjs'))await captureR4Store();
