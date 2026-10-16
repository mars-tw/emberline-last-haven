import http from 'node:http';
import {readFile,readdir} from 'node:fs/promises';
import {extname} from 'node:path';
import {createHash} from 'node:crypto';
/** A private, disposable loopback server. It never binds a shared fixed port. */
export async function startServer(){
 const files=new Map();async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const path=dir+'/'+e.name;if(e.isDirectory())await walk(path);else files.set('/'+path.slice(5),await readFile(path));}}await walk('dist');
 const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8','.webmanifest':'application/manifest+json'};
 const server=http.createServer((req,res)=>{const path=new URL(req.url,'http://localhost').pathname;const key=path==='/'?'/index.html':path;const data=files.get(key);if(!data){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':mime[extname(key)]??'application/octet-stream','Vary':'Origin'});res.end(data);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const address=server.address();
 return {url:`http://127.0.0.1:${address.port}`,indexSha256:createHash('sha256').update(files.get('/index.html')).digest('hex'),async stop(){if(server.listening){server.closeAllConnections();await new Promise(r=>server.close(r));}}};
}
