import {it,expect} from 'vitest';
import {newCampaign,begin,finish,chooseRelay,layBait,tick,VERSION} from '../src/campaign';
import {relayLoss,dispatchView,relayReceipt,crewCardView,swapPreview} from '../src/dispatch-view';
import {defensePoint} from '../src/art-layout';
import {baitForecast} from '../src/feedback';
import {CREW_NAMES,fatigueAfter,settle} from '../src/journey';
import {parse} from '../src/storage';
it.each([69,95,100])('both loss fields at %s contain only forgone benefits and both boxes save exactly',hull=>{
 for(const choice of ['rescue','repair'] as const){const c=newCampaign();c.segment=4;begin(c);finish(c);c.hull=hull;c.people=21;c.level=0;const before=structuredClone(c);
 const losses=['rescue','repair'].map(id=>relayLoss(c,id as typeof choice));for(const loss of losses){expect(loss).not.toMatch(/維持|仍生效|不變|同行 \+2/);expect(loss.split('；')).toHaveLength(new Set(loss.split('；')).size);}
 expect(losses[0]).toContain('林叔、阿禾不會加入');expect(dispatchView(c,choice).match(/封箱後同行/g)).toHaveLength(1);expect(dispatchView(c,choice)).toContain('/art/content-r5/rescue.webp');expect(dispatchView(c,choice)).not.toContain('relay-table.webp');expect(c).toEqual(before);
 chooseRelay(c,choice);expect(c.people).toBe(21+(choice==='rescue'?2:0));expect(c.supplies).toBe(before.supplies+(choice==='rescue'?4:0));expect(c.hull).toBe(choice==='repair'?Math.min(100,hull+18):hull);expect(c.repairCredit).toBe(choice==='repair'?Math.max(0,hull-82):0);expect(relayReceipt(c)).toContain('/art/content-r5/rescue.webp');expect(parse(JSON.stringify(c))).toEqual(c);expect(chooseRelay(c,choice)).toBe(false);
 }
});
it('stable display slots survive sorting, crossing, and removal of a neighbour',()=>{
 const es=[1,2,3,4].map(id=>({id,x:75,y:30,lane:'west',exit:'west'}));const a=es.map((e,i)=>defensePoint(e,i));const b=es.toReversed().map(e=>[e.id,defensePoint(e,e.id-1)]);for(const [id,p] of b)expect(p).toEqual(a[(id as number)-1]);expect(defensePoint(es[3],3)).toEqual(a[3]);expect(new Set(a.map(p=>`${p.x}/${p.y}`)).size).toBe(4);
});
it('preview targets are exactly same-lane live enemies, without mutation or spending',()=>{
 const c=newCampaign();c.segment=1;begin(c);expect(baitForecast(c,'west').count).toBe(4);expect(baitForecast(c,'east').unaffected).toBe(4);expect(baitForecast(c,'east').count).toBe(0);layBait(c,'west');for(let i=0;i<300;i++)tick(c,.05);const frozen=structuredClone(c),f=baitForecast(c,'east');expect(f.ids).toEqual(c.progress.enemies.filter(e=>e.lane==='east'&&!e.exit&&!e.attracted&&e.state!=='death'&&e.state!=='flung').map(e=>e.id));expect(f.unaffected).toBe(0);expect(f.exiting).toBeGreaterThan(0);expect(f.cost).toBe(1);expect(f.duration).toBe(12);expect(c).toEqual(frozen);
});
it('named crew use disjoint names and true time-specific fatigue without resetting on swap',()=>{
 expect(CREW_NAMES).toEqual(['老席','熹','安']);expect(CREW_NAMES[0]).not.toContain(CREW_NAMES[2]);const c=newCampaign();c.crew.fatigue=[3,0,2];c.crew.plan={driver:0,watch:2,rest:1};const before=structuredClone(c);const html=crewCardView(c,1,{person:1,role:'watch'});expect(html).toContain('休息 → 守夜');expect(html).toContain('aria-label="0→1 格（增加1）（目前→本段結束預估）"');expect(swapPreview(c,1,'watch')).toContain('不因交換重置');expect(dispatchView(c)).not.toContain('疲勞不變');expect(dispatchView(c)).not.toContain('級');expect(crewCardView(c,0)).toContain('7.75');expect(c).toEqual(before);const expected=fatigueAfter(c.crew);settle(c.crew,0);settle(c.crew,0);expect(c.crew.fatigue).toEqual(expected);expect(c.crew.history).toHaveLength(1);
});
it('immediately prior save preserves identities, fatigue and exit ledger',()=>{const c=newCampaign();c.version='0.11.2';c.crew.fatigue=[3,1,2];expect(parse(JSON.stringify(c))).toEqual({...c,version:VERSION});});
