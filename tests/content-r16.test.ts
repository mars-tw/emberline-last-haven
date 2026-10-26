import {it,expect} from 'vitest';
import {newCampaign,begin,chooseRelay,finish,tick} from '../src/campaign';
import {nightControlText,crewCardView} from '../src/dispatch-view';
import {centralChannelPoint} from '../src/art-layout';
import {parse} from '../src/storage';

it.each([0,1,2,3])('no starting shield at grade%s never promises or claims a spent shield',level=>{
 const c=newCampaign();c.segment=2;c.screen='play';c.level=level;
 for(const choice of ['roof','window','brace'] as const)expect(nightControlText(c,choice)).not.toMatch(/保留盾|留盾|已用完/);
 expect(nightControlText(c,'brace')).toContain(`沒有盾・車損${Math.max(3,7-level)}％`);
 expect(nightControlText(c,'roof')).toContain('判對免車損');
 c.progress.nightFeedback={age:.8,wave:1,threat:'roof',choice:'roof',beforeShield:0,afterShield:0,beforeHull:90,afterHull:90,outcome:'countered'};
 expect(nightControlText(c,'roof')).toContain('判對免車損');expect(nightControlText(c,'roof')).not.toMatch(/保留盾|留盾|已用完/);
});
it('spent wording survives reload only for a genuinely granted shield',()=>{
 const c=newCampaign();c.segment=2;begin(c);c.crew.rested=c.crew.plan.watch;c.crew.shield=0;
 expect(nightControlText(parse(JSON.stringify(c))!,'brace')).toContain('盾已用完');
 c.crew.rested=null;expect(nightControlText(c,'brace')).toContain('沒有盾');
});
it('decreasing forecast has two hollow unfilled change cells; increase stays striped',()=>{
 const c=newCampaign();c.crew.fatigue=[3,0,2];c.crew.plan={driver:0,watch:1,rest:2};
 const html=crewCardView(c,2),forecast=html.split('data-time="forecast"')[1];
 expect(forecast.match(/data-filled="true"/g)??[]).toHaveLength(0);
 expect(forecast.match(/data-change="true" data-direction="decrease"/g)).toHaveLength(2);
 expect(crewCardView(c,1)).toContain('data-change="true" data-direction="increase"');
});
it('nine central actors stay inside the central channel, clear of side labels',()=>{
 const points=Array.from({length:9},(_,i)=>centralChannelPoint(i,100));
 expect(new Set(points.map(p=>`${p.x}:${p.y}`)).size).toBe(9);
 for(const p of points){expect(p.x).toBeGreaterThanOrEqual(118);expect(p.x).toBeLessThanOrEqual(242);expect(p.y+12).toBeLessThan(533);}
});
it('central spawn and physical movement never cross into west/east lanes',()=>{
 const c=newCampaign();c.segment=1;begin(c);c.progress.started=true;c.progress.time=29.9;c.progress.defenseBatch=2;
 for(let i=0;i<100;i++)tick(c,.05);
 const group=c.progress.enemies.filter(e=>e.lane==='center');expect(group.length).toBeGreaterThan(0);
 for(const e of group){expect(e.x).toBeGreaterThanOrEqual(150);expect(e.x).toBeLessThanOrEqual(210);}
});
it.each([98,99,100])('rescue settles actual hull%s with correct capped extra',hull=>{
 const c=newCampaign();c.segment=4;begin(c);finish(c);expect(chooseRelay(c,'rescue')).toBe(true);
 c.segment=5;c.screen='play';c.hull=hull-8;c.people=5;finish(c);
 expect(c.nightRepair?.base).toBe(8);expect(c.nightRepair?.extra).toBe(Math.min(2,100-hull));expect(c.hull).toBe(100);
 expect(parse(JSON.stringify(c))?.nightRepair).toEqual(c.nightRepair);
});
