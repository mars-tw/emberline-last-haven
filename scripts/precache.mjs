import {readdir,writeFile,readFile,copyFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname} from 'node:path';
async function walk(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())out.push(...await walk(p));else if(!p.endsWith('/sw.js'))out.push(p);}return out;}
const runtime=['art/content-r3/shian-portrait.webp','art/content-r2/coldstore.webp','art/content-r2/lighthouse.webp','art/content-r1/relay-table.webp','manifest.webmanifest','icon.svg','art/r1/trailer.png','art/r3/truck.png','art/r3/an-poses.png','art/r4/outpost-ready.webp',...['wreck','sign','luggage','concrete'].map(p=>`art/r2/${p}.png`),...Array.from({length:3},(_,i)=>`art/r2/road-${i}.webp`),...(await readdir('public/art/r5')).map(p=>`art/r5/${p}`)];
runtime.push('art/content-r5/rescue.webp','art/content-r5/repair.webp','art/content-r6/xi-brace.webp','art/content-r7/an-portrait.webp');
for(const p of runtime){await mkdir(dirname(`dist/${p}`),{recursive:true});await copyFile(`public/${p}`,`dist/${p}`);}
await copyFile('CREDITS.md','dist/CREDITS.txt');await copyFile('LICENSE','dist/LICENSE.txt');
const paths=await walk('dist'),files=paths.map(p=>'/'+p.slice(5));
const digest=createHash('sha256');for(const p of paths)digest.update(await readFile(p));const revision=digest.digest('hex').slice(0,16);
const code=`const CACHE='emberline-${revision}',FILES=${JSON.stringify(['/',...files])};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('emberline-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(caches.open(CACHE).then(async c=>(await c.match(e.request,{ignoreSearch:true,ignoreVary:true}))||fetch(e.request)));});`;
await writeFile('dist/sw.js',code);console.log(`Offline precache: ${files.length} files, revision ${revision}`);
