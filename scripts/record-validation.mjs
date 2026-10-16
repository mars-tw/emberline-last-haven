import {spawnSync} from 'node:child_process';
import {writeFile,readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const commands=[
 ['typecheck',process.execPath,['node_modules/typescript/bin/tsc','--noEmit']],
 ['unit',process.execPath,['node_modules/vitest/vitest.mjs','run','--reporter=default','--reporter=json','--outputFile=docs/evidence/unit-tests.json']],
 ...['test-r86-convoy-latch.js','test-rules.js','test-economy.js'].map(f=>[f,process.execPath,['vendor/ashes/scripts/'+f]]),
 ['storm-source',process.execPath,['scripts/source-tests.mjs']],
 ['animation','python',['scripts/art-check.py']],
 ['build',process.execPath,['node_modules/vite/bin/vite.js','build']],
 ['precache',process.execPath,['scripts/precache.mjs']]
];
const results=[];for(const [name,bin,args] of commands){const r=spawnSync(bin,args,{encoding:'utf8'});results.push({name,command:[bin,...args].join(' '),exitCode:r.status,stdout:r.stdout,stderr:r.stderr});if(r.status!==0){await writeFile('docs/evidence/validation.json',JSON.stringify({status:'BLOCKED',results},null,2));process.stderr.write(r.stderr);process.exit(r.status??1);}console.log(`VERIFIED ${name}`);}
const bundle=[];for(const f of await readdir('dist/assets')){const p='dist/assets/'+f,b=await readFile(p);bundle.push({path:p,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')});}
await writeFile('docs/evidence/validation.json',JSON.stringify({status:'VERIFIED',headless:true,results,bundle},null,2));
