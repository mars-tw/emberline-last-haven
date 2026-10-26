import {it,expect} from 'vitest';
import {newCampaign,begin,finish,chooseRelay,tick,layBait,VERSION} from '../src/campaign';
import {repairAccount,dispatchView,crewEffectView} from '../src/dispatch-view';
import {fatigueAfter,settle,assign} from '../src/journey';
import {avoidLabels} from '../src/art-layout';
import {lureStatus} from '../src/feedback';
import {parse} from '../src/storage';
it('migrates the immediately previous R5 version without losing the campaign',()=>{const c=newCampaign();c.version='0.11.0';c.crew.fatigue=[3,1,0];c.relay={'0':'rescue'};const restored=parse(JSON.stringify(c))!;expect(restored).toEqual({...c,version:VERSION});});
it('reports every earned group on the same flank, rather than a fixed one',()=>{const c=newCampaign();c.progress.divertedGroups=['2:east','3:east'];expect(lureStatus(c)).toBe('東側已引離 2 群');});
it.each([[4,69,18,0],[7,95,5,13],[7,100,0,18]])('chapter relay %s computes gain, loss, commit and saved credit', (segment,hull,repaired,stored)=>{
 const c=newCampaign();c.segment=segment;begin(c);finish(c);c.hull=hull;
 const before=structuredClone(c),text=repairAccount(c.hull),html=dispatchView(c,'repair');
 expect(html.split(text).length).toBe(2);expect(html).toContain(hull===100?'下段少 18％備修':`少 ${repaired}％車體修復`);expect(html).not.toContain('另存 0');expect(html).not.toContain('100→100');expect(html).not.toContain('18％即修／備修');expect(html).toContain('已選擇工具箱');expect(html.match(/付出／得到/g)).toHaveLength(2);expect(c).toEqual(before);
 if(hull<100)expect(html).toContain(`車體 ${hull}→${hull+repaired}％`);else expect(html).toContain('轉備修 18％');
 expect(chooseRelay(c,'repair')).toBe(true);expect(c.hull).toBe(hull+repaired);expect(c.repairCredit).toBe(stored);expect(c.relayResults[String(Math.floor(segment/3))]).toEqual({before:hull,repaired,stored});
 const saved=parse(JSON.stringify(c))!;expect(saved.version).toBe(VERSION);expect(chooseRelay(saved,'rescue')).toBe(false);expect(saved).toEqual(c);
});
it('never calls a committed exit turning after bait expiration and survives reload',()=>{
 const c=newCampaign();c.segment=1;begin(c);layBait(c,'west');for(let i=0;i<245;i++)tick(c,.05);
 expect(c.progress.baitLeft).toBe(0);expect(c.progress.enemies.some(e=>e.exit)).toBe(true);expect(lureStatus(c)).not.toContain('轉向中');expect(lureStatus(c)).toContain('離場中');
 const saved=parse(JSON.stringify(c))!;for(let i=0;i<140;i++)tick(saved,.05);expect(saved.progress.attracted).toBe(4);expect(saved.progress.divertedGroups).toEqual(['1:west']);
});
it.each([0,1,2,3])('fatigue %s forecast matches settlement and does not mutate preview',fatigue=>{
 const c=newCampaign();c.crew.fatigue=[fatigue,fatigue,fatigue];c.crew.rested=1;const before=structuredClone(c);
 const text=crewEffectView(c,{person:1,role:'watch'});expect(c).toEqual(before);expect(text).toContain('剛休息，可擋1次，僅本段有效');expect(text).toContain('安專長使疲勞減少3格');
 assign(c.crew,'watch',1);const predicted=fatigueAfter(c.crew);expect(predicted).toEqual([Math.min(3,fatigue+1),Math.min(3,fatigue+1),Math.max(0,fatigue-3)]);
 for(const [i,name] of ['老席','熹','安'].entries())expect(text).toContain(`${name} ${fatigue}→${predicted[i]} 格`);
 settle(c.crew,0);expect(c.crew.fatigue).toEqual(predicted);settle(c.crew,0);expect(c.crew.fatigue).toEqual(predicted);expect(parse(JSON.stringify(c))!.crew.fatigue).toEqual(predicted);
});
it('keeps four crowded edge labels fully inside and disjoint',()=>{
 for(const x of [-49,0,30,340,409]){const labels=avoidLabels([0,1,2,3].map(()=>({x,y:200})));expect(labels).toHaveLength(4);
 for(const [i,p] of labels.entries()){expect(p.x-42).toBeGreaterThanOrEqual(10);expect(p.x+42).toBeLessThanOrEqual(350);expect(p.y).toBeGreaterThanOrEqual(150);expect(p.y+24).toBeLessThanOrEqual(482);for(const q of labels.slice(i+1))expect(Math.abs(p.x-q.x)>=88||Math.abs(p.y-q.y)>=27).toBe(true);}}
});
