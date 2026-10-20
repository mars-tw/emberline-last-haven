import {it,expect} from 'vitest';
import {newCampaign,begin,finish,chooseRelay,tick,layBait,VERSION,seal,inspect,counter,actualThreat} from '../src/campaign';
import {relayReceipt,dispatchView,crewCardView,crewEffectView} from '../src/dispatch-view';
import {diversionProgress} from '../src/feedback';
import {assign,fatigueAfter,settle,ROLES} from '../src/journey';
import {parse} from '../src/storage';
const run=(c:ReturnType<typeof newCampaign>,seconds:number)=>{for(let i=0;i<seconds*20;i++)tick(c,.05);};
function relay(hull=69){const c=newCampaign();c.segment=4;begin(c);finish(c);c.hull=hull;c.people=20;c.level=1;return c;}
it.each(['repair','rescue'] as const)('distinguishes carried and left case for %s and locks after reload',choice=>{
 const c=relay();const people=c.people,supplies=c.supplies;expect(chooseRelay(c,choice)).toBe(true);const html=relayReceipt(c);
 expect(html).toContain(`留站封存：${choice==='repair'?'救援包':'工具箱'}`);expect(html).toContain(`本章已帶走：${choice==='repair'?'工具箱':'救援包'}`);
 expect(html).not.toContain(`留站封存：${choice==='repair'?'工具箱':'救援包'}`);expect(c.people).toBe(people+(choice==='rescue'?2:0));expect(c.supplies).toBe(supplies+(choice==='rescue'?4:0));
 const saved=parse(JSON.stringify(c))!;expect(saved).toEqual(c);expect(chooseRelay(saved,choice==='repair'?'rescue':'repair')).toBe(false);
});
it.each([69,95,100])('hull %s forecast, committed accounting and reserve are consistent',hull=>{
 const c=relay(hull),html=dispatchView(c,'repair');expect((html.match(/轉存備修 18％/g)??[]).length).toBe(hull===100?1:0);expect(html).not.toContain('預選工具箱');expect(html).not.toContain('case-state');
 chooseRelay(c,'repair');expect(c.hull).toBe(Math.min(100,hull+18));expect(c.repairCredit).toBe(Math.max(0,hull-82));const receipt=relayReceipt(c);
 if(hull===69){expect(receipt).toContain('沒有備用維修');expect(receipt).not.toContain('自動補');expect(c.log.at(-1)).not.toContain('自動補');}else expect(receipt).toContain(`本箱備修入帳 ${hull-82}％`);
});
it('rescue guard collaboration promises the exact real guard increase in either case field',()=>{const c=relay();c.people=21;c.level=0;const html=dispatchView(c,'rescue');expect(html).toContain('守衛火力 8→9');expect(html).not.toContain('守衛增援');expect(html.split('守衛火力 8→9')).toHaveLength(2);expect(html).toContain('林叔、阿禾不會加入');expect(html).not.toContain('仍生效');});
it('counts every physical exit immediately, completes one group only after its fourth exit, and persists removed sprites',()=>{
 const c=newCampaign();c.segment=1;begin(c);layBait(c,'west');for(let i=0;i<500&&!c.progress.diversion['1:west']?.escaped;i++)tick(c,.05);
 expect(c.progress.diversion['1:west'].escaped).toBeGreaterThan(0);expect(c.progress.diversion['1:west'].escaped).toBeLessThan(4);expect(c.progress.divertedGroups).toEqual([]);
 expect(diversionProgress(c).join()).toContain(`${c.progress.diversion['1:west'].escaped}／4 已出界`);
 const saved=parse(JSON.stringify(c))!;expect(saved.progress.diversion).toEqual(c.progress.diversion);run(saved,5);expect(saved.progress.diversion['1:west']).toEqual({total:4,escaped:4});expect(saved.progress.divertedGroups).toEqual(['1:west']);expect(saved.progress.enemies.filter(e=>e.group==='1:west')).toEqual([]);
 const again=parse(JSON.stringify(saved))!;expect(again.progress.diversion).toEqual(saved.progress.diversion);run(again,1);expect(again.progress.divertedGroups).toEqual(['1:west']);
});
it('migrates R6 without inventing disappeared individual exits or losing earned groups',()=>{const c=newCampaign();c.version='0.11.1';c.segment=1;c.progress.divertedGroups=['1:west'];delete (c.progress as Partial<typeof c.progress>).diversion;const migrated=parse(JSON.stringify(c))!;expect(migrated.version).toBe(VERSION);expect(migrated.progress.divertedGroups).toEqual(['1:west']);expect(migrated.progress.diversion).toEqual({});});
it.each([null,{'1:west':{total:4,escaped:5}},{'1:north':{total:4,escaped:0}},{'1:west':{total:4,escaped:1.5}}])('rejects invalid current-version exit ledgers %j',ledger=>{const c=newCampaign();(c.progress as any).diversion=ledger;expect(parse(JSON.stringify(c))).toBeNull();});
it.each([[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]])('each person card owns the forecast for roles %s/%s/%s',(...plan)=>{
 const c=newCampaign();c.crew.fatigue=[2,0,2];c.crew.rested=1;ROLES.forEach((role,i)=>assign(c.crew,role,plan[i]));const predicted=fatigueAfter(c.crew);
 for(let person=0;person<3;person++){const html=crewCardView(c,person);expect(html).toContain(`${c.crew.fatigue[person]}→${predicted[person]} 格`);expect(html).toContain('card-effect');}
 settle(c.crew,0);expect(c.crew.fatigue).toEqual(predicted);expect(parse(JSON.stringify(c))!.crew.fatigue).toEqual(predicted);
});
it('names the replaced watch and shows explicit zero shields without changing the preview',()=>{const c=newCampaign();c.crew.plan={driver:0,watch:2,rest:1};c.crew.fatigue=[2,0,2];c.crew.rested=1;c.level=1;const frozen=structuredClone(c);expect(crewCardView(c,1,{person:1,role:'watch'})).not.toContain('原安');expect(crewEffectView(c,{person:1,role:'watch'})).toContain('安原任守夜：14秒預警 → 熹 18秒預警');expect(crewCardView(c,2)).toContain('可擋 0 次');expect(c).toEqual(frozen);});
it('reserve deducts exactly the next unshielded real night impact and persists',()=>{const c=relay(100);chooseRelay(c,'repair');c.segment=5;c.screen='intro';c.progress=newCampaign().progress;c.crew.rested=null;begin(c);inspect(c,'passenger-breathing');inspect(c,'window-silhouette');seal(c,actualThreat(c));expect(c.crew.shield).toBe(0);counter(c,'brace');expect(c.hull).toBe(100);expect(c.repairCredit).toBe(12);expect(c.log.join()).toContain('自動維修 +6％，剩 12％');expect(parse(JSON.stringify(c))!.repairCredit).toBe(12);});
