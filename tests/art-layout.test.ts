import {describe,it,expect} from 'vitest';
import {roofLayout,spreadCrowd} from '../src/art-layout';

describe('mobile art proportions and crowd readability',()=>{
 it('fits 40px gunners inside one third of visible vehicle width across aspect ratios',()=>{
  for(const scale of [.35,.6,1,1.8])for(const aspect of [.65,1,1.45]){
   const r=roofLayout(scale,aspect,.88);
   expect(Math.min(r.gunnerWidth,r.gunnerHeight)*scale).toBeGreaterThanOrEqual(40);
   expect(Math.max(r.gunnerWidth,r.gunnerHeight)/(r.truckWidth*.88)).toBeLessThanOrEqual(1/3);
  }
 });
 it('separates eight converged enemies at a 390px portrait scale',()=>{
  const points=Array.from({length:8},()=>({x:180,y:285})),copy=structuredClone(points),r=spreadCrowd(points,.72);
  expect(points).toEqual(copy);
  for(let i=0;i<r.length;i++)for(let j=i+1;j<r.length;j++)expect(Math.abs(r[i].x-r[j].x)*.72>=48.9||Math.abs(r[i].y-r[j].y)*.72>=61.9).toBe(true);
 });
 it('keeps separated enemies inside the actual arena at phone and tablet scales',()=>{
  for(const scale of [.6,1,1.6])for(const minY of [82,150]){
   const r=spreadCrowd(Array.from({length:8},(_,i)=>({x:i%2?40:320,y:200+i*12})),scale,minY);
   for(const p of r){expect(p.x).toBeGreaterThanOrEqual(30);expect(p.x).toBeLessThanOrEqual(330);expect(p.y).toBeGreaterThanOrEqual(minY);expect(p.y).toBeLessThanOrEqual(422);}
  }
 });
});
