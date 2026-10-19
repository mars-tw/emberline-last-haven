import {modeFor,campaignRaids,type Campaign} from './campaign';
import {LANE_NAMES,baitMatches,type Lane} from './journey';

export function lureState(c:Campaign,e:Campaign['progress']['enemies'][number]){
 if(e.attracted)return 'diverted';
 return e.exit||c.progress.baitLeft>0&&baitMatches(c.progress.bait,e.lane??'center')?'turning':'unaffected';
}
export function diversionProgress(c:Campaign){
 return Object.entries(c.progress.diversion).filter(([group,r])=>r.escaped>0||c.progress.enemies.some(e=>e.group===group&&(e.exit||c.progress.baitLeft>0&&baitMatches(c.progress.bait,e.lane??'center')))).map(([group,r])=>`${group.startsWith('legacy')?'舊批':`第${group[0]}批`}${{west:'西群',center:'中群',east:'東群'}[group.split(':')[1] as Lane]} ${r.escaped}／${r.total} 已出界`);
}
export function lureStatus(c:Campaign){
 return (['west','center','east'] as Lane[]).map(lane=>{
  const enemies=c.progress.enemies.filter(e=>e.lane===lane&&e.state!=='death'&&e.state!=='flung');
  const diverted=c.progress.divertedGroups.filter(g=>g.endsWith(':'+lane)).length;
  const exiting=enemies.some(e=>e.exit&&!e.attracted);
  return c.progress.baitLeft>0&&baitMatches(c.progress.bait,lane)&&enemies.some(e=>!e.exit)?`${LANE_NAMES[lane]}轉向中`:exiting?diverted?`${LANE_NAMES[lane]}已引離 ${diverted} 群・餘下離場中`:`${LANE_NAMES[lane]}離場中`:diverted?`${LANE_NAMES[lane]}已引離 ${diverted} 群`:enemies.length?`${LANE_NAMES[lane]}未受影響`:'';
 }).filter(Boolean).join('・');
}

/** Each mode exposes one primary task; defense time is a separate unnumbered progress bar. */
export function countdown(c:Campaign){
 const p=c.progress,m=modeFor(c.segment);
 if(c.screen==='report')return m==='defense'?`補給 +${c.reward} · 已引離 ${Math.min(2,p.divertedGroups.length)}／2 群${p.divertedGroups.length>=2?' 已達標':''}`:`補給 +${c.reward} · 同行 ${c.people} 人`;
 if(c.screen!=='play')return '';
 if(m==='convoy')return p.time<48?`${Math.ceil(48-p.time)} 秒 · 甩落 ${p.flung}`:`加程 ${Math.max(0,Math.ceil(78-p.time))} 秒 · 甩落 ${p.flung}/2`;
 if(m==='defense')return !p.started?'選落點後開始':`已引離 ${Math.min(2,p.divertedGroups.length)}／2 群${p.divertedGroups.length>=2?' 已達標':''}`;
 return p.started?`第 ${p.wave} / 3 波 · ${Math.ceil(p.warning)} 秒`:'兩份觀察 → 封存判讀';
}

export function reportSummary(c:Campaign){
 const p=c.progress;
 return modeFor(c.segment)==='convoy'?`救回 ${p.rescued} 人；同行 ${c.people} 人、守衛火力 ${1+Math.floor(c.people/3)+c.level}。補給 +${c.reward}。`:modeFor(c.segment)==='defense'?`共引離 ${p.attracted} 隻；目前車體 ${Math.ceil(c.hull)}％。補給 +${c.reward}。`:`反制 ${p.countered}／3 波，承受 ${p.impacts} 次撞擊。補給 +${c.reward}。`;
}

/** Same predicate as the simulation; the preview never spends or mutates state. */
export function baitForecast(c:Campaign,lane:Lane){
 const p=c.progress,live=p.enemies.filter(e=>!e.attracted&&e.state!=='death'&&e.state!=='flung');
 const matched=live.filter(e=>e.lane===lane&&!e.exit);
 return {ids:matched.map(e=>e.id),count:!p.started?(campaignRaids(c)[0].lanes.find(g=>g.lane===lane)?.count??0):matched.length,unaffected:!p.started?campaignRaids(c)[0].lanes.filter(g=>g.lane!==lane).reduce((n,g)=>n+g.count,0):live.filter(e=>e.lane!==lane&&!e.exit).length,exiting:live.filter(e=>e.exit).length,cost:1,duration:12,exit:lane==='west'?'西側出口':'東側出口'};
}

/** DOM identity persists while a finger is held; only replace on control-mode changes. */
export function controlKey(c:Campaign){return `${c.screen}:${modeFor(c.segment)}:${c.progress.started}`;}
