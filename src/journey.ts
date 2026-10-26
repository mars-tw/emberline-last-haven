/** Offline journey decisions. No clocks or random rolls in the persisted rules. */
export const CREW_NAMES=['老席','熹','安'] as const;
export const CREW_TRAITS=['夜巡熟手：守夜預警多 2 秒','熟悉車身：開車甩尾快 0.5 秒','善於調息：休息使疲勞減少 3 格'] as const;
export const TRAIT_ROLES=['watch','driver','rest'] as const;
export const CREW_RULES={driftBase:5.5,driftFatigue:.75,driverTrait:.5,watchBase:16,watchLevel:2,watchFatigue:2,watchTrait:2,watchMinimum:6,fatigueMaximum:3,workFatigue:1,restRecovery:2,restTraitRecovery:3} as const;
export function driverNumbers(crew:Crew,person=crew.plan.driver){const r=CREW_RULES,base=r.driftBase,fatigue=crew.fatigue[person],rate=r.driftFatigue,trait=person===1?r.driverTrait:0;return {base,fatigue,rate,trait,seconds:base+fatigue*rate-trait};}
export function watchNumbers(crew:Crew,level=0,person=crew.plan.watch){const r=CREW_RULES,base=r.watchBase,levelRate=r.watchLevel,fatigue=crew.fatigue[person],rate=r.watchFatigue,trait=person===0?r.watchTrait:0,raw=base+level*levelRate-fatigue*rate;return {base,level,levelRate,fatigue,rate,trait,minimum:r.watchMinimum,clamp:Math.max(0,r.watchMinimum-raw),seconds:Math.max(r.watchMinimum,raw)+trait,shield:crew.rested===person?1:0};}
export function fatigueNumbers(crew:Crew,person:number){const r=CREW_RULES,before=crew.fatigue[person],rest=crew.plan.rest===person,recovery=rest?(person===2?r.restTraitRecovery:r.restRecovery):0,gain=rest?0:r.workFatigue,raw=before+gain-recovery,floor=Math.max(0,-raw),cap=Math.max(0,raw-r.fatigueMaximum);return {before,gain,recovery,floor,cap,after:raw+floor-cap};}
export const driftSeconds=(crew:Crew)=>driverNumbers(crew).seconds;
export const watchBonus=(crew:Crew)=>watchNumbers(crew).trait;
export function crewPreview(crew:Crew,level=0){const w=watchNumbers(crew,level),f=fatigueNumbers(crew,crew.plan.rest);return [`${CREW_NAMES[crew.plan.driver]}開車：甩尾冷卻 ${driftSeconds(crew)} 秒`,`${CREW_NAMES[crew.plan.watch]}守夜：後續每波 ${w.seconds} 秒預警${w.shield?'，可擋 1 次撞擊':''}`,`${CREW_NAMES[crew.plan.rest]}休息：本段後疲勞減少 ${f.before-f.after} 格`];}
export const ROLES=['driver','watch','rest'] as const;
export type Role=typeof ROLES[number];
export type Crew={fatigue:number[];plan:Record<Role,number>;planConfirmed:boolean;rested:number|null;applied:number;shield:number;driftPenalty:number;warningPenalty:number;history:{segment:number;plan:Record<Role,number>;fatigue:number[]}[]};
export function freshCrew():Crew{return {fatigue:[0,0,0],plan:{driver:0,watch:1,rest:2},planConfirmed:false,rested:null,applied:-1,shield:0,driftPenalty:0,warningPenalty:0,history:[]};}
export function crewEffects(crew:Crew){const d=driverNumbers(crew),w=watchNumbers(crew);return {driftPenalty:d.fatigue*d.rate,warningPenalty:w.fatigue*w.rate,shield:w.shield};}
export function assign(crew:Crew,role:Role,person:number){if(!Number.isInteger(person)||person<0||person>2)return false;const other=ROLES.find(r=>crew.plan[r]===person)!;const old=crew.plan[role];crew.plan[role]=person;crew.plan[other]=old;crew.planConfirmed=true;return true;}
export function depart(crew:Crew,segment:number){if(crew.applied===segment)return;Object.assign(crew,crewEffects(crew));crew.applied=segment;}
export const fatigueAfter=(crew:Crew)=>crew.fatigue.map((_,i)=>fatigueNumbers(crew,i).after);
export function settle(crew:Crew,segment:number){if(crew.history.some(r=>r.segment===segment))return;const plan={...crew.plan};crew.fatigue=fatigueAfter(crew);crew.rested=plan.rest;crew.history.push({segment,plan,fatigue:[...crew.fatigue]});}
export const repairAmounts=(hull:number)=>({repaired:Math.min(18,100-hull),stored:Math.max(0,18-(100-hull))});
export type Lane='west'|'center'|'east';
export const LANE_NAMES={west:'西側',center:'中央',east:'東側'};
export const LANE_COLORS={west:'#f4bd68',center:'#9ed6c8',east:'#c8b2ed'};
export type Raid={at:number;lanes:{lane:Lane;count:number}[]};
export const RAIDS:readonly Raid[][]=[
 [{at:0,lanes:[{lane:'west',count:4}]},{at:14,lanes:[{lane:'east',count:4}]},{at:30,lanes:[{lane:'center',count:9}]}],
 [{at:0,lanes:[{lane:'east',count:5}]},{at:10,lanes:[{lane:'center',count:6}]},{at:26,lanes:[{lane:'west',count:8}]}],
 [{at:0,lanes:[{lane:'center',count:4}]},{at:16,lanes:[{lane:'west',count:6},{lane:'east',count:6}]},{at:32,lanes:[{lane:'east',count:6},{lane:'west',count:6}]}]
];
export const raidsFor=(segment:number,attempt=0):Raid[]=>RAIDS[Math.floor(segment/3)].map((raid,i)=>({at:raid.at+(i&&attempt?(attempt%2?2:-2):0),lanes:raid.lanes.map(g=>({...g,count:Math.min(9,g.count+(i&&attempt?(attempt%2?-1:1):0))}))}));
export function raidText(raid:Raid){return `${raid.at} 秒 ${raid.lanes.map(l=>`${LANE_NAMES[l.lane]} ${l.count} 隻`).join('＋')}`;}
export function nextRaidText(raid:Raid,time:number){return `${Math.max(0,Math.ceil(raid.at-time))} 秒・下一批${raid.lanes.map(l=>`${LANE_NAMES[l.lane]} ${l.count} 隻`).join('＋')}`;}
export function raidChanges(segment:number,attempt:number){const raids=raidsFor(segment,attempt),before=raidsFor(segment,Math.max(0,attempt-1));return raids.map((r,i)=>attempt>0&&JSON.stringify(r)!==JSON.stringify(before[i]));}
export function raidComparison(segment:number,attempt:number,batch:number,lane:Lane){
 const now=raidsFor(segment,attempt)[batch],old=raidsFor(segment,Math.max(0,attempt-1))[batch];
 const count=now.lanes.find(g=>g.lane===lane)?.count,previous=old.lanes.find(g=>g.lane===lane)?.count;
 return !attempt?'首次偵察':now.at===old.at&&count===previous?'與上次相同':`有變動：${now.at} 秒／${count} 隻（上次 ${old.at} 秒／${previous} 隻）`;
}
export const baitMatches=(bait:string,lane:Lane)=>bait===lane;

export const BAIT_HINTS:Record<Lane,string>={west:'只引西線，慢速拖住；東線會繼續前進。',center:'只接中央縱隊；兩翼不會跟來。',east:'只引東線，快速引進射界；西線不受影響。'};
