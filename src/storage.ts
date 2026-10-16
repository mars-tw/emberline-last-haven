import { newCampaign, VERSION, type Campaign } from './campaign';
import {parseRun} from '../vendor/train/src/game/save';
export const KEY='emberline.campaign.v1';
type StorageLike=Pick<Storage,'getItem'|'setItem'>;
const finite=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
export function parse(raw:string|null):Campaign|null {
 try {const c=JSON.parse(raw??'null');if(!c||c.schema!==1||c.version!==VERSION||!['intro','play','report','ending','stranded'].includes(c.screen)||!Number.isInteger(c.segment)||!finite(c.segment,0,8)||!finite(c.supplies,0,1000000)||!finite(c.people,0,100000)||!finite(c.hull,0,100)||!Number.isInteger(c.level)||!finite(c.level,0,3))return null;
 const p=c.progress;if(!p||!finite(p.time,0,10000)||!finite(p.x,0,360)||!Array.isArray(p.enemies)||p.enemies.length>60||!Array.isArray(p.shots)||p.shots.length>100||!Array.isArray(c.receipts)||!Array.isArray(c.log)||!c.archives||typeof c.archives!=='object'||Array.isArray(c.archives))return null;
 // Persisted simulation data is untrusted, including nested animation/timer values.
 for(const k of ['cooldown','spawn','shot','serial','flung','kills','rescued','baitLeft','attracted','wave','warning','countered','impacts'])if(!finite(p[k],-1,100000))return null;
 if(!['west','center','east'].includes(p.bait)||!p.shake||Object.values(p.shake).some(v=>!finite(v,0,100000)))return null;
 for(const e of p.enemies)if(!finite(e.x,-1000,1000)||!finite(e.y,-1000,2000)||!finite(e.age,0,10000)||!finite(e.hp,-1000,10000)||!finite(e.slot,-1,3)||!['runner','shambler'].includes(e.type)||!['walk','attack','hurt','death','flung'].includes(e.state))return null;
 for(const s of p.shots)if(!finite(s.x,-1000,1000)||!finite(s.y,-1000,2000))return null;
 if(c.log.some((s:unknown)=>typeof s!=='string')||c.receipts.some((s:unknown)=>typeof s!=='string'))return null;
 if(p.night){if(!Array.isArray(p.night.flags)||!p.night.voyage||!Array.isArray(p.night.voyage.inspectedIds)||typeof p.night.seed!=='string')return null;const night=parseRun(JSON.stringify(p.night));if(!night||night.routeId!=='R01'||night.day!==Math.floor(c.segment/3)+1)return null;p.night=night;}
 return c as Campaign;}catch{return null;}
}
export function load(storage:StorageLike):{campaign:Campaign;message:string;found:boolean} {
 try {const raw=storage.getItem(KEY),valid=parse(raw);if(valid)return {campaign:valid,message:'',found:true};const backup=parse(storage.getItem(KEY+'.backup'));if(backup)return {campaign:backup,message:'主存檔無法讀取，已回復上一份備份。',found:true};return {campaign:newCampaign(),message:raw?'存檔損壞，原始資料仍保留。請先匯出資料，再開始新旅程。':'',found:false};}
 catch{return {campaign:newCampaign(),message:'無法存取儲存空間。請匯出旅程，以免關閉後遺失。',found:false};}
}
export function save(c:Campaign,storage:StorageLike):boolean {
 try {const current=storage.getItem(KEY);if(parse(current))storage.setItem(KEY+'.backup',current!);storage.setItem(KEY,JSON.stringify(c));return true;}catch{return false;}
}
export type LegacySource='ashes'|'storm'|'train';
export function importLegacy(c:Campaign,source:LegacySource,raw:string):{ok:boolean;message:string} {
 if(c.archives[source])return {ok:false,message:'這款原作已匯入，不能重複領取。'};
 if(raw.length>250000)return {ok:false,message:'檔案超過 250 KB，請使用原作 JSON 存檔。'};
 try {let encoded=false;let parsed;try{parsed=JSON.parse(raw);}catch{if(source!=='ashes')throw Error();parsed=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(raw.trim()),c=>c.charCodeAt(0))));encoded=true;}const v=parsed?.meta??parsed?.run??parsed;if(!v||typeof v!=='object'||Array.isArray(v))throw Error();let n=0;
 if(source==='ashes') {const metrics=v.stats??v;if(!finite(v.parts,0,1e9)||!finite(metrics.bestWave??metrics.totalRuns,0,1e9))throw Error();n=Number(metrics.bestWave??metrics.totalRuns);}
 if(source==='storm') {if(!finite(v.wave,0,10000)||!finite(v.money,0,1e9))throw Error();n=v.wave;}
 if(source==='train') {if(!finite(v.day,1,7)||!['R01','R02','R03'].includes(v.routeId)||!v.resources)throw Error();n=v.day;}
 if(!finite(n,0,1e9))throw Error();const grant=Math.min(12,Math.floor(n)+2);c.archives[source]=encoded?{format:'ashes-base64',originalText:raw,decoded:parsed}:parsed;c.supplies+=grant;
 return {ok:true,message:`原始進度已封存，補給 +${grant}。原作的存檔與解鎖保持在原遊戲，這裡不換算成通關。`};
 }catch{return {ok:false,message:'格式不符，沒有更動旅程。請確認選對原作與 JSON 存檔。'};}
}
