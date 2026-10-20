import { newCampaign, VERSION, type Campaign } from './campaign';
import {parseRun} from '../vendor/train/src/game/save';
import {freshCrew,raidsFor} from './journey';
export const KEY='emberline.campaign.v1';
type StorageLike=Pick<Storage,'getItem'|'setItem'>;
const finite=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
export function parse(raw:string|null):Campaign|null {
 try {const c=JSON.parse(raw??'null');if(!c||c.schema!==1||![VERSION,'0.11.3','0.11.2','0.11.1','0.11.0','0.10.0','0.9.0','0.8.0','0.7.0','0.6.0','0.5.0'].includes(c.version)||!['intro','play','report','ending','stranded'].includes(c.screen)||!Number.isInteger(c.segment)||!finite(c.segment,0,8)||!finite(c.supplies,0,1000000)||!finite(c.people,0,100000)||!finite(c.hull,0,100)||!Number.isInteger(c.level)||!finite(c.level,0,3))return null;
 const p=c.progress;if(!p||!finite(p.time,0,10000)||!finite(p.x,0,360)||!Array.isArray(p.enemies)||p.enemies.length>60||!Array.isArray(p.shots)||p.shots.length>100||!Array.isArray(c.receipts)||!Array.isArray(c.log)||!c.archives||typeof c.archives!=='object'||Array.isArray(c.archives))return null;
 // Persisted simulation data is untrusted, including nested animation/timer values.
 for(const k of ['cooldown','spawn','shot','serial','flung','kills','rescued','baitLeft','attracted','wave','warning','countered','impacts'])if(!finite(p[k],-1,100000))return null;
 if(!['west','center','east'].includes(p.bait)||!p.shake||Object.values(p.shake).some(v=>!finite(v,0,100000)))return null;
 for(const e of p.enemies)if(!finite(e.x,-1000,1000)||!finite(e.y,-1000,2000)||!finite(e.age,0,10000)||!finite(e.hp,-1000,10000)||!finite(e.slot,-1,3)||!['runner','shambler'].includes(e.type)||!['walk','attack','hurt','death','flung'].includes(e.state))return null;
 for(const s of p.shots)if(!finite(s.x,-1000,1000)||!finite(s.y,-1000,2000))return null;
 for(const e of p.enemies)if(e.exit!==undefined&&(!['west','center','east'].includes(e.exit)||e.lane!==undefined&&e.exit!==e.lane)||e.escapedAt!==undefined&&(!e.exit||!e.attracted||!finite(e.escapedAt,0,p.time)||(e.exit==='west'?e.x>=-48:e.x<=408)))return null;
 if(c.log.some((s:unknown)=>typeof s!=='string')||c.receipts.some((s:unknown)=>typeof s!=='string'))return null;
 if(p.night){if(!Array.isArray(p.night.flags)||!p.night.voyage||!Array.isArray(p.night.voyage.inspectedIds)||typeof p.night.seed!=='string')return null;const night=parseRun(JSON.stringify(p.night));if(!night||night.routeId!=='R01'||night.day!==Math.floor(c.segment/3)+1)return null;p.night=night;}
 // Only legacy saves receive defaults. Current-version missing fields are corruption.
 if(['0.7.0','0.6.0','0.5.0'].includes(c.version)){
  if(c.repairCredit===undefined)c.repairCredit=0;
  if(c.defenseRetries===undefined)c.defenseRetries=[0,0,0];
  if(c.relayResults===undefined)c.relayResults={};
  if(p.baitCooldown===undefined)p.baitCooldown=p.baitLeft;
  if(!c.crew){c.crew=freshCrew();c.crew.applied=c.screen==='intro'?-1:c.segment;}
  if(!c.relay){c.relay={};for(let chapter=0;chapter<3;chapter++)if(c.segment>chapter*3+1)c.relay[chapter]='passed';}
  if(p.defenseBatch===undefined)p.defenseBatch=c.segment%3===1&&p.started?raidsFor(c.segment).filter(r=>r.at<=p.time).length:0;
 }
 if(c.version!==VERSION){
  if(c.segment%3===1)for(const e of p.enemies)if(e.lane===undefined)e.lane=e.x<125?'west':e.x>235?'east':'center';
  if(c.segment%3===1)for(const e of p.enemies)if(e.attracted&&e.exit===undefined)e.exit=e.lane;
  if(p.divertedGroups===undefined)p.divertedGroups=[...new Set(p.enemies.filter((e:any)=>e.attracted).map((e:any)=>`legacy:${e.lane??'center'}`))];
 }
 if(!Array.isArray(p.divertedGroups)||p.divertedGroups.length>9||p.divertedGroups.some((g:unknown)=>typeof g!=='string'||!/^(?:[1-3]|legacy):(west|center|east)$/.test(g as string))||new Set(p.divertedGroups).size!==p.divertedGroups.length||p.enemies.some((e:any)=>e.group!==undefined&&(typeof e.group!=='string'||!/^[1-3]:(west|center|east)$/.test(e.group))))return null;
 // R7 records exits independently of the short-lived enemy sprites. Preserve already
 // earned legacy groups; unknown historical individual counts are not reconstructed.
 if(c.version!==VERSION&&p.diversion===undefined){p.diversion={};if(c.segment%3===1){const raids=raidsFor(c.segment,c.defenseRetries[Math.floor(c.segment/3)]);for(const e of p.enemies){const group=e.group??`legacy:${e.lane??'center'}`;const total=raids[Number(group[0])-1]?.lanes.find(g=>g.lane===e.lane)?.count??p.enemies.filter((q:any)=>q.group===e.group).length;p.diversion[group]??={total,escaped:0};if(e.attracted)p.diversion[group].escaped++;}}}
 if(!p.diversion||Array.isArray(p.diversion)||typeof p.diversion!=='object'||Object.keys(p.diversion).length>9||Object.entries(p.diversion).some(([g,r]:[string,any])=>!/^(?:[1-3]|legacy):(west|center|east)$/.test(g)||!r||!Number.isInteger(r.total)||!finite(r.total,1,60)||!Number.isInteger(r.escaped)||!finite(r.escaped,0,r.total)))return null;
 const crew=c.crew,validPlan=(v:any)=>v&&Object.keys(v).length===3&&['driver','watch','rest'].every(k=>Number.isInteger(v[k])&&finite(v[k],0,2))&&new Set(Object.values(v)).size===3;
 const fatigue=(v:any)=>Array.isArray(v)&&v.length===3&&v.every((f:unknown)=>Number.isInteger(f)&&finite(f,0,3));
 if(!crew||!fatigue(crew.fatigue)||!validPlan(crew.plan)||!(crew.rested===null||Number.isInteger(crew.rested)&&finite(crew.rested,0,2))||!Number.isInteger(crew.applied)||!finite(crew.applied,-1,8)||!Number.isInteger(crew.shield)||!finite(crew.shield,0,1)||!finite(crew.driftPenalty,0,2.25)||!finite(crew.warningPenalty,0,6)||!Array.isArray(crew.history)||crew.history.length>9)return null;
 if(crew.history.some((h:any)=>!h||!Number.isInteger(h.segment)||!finite(h.segment,0,8)||!validPlan(h.plan)||!fatigue(h.fatigue))||new Set(crew.history.map((h:any)=>h.segment)).size!==crew.history.length)return null;
 if(!c.relay||Array.isArray(c.relay)||typeof c.relay!=='object'||Object.entries(c.relay).some(([k,v])=>!['0','1','2'].includes(k)||!['rescue','repair','passed'].includes(v as string)))return null;
 if(!Number.isInteger(p.defenseBatch)||!finite(p.defenseBatch,0,3)||p.enemies.some((e:any)=>e.lane!==undefined&&!['west','center','east'].includes(e.lane)))return null;
 if(!finite(p.baitCooldown,0,14)||!finite(c.repairCredit,0,54)||!Array.isArray(c.defenseRetries)||c.defenseRetries.length!==3||c.defenseRetries.some((n:unknown)=>!Number.isInteger(n)||!finite(n,0,100000)))return null;
 if(!c.relayResults||Array.isArray(c.relayResults)||typeof c.relayResults!=='object'||Object.entries(c.relayResults).some(([k,r]:[string,any])=>!['0','1','2'].includes(k)||!c.relay[k]||!r||!finite(r.before,0,100)||!finite(r.repaired,0,18)||!finite(r.stored,0,18)||r.repaired+r.stored>18))return null;
 if(p.nightFeedback){const f=p.nightFeedback;if(!finite(f.age,0,2)||!Number.isInteger(f.wave)||!finite(f.wave,1,3)||!['roof','window'].includes(f.threat)||!['blocked','damaged','countered'].includes(f.outcome)||!finite(f.beforeHull,0,100)||!finite(f.afterHull,0,100)||![f.beforeShield,f.afterShield].every(v=>Number.isInteger(v)&&finite(v,0,1)))return null;}
 if(c.nightRepair){const r=c.nightRepair;if(!finite(r.before,0,100)||!finite(r.base,0,100)||!finite(r.extra,0,2)||!finite(r.after,0,100)||typeof r.rescued!=='boolean'||Math.abs(r.before+r.base+r.extra-r.after)>.0001)return null;}
 c.version=VERSION;return c as Campaign;}catch{return null;}
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
