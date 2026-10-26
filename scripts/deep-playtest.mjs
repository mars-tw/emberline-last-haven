import {nightSignal} from './journey-inputs.mjs';
import {commitBait} from './journey-inputs.mjs';
import {continueJourney} from './journey-inputs.mjs';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const phase=process.argv[2]??'before',dir=`docs/evidence/deep-r1-${phase}`;
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--mute-audio']}),context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true}),page=await context.newPage();
const events=[],errors=[],start=Date.now();let lastStage='',lastShot=-1,lastSteer=0;
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:4179');await page.waitForFunction(()=>window.emberlineTelemetry?.().loaded);
 await page.locator('#begin').click();
 while(Date.now()-start<600000){
  const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('emberline.campaign.v1'))),t=(Date.now()-start)/1000;
  const stage=`${s.segment}:${s.screen}`;
  if(stage!==lastStage){events.push({seconds:t,stage,hull:s.hull,supplies:s.supplies,people:s.people,report:s.lastReport,log:s.log.at(-1)});console.log(JSON.stringify(events.at(-1)));lastStage=stage;}
  const minute=Math.floor(t/60);if(minute!==lastShot){await page.screenshot({path:`${dir}/minute-${minute}.png`});lastShot=minute;}
  if(s.screen==='stranded'){await page.locator('#retry').click();}
  else if(s.screen==='report'){
   await page.waitForTimeout(3500);
   if(s.level<3&&s.supplies>=12)await page.locator('#upgrade').click();
   await continueJourney(page);
  }else if(s.screen==='ending'){
   // Keep the real elapsed review window: inspect journey and settings, no save injection.
   await page.locator('#view-book').click();await page.waitForTimeout(5000);await page.locator('[data-tab="settings"]').click();await page.waitForTimeout(4000);await page.locator('#close').click();
  }else if(s.screen==='play'&&s.segment%3===0){
   const n=s.progress.enemies.filter(e=>e.slot>=0&&e.state==='attack').length;
   if((n>=2||(n&&s.hull<45))&&s.progress.time>=s.progress.cooldown)await page.locator('#drift').click();
   if(t-lastSteer>12){const b=page.locator(Math.floor(t/12)%2?'#left':'#right'),r=await b.boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.waitForTimeout(280);await page.mouse.up();lastSteer=t;}
  }else if(s.screen==='play'&&s.segment%3===1){
   if(s.progress.baitLeft<=0&&s.supplies>0)await commitBait(page,'#bait-center');
   else if(!s.progress.started)await page.locator('#defend').click();
  }else if(s.screen==='play'){
   if(!s.progress.started){await page.locator('#breath').click();await page.waitForTimeout(2500);await page.locator('#window').click();await page.waitForTimeout(2500);const cue=await page.locator('#scene-message').innerText();await page.locator(cue.includes('玻璃')?'#seal-window':'#seal-roof').click();}
   else if(s.progress.warning<10){const cue=await nightSignal(page);await page.locator(s.supplies<2?'#brace':cue.includes('玻璃')?'#counter-window':'#counter-roof').click();}
  }
  await page.waitForTimeout(700);
 }
 const final=await page.evaluate(()=>JSON.parse(localStorage.getItem('emberline.campaign.v1')));
 assert.deepEqual(errors,[]);await page.screenshot({path:`${dir}/minute-10.png`});
 await writeFile(`${dir}/receipt.json`,JSON.stringify({status:'VERIFIED',headless:true,clockAcceleration:false,stateInjection:false,startedAt:new Date(start).toISOString(),elapsedSeconds:(Date.now()-start)/1000,events,errors,final},null,2));
}finally{await context.close();await browser.close();}
