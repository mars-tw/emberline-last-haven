import {spawnSync} from 'node:child_process';
import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('vendor/storm/docs/evidence/r25-store',{recursive:true});
const r=spawnSync(process.execPath,['scripts/test-r25-rules.mjs'],{cwd:'vendor/storm',encoding:'utf8'});
process.stdout.write(r.stdout);process.stderr.write(r.stderr);
if(r.status!==0)process.exit(r.status??1);
await copyFile('vendor/storm/docs/evidence/r25-store/r25-rules.json','docs/evidence/storm-original-rules.json');
