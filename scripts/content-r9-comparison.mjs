import {chromium} from 'playwright';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const sha=b=>createHash('sha256').update(b).digest('hex'),before='docs/evidence/content-r9-before',after='docs/evidence/content-r9-after';
await mkdir(after,{recursive:true});
// The committed parent artifacts are immutable sources for the original before run.
const metadata=JSON.parse(await readFile(`${before}/source.json`,'utf8')),commit=metadata.sourceCommit;
const prior=JSON.parse(execFileSync('git',['show',`${commit}:docs/content/r7/receipt.json`],{encoding:'utf8',maxBuffer:30e6}));
const art=JSON.parse(execFileSync('git',['show',`${commit}:docs/art/compare/r5-after/captures.json`],{encoding:'utf8',maxBuffer:30e6}));
const fixtures={flank:art.records.find(c=>c.path.endsWith('/phone-bait.png')).state,relay:prior.captures.find(c=>c.path.endsWith('/phone-relay-69-rescue-selected.png')).state,crew:prior.captures.find(c=>c.path.endsWith('/phone-crew-preview.png')).state};
const b=await chromium.launch({headless:true}),records=[];
try{const ctx=await b.newContext({deviceScaleFactor:1}),p=await ctx.newPage();
for(const [name,f] of Object.entries(fixtures))for(const [view,width,height] of [['phone',430,932],['landscape',844,390],['tablet',1032,1376]]){
 await p.goto('http://127.0.0.1:4179');await p.waitForFunction(()=>window.emberlineTelemetry?.().loaded);await p.setViewportSize({width,height});
 await p.locator('#pause').click();await p.locator('[data-tab=import]').click();await p.locator('#source').selectOption('emberline');await p.locator('#legacy').setInputFiles({name:'comparison.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(f))});await p.locator('#confirm-import').click();assert.doesNotMatch(await p.locator('#import-note').innerText(),/格式不符/);await p.locator('#close').click();if(await p.locator('#resume').isVisible())await p.locator('#resume').click();if(name!=='flank')await p.locator('#dispatch-open').click();
 const path=`${after}/${view}-${name}.png`,old=`${before}/${view}-${name}.png`;await p.screenshot({path});const bytes=await readFile(path),previous=await readFile(old);assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],[width,height]);records.push({view,content:name,before:{path:old,sha256:sha(previous)},after:{path,sha256:sha(bytes)},dimensions:[width,height],fixture:f});if(await p.locator('#dispatch').evaluate(d=>d.open))await p.locator('#dispatch-close').click();
}await ctx.close();}finally{await b.close();}
await writeFile('docs/content/r9/comparison.json',JSON.stringify({status:'VERIFIED',headless:true,beforeVersion:'0.11.3',afterVersion:'0.11.4',indexSha256:sha(await readFile('dist/index.html')),captures:records},null,2));console.log('VERIFIED R9: same retained fixtures, nine native before/after pairs across three viewports');
