import {continueJourney} from './journey-inputs.mjs';
import {chromium} from 'playwright';
import {readFile,writeFile,mkdir,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const dir='docs/evidence/deep-r1-after';await mkdir(dir,{recursive:true});const diagnosticDir='docs/content/r15/regression/r11/regression/deep-r1';await mkdir(diagnosticDir,{recursive:true});
const b=await chromium.launch({headless:true,args:['--mute-audio']}),loads=[],checks=[],errors=[];
const state=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('emberline.campaign.v1')));
try{
 for(let run=0;run<3;run++){
  const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true}),p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
  const start=performance.now();await p.goto('http://127.0.0.1:4179');await p.waitForFunction(()=>window.emberlineTelemetry?.().loaded);const ready=performance.now()-start;
  await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  loads.push({run:run+1,criticalReadyMs:ready,offlineReadyMs:performance.now()-start,resources:await p.evaluate(()=>performance.getEntriesByType('resource').map(r=>({name:new URL(r.name).pathname,duration:r.duration,transferSize:r.transferSize,decodedBodySize:r.decodedBodySize}))),loadedImages:await p.evaluate(()=>window.emberlineTelemetry().artPaths.length)});
  if(run===0){
   await p.locator('#begin').click();await p.clock.install();await p.clock.pauseAt(Date.now()+1000);
   const left=await p.locator('#left').elementHandle(),box=await p.locator('#left').boundingBox();await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();
   await p.clock.runFor(350);await p.evaluate(()=>document.activeElement.blur());await p.keyboard.press('Space');
   assert.equal(await left.evaluate(el=>el===document.getElementById('left')),true,'log update preserves held DOM node');await p.clock.runFor(750);const x=(await state(p)).progress.x;assert.ok(x<170);
   await p.mouse.move(1,1);await p.mouse.up();await p.clock.runFor(1200);assert.equal((await state(p)).progress.x,x,'release outside captured button stops steering');checks.push('held steering survives action log render and release outside stops it');
   await p.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal(await p.locator('#controls').evaluate(e=>e.inert),true);const frozen=await state(p);await p.locator('#drift').dispatchEvent('click');await p.clock.runFor(1000);assert.deepEqual((await state(p)).progress,frozen.progress);await p.locator('#resume').click();checks.push('background pause blocks footer and simulation until explicit resume');
   for(let n=0;(await state(p)).screen==='play';n++){
    assert.ok(n<85);await p.clock.runFor(1000);const s=await state(p);if(s.screen!=='play')break;
    if(s.progress.enemies.some(e=>e.slot>=0&&e.state==='attack')&&s.progress.time>=s.progress.cooldown)await p.locator('#drift').click();
   }
   assert.equal((await state(p)).screen,'report');assert.match(await p.locator('#timer').innerText(),/補給 \+/);const s=await state(p);assert.ok((await p.locator('#story').innerText()).includes(`補給 +${s.reward}`));checks.push('earned supply stays visible in timer and compact report');
   await p.evaluate(()=>window.dispatchEvent(new Event('blur')));await continueJourney(p);assert.equal(await p.evaluate(()=>window.emberlineTelemetry().paused),false);checks.push('report can advance after background without a hidden pause softlock');assert.equal(await p.locator('#timer').innerText(),'選落點後開始');const supply=(await state(p)).supplies;
   const canvas=await p.locator('#world').boundingBox(),scale=Math.min(canvas.width/360,canvas.height/560),ox=(canvas.width-360*scale)/2,oy=(canvas.height-560*scale)/2;
   await p.mouse.click(canvas.x+ox+75*scale,canvas.y+oy+280*scale);await p.clock.runFor(200);
   assert.equal((await state(p)).supplies,supply,'device preview must not spend');assert.equal((await state(p)).progress.started,false);assert.equal(await p.locator('#bait-cancel').isVisible(),true);
   await p.mouse.click(canvas.x+ox+75*scale,canvas.y+oy+280*scale);await p.clock.runFor(200);
   assert.equal((await state(p)).supplies,supply-1);assert.equal((await state(p)).progress.started,true);assert.equal(await p.locator('#bait-west').innerText(),'西側生效・剩12秒');assert.equal(await p.locator('#bait-west').getAttribute('data-bait-state'),'active');assert.match(await p.locator('#contact-signal').innerText(),/誘餌剩 \d+ 秒/);assert.doesNotMatch((await p.locator('#controls').innerText()).replace(await p.locator('#bait-west').innerText(),'').replaceAll('每12秒1補給',''),/秒/);
   await p.mouse.click(canvas.x+ox+75*scale,canvas.y+oy+280*scale);assert.equal((await state(p)).supplies,supply-1);checks.push('tap actual west bait device with four real targets previews free, confirms defense once; cooldown does not double-spend');
   await p.screenshot({path:`${diagnosticDir}/direct-bait-and-cooldown.png`});
  }
  await ctx.close();
 }
 const bad=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),p=await bad.newPage();await p.route('**/art/r5/train.webp',r=>r.abort());await p.goto('http://127.0.0.1:4179');await p.getByRole('heading',{name:'行車素材尚未就緒'}).waitFor();assert.ok(await p.locator('#begin').isDisabled());
 const retry=await p.getByRole('button',{name:'重新載入'}).boundingBox();assert.ok(retry.width>=44&&retry.height>=44);await p.screenshot({path:`${diagnosticDir}/asset-failure-retry.png`});checks.push('failed required art blocks start and presents accessible reload');await bad.close();
}finally{await b.close();}
assert.deepEqual(errors,[]);
let bytes=0,files=0;async function size(dir){for(const f of await readdir(dir,{withFileTypes:true})){const p=`${dir}/${f.name}`;if(f.isDirectory())await size(p);else{bytes+=(await stat(p)).size;files++;}}}await size('dist');
await writeFile(`${dir}/receipt.json`,JSON.stringify({status:'VERIFIED',headless:true,stateInjection:false,diagnosticCaptureDir:diagnosticDir,indexSha256:createHash('sha256').update(await readFile('dist/index.html')).digest('hex'),checks,errors,coldLoad:loads,criticalReadyMedianMs:[...loads.map(l=>l.criticalReadyMs)].sort((a,b)=>a-b)[1],offlineReadyMedianMs:[...loads.map(l=>l.offlineReadyMs)].sort((a,b)=>a-b)[1],measurementScope:'Fresh isolated browser contexts on localhost, shared Windows host; not network or physical-device estimates',webBundle:{bytes,files},nativeIPA:null,nativeAAB:null},null,2));console.log('VERIFIED deep R1 controls, direct bait, reward, loading failure, cold load and bundle');
