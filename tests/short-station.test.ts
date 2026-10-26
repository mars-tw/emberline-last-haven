import {it,expect} from 'vitest';
import {newCampaign,begin,VERSION} from '../src/campaign';
import {parse} from '../src/storage';
import {shortStationFrame,stationCSSPoint,shortHeroPoint,shortEnemyPoint,settleStationPoint} from '../src/short-station';

it('keeps the existing full-height station and invalid geometry out of the short camera',()=>{
 expect(shortStationFrame(430,400,.7)).toBeNull();
 expect(shortStationFrame(300,250,.4)).toBeNull();
 expect(shortStationFrame(500,200,NaN)).toBeNull();
});

it.each([[567,160],[298,165],[886,201]])('fits the actual largest pose envelopes in all three lanes at %sx%s',(width,height)=>{
 const scale=height/560,view=shortStationFrame(width,height,scale)!;
 expect(view).not.toBeNull();
 const bodyHeight=40.872,bodyWidth=36,rects:{x:number;y:number;w:number;h:number}[]=[];
 for(const [lane,count] of [['west',6],['center',9],['east',6]] as const)for(let index=0;index<count;index++){
  const point=shortEnemyPoint(view,lane,index,count,bodyHeight,180,200,undefined,index);
  const css=stationCSSPoint(view,point),rect={x:css.x-bodyWidth/2,y:css.y-bodyHeight,w:bodyWidth,h:bodyHeight};
  expect(rect.x).toBeGreaterThanOrEqual(0);expect(rect.y).toBeGreaterThanOrEqual(0);
  expect(rect.x+rect.w).toBeLessThanOrEqual(width);expect(rect.y+rect.h).toBeLessThanOrEqual(height);
  expect(rects.every(r=>rect.x+rect.w<=r.x+.001||rect.x>=r.x+r.w-.001||rect.y+rect.h<=r.y+.001||rect.y>=r.y+r.h-.001)).toBe(true);
  rects.push(rect);
 }
 const hero=stationCSSPoint(view,shortHeroPoint(view));
 expect(hero.x-12).toBeGreaterThanOrEqual(0);
 expect(rects.every(rect=>hero.x+12<=rect.x||hero.x-12>=rect.x+rect.w)).toBe(true);
});

it('keeps root travel monotonic and ties real exit movement to original source boundaries',()=>{
 const view=shortStationFrame(567,160,160/560)!;
 const early=shortEnemyPoint(view,'west',0,6,40.872,51,0,undefined,0);
 const later=shortEnemyPoint(view,'west',0,6,40.872,51,100,undefined,0);
 expect(later.y).toBeGreaterThan(early.y);
 const start=shortEnemyPoint(view,'west',0,6,40.872,51,0,'west',0);
 expect(start).toEqual(early);
 const end=stationCSSPoint(view,shortEnemyPoint(view,'west',0,6,40.872,-48,0,'west',0));
 expect(end.x).toBeCloseTo(-20,8);
 const right=stationCSSPoint(view,shortEnemyPoint(view,'east',0,6,40.872,408,0,'east',0));
 expect(right.x).toBeCloseTo(587,8);
});

it('holds a paused body and bounds slot settling by elapsed simulation time',()=>{
 const previous={x:50,y:200},next={x:100,y:350};
 expect(settleStationPoint(previous,next,.3,0)).toEqual(previous);
 const moved=settleStationPoint(previous,next,.3,.016);
 expect(Math.hypot(moved.x-previous.x,moved.y-previous.y)*.3).toBeCloseTo(70*.016,8);
 expect(previous).toEqual({x:50,y:200});expect(next).toEqual({x:100,y:350});
});

it.each(['0.18.0','0.18.1','0.18.2','0.18.3'])('migrates genuine %s preview progress without changing any earned state',version=>{
 const current=newCampaign();current.segment=2;begin(current);current.supplies=33;current.people=5;current.hull=87;
 current.relay={'0':'rescue'};current.archives={storm:{wave:7,money:30}};
 const old=JSON.parse(JSON.stringify(current));old.version=version;
 const before=JSON.stringify(old);
 const loaded=parse(before);
 expect(loaded).not.toBeNull();
 expect(loaded).toEqual({...old,version:VERSION});
 expect(JSON.stringify(old)).toBe(before);
 expect(parse(JSON.stringify({...old,version:'0.99.0'}))).toBeNull();
});
