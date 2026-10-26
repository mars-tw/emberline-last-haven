import {it,expect} from 'vitest';
import {newCampaign,begin,layBait,tick,chooseRelay,finish,VERSION} from '../src/campaign';
import {countdown,lureState,reportSummary} from '../src/feedback';
import {dispatchView,swapPreview} from '../src/dispatch-view';
import {raidComparison} from '../src/journey';
import {parse} from '../src/storage';

it('counts each actual raid lane once, never relabels individual enemies as groups',()=>{
 const c=newCampaign();c.segment=1;begin(c);layBait(c,'west');
 for(let i=0;i<1200;i++)tick(c,.016);
 expect(c.progress.attracted).toBeGreaterThan(1);expect(c.progress.divertedGroups).toEqual(['1:west']);
 expect(countdown(c)).toContain('已引離 1／2 群');
 expect(parse(JSON.stringify(c))!.progress.divertedGroups).toEqual(['1:west']);
});
it('shows three real enemy states and does not award a group during turning',()=>{
 const c=newCampaign();c.segment=1;begin(c);c.progress.started=true;tick(c,.05);const e=c.progress.enemies[0];
 expect(lureState(c,e)).toBe('unaffected');layBait(c,'west');tick(c,.05);
 expect(lureState(c,e)).toBe('turning');expect(c.progress.divertedGroups).toEqual([]);
 for(let i=0;i<1200&&!e.attracted;i++)tick(c,.016);
 expect(lureState(c,e)).toBe('diverted');expect(c.progress.divertedGroups).toHaveLength(0);expect(c.progress.diversion['1:west'].escaped).toBeGreaterThan(0);for(let i=0;i<120;i++)tick(c,.05);expect(c.progress.divertedGroups).toHaveLength(1);expect(c.progress.diversion['1:west']).toEqual({total:4,escaped:4});
});
it('does not finish at forty seconds when multiple individuals came from only one group',()=>{
 const c=newCampaign();c.segment=1;begin(c);c.progress.started=true;c.progress.time=39.99;c.progress.attracted=8;c.progress.divertedGroups=['1:west'];c.progress.defenseBatch=3;tick(c,.02);
 expect(c.screen).toBe('play');c.progress.divertedGroups.push('2:east');tick(c,.02);expect(c.screen).toBe('report');expect(reportSummary(c)).toContain('共引離 8 隻');
});
it.each(['rescue','repair'] as const)('previews %s without consuming or sealing, then commits once',choice=>{
 const c=newCampaign();c.segment=1;begin(c);finish(c);const before=structuredClone(c),html=dispatchView(c,choice);
 expect(c).toEqual(before);expect(html).toContain('data-selected="true"');expect(html).toContain('已選');expect(html).toContain('封存另一箱');expect(html).not.toContain('class="case-state"');expect(html).toContain(`帶${choice==='rescue'?'救援包':'工具箱'}出發`);
 expect(chooseRelay(c,choice)).toBe(true);expect(chooseRelay(c,choice==='rescue'?'repair':'rescue')).toBe(false);expect(parse(JSON.stringify(c))!.relay['0']).toBe(choice);
});
it('keeps unselected cases neutral and describes each case own loss',()=>{
 const c=newCampaign();c.segment=1;begin(c);finish(c);const html=dispatchView(c);
 expect(html).not.toContain('class="primary"');expect(html.match(/不選這箱，你會失去/g)).toHaveLength(2);expect(html).toContain('即修 0％（100％已滿）＋轉備修 18％＝18％');expect(html.split('轉備修 18％')).toHaveLength(2);
});
it('uses explicit roster idle and applied states and applicable trait roles',()=>{
 const c=newCampaign();c.crew.fatigue=[1,0,1];
 expect(dispatchView(c)).toContain('先點一個職務');expect(dispatchView(c,null,true)).toContain('disabled>已套用');
 for(const role of ['開車','守夜','休息'])expect(dispatchView(c)).toContain(`專長・${role}時生效`);
 expect(swapPreview(c,1,'rest')).toContain('熹 守夜 → 休息；安 休息 → 守夜');expect(c.crew.fatigue).toEqual([1,0,1]);
});
it('compares every retry lane with actual previous values',()=>{
 expect(raidComparison(1,0,0,'west')).toBe('首次偵察');expect(raidComparison(1,1,0,'west')).toBe('與上次相同');
 expect(raidComparison(1,1,1,'east')).toBe('有變動：16 秒／3 隻（上次 14 秒／4 隻）');
 expect(raidComparison(1,2,1,'east')).toBe('有變動：12 秒／5 隻（上次 16 秒／3 隻）');
});
it('migrates R3 without inventing historical groups and rejects missing current fields',()=>{
 const c=newCampaign();c.version='0.9.0';delete (c.progress as any).divertedGroups;
 expect(parse(JSON.stringify(c))!.version).toBe(VERSION);expect(parse(JSON.stringify(c))!.progress.divertedGroups).toEqual([]);
 c.version=VERSION;expect(parse(JSON.stringify(c))).toBeNull();
});
it('rejects duplicated and corrupt persisted group awards',()=>{
 const c=newCampaign();c.progress.divertedGroups=['1:west','1:west'];expect(parse(JSON.stringify(c))).toBeNull();
 c.progress.divertedGroups=['4:north'];expect(parse(JSON.stringify(c))).toBeNull();
});
it('reloading in mid-turn preserves the trajectory and awards the group only once',()=>{
 const c=newCampaign();c.segment=1;begin(c);layBait(c,'west');for(let i=0;i<200;i++)tick(c,.016);
 const restored=parse(JSON.stringify(c))!;expect(restored.progress.enemies).toEqual(c.progress.enemies);
 for(let i=0;i<1000;i++)tick(restored,.016);
 expect(restored.progress.attracted).toBeGreaterThan(1);expect(restored.progress.divertedGroups).toEqual(['1:west']);
 expect(parse(JSON.stringify(restored))!.progress.divertedGroups).toEqual(['1:west']);
});
it('keeps pre-lane legacy enemies playable and reloadable after their real first diversion',()=>{
 for(const version of ['0.5.0','0.9.0']){
  const c=newCampaign();c.version=version;c.screen='play';c.segment=1;c.progress.started=true;c.progress.defenseBatch=1;
  c.progress.enemies=[{id:1,x:75,y:30,hp:20,state:'walk',age:0,slot:-1,type:'runner',hit:false,attracted:false}];delete (c.progress as any).divertedGroups;
  const restored=parse(JSON.stringify(c))!;expect(restored.progress.enemies[0].lane).toBe('west');layBait(restored,'west');
  for(let i=0;i<1200;i++)tick(restored,.016);
  expect(restored.progress.divertedGroups).toEqual(['legacy:west']);expect(parse(JSON.stringify(restored))).toEqual(restored);
 }
});
