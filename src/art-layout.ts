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
export type CrowdEnvelope={width:number;height:number;minHeight:number;maxFootY?:number};
/** Dense central raids keep their own channel rather than borrowing both side roads. */
export function centralChannelPoint(ordinal:number,height=100):DisplayPoint{
 return {x:118+(ordinal%3)*62,y:Math.max(130,height+35)+Math.floor(ordinal/3)*(height+30)};
}
export function laneChannelPoint(lane:string,index:number,count:number,height=100):DisplayPoint{
 if(lane==='center'&&count>8)return centralChannelPoint(index,height);
 const columns=count>2?2:1;
 const xs=lane==='west'?(columns===1?[65]:[34,96]):lane==='east'?(columns===1?[295]:[264,326]):columns===1?[180]:[149,211];
 return {x:xs[index%columns],y:Math.min(516,Math.max(130,height+35)+Math.floor(index/columns)*(height+30))};
}
/** Stable exit ports spread one batch over the narrow gate, including 9-unit center groups. */
export function diversionExitPort(index:number,count:number){
 const total=Math.max(1,Math.trunc(Number.isFinite(count)?count:1)),slot=Math.max(0,Math.min(total-1,Math.trunc(Number.isFinite(index)?index:0)));
 return {slot,exitY:total===1?300:Math.round(266+68*slot/(total-1))};
}
export function defenseCrowd(points:DisplayPoint[],reserved:{x:number;y:number;w:number;h:number}[]=[],envelope?:CrowdEnvelope):DisplayPoint[]{
 const placed:DisplayPoint[]=[];
 const minY=envelope?Math.max(120,envelope.height+35):174,maxY=envelope?Math.min(envelope.maxFootY??548,484+envelope.minHeight):450;
 const gapX=envelope?Math.max(50,envelope.width/2+12):67,rowGap=envelope?Math.max(92,Math.ceil(envelope.height+30)):92,gapY=envelope?rowGap-6:88;
 const cols=envelope?Math.max(5,Math.min(7,Math.floor(292/gapX)+1)):5,rows=envelope?5:4;
 const clear=(v:DisplayPoint)=>reserved.every(r=>v.x+34<r.x-r.w/2-4||v.x-34>r.x+r.w/2+4||v.y+8<r.y-r.h-4||v.y-90>r.y+4);
 for(const p of points){
  // Keep continuous root travel inside each safe slot. The residual comes from
  // the simulation-derived display point, so packing never freezes walking feet.
  const travel=(v:DisplayPoint)=>{
   const dx=Math.max(-1.5,Math.min(1.5,(p.x-v.x)*.02));
   const dy=Math.max(envelope?-3:-1.5,Math.min(envelope?3:1.5,(p.y-v.y)*(envelope ? .1 : .02)));
   return {x:Math.max(34,Math.min(326,v.x+dx)),y:Math.max(minY,Math.min(maxY,v.y+dy))};
  };
  const grid=Array.from({length:cols},(_,col)=>Array.from({length:rows},(_,row)=>({x:envelope?34+col*292/(cols-1):38+col*71,y:minY+row*rowGap}))).flat().map(travel).filter(clear);
  const sorted=grid.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
  // Dense crowds share local slots; mixed source rows must not push actors over Xi.
  const band=Math.max(0,Math.round((p.y-190)/112));
  const preferred=envelope?{x:Math.max(34,Math.min(326,p.x)),y:Math.max(minY,Math.min(maxY,minY+band*rowGap+Math.max(-3,Math.min(3,(p.y-190-band*112)*.1))))}:p;
  const candidates=points.length<=4?[preferred,...sorted]:sorted;
  const free=candidates.find(v=>clear(v)&&v.x>=34&&v.x<=326&&v.y>=minY&&v.y<=maxY&&placed.every(q=>Math.abs(v.x-q.x)>=gapX||Math.abs(v.y-q.y)>=gapY));
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
