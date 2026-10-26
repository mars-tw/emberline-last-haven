import {it,expect} from 'vitest';
import {newCampaign,begin,finish,chooseRelay,advance,inspect,seal,counter,actualThreat,VERSION} from '../src/campaign';
import {RADIO_SIGNALS,radioTimeline,radioAction,radioView} from '../src/radio';
import {crewComparison,crewRiskView,relayReceipt,dispatchView} from '../src/dispatch-view';
import {parse} from '../src/storage';

it.each(RADIO_SIGNALS)('$name has three sequential beats with a long pulse exactly three times the short pulse',s=>{
 const t=radioTimeline(s.code);expect(t).toHaveLength(3);expect(t.map(f=>f.index)).toEqual([0,1,2]);for(let i=1;i<3;i++)expect(t[i].start).toBe(t[i-1].start+t[i-1].duration+180);
 expect(t.find(f=>f.beat==='長')!.duration).toBe(t.find(f=>f.beat==='短')!.duration*3);
});
it.each([0,1,2])('chapter %s never reveals the right answer before dispatch and one-person dialogue matches exactly +1/+2',ch=>{
 const c=newCampaign();c.segment=ch*3+1;begin(c);radioAction(c,'call');expect(radioView(c)).toContain('缺西側／東側');expect(radioAction(c,'send-east')).toBe(false);radioAction(c,'west');radioAction(c,'east');expect(radioView(c)).not.toContain('data-mismatch="true"');expect(radioView(c)).not.toContain('接回'+RADIO_SIGNALS[ch].name);
 const before=[c.people,c.supplies];radioAction(c,`send-${RADIO_SIGNALS[ch].answer}`);expect([c.people,c.supplies]).toEqual([before[0]+1,before[1]+2]);expect(radioView(c)).toContain('一個人');const saved=JSON.stringify(c);radioAction(c,'call');expect(JSON.stringify(c)).toBe(saved);expect(parse(saved)!.radio[String(ch)].done).toBe(true);
});
it('95% repair exposes pending13 then records exact unshielded 100→93→100 and13→6, survives save',()=>{
 const c=newCampaign();c.segment=1;begin(c);finish(c);c.hull=95;chooseRelay(c,'repair');expect(c.repairCredit).toBe(13);expect(relayReceipt(c)).toContain('待生效項目');expect(relayReceipt(c)).toContain('備修 13％');advance(c);inspect(c,'passenger-breathing');inspect(c,'window-silhouette');seal(c,actualThreat(c));counter(c,'brace');expect(c.repairUse).toEqual({source:'灰燼出城工具箱',beforeHull:100,damagedHull:93,afterHull:100,beforeCredit:13,used:7,afterCredit:6});expect(parse(JSON.stringify(c))!.repairUse).toEqual(c.repairUse);const bad=structuredClone(c);bad.repairUse!.used++;expect(parse(JSON.stringify(bad))).toBeNull();
});
it.each([69,95,100])('hull%s has an obvious expandable exact18 account and pending source after sealing',hull=>{
 const c=newCampaign();c.segment=1;begin(c);finish(c);c.hull=hull;expect(dispatchView(c,'repair')).toContain('▸ 修復明細・總值18％');chooseRelay(c,'repair');expect(relayReceipt(c)).toContain('灰燼出城工具箱');expect(c.hull+c.repairCredit).toBe(hull+18);
});
it.each([70,99,100])('rescue night repair at pre-general%s obeys the exact marginal2 and100 cap',hull=>{
 const c=newCampaign();c.segment=2;begin(c);c.relay['0']='rescue';c.people=3;c.hull=hull;finish(c);const r=c.nightRepair!;expect(r.extra).toBe(Math.min(2,100-hull-r.base));expect(r.after).toBe(Math.min(100,hull+r.base+2));expect(parse(JSON.stringify(c))!.nightRepair).toEqual(r);
});
it('all three fatigue rows keep identical order and risk separates seconds from fatigue counts',()=>{
 const c=newCampaign();c.crew.fatigue=[3,0,2];c.crew.plan={driver:0,watch:2,rest:1};const before=structuredClone(c),h=crewComparison(c,1,'watch');expect(h.match(/老席・/g)).toHaveLength(2);expect(h.match(/熹・/g)).toHaveLength(2);expect(h.match(/安・/g)).toHaveLength(2);expect(h).toContain('疲勞 2→0（減少2）');expect(h).not.toContain('回復');const risk=crewRiskView(c,0);expect(risk).toContain('基礎 5.5 秒');expect(risk).toContain('因疲勞增加 3×0.75＝2.25 秒');expect(risk).not.toContain('疲勞 +2.25');expect(c).toEqual(before);
});
it('R11 saves upgrade to current version without losing durable radio or repair ledger',()=>{
 const c=newCampaign();c.version='0.13.0';c.radio['0']={heard:['call','west','east'],choice:'east',done:true,attempts:1};expect(parse(JSON.stringify(c))).toEqual({...c,version:VERSION});
});
