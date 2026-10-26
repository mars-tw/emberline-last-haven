import {it,expect} from 'vitest';
import {newCampaign,VERSION,watchIdentity,chooseRelay,begin,finish} from '../src/campaign';
import {crewCardView,crewEffectView,crewComparison,rescueTeamView} from '../src/dispatch-view';
import {parse} from '../src/storage';
it.each([0,1,2])('watcher %s identity is derived exclusively from the saved crew plan',person=>{
 const c=newCampaign();const other=c.crew.plan.watch;c.crew.plan.watch=person;
 if(person!==other)c.crew.plan[person===0?'driver':'rest']=other;
 const identity=watchIdentity(c);expect(identity.person).toBe(c.crew.plan.watch);
 expect(identity.name).toBe(['老席','熹','安'][person]);expect(identity.portrait).toContain(['laoxi','xi','an'][person]);
 expect(watchIdentity(parse(JSON.stringify(c))!)).toEqual(identity);
});
it('three primary card fields contain no arithmetic; unchanged roles are absent from swap consequences',()=>{
 const c=newCampaign();c.level=1;c.crew.fatigue=[3,0,2];
 for(let i=0;i<3;i++){const html=crewCardView(c,i);expect(html).not.toContain('×');expect(html.match(/class="card-role"/g)).toHaveLength(1);expect(html.match(/class="card-fatigue"/g)).toHaveLength(1);expect(html.match(/class="card-effect/g)).toHaveLength(1);}
 const delta=crewComparison(c,1,'rest').split('<details')[0];expect(delta).not.toContain('老席');expect(delta).not.toContain('×');
 const detail=crewEffectView(c);for(const name of ['基礎秒數','疲勞','工作增加','下限補正'])expect(detail).toContain(name);expect(detail).toContain('×');
});
it('the same selected rescue branch adds two people once, presents both named portraits and survives reload',()=>{
 const c=newCampaign();c.segment=4;begin(c);finish(c);const people=c.people;
 expect(chooseRelay(c,'rescue')).toBe(true);expect(c.people).toBe(people+2);
 const view=rescueTeamView(c);for(const text of ['林叔','阿禾','rescue-portraits.webp','接手警戒','搶修'])expect(view).toContain(text);
 expect(chooseRelay(c,'repair')).toBe(false);expect(rescueTeamView(parse(JSON.stringify(c))!)).toBe(view);
});

it('upgrades the immediately previous 0.13.2 save with exact crew, shield and carried repair accounting',()=>{
 const c=newCampaign();c.version='0.13.2';c.screen='report';c.segment=4;c.hull=100;c.supplies=29;c.people=21;c.relay={'1':'repair'};c.relayResults={'1':{before:95,repaired:5,stored:13}};c.repairCredit=13;c.crew.fatigue=[3,0,2];c.crew.rested=1;c.crew.shield=0;
 const loaded=parse(JSON.stringify(c));expect(loaded).toEqual({...c,version:VERSION});expect(loaded!.repairCredit+loaded!.relayResults['1'].repaired).toBe(18);expect(loaded!.crew.shield).toBe(0);
});
