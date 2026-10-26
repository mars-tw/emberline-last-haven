import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {open,restore,step,sha} from './content-r10-comparison.mjs';
const dir='docs/evidence/content-r12/after',r=JSON.parse(await readFile('docs/content/r15/regression/r12/receipt.json','utf8')),after=[],before=[],errors=[],external=[];
await mkdir(dir,{recursive:true});const browser=await chromium.launch({headless:true,args:['--mute-audio']});
const cases=[['flank','flank-4-of-4-exit'],['relay','relay-95-details'],['watch','crew-roof-blocked']];
try{for(const [width,height,dpr] of [[430,932,3],[844,390,1],[1032,1376,2]]){const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:true}),p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('request',q=>{if(!q.url().startsWith('http://127.0.0.1:4179'))external.push(q.url());});await open(p,'http://127.0.0.1:4179');for(const [name,suffix] of cases){
 const oldPath=`docs/content/r15/regression/r11/after/${width}-${name}.png`,oldBytes=await readFile(oldPath);before.push({path:oldPath,sha256:sha(oldBytes),dimensions:[oldBytes.readUInt32BE(16),oldBytes.readUInt32BE(20)],sourceKind:'byte-identical historical R11 comparison input, not R12 execution'});
 const capture=r.captures.find(c=>c.path.endsWith(`/phone-${suffix}.png`));assert.ok(capture,suffix);const f=structuredClone(capture.state);f.progress=structuredClone(capture.telemetry.liveProgress);await restore(p,f);
 if(name==='relay'){await p.locator('#dispatch-open').click();await p.locator('#relay-repair').click();await p.locator('.repair-details summary').click();}
 await step(p,.02);const path=`${dir}/${width}-${name}.png`;await p.screenshot({path});const b=await readFile(path);assert.deepEqual([b.readUInt32BE(16),b.readUInt32BE(20)],[width*dpr,height*dpr]);after.push({path,sha256:sha(b),dimensions:[width*dpr,height*dpr],viewport:[width,height],sourceKind:'R12 same-frame checkpoint from durable campaign plus read-only progress telemetry; normal product file import and controls; virtual clock'});
 }await ctx.close();}}finally{await browser.close();}
assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
await writeFile('docs/content/r15/regression/r12/comparison-before-3views.json',JSON.stringify({status:'VERIFIED',records:before},null,2));
await writeFile('docs/content/r15/regression/r12/comparison-after.json',JSON.stringify({status:'VERIFIED',indexSha256:sha(await readFile('dist/index.html')),records:after,errors,externalRequests:external},null,2));console.log('VERIFIED R12 three systems × three viewports,9 new originals and9 labelled historical references');
