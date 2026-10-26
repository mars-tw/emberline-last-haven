import {it,expect} from 'vitest';
import {defenseCrowd} from '../src/art-layout';
it.each([.65,.6892857142857143,1.1])('scale%s reserves actual tall-pose and number geometry for four or eighteen actors',scale=>{
 const envelope={width:Math.max(64,40/scale*1.5),height:Math.max(64,40/scale*1.704),minHeight:40/scale};
 const hero={x:178,y:488,w:40/scale,h:40/scale*2.064};
 for(const count of [4,18]){
  const points=Array.from({length:count},(_,i)=>({x:39+(i%2)*72,y:193+Math.floor(i/2)*112})),copy=structuredClone(points),packed=defenseCrowd(points,[hero],envelope);expect(points).toEqual(copy);expect(packed).toHaveLength(count);
  for(const pattern of [0,1,2]){
   const bodies=packed.map((p,i)=>({...p,w:envelope.width,h:pattern===2?envelope.height:(i+pattern)%2?envelope.minHeight:envelope.height}));
   const labels=bodies.map(p=>({x:p.x-9,y:p.y-p.h-21,w:18,h:18}));
   for(const [i,l] of labels.entries()){
    expect(l.x).toBeGreaterThanOrEqual(10);expect(l.x+l.w).toBeLessThanOrEqual(350);expect(l.y).toBeGreaterThanOrEqual(10);expect(l.y+l.h).toBeLessThanOrEqual(482);
    expect(l.x+l.w/2).toBe(bodies[i].x);expect(Math.abs(l.y+l.h/2-(bodies[i].y-bodies[i].h))).toBeLessThanOrEqual(13);
    for(const body of [...bodies,hero])expect(l.x+l.w<body.x-body.w/2||l.x>body.x+body.w/2||l.y+l.h<body.y-body.h||l.y>body.y).toBe(true);
    for(const q of labels.slice(i+1))expect(l.x+l.w<=q.x||q.x+q.w<=l.x||l.y+l.h<=q.y||q.y+q.h<=l.y).toBe(true);
   }
  }
 }
});
