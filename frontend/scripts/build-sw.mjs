import {readdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
async function walk(dir,prefix='') {
 const list=[]; for(const entry of await readdir(dir,{withFileTypes:true})) {
 const rel=`${prefix}/${entry.name}`;
 if(entry.isDirectory())list.push(...await walk(`${dir}/${entry.name}`,rel)); else if(entry.name!=='sw.js')list.push(rel);
 }return list;
}
const urls=await walk('dist');
if(!urls.includes('/vendor/ready.json'))throw new Error('Run npm run setup:offline before building.');
const digest=createHash('sha256');for(const url of urls)digest.update(await readFile(`dist${url}`));
const version=`dishari-${digest.digest('hex').slice(0,16)}`;
await writeFile('dist/sw.js',`const CACHE=${JSON.stringify(version)};const ASSETS=${JSON.stringify(['/',...urls])};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith('dishari-')||k.startsWith('disha-'))&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.match(e.request,{ignoreVary:true}).then(hit=>hit||fetch(e.request).catch(()=>e.request.mode==='navigate'?caches.match('/index.html',{ignoreVary:true}):Response.error())))});`);
console.log(`Offline cache generated: ${urls.length} assets`);
