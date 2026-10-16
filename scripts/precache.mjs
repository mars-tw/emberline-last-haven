import {readdir,writeFile,readFile,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
async function walk(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())out.push(...await walk(p));else if(!p.endsWith('/sw.js'))out.push(p);}return out;}
await copyFile('CREDITS.md','dist/CREDITS.txt');await copyFile('LICENSE','dist/LICENSE.txt');
const paths=await walk('dist'),files=paths.map(p=>'/'+p.slice(5));
const digest=createHash('sha256');for(const p of paths)digest.update(await readFile(p));const revision=digest.digest('hex').slice(0,16);
const code=`const CACHE='emberline-${revision}',FILES=${JSON.stringify(['/',...files])};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('emberline-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(caches.open(CACHE).then(async c=>(await c.match(e.request,{ignoreSearch:true,ignoreVary:true}))||fetch(e.request)));});`;
await writeFile('dist/sw.js',code);console.log(`Offline precache: ${files.length} files, revision ${revision}`);
