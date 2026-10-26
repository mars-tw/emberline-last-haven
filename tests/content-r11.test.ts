import {it,expect} from 'vitest';
import {newCampaign,begin,inspect,seal,counter,actualThreat,nightPresentation,tick,finish,chooseRelay,VERSION} from '../src/campaign';
import {radioAction,radioView,RADIO_SIGNALS} from '../src/radio';
import {watchSource,crewComparison,dispatchView,relayReceipt} from '../src/dispatch-view';
import {parse} from '../src/storage';
it.each([0,1,2])('chapter %s radio highlights each mismatching beat and preserves the exact one-time outcome',ch=>{
 const c=newCampaign();c.segment=ch*3+1;begin(c);const before=[c.people,c.supplies];
 for(const a of ['call','west','east'] as const)radioAction(c,a);
 const answer=RADIO_SIGNALS[ch].answer,wrong=answer==='west'?'east':'west';radioAction(c,`send-${wrong}`);
 const view=radioView(c);expect(view.match(/data-mismatch="true"/g)).toHaveLength(2);expect(view).toContain('不派車、不扣款');expect(view).toContain(ch===2?'第 2、3 拍':'第 1、2 拍');expect([c.people,c.supplies]).toEqual(before);
 radioAction(c,`send-${answer}`);const saved=parse(JSON.stringify(c))!;expect(saved.radio[String(ch)].done).toBe(true);expect([saved.people,saved.supplies]).toEqual([before[0]+1,before[1]+2]);expect(radioAction(saved,`send-${answer}`)).toBe(false);expect(radioView(saved)).toContain('不能重領');
});
it('all roster cards have their own potential warning and shield sources rather than copying the current watcher',()=>{
 const c=newCampaign();c.level=1;c.crew.fatigue=[3,0,2];c.crew.rested=1;
 for(const [i,name,seconds,shield] of [[0,'老席',14,0],[1,'熹',18,1],[2,'安',14,0]] as const){const h=watchSource(c,c.crew,i);expect(h).toContain(`預警：${name}・${seconds} 秒`);expect(h).toContain(`擋擊：${name}・盾格 ${shield}／1`);expect(h).toContain(`16＋1×2－${c.crew.fatigue[i]}×2＋0＋${i===0?2:0}＝${seconds} 秒`);}
 const before=structuredClone(c);expect(crewComparison(c,0,'watch')).toContain('交換前');expect(crewComparison(c,0,'watch')).toContain('交換後');expect(crewComparison(c,0,'watch')).toContain('14秒預警／盾0');expect(crewComparison(c,0,'watch')).toContain('甩尾 7.75 秒');expect(c).toEqual(before);
});
it.each([69,95,100])('hull %s puts both decisions before closed accounting details and seals the same values',hull=>{
 const c=newCampaign();c.segment=4;begin(c);finish(c);c.hull=hull;c.people=21;
 const h=dispatchView(c,'repair');expect(h).toContain(`立刻修到 ${Math.min(100,hull+18)}％，總值 18％`);expect(h.replace(/<[^>]+>/g,'')).toContain('+4 補給、+2 人、火力');expect(h.indexOf('case-summary')).toBeLessThan(h.indexOf('repair-details'));expect(h).not.toContain('備用維修');expect(h).not.toContain('夜間修復 0');
 chooseRelay(c,'repair');expect(c.hull).toBe(Math.min(100,hull+18));expect(c.repairCredit).toBe(Math.max(0,hull-82));expect(relayReceipt(c)).not.toContain('repair-formula');expect(parse(JSON.stringify(c))).toEqual(c);
});
it.each(['roof','window'] as const)('%s selected action, impact and result share one immutable resource receipt',zone=>{
 for(const kind of ['correct','wrong','free'] as const){const c=newCampaign();c.segment=2;c.hull=88;c.crew.rested=1;begin(c);inspect(c,'passenger-breathing');inspect(c,'window-silhouette');seal(c,actualThreat(c));if(actualThreat(c)!==zone)counter(c,actualThreat(c));
 const s=c.supplies,choice=kind==='free'?'brace':kind==='correct'?zone:zone==='roof'?'window':'roof';counter(c,choice);
 let f=nightPresentation(c)!;expect(f.phase).toBe('selected');expect(f.choice).toBe(choice);expect(f.beforeSupplies).toBe(s);expect(f.afterSupplies).toBe(s-(kind==='free'?0:2));expect(f.beforeHull).toBe(88);expect(f.afterHull).toBe(88);expect(f.afterShield).toBe(kind==='correct'?1:0);
 for(let i=0;i<11;i++)tick(c,.05);expect(nightPresentation(c)!.phase).toBe('impact');for(let i=0;i<5;i++)tick(c,.05);expect(nightPresentation(c)!.phase).toBe(kind==='correct'?'countered':'blocked');expect(parse(JSON.stringify(c))!.progress.nightFeedback).toEqual(c.progress.nightFeedback);
 }
});
it('a shield spent in wave one remains empty in wave two and reload does not replenish it',()=>{const c=newCampaign();c.segment=2;c.crew.rested=1;begin(c);inspect(c,'passenger-breathing');inspect(c,'window-silhouette');seal(c,actualThreat(c));counter(c,'brace');for(let i=0;i<32;i++)tick(c,.05);const loaded=parse(JSON.stringify(c))!,hull=loaded.hull;expect(loaded.crew.shield).toBe(0);counter(loaded,'brace');expect(loaded.crew.shield).toBe(0);expect(loaded.hull).toBe(hull-7);expect(loaded.progress.nightFeedback?.beforeShield).toBe(0);});
it('validates the selected-action account and migrates R10 without resource or history changes',()=>{const c=newCampaign();c.version='0.12.0';expect(parse(JSON.stringify(c))).toEqual({...c,version:VERSION});c.segment=2;begin(c);inspect(c,'passenger-breathing');inspect(c,'window-silhouette');seal(c,actualThreat(c));counter(c,'brace');c.progress.nightFeedback!.cost=2;expect(parse(JSON.stringify(c))).toBeNull();});
