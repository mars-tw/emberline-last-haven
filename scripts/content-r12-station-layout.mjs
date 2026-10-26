import {chromium} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {open,restore,step,sha} from './content-r10-comparison.mjs';
const prior=JSON.parse(await readFile('docs/art/compare/r5-after/captures.json','utf8'));
const cases=['bait','defense-active','defense-crowd','common-progress'];
const browser=await chromium.launch({headless:true,args:['--mute-audio']}),checks=[];
try{const p=await browser.newPage();await open(p,'http://127.0.0.1:4179');for(const [width,height] of [[320,568],[360,800],[390,844],[430,932],[844,390],[768,1024],[1032,1376],[1366,600],[1920,1080]]){await p.setViewportSize({width,height});let baseline;for(const name of cases){const row=prior.records.find(r=>r.path.endsWith('/phone-'+name+'.png'));assert.ok(row,name);await restore(p,row.state);await step(p,.02);const box=await p.locator('#world').boundingBox();assert.ok(box.height>=40,`${width}x${height} playable field ${box.height}`);if(baseline)assert.deepEqual(box,baseline,`${width}x${height} ${name} same physical battlefield`);else baseline=box;checks.push({viewport:[width,height],scene:name,canvas:box,status:'VERIFIED'});}}}finally{await browser.close();}
await writeFile('docs/content/r15/regression/r12/station-layout.json',JSON.stringify({status:'VERIFIED',indexSha256:sha(await readFile('dist/index.html')),checks},null,2));console.log(`VERIFIED ${checks.length} station checks, exact canvas bounds before/during/after defense, minimum40px`);
