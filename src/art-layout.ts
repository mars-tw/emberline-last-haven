/** Display geometry only: combat entities and impact timing are never mutated. */
export function roofLayout(cssScale:number,aspect=1,truckOccupancy=1){
 const gunnerWidth=40*Math.max(1,aspect),gunnerHeight=40*Math.max(1,1/aspect);
 const truckWidth=(Math.max(gunnerWidth,gunnerHeight)*3+8)/truckOccupancy/cssScale;
 return {gunnerWidth:gunnerWidth/cssScale,gunnerHeight:gunnerHeight/cssScale,truckWidth,truckHeight:truckWidth*1.70};
}
export type DisplayPoint={x:number;y:number};
/** A batch's immutable spawn ordinal, independent of depth sorting/removal. */
export function defensePoint(e:{id:number;x:number;y:number;lane?:string;exit?:string},ordinal:number):DisplayPoint{
 const col=ordinal%2,row=Math.floor(ordinal/2),base={west:75,center:180,east:285}[e.lane??'center']??180;
 if(e.exit){const travel=Math.max(0,Math.min(1,e.exit==='west'?(e.x+48)/160:(408-e.x)/160));return {x:e.exit==='west'?24+col*72+travel*45:336-col*72-travel*45,y:190+row*112};}
 return {x:base+(col?36:-36),y:190+row*112+Math.min(30,Math.max(0,e.y-30)*.12)};
}
/** Move bodies locally when paths meet; the number remains attached to its body. */
export function defenseCrowd(points:DisplayPoint[],reserved:{x:number;y:number;w:number;h:number}[]=[]):DisplayPoint[]{
 const placed:DisplayPoint[]=[];
 const clear=(v:DisplayPoint)=>reserved.every(r=>v.x+34<r.x-r.w/2-4||v.x-34>r.x+r.w/2+4||v.y+8<r.y-r.h-4||v.y-90>r.y+4);
 for(const p of points){
  // Keep continuous root travel inside each safe slot. The residual comes from
  // the simulation-derived display point, so packing never freezes walking feet.
  const travel=(v:DisplayPoint)=>({x:Math.max(34,Math.min(326,v.x+Math.max(-1.5,Math.min(1.5,(p.x-v.x)*.02)))),y:Math.max(174,Math.min(450,v.y+Math.max(-1.5,Math.min(1.5,(p.y-v.y)*.02))))});
  const grid=Array.from({length:5},(_,col)=>Array.from({length:4},(_,row)=>({x:38+col*71,y:174+row*92}))).flat().map(travel).filter(clear);
  const sorted=grid.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
  // Dense crowds share local slots; mixed source rows must not push actors over Xi.
  const candidates=points.length<=4?[p,...sorted]:sorted;
  const free=candidates.find(v=>clear(v)&&v.x>=34&&v.x<=326&&v.y>=174&&v.y<=450&&placed.every(q=>Math.abs(v.x-q.x)>=67||Math.abs(v.y-q.y)>=88));
  placed.push(free??grid.find(v=>placed.every(q=>v.x!==q.x||v.y!==q.y))??p);
 }
 return placed;
}
/** Safe label rectangles in the 360×560 world, with separate rows at the edge. */
export function avoidLabels(points:DisplayPoint[]){
 const placed:DisplayPoint[]=[];
 for(const p of points){
  const x=Math.max(52,Math.min(308,p.x));
  const candidates=[x,52,140,228,308].flatMap(px=>Array.from({length:11},(_,i)=>({x:px,y:150+i*28}))).sort((a,b)=>Math.hypot(a.x-x,a.y-p.y)-Math.hypot(b.x-x,b.y-p.y));
  placed.push(candidates.find(v=>placed.every(q=>Math.abs(v.x-q.x)>=88||Math.abs(v.y-q.y)>=27))??{x,y:458});
 }
 return placed;
}
export function spreadCrowd(points:DisplayPoint[],cssScale:number,minY=82):DisplayPoint[]{
 const placed:DisplayPoint[]=[],gapX=49/cssScale,gapY=62/cssScale;
 for(const p of points){
  const candidates=[p,...Array.from({length:4},(_,ring)=>Array.from({length:8},(_,i)=>({x:p.x+Math.cos(i*Math.PI/4)*gapX*(ring+1),y:p.y+Math.sin(i*Math.PI/4)*gapY*(ring+1)}))).flat()]
   .map(v=>({x:Math.max(30,Math.min(330,v.x)),y:v.y>282&&v.y<390?(v.y<336?272:402):Math.max(minY,Math.min(422,v.y))}));
  const free=candidates.find(v=>placed.every(q=>Math.abs(v.x-q.x)>=gapX||Math.abs(v.y-q.y)>=gapY));
  placed.push(free??candidates.reduce((best,v)=>distance(v)>distance(best)?v:best));
  function distance(v:DisplayPoint){return Math.min(...placed.map(q=>Math.hypot((v.x-q.x)/gapX,(v.y-q.y)/gapY)));}
 }
 return placed;
}
