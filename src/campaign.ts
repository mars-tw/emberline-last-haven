import { createRun } from '../vendor/train/src/game/model';
import { RunService } from '../vendor/train/src/game/services';
import { commitHandover, handoverEvidence, handoverReady } from '../vendor/train/src/game/handover';
import { nightThreatIdFor } from '../vendor/train/src/game/night-feel';
import type { RunState } from '../vendor/train/src/game/types';
import { layoutFor, layoutObjective } from './origins/baitLayout';
import { pickLatchSlot, resolveLatchBiteDamage, resolveMultiFlingParts, driftReady, updateShakeTracker } from './origins/convoy.js';
import latch from './origins/latch-config.js';
import {freshCrew,depart,settle,assign,raidsFor,baitMatches,BAIT_HINTS,driftSeconds,watchBonus,repairAmounts,CREW_NAMES,type Crew,type Role,type Lane} from './journey';

export const VERSION='0.11.3';
export const RESCUED_NAMES=[['阿岑','小路'],['林叔','阿禾'],['阿澄','以寧']] as const;
export const CHAPTERS=[
 {name:'灰燼出城',place:'南岸公路 → 雪線中繼站 → 灰霧鐵道',story:'老席收到北方燈塔的求救訊號。熹把最後的補給搬上拖車，A-07 指向地圖上仍亮著的那盞燈。先把公路上的人帶走。',end:'中繼站有人接住了車隊。A-07 第一次說出自己的名字：安。北方的訊號還在。'},
 {name:'白霜斷橋',place:'斷橋繞道 → 冷庫據點 → 白霜支線',story:'橋已經斷了，守燈人的車隊困在東側。帶他們繞過廢車，再以冷庫作掩護，把物資送上列車。',end:'安把冷窗上的霜擦去，露出遠方海岸線。熹將新加入的守衛記進同一本行車簿。'},
 {name:'燈塔之前',place:'海岸撤離線 → 最後補給站 → 燈塔終站',story:'燈塔燃料只剩一夜。老席要接走最後一批倖存者，讓補給站撐到列車開動。這次不會再有下一個中繼站。',end:'列車抵達北方燈塔。安接上廣播，熹打開車門，老席關掉引擎。你們帶來的人，成了下一班車的守燈人。'}
];
export type Mode='convoy'|'defense'|'train';
export type Enemy={id:number;x:number;y:number;hp:number;state:'walk'|'attack'|'hurt'|'death'|'flung';age:number;slot:number;type:'runner'|'shambler';hit:boolean;attracted:boolean;group?:string;lane?:Lane;exit?:Lane;escapedAt?:number};
export interface Segment {
 time:number; x:number; cooldown:number; spawn:number; shot:number; enemies:Enemy[]; shots:{x:number;y:number}[];
 serial:number;flung:number; kills:number; rescued:number; bait:string; baitLeft:number; attracted:number; started:boolean;
 night:RunState|null; wave:number; warning:number; countered:number; impacts:number; shake:{left:number;right:number;cooldownLeft:number};
 defenseBatch:number;baitCooldown:number;divertedGroups:string[];diversion:Record<string,{total:number;escaped:number}>;
}
export interface Campaign {
 schema:1;version:string; screen:'intro'|'play'|'report'|'ending'|'stranded'; segment:number; supplies:number;people:number;hull:number;level:number;
 progress:Segment; log:string[]; receipts:string[]; archives:Record<string,unknown>; sound:boolean; reduced:boolean;
 lastReport:string; reward:number;
 crew:Crew;relay:Record<string,'rescue'|'repair'|'passed'>;repairCredit:number;defenseRetries:number[];relayResults:Record<string,{before:number;repaired:number;stored:number}>;
}
export const modeFor=(segment:number):Mode=>(['convoy','defense','train'] as const)[segment%3];
export const chapterFor=(c:Campaign)=>CHAPTERS[Math.floor(c.segment/3)];
export const guardPower=(c:Campaign)=>1+Math.floor(c.people/3)+c.level;
export const service=new RunService();
export function freshSegment():Segment { return {time:0,x:180,cooldown:0,spawn:0,shot:0,enemies:[],shots:[],serial:0,flung:0,kills:0,rescued:0,bait:'center',baitLeft:0,attracted:0,started:false,night:null,wave:0,warning:0,countered:0,impacts:0,shake:{left:0,right:0,cooldownLeft:0},defenseBatch:0,baitCooldown:0,divertedGroups:[],diversion:{}}; }
export function newCampaign():Campaign {return {schema:1,version:VERSION,screen:'intro',segment:0,supplies:8,people:3,hull:100,level:0,progress:freshSegment(),log:['南岸電台：北方燈塔仍在發訊。'],receipts:[],archives:{},sound:true,reduced:false,lastReport:'',reward:0,crew:freshCrew(),relay:{},repairCredit:0,defenseRetries:[0,0,0],relayResults:{}};}
export const campaignRaids=(c:Campaign)=>raidsFor(c.segment,c.defenseRetries[Math.floor(c.segment/3)]);
export function begin(c:Campaign) { if(c.screen!=='intro')return false;depart(c.crew,c.segment);c.screen='play';return true; }
export const relayPending=(c:Campaign)=>c.screen==='report'&&modeFor(c.segment)==='defense'&&!c.relay[String(Math.floor(c.segment/3))];
export function chooseRelay(c:Campaign,choice:'rescue'|'repair') {
 if(!relayPending(c)||!['rescue','repair'].includes(choice)||choice==='rescue'&&c.supplies<3)return false;
 c.relay[String(Math.floor(c.segment/3))]=choice;
 const key=String(Math.floor(c.segment/3)),before=c.hull;
 if(choice==='rescue'){c.supplies-=3;c.people+=2;c.relayResults[key]={before,repaired:0,stored:0};note(c,`${RESCUED_NAMES[Number(key)].join('與')}登車：「我們接手搬補給。」同行 +2，補給 −3；工具箱留在站內。`);}
 else{const {repaired:repair,stored}=repairAmounts(c.hull);c.hull+=repair;c.repairCredit+=stored;c.relayResults[key]={before,repaired:repair,stored};note(c,`工具箱已帶走：${repair?`車體 ${before}→${c.hull}％`:'車體已滿'}；${c.repairCredit?`備用維修 ${c.repairCredit}％，下段受損時扣用`:'沒有備用維修'}。救援包留站封存。`);}return true;
}
export function assignCrew(c:Campaign,role:Role,person:number){if(!['intro','report'].includes(c.screen)||c.screen==='report'&&c.segment===8||!['driver','watch','rest'].includes(role))return false;return assign(c.crew,role,person);}
function impact(c:Campaign,damage:number){if(c.crew.shield>0){c.crew.shield--;note(c,`${CREW_NAMES[c.crew.plan.watch]}擋下這次撞擊！車體未受損，擋擊 1→0（${actualThreat(c)==='window'?'窗側':'車頂'}）。`);return;}c.hull=Math.max(0,c.hull-damage);if(c.repairCredit>0){const repair=Math.min(c.repairCredit,100-c.hull);c.hull+=repair;c.repairCredit-=repair;note(c,`備用零件自動維修 +${repair}％，剩 ${c.repairCredit}％。`);}}
export function note(c:Campaign,text:string) {c.log.push(text);c.log=c.log.slice(-16);}
export function inspect(c:Campaign,which:'passenger-breathing'|'window-silhouette') {if(modeFor(c.segment)!=='train'||c.screen!=='play'||c.progress.started)return false;service.inspectObject(ensureNight(c),which);return true;}
export function ensureNight(c:Campaign):RunState {
 if(!c.progress.night) {const run=createRun(`emberline-${c.segment}`); run.day=Math.floor(c.segment/3)+1;run.selectedRouteNodeId='RN01';c.progress.night=run;}
 return c.progress.night;
}
export function evidence(c:Campaign) {return handoverEvidence(ensureNight(c));}
export function seal(c:Campaign,choice:string) {
 const p=c.progress;if(c.screen!=='play'||modeFor(c.segment)!=='train'||p.started||!commitHandover(ensureNight(c),choice))return false;
 const run=ensureNight(c);service.beginNight(run);p.started=true;p.wave=1;p.warning=Math.max(6,(run.activeContact?.secondsLeft??18)-c.crew.warningPenalty)+watchBonus(c.crew);
 note(c,`交接已封存，首波預警 ${p.warning} 秒（含交接判讀結果；後續每波依輪班）。`);return true;
}
export function actualThreat(c:Campaign) {const p=c.progress;return nightThreatIdFor(ensureNight(c),p.wave||1,null)==='T002'?'window':'roof';}
export function counter(c:Campaign,choice:'window'|'roof'|'brace') {
 const p=c.progress;if(c.screen!=='play'||modeFor(c.segment)!=='train'||!p.started||(p.warning<=0&&choice!=='brace'))return false;
 const cost=choice==='brace'?0:2;
 if(c.supplies<cost) {note(c,'補給不足。可以選擇加固承受，保留資源。');return false;}
 c.supplies-=cost;
 if(choice===actualThreat(c)) {p.countered++;note(c,choice==='window'?'百葉封住敲窗者。':'扣具切離，車頂的拖曳聲消失了。');}
 else {const damage=choice==='brace'?Math.max(3,7-c.level):12;p.impacts++;note(c,choice==='brace'?'你帶大家伏低，準備承受撞擊。':'反制方向不符，撞擊逼近。');impact(c,damage);}
 if(c.hull<=0){c.screen='stranded';note(c,'車體失去動力。需要撤回安全點搶修。');return true;}if(p.wave===3) finish(c);else {const outcome=c.log.at(-1);p.wave++;p.warning=Math.max(6,16+c.level*2-c.crew.warningPenalty)+watchBonus(c.crew);note(c,`${outcome} 第 ${p.wave} 波接觸：先看訊號再反制。`);}return true;
}
export function layBait(c:Campaign,id:string) {
 const p=c.progress;if(c.screen!=='play'||modeFor(c.segment)!=='defense'||c.supplies<1||p.baitCooldown>0||p.baitLeft>0)return false;
 if(!['west','center','east'].includes(id))return false;
 c.supplies--;p.bait=id;p.baitLeft=12;p.baitCooldown=12;p.started=true;note(c,`${layoutFor(id).name}：已花 1 補給。${BAIT_HINTS[id as Lane]}`);return true;
}
export function drift(c:Campaign) {
 const p=c.progress;if(c.screen!=='play'||modeFor(c.segment)!=='convoy'||!driftReady(p.time,p.cooldown))return false;
 const latched=p.enemies.filter(e=>e.slot>=0&&e.state!=='death'&&e.state!=='flung');
 if(!latched.length) {note(c,'等敵人攀上車，再甩尾。');return false;}
 p.cooldown=p.time+driftSeconds(c.crew);p.flung+=latched.length;
 for(const e of latched) {e.state='flung';e.age=0;e.slot=-1;for(const other of p.enemies) if(other!==e&&other.slot<0&&other.state==='walk'&&Math.hypot(other.x-e.x,other.y-e.y)<85) {other.hp=0;other.state='death';other.age=0;p.kills++;}}
 c.supplies+=resolveMultiFlingParts(latched.length,latch);note(c,`甩落 ${latched.length} 隻！${latched.length>1?'連鎖回收補給。':''}`);return true;
}
export function upgrade(c:Campaign) {if(c.screen!=='report'||c.level>=3||c.supplies<4)return false;c.supplies-=4;c.level++;c.hull=Math.min(100,c.hull+15);note(c,'護具已強化：全隊火力、夜間承受能力與車體維修同步改善。');return true;}
export function retry(c:Campaign) {if(c.screen!=='stranded')return false;if(modeFor(c.segment)==='defense')c.defenseRetries[Math.floor(c.segment/3)]++;c.hull=60;c.supplies=Math.max(0,c.supplies-2);c.progress=freshSegment();c.screen='play';note(c,'車隊撤回上一個安全點。花最多 2 補給搶修，重試不洗疲勞與擋擊；後兩批偵察可能改變。');return true;}
export function advance(c:Campaign) {if(c.screen!=='report'||relayPending(c))return false;if(c.segment===8){c.screen='ending';return true;}c.segment++;c.progress=freshSegment();depart(c.crew,c.segment);c.screen='play';return true;}
export function finish(c:Campaign) {
 if(c.screen!=='play')return false;const receipt=`segment:${c.segment}`;if(c.receipts.includes(receipt))return false;
 const p=c.progress,mode=modeFor(c.segment);let reward=0;
 if(mode==='convoy') {const rescued=2+Math.min(3,Math.floor(p.flung/2));p.rescued=rescued;c.people+=rescued;const repair=Math.min(100-c.hull,rescued*3);c.hull+=repair;reward=3+p.kills%3;c.lastReport=`救回 ${rescued} 人。他們會成為據點守衛與列車乘客，並協助搶修車體 +${repair}％。守衛火力現為 ${guardPower(c)}。`;}
 if(mode==='defense') {const repair=Math.min(100-c.hull,6+Math.floor(c.people/2));c.hull+=repair;reward=5+Math.min(4,p.attracted);c.lastReport=`${p.attracted} 隻敵人被誘餌改道。同行者搶修車體 +${repair}％。回收補給可在列車反制或整備護具。`;}
 if(mode==='train') {reward=2+p.countered;c.hull=Math.min(100,c.hull+5+c.people);c.lastReport=`正確反制 ${p.countered}／3 波，${p.impacts} 次撞擊。${chapterFor(c).end}`;}
 c.supplies+=reward;c.reward=reward;c.receipts.push(receipt);settle(c.crew,c.segment);c.screen='report';note(c,`段落完成，補給 +${reward}。輪班疲勞已記入行車簿。`);return true;
}
function spawn(c:Campaign,side:boolean,lane?:Lane,index=0) {const p=c.progress;p.serial++;const rear=side&&p.serial%3!==0;p.enemies.push({id:p.serial,x:lane?({west:75,center:180,east:285}[lane]+(index%3-1)*24):rear?(p.serial%2?50:310):50+(p.serial*71)%260,y:lane?30-Math.floor(index/3)*24:rear?390:30,hp:3+Math.floor(c.segment/3),state:'walk',age:0,slot:-1,type:p.serial%2?'runner':'shambler',hit:false,attracted:false,group:lane?`${p.defenseBatch}:${lane}`:undefined,lane});}
export function tick(c:Campaign,dt:number,steer=0) {
 if(c.screen!=='play')return;const p=c.progress,mode=modeFor(c.segment);dt=Math.max(0,Math.min(.05,dt));
 if(mode==='train') {if(!p.started)return;p.time+=dt;p.warning=Math.max(0,p.warning-dt);if(p.warning===0)counter(c,'brace');return;}
 if(mode==='defense'&&!p.started)return;
 p.time+=dt;
 if(mode==='convoy') {const old=p.x;p.x=Math.max(70,Math.min(290,p.x+steer*155*dt));const shake=updateShakeTracker(p.shake,p.x-old,dt,latch);p.shake=shake.tracker;if(shake.triggered)drift(c);}
 if(mode==='defense'){const raids=campaignRaids(c);while(p.defenseBatch<raids.length&&p.time>=raids[p.defenseBatch].at){const raid=raids[p.defenseBatch++];for(const group of raid.lanes){p.diversion[`${p.defenseBatch}:${group.lane}`]={total:group.count,escaped:0};for(let i=0;i<group.count;i++)spawn(c,false,group.lane,i);}note(c,`第 ${p.defenseBatch} 批來敵已進場，留意裝車區。`);}}
 else{p.spawn-=dt;if(p.spawn<=0){spawn(c,true);p.spawn=3.5;}}
 p.baitLeft=Math.max(0,p.baitLeft-dt);
 p.baitCooldown=Math.max(0,p.baitCooldown-dt);
 // Same three world-space bait points as Storm, mapped into the unified stage.
 const targetX=180+layoutFor(p.bait).x*21;
 for(const e of p.enemies) {
  e.age+=dt;if(e.state==='death')continue;
  // Once committed at the bait point, follow the edge even after the lure expires.
  // The entire sprite must cross the world boundary before awarding a diversion.
  if(mode==='defense'&&e.exit){
   if(e.escapedAt!==undefined)continue;
   e.state='walk';e.x+=(e.exit==='west'?-1:1)*22*dt;
   if(e.x<-48||e.x>408){e.escapedAt=p.time;if(!e.attracted){e.attracted=true;p.attracted++;const group=e.group??`legacy:${e.lane??e.exit}`,record=p.diversion[group]??={total:p.enemies.filter(q=>q.group===e.group).length,escaped:0};record.escaped=Math.min(record.total,record.escaped+1);if(record.escaped===record.total&&!p.divertedGroups.includes(group))p.divertedGroups.push(group);}}
   continue;
  }
  if(e.state==='flung') {e.y+=380*dt;continue;}
  if(e.state==='hurt') {if(e.age>.24){e.state='walk';e.age=0;}continue;}
  if(e.slot>=0) {
   e.x=p.x+(e.slot%2?32:-32);e.y=e.slot<2?350:442;
   if(e.state!=='attack'){e.state='attack';e.age=0;e.hit=false;}
   if(!e.hit&&e.age>=.2){impact(c,resolveLatchBiteDamage(2,c.level*2,1,latch));e.hit=true;}
   if(e.age>=.85){e.age=0;e.hit=false;}continue;
  }
  const lured=mode==='defense'&&p.baitLeft>0&&baitMatches(p.bait,e.lane??(e.x<125?'west':e.x>235?'east':'center'));
  const tx=mode==='convoy'?p.x:(lured?targetX:180),ty=mode==='convoy'?350:(lured?285:455);
  const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);
  const speed=mode==='convoy'?64:lured&&p.bait==='west'?25:lured&&p.bait==='east'?40:30;
  if(d>12) {e.x+=dx/d*dt*speed;e.y+=dy/d*dt*speed;}
  else if(mode==='convoy') {const slot=pickLatchSlot(p.enemies.filter(x=>x.slot>=0&&x.state!=='death'&&x.state!=='flung').map(x=>x.slot),latch);if(slot>=0){e.slot=slot;e.age=0;e.hit=false;}}
  else if(lured) {e.exit=e.lane??p.bait as Lane;e.state='walk';}
  else {if(e.state!=='attack'){e.state='attack';e.age=0;e.hit=false;}if(e.age>=.32&&!e.hit){e.hit=true;impact(c,3);}if(e.age>=1.2){e.age=0;e.hit=false;}}
 }
 p.shot=Math.max(0,p.shot-dt);if(p.shot<=0) {
  const target=p.enemies.find(e=>!e.exit&&e.slot<0&&(e.state==='walk'||e.state==='attack')&&(mode==='convoy'?e.y<320:e.attracted||e.y>340));
  if(target){p.shots.push({x:target.x,y:mode==='convoy'?320:470});p.shot=mode==='convoy'?.6:Math.max(.25,1.2/guardPower(c));}
 }
 for(const shot of p.shots) {shot.y-=300*dt;const e=p.enemies.find(e=>!e.exit&&e.slot<0&&e.state!=='death'&&e.state!=='flung'&&Math.hypot(e.x-shot.x,e.y-shot.y)<20);if(e){e.hp-=1+c.level;e.state=e.hp<=0?'death':'hurt';e.age=0;if(e.hp<=0)p.kills++;shot.y=-100;}}
 if(c.hull<=0){c.screen='stranded';note(c,'車體失去動力。需要撤回安全點搶修。');return;}
 p.shots=p.shots.filter(s=>s.y>0);p.enemies=p.enemies.filter(e=>!((e.state==='death'&&e.age>.65)||(e.state==='flung'&&e.age>1.2)||(e.escapedAt!==undefined&&p.time-e.escapedAt>.8))).slice(-60);
 if(mode==='convoy'&&p.time>=48&&p.flung>=2)finish(c);
 if(mode==='convoy'&&p.time>=78) {note(c,'你拖著受損車隊抵達中繼站。下次試著讓兩隻攀車後一起甩落。');finish(c);}
 if(mode==='defense'&&p.time>=40&&(layoutObjective(p.divertedGroups.length)||p.time>=60))finish(c);
}
