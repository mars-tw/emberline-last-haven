import {it,expect} from 'vitest';
import {newCampaign,begin,advance,finish,assignCrew,inspect,seal,counter,actualThreat,upgrade,visibleResources,shieldSource,VERSION} from '../src/campaign';
import {freshCrew,driftSeconds,watchNumbers,fatigueAfter,type Role} from '../src/journey';
import {crewComparison,crewEffectView,dispatchView} from '../src/dispatch-view';
import {parse} from '../src/storage';

// Parse the actual displayed arithmetic, with multiplication before addition.
// This evaluator has no dependency on production rule helpers and never executes code.
function equations(html:string){return [...html.matchAll(/data-equation="(driver|watch|rest)">([^<]+)</g)].map(m=>{
 const [left,right]=m[2].split('＝'),terms=left.replaceAll('－','＋-').split('＋');
 expect(left).toMatch(/^[\d.＋－×]+$/);
 const result=terms.reduce((sum,term)=>sum+term.split('×').reduce((p,n)=>p*Number(n),1),0);
 const shown=Number(right.replace(/ 秒| 格/g,''));expect(result).toBe(shown);
 return {role:m[1],shown,text:m[2]};
});}
const permutations=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
it('recomputes every visible equation across 6144 live roster states, including every role, fatigue, grade and rest source',()=>{
 let count=0;
 for(const [driver,watch,rest] of permutations)for(let a=0;a<4;a++)for(let b=0;b<4;b++)for(let d=0;d<4;d++)for(let level=0;level<4;level++)for(const rested of [null,0,1,2]){
  const c=newCampaign();c.level=level;c.crew={...freshCrew(),plan:{driver,watch,rest},fatigue:[a,b,d],rested,driftPenalty:999,warningPenalty:999};
  const eq=equations(crewEffectView(c));expect(eq).toHaveLength(3);
  expect(eq[0].shown).toBe(5.5+c.crew.fatigue[driver]*.75-(driver===1?.5:0));
  expect(eq[1].shown).toBe(Math.max(6,16+level*2-c.crew.fatigue[watch]*2)+(watch===0?2:0));
  expect(eq[2].shown).toBe(Math.max(0,c.crew.fatigue[rest]-(rest===2?3:2)));
  expect(driftSeconds(c.crew)).toBe(eq[0].shown);expect(watchNumbers(c.crew,level).seconds).toBe(eq[1].shown);expect(fatigueAfter(c.crew)[rest]).toBe(eq[2].shown);
  const comparison=equations(crewComparison(c,watch,'rest'));expect(comparison).toHaveLength(6);
  expect(comparison.slice(0,3).map(e=>e.role).sort()).toEqual(['driver','rest','watch']);count++;
 }
 expect(count).toBe(6144);
});
it('R12 regression: driver 7.75 is 5.5+3×0.75−0, never the watcher formula 18+2−3×2',()=>{
 const c=newCampaign();c.level=1;c.crew.plan={driver:0,watch:2,rest:1};c.crew.fatigue=[3,0,2];
 const html=crewComparison(c,1,'watch'),eq=equations(html);expect(eq.filter(e=>e.role==='driver').map(e=>e.text)).toEqual(['5.5＋3×0.75－0＝7.75 秒','5.5＋3×0.75－0＝7.75 秒']);
});
it('current fatigue ignores stale history snapshots before preview, cancel, apply and save/reload',()=>{
 const c=newCampaign();c.screen='report';c.segment=4;c.relay['1']='passed';c.crew.fatigue=[3,0,2];c.crew.plan={driver:0,watch:2,rest:1};
 c.crew.history=[{segment:4,plan:{driver:0,watch:1,rest:2},fatigue:[3,3,0]}];
 const before=structuredClone(c);expect(dispatchView(c)).toContain('目前疲勞：老席 3・熹 0・安 2');expect(dispatchView(c)).not.toContain('第5段 老席 3・熹 3・安 0');
 equations(crewComparison(c,1,'watch'));expect(c).toEqual(before);assignCrew(c,'watch',1);
 const saved=parse(JSON.stringify(c))!;expect(saved.crew).toEqual(c.crew);expect(dispatchView(saved)).toContain('目前疲勞：老席 3・熹 0・安 2');
});
it('upgrade grade is not shield inventory: cost4 and repair15 never replenish a consumed shield',()=>{
 const c=newCampaign();c.screen='report';c.supplies=20;c.hull=80;c.crew.shield=0;c.crew.rested=1;
 expect(upgrade(c)).toBe(true);expect(visibleResources(c)).toEqual({level:1,people:3,supplies:16,hull:95,shield:0});
 expect(c.log.at(-1)).toContain('盾格 0→0（升級不補盾）');expect(shieldSource(c)).toContain('本段出發盾格 0→1（免費）');
 expect(parse(JSON.stringify(c))!.crew.shield).toBe(0);
});
it.each(['roof','window'] as const)('%s: HUD and watcher use the same before/after transaction, then remain consumed across waves and reload',zone=>{
 const c=newCampaign();c.segment=1;begin(c);finish(c);c.relay['0']='rescue';c.crew.rested=1;c.crew.plan={driver:0,watch:1,rest:2};advance(c);
 inspect(c,'passenger-breathing');inspect(c,'window-silhouette');seal(c,actualThreat(c));
 if(actualThreat(c)!==zone){counter(c,actualThreat(c));c.progress.nightFeedback!.age=1.8;}
 const before=visibleResources(c);counter(c,'brace');expect(visibleResources(c)).toEqual(before);
 c.progress.nightFeedback!.age=.5;const after=visibleResources(c);expect(after.shield).toBe(0);expect(after.supplies).toBe(before.supplies);expect(after.hull).toBe(before.hull);
 c.progress.nightFeedback!.age=.9;expect(visibleResources(c)).toEqual(after);
 const saved=parse(JSON.stringify(c))!;expect(visibleResources(saved)).toEqual(after);expect(saved.crew.shield).toBe(0);
});
it('previous 0.13.1 saves retain all decisions, resources, fatigue and shields while migrating version',()=>{
 const c=newCampaign();c.version='0.13.1';c.crew.fatigue=[3,0,2];c.level=1;expect(parse(JSON.stringify(c))).toEqual({...c,version:VERSION});
});
