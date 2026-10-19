import {it,expect} from 'vitest';
import {newCampaign,begin,tick,layBait,finish,chooseRelay,guardPower,assignCrew,advance,inspect,seal,counter,actualThreat} from '../src/campaign';
import {crewEffectView,dispatchView,relayReceipt,rescuePower} from '../src/dispatch-view';
import {parse} from '../src/storage';
const step=(c:ReturnType<typeof newCampaign>,seconds:number)=>{for(let i=0;i<Math.ceil(seconds*20);i++)tick(c,.05);};
it('walks from the bait to the boundary, awards only at full exit, retains the exit stamp',()=>{
 const c=newCampaign();c.segment=1;begin(c);layBait(c,'west');step(c,10.5);
 expect(c.progress.enemies.some(e=>e.exit==='west')).toBe(true);expect(c.progress.attracted).toBe(0);
 let crossed=false;for(let i=0;i<200&&!crossed;i++){
  const before=c.progress.attracted;tick(c,.05);
  if(c.progress.attracted>before){crossed=true;const e=c.progress.enemies.find(e=>e.escapedAt!==undefined)!;expect(e.x).toBeLessThan(-48);expect(e.escapedAt).toBe(c.progress.time);expect(c.progress.divertedGroups).toEqual([]);expect(c.progress.diversion['1:west'].escaped).toBe(2);}
 }
 expect(crossed).toBe(true);step(c,3);expect(c.progress.divertedGroups).toEqual(['1:west']);expect(c.progress.diversion['1:west']).toEqual({total:4,escaped:4});expect(parse(JSON.stringify(c))).toEqual(c);
});
it('spawns all four east enemies while the renewed west bait is active, with no wrong-side diversion',()=>{
 const c=newCampaign();c.segment=1;begin(c);layBait(c,'west');step(c,12.1);layBait(c,'west');step(c,2.1);
 const east=c.progress.enemies.filter(e=>e.lane==='east');expect(east).toHaveLength(4);expect(c.progress.baitLeft).toBeGreaterThan(0);
 const y=east.map(e=>e.y);step(c,1);for(let i=0;i<4;i++){expect(east[i].y).toBeGreaterThan(y[i]);expect(east[i].exit).toBeUndefined();expect(east[i].attracted).toBe(false);}
});
it('reloads a committed exit after the bait expires and preserves exact boundary awards',()=>{
 const c=newCampaign();c.segment=1;begin(c);layBait(c,'west');step(c,12.1);const restored=parse(JSON.stringify(c))!;
 expect(restored.progress.baitLeft).toBe(0);expect(restored.progress.enemies.some(e=>e.exit)).toBe(true);step(restored,7);expect(restored.progress.divertedGroups).toEqual(['1:west']);expect(restored.progress.attracted).toBe(4);expect(parse(JSON.stringify(restored))).toEqual(restored);
});
it.each(['north',null,55])('rejects corrupt persisted exit direction %s',exit=>{const c=newCampaign();c.segment=1;begin(c);layBait(c,'west');step(c,1);(c.progress.enemies[0] as any).exit=exit;expect(parse(JSON.stringify(c))).toBeNull();});
it('rejects an invented escape stamp before crossing the boundary',()=>{const c=newCampaign();c.segment=1;begin(c);layBait(c,'west');step(c,1);Object.assign(c.progress.enemies[0],{exit:'west',escapedAt:0,attracted:true});expect(parse(JSON.stringify(c))).toBeNull();});
it('previews numeric effects without saving and matches the committed next effects',()=>{
 const c=newCampaign();c.crew.plan={driver:0,watch:2,rest:1};c.crew.fatigue=[1,0,1];c.crew.rested=1;c.level=1;const before=structuredClone(c);
 const html=crewEffectView(c,{person:1,role:'watch'});expect(html).toContain('安原任守夜：16秒預警 → 熹 18秒預警');expect(html).toContain('新增可擋 1 次');expect(html).toContain('熹原任休息：0格回復 → 安 1格回復');expect(html).toContain('熹守夜：後續每波 18 秒預警，可擋 1 次撞擊');expect(html).toContain('安休息：本段後疲勞回復 1 格');expect(c).toEqual(before);
 assignCrew(c,'watch',1);const actual=crewEffectView(c);for(const value of ['熹守夜：後續每波 18 秒預警，可擋 1 次撞擊','安休息：本段後疲勞回復 1 格'])expect(actual).toContain(value);
});
it('uses the very same rested Xi from the swap in an actual train block',()=>{
 const c=newCampaign();c.segment=1;begin(c);c.crew.plan={driver:0,watch:2,rest:1};finish(c);chooseRelay(c,'rescue');expect(c.crew.rested).toBe(1);assignCrew(c,'watch',1);advance(c);expect(c.crew.plan.watch).toBe(1);expect(c.crew.shield).toBe(1);
 inspect(c,'passenger-breathing');inspect(c,'window-silhouette');seal(c,actualThreat(c));const hull=c.hull;counter(c,'brace');expect(c.hull).toBe(hull);expect(c.crew.shield).toBe(0);expect(c.log.join('')).toContain('熹擋下這次撞擊');
});
it.each([4,7])('has distinct real object icons, consistent previews and immutable saved rescue in segment %s',segment=>{
 const c=newCampaign();c.segment=segment;c.people=21;c.level=0;begin(c);finish(c);const html=dispatchView(c,'rescue');expect(rescuePower(c)).toContain('守衛火力維持 8');expect(html).not.toContain('8→8');expect(html).toContain('/art/content-r5/rescue.webp');expect(html).toContain('/art/content-r5/repair.webp');
 const people=c.people+2,supplies=c.supplies-3,power=guardPower({...c,people});chooseRelay(c,'rescue');expect(c.people).toBe(people);expect(c.supplies).toBe(supplies);expect(guardPower(c)).toBe(power);expect(relayReceipt(c)).toContain('/art/content-r5/rescue.webp');expect(parse(JSON.stringify(c))!.relay[String(Math.floor(segment/3))]).toBe('rescue');expect(chooseRelay(c,'repair')).toBe(false);
});
it('shows no same-value hull arrows on full-hull repair receipts',()=>{const c=newCampaign();c.segment=1;begin(c);finish(c);chooseRelay(c,'repair');expect(relayReceipt(c)).not.toContain('100→100');expect(relayReceipt(c)).toContain('修復 0％');expect(relayReceipt(c)).toContain('/art/content-r5/repair.webp');});
it('migrates R4 saves without changing fatigue, resources or earned groups',()=>{const c=newCampaign();c.version='0.10.0';c.progress.divertedGroups=['1:west'];c.progress.attracted=4;const m=parse(JSON.stringify(c))!;expect(m.version).toBe('0.11.3');expect(m.crew).toEqual(c.crew);expect(m.progress.divertedGroups).toEqual(c.progress.divertedGroups);expect(m.supplies).toBe(c.supplies);});
it('does not award an already-counted R4 enemy again when it finally walks outside',()=>{const c=newCampaign();c.version='0.10.0';c.segment=1;begin(c);c.progress.started=true;c.progress.defenseBatch=3;c.progress.divertedGroups=['1:west'];c.progress.attracted=1;c.progress.enemies=[{id:1,x:75,y:285,hp:3,state:'walk',age:0,slot:-1,type:'runner',hit:false,attracted:true,lane:'west',group:'1:west'}];const m=parse(JSON.stringify(c))!;expect(m.progress.enemies[0].exit).toBe('west');step(m,8);expect(m.progress.attracted).toBe(1);expect(m.progress.divertedGroups).toEqual(['1:west']);expect(m.progress.enemies).toEqual([]);});
