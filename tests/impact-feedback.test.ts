import {describe,it,expect} from 'vitest';
import {frameContactPoint,projectContactPoint,deathDisplayPoint,defenseImpactMarkers} from '../src/impact-feedback';

describe('actual defense impact display',()=>{
 it('chooses an opaque body pixel even when the box center is transparent',()=>{
  const data=new Uint8ClampedArray(4*4*4);data[(1*4+0)*4+3]=255;data[(3*4+3)*4+3]=255;
  const copy=[...data],point=frameContactPoint(data,4,0,4,4,{left:0,right:3,top:1,bottom:3})!;
  expect(data[(Math.floor(point.y*4)*4+Math.floor(point.x*4))*4+3]).toBeGreaterThan(80);
  expect([...data]).toEqual(copy);
 });
 it('uses the selected atlas frame rather than a neighboring pose',()=>{
  const data=new Uint8ClampedArray(8*4*4);data[(1*8+0)*4+3]=255;data[(2*8+6)*4+3]=255;
  expect(frameContactPoint(data,8,4,4,4,{left:2,right:2,top:2,bottom:2})).toEqual({x:.625,y:.625});
 });
 it('does not invent a contact point for transparent artwork',()=>{
  expect(frameContactPoint(new Uint8ClampedArray(4*4*4),4,0,4,4,{left:0,right:3,top:0,bottom:3})).toBeNull();
 });
 it('keeps the contact pixel correct under canvas scale and a mirrored sprite',()=>{
  expect(projectContactPoint({x:.75,y:.5},50,80,40,60,{a:-2,b:0,c:0,d:2,e:200,f:10},{ox:20,oy:10,dpr:2})).toEqual({x:30,y:50});
 });
 it('shows feedback only during actual hurt or death ages',()=>{
  const enemies=[{id:1,state:'walk',age:0},{id:2,state:'hurt',age:.02},{id:3,state:'death',age:0},{id:4,state:'hurt',age:.12}];
  const actors=enemies.map(e=>({id:'enemy-'+e.id,contactX:e.id*20,contactY:60}));
  expect(defenseImpactMarkers(enemies,actors,2).map(m=>[m.targetId,m.x,m.y])).toEqual([[2,20,30],[3,30,30]]);
 });
 it('binds to the actual hurt target id regardless of spatial or array order',()=>{
  const markers=defenseImpactMarkers([{id:42,state:'hurt',age:0}],
   [{id:'enemy-1',contactX:10,contactY:10},{id:'enemy-42',contactX:900,contactY:200}],1);
  expect(markers).toEqual([{targetId:42,sourceState:'hurt',age:0,x:900,y:200,cssX:900,cssY:200,strength:1}]);
 });
 it('omits unknown artwork and never changes battle values',()=>{
  const enemies=[{id:8,state:'hurt',age:0,hp:3}],copy=structuredClone(enemies);
  expect(defenseImpactMarkers(enemies,[{id:'enemy-8'}],1)).toEqual([]);expect(enemies).toEqual(copy);
 });
 it('keeps the death pose where the same actor was last drawn',()=>{
  const previous={x:264,y:132},proposed={x:180,y:300};
  const dead=deathDisplayPoint('death',proposed,previous);expect(dead).toEqual(previous);expect(dead).not.toBe(previous);
  expect(deathDisplayPoint('walk',proposed,previous)).toEqual(proposed);expect(proposed).toEqual({x:180,y:300});
 });
});
