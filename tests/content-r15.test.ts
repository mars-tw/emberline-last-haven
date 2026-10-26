import {it,expect} from 'vitest';
import {newCampaign,watchPose,visibleResources,VERSION,chooseRelay,begin,finish} from '../src/campaign';
import {crewCardView,rescueCap,rescuePower,rescueTeamView} from '../src/dispatch-view';
import {parse} from '../src/storage';
import {DANGER_COLOR} from '../src/render';
import {nextRaidText,raidsFor} from '../src/journey';

it('uses the exact solid red legend color for danger markers and distinguishes the next batch',()=>{
 expect(DANGER_COLOR).toBe('#ef654f');expect(nextRaidText(raidsFor(1)[2],24)).toBe('6 秒・下一批中央 9 隻');
});
it.each(['selected','impact','blocked'] as const)('Lao Xi shield1 block %s follows the transaction, not the already-spent inventory',phase=>{
 const c=newCampaign();c.screen='play';c.segment=2;c.crew.plan={watch:0,driver:1,rest:2};c.crew.shield=0;
 c.progress.nightFeedback={age:{selected:.1,impact:.5,blocked:.9}[phase],wave:1,threat:'roof',choice:'brace',cost:0,beforeSupplies:c.supplies,afterSupplies:c.supplies,beforeHull:87,afterHull:87,beforeShield:1,afterShield:0,outcome:'blocked'};
 expect(watchPose(c)).toBe(phase==='selected'?'listen':'block');expect(visibleResources(c).shield).toBe(phase==='selected'?1:0);
 expect(watchPose(parse(JSON.stringify(c))!)).toBe(watchPose(c));
});
it('shield0 wait observes; a damaging contact protects the head without a shield pose; recovery observes again',()=>{
 const c=newCampaign();c.screen='play';c.segment=2;c.crew.shield=0;expect(watchPose(c)).toBe('listen');
 c.progress.nightFeedback={age:.5,wave:1,threat:'roof',choice:'brace',beforeHull:87,afterHull:81,beforeShield:0,afterShield:0,outcome:'damaged'};
 expect(watchPose(c)).toBe('hurt');c.progress.nightFeedback.age=.9;expect(watchPose(c)).toBe('hurt');
 c.progress.nightFeedback.age=1.6;expect(watchPose(c)).toBe('listen');
});
it('countered contact and malformed zero-shield block never select a board',()=>{
 const c=newCampaign();c.screen='play';c.segment=2;c.progress.nightFeedback={age:.9,wave:1,threat:'roof',choice:'roof',beforeHull:87,afterHull:87,beforeShield:0,afterShield:0,outcome:'countered'};
 expect(watchPose(c)).toBe('listen');c.progress.nightFeedback.outcome='blocked';expect(watchPose(c)).toBe('listen');
});
it('0 to1 forecast contains distinct current and forecast bars plus one striped change, without modifying save',()=>{
 const c=newCampaign();c.crew.plan={driver:0,watch:1,rest:2};const before=structuredClone(c),html=crewCardView(c,1);
 expect(html).toContain('目前→本段結束預估');expect(html).toContain('data-time="current" aria-label="目前疲勞0／3"');
 expect(html).toContain('data-time="forecast" aria-label="本段結束預估疲勞1／3"');expect(html.match(/data-change="true"/g)).toHaveLength(1);expect(c).toEqual(before);
});
it.each([95,99,100])('rescue preview at%s uses the hull cap and sealed branch survives reload exactly once',hull=>{
 const c=newCampaign();c.segment=4;begin(c);finish(c);c.hull=hull;const snapshot=structuredClone(c);
 expect(rescueCap(hull)).toBe(`（車體 ${hull}％，預估 +${Math.min(2,100-hull)}％）`);
 expect(rescuePower(c)).toContain(rescueCap(hull));expect(c).toEqual(snapshot);expect(chooseRelay(c,'rescue')).toBe(true);
 const saved=parse(JSON.stringify(c))!;expect(saved.people).toBe(snapshot.people+2);expect(saved.supplies).toBe(snapshot.supplies+4);expect(saved.hull).toBe(hull);
 expect(rescueTeamView(saved)).toContain('協助主守夜');expect(rescueTeamView(saved)).toContain('支援搶修');expect(chooseRelay(saved,'repair')).toBe(false);
});
it('0.14.0 migration preserves all old content and never refills a spent shield',()=>{
 const c=newCampaign();c.version='0.14.0';c.screen='report';c.segment=4;c.crew.shield=0;c.relay={'1':'repair'};c.repairCredit=13;c.relayResults={'1':{before:95,repaired:5,stored:13}};c.crew.fatigue=[3,0,2];
 expect(parse(JSON.stringify(c))).toEqual({...c,version:VERSION});
});
