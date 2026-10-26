import {it,expect} from 'vitest';
import {newCampaign,begin,VERSION} from '../src/campaign';
import {nightControlParts,nightControlText} from '../src/dispatch-view';
import {parse} from '../src/storage';

it('upgrading a valid R17 save keeps earned resources, crew and diversion receipts',()=>{
 const c=newCampaign();c.segment=2;begin(c);c.supplies=33;c.people=5;c.hull=87;
 c.relay={'0':'rescue'};c.archives={storm:{wave:7,money:30}};
 const old=JSON.parse(JSON.stringify(c));old.version='0.17.0';
 const loaded=parse(JSON.stringify(old));
 expect(loaded).not.toBeNull();expect(loaded!.version).toBe(VERSION);
 for(const key of ['supplies','people','hull','crew','relay','archives','receipts'] as const)expect(loaded![key]).toEqual(c[key]);
 expect(parse(JSON.stringify({...old,version:'0.99.0'}))).toBeNull();
});

it.each([0,1,2,3])('structured controls retain all visible original words and prices at grade %s',level=>{
 const c=newCampaign();c.segment=2;c.screen='play';c.level=level;
 for(const shield of [0,1])for(const rested of [false,true]){
  c.crew.shield=shield;c.crew.rested=rested?c.crew.plan.watch:null;
  for(const choice of ['window','roof','brace'] as const){
   const p=nightControlParts(c,choice);
   expect(p.action.length).toBeGreaterThan(0);
   expect(p.action+p.cost+p.outcome).toBe(nightControlText(c,choice));
   expect(p.full).toBe(nightControlText(c,choice));
   if(choice!=='brace')expect(p.cost).toContain('2補給');
   else {expect(p.cost).toContain('免費');if(!shield)expect(p.outcome).toContain('車損'+Math.max(3,7-level)+'％');}
  }
 }
});

it('the settled block still exposes the genuinely spent shield rather than a new cost',()=>{
 const c=newCampaign();c.segment=2;begin(c);c.crew.rested=c.crew.plan.watch;c.crew.shield=0;
 c.progress.nightFeedback={age:.8,wave:1,threat:'roof',choice:'brace',beforeShield:1,afterShield:0,beforeHull:90,afterHull:90,outcome:'blocked'};
 const p=nightControlParts(c,'brace');expect(p.full).toContain('盾已用完');
 expect(p.action+p.cost+p.outcome).toBe(p.full);
 expect(p.cost).toBe('');
});
