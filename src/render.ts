import {modeFor,actualThreat,nightPresentation,watchPose,guardPower,campaignRaids,watchIdentity,type Campaign,type Enemy} from './campaign';
import {LANE_NAMES,LANE_COLORS,raidComparison,raidsFor,baitMatches,type Lane} from './journey';
import {lureState} from './feedback';
import {attackFrame,gunnerFrame} from './animation';
import {roofLayout,defensePoint,defenseCrowd,laneChannelPoint,diversionExitPort} from './art-layout';
import {frameContactPoint,projectContactPoint,deathDisplayPoint,defenseImpactMarkers,type Point,type ImpactMarker} from './impact-feedback';
import {shortStationFrame,shortSceneX,shortLaneX,shortHeroPoint,shortEnemyPoint,shortExitPort,settleStationPoint,type ShortStation} from './short-station';
const paths=['content-r1/relay-table.webp','r1/trailer.png','r3/truck.png','r3/an-poses.png',...['wreck','sign','luggage','concrete'].map(p=>'r2/'+p+'.png'),...Array.from({length:3},(_,i)=>'r2/road-'+i+'.webp'),...['climber-attack.png','xi-gunner.png','xi-attack.png',...['runner','shambler'].flatMap(e=>['walk','attack','hurt','death'].map(a=>e+'-'+a+'.png'))].map(p=>'r5/'+p),...['departure.webp','train.webp','train-wide.webp','outpost-wide.webp','xi-front.png','xi-side.png','xi-night.png','bait.png','wreckage.png','fence.png','battery.png'].map(p=>'r5/'+p),'r4/outpost-ready.webp'];
type Actor={id:string;action:string;frame:number;visibleWidth:number;visibleHeight:number;path:string;x:number;y:number;opacity:number;opaqueBody:boolean;contactX?:number;contactY?:number};
paths.push('content-r14/an-duty.webp','content-r14/laoxi-watch.webp','content-r6/xi-brace.webp','content-r9/xi-roof.webp','content-r2/coldstore.webp','content-r2/lighthouse.webp');
paths.push('content-r15/laoxi-duty.webp');
paths.push('content-r16/rescue-support.webp');
export const DANGER_COLOR='#ef654f';
export class Renderer {
 images=new Map<string,HTMLImageElement>();ready:Promise<void>;ctx:CanvasRenderingContext2D;
 opaqueImages=new Map<string,HTMLCanvasElement>();
 bounds=new Map<string,{w:number;h:number;contact?:Point|null}[]>();actors:Actor[]=[];cssScale=1;
 damageMarkers:ImpactMarker[]=[];defenseLastPoints=new Map<number,Point>();defenseProgress:Campaign['progress']|null=null;defenseViewKey='';
 compactView:ShortStation|null=null;compactLastTime=0;
 transform={scale:1,ox:0,oy:0,dpr:1};
 blockEvent='';blockUntil=0;
 previewLane:Lane|null=null;
 defenseChapter=0;
 labelCapacity=false;drawnLabelIds:number[]=[];
  labels:{id:number;text:string;x:number;y:number;w:number;h:number}[]=[];previewArrows:{id:number;x:number;y:number;lane:Lane;slot:number;bendX:number;endX:number;endY:number}[]=[];dangerMarkers:{id:number;x:number;y:number;color:string;dash:number[]}[]=[];sceneArt='';roofRatio=0;poseCounts=new Map<string,number>();luredIds:number[]=[];arrowLanes:string[]=[];
 constructor(public canvas:HTMLCanvasElement){
  this.ctx=canvas.getContext('2d',{alpha:false})!;
  this.ready=Promise.all(paths.map(path=>new Promise<void>((resolve,reject)=>{
   const im=new Image();im.onload=()=>{this.images.set(path,im);
    if(path.endsWith('.png')||path.includes('xi-brace')||path.includes('xi-roof')||path.includes('-duty')||path.includes('laoxi-watch')||path.includes('rescue-support')){const cols=path.includes('-duty')||path.includes('rescue-support')?2:path.includes('an-poses')||/-(walk|attack|hurt|death|gunner|night)\.png/.test(path)?4:1,fw=im.width/cols;
     const scratch=document.createElement('canvas');scratch.width=im.width;scratch.height=im.height;const sc=scratch.getContext('2d')!;sc.drawImage(im,0,0);const data=sc.getImageData(0,0,im.width,im.height).data;
     this.bounds.set(path,Array.from({length:cols},(_,i)=>{let left=fw,right=0,top=im.height,bottom=0;for(let y=0;y<im.height;y++)for(let x=0;x<fw;x++)if(data[(y*im.width+i*fw+x)*4+3]>80){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}return{w:(right-left+1)/fw,h:(bottom-top+1)/im.height,contact:frameContactPoint(data,im.width,i*fw,fw,im.height,{left,right,top,bottom})};}));
     if(/r5\/(runner|shambler)-(walk|attack|hurt)\.png/.test(path)){const pixels=sc.getImageData(0,0,im.width,im.height);for(let i=3;i<pixels.data.length;i+=4)if(pixels.data[i]>80)pixels.data[i]=255;sc.putImageData(pixels,0,0);scratch.dataset.opaqueEnemy=path;this.opaqueImages.set(path,scratch);}
    }resolve();};im.onerror=()=>reject(new Error('素材無法載入：'+path));im.src='/art/'+path;
  }))).then(()=>{});
 }
 image(path:string,x:number,y:number,w:number,h:number){const im=this.images.get(path);if(im)this.ctx.drawImage(im,x,y,w,h);}
 cover(path:string,w:number,h:number,anchorY=.5){const im=this.images.get(path);if(!im)return;const s=Math.max(w/im.width,h/im.height),sw=w/s,sh=h/s;this.ctx.drawImage(im,(im.width-sw)/2,(im.height-sh)*anchorY,sw,sh,0,0,w,h);}
 sprite(path:string,x:number,y:number,w:number,h:number,frame=0,id='',action='idle',minimum=0,opaque=false){
  const im=(opaque?this.opaqueImages.get(path):undefined)??this.images.get(path);if(!im)return;const bounds=this.bounds.get(path)??[{w:1,h:1,contact:null}],b=bounds[frame]??bounds[0];
  const k=Math.max(1,minimum/(w*b.w*this.cssScale),minimum/(h*b.h*this.cssScale));w*=k;h*=k;
  this.ctx.drawImage(im,frame*im.width/bounds.length,0,im.width/bounds.length,im.height,x-w/2,y-h,w,h);
  const contact=b.contact?projectContactPoint(b.contact,x,y,w,h,this.ctx.getTransform(),this.transform):null;
  if(id)this.actors.push({id,action,frame,path,x:x*this.cssScale,y:y*this.cssScale,visibleWidth:w*b.w*this.cssScale,visibleHeight:h*b.h*this.cssScale,opacity:this.ctx.globalAlpha,opaqueBody:opaque&&this.opaqueImages.has(path),...(contact?{contactX:contact.x,contactY:contact.y}:{})});
 }
 contactShadow(x:number,y:number,rx:number,ry:number){
  const ctx=this.ctx;ctx.save();ctx.translate(x,y);ctx.scale(1,Math.max(.16,ry/rx));
  const shadow=ctx.createRadialGradient(0,0,1,0,0,rx);
  shadow.addColorStop(0,'#11181dcc');
  shadow.addColorStop(.62,'#11181d66');
  shadow.addColorStop(1,'#11181d00');
  ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,rx,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 enemy(e:Enemy,reduced:boolean,minimum:number,point={x:e.x,y:e.y+14},size=80){
  const action=e.state==='flung'?'hurt':e.state;
  let frame=action==='attack'?attackFrame(e.age,e.slot>=0):action==='walk'?Math.floor(e.age/(reduced?.28:.16)+e.id*.73)%4:Math.min(3,Math.floor(e.age/(action==='death'?.65:.24)*4));
  // Only locomotion can vary phase. Attack/hurt/death stay tied to impact ages.
  if(action==='walk')for(let i=0;i<4;i++){const f=(frame+i)%4,key=e.type+'/'+action+'/'+f;if((this.poseCounts.get(key)??0)<2){frame=f;break;}}
  const key=e.type+'/'+action+'/'+frame;this.poseCounts.set(key,(this.poseCounts.get(key)??0)+1);
  const ctx=this.ctx;ctx.save();ctx.translate(point.x+5,point.y-2);ctx.scale(1,.30);
  const g=ctx.createRadialGradient(0,0,1,0,0,32);g.addColorStop(0,'#151b20bb');g.addColorStop(1,'#151b2000');ctx.fillStyle=g;ctx.fillRect(-32,-32,64,64);ctx.restore();
  // State ages and impact frames still come from combat.
  const climbing=e.slot>=0&&action==='attack',path=climbing?'r5/climber-attack.png':'r5/'+e.type+'-'+action+'.png';
  ctx.save();if(climbing&&e.slot%2||size===64&&e.exit==='west'){ctx.translate(point.x*2,0);ctx.scale(-1,1);}
  if(size===64&&this.defenseChapter===2)ctx.filter='sepia(.35) saturate(1.25)';
  ctx.globalAlpha=1;
  this.sprite(path,point.x,point.y,climbing?70:size,climbing?70:size,frame,'enemy-'+e.id,action,action==='death'?0:minimum,size===64&&e.state!=='death'&&e.state!=='flung');ctx.restore();
 }
 road(w:number,h:number,time:number){
  const tileH=Math.max(h,w),offset=(time*52)%(tileH*3);
  for(let i=-3;i<4;i++){const index=((i%3)+3)%3,y=i*tileH+offset;if(y>h||y+tileH<0)continue;const im=this.images.get('r2/road-'+index+'.webp');if(im)this.ctx.drawImage(im,0,y,w,tileH+1);}
 }
 scout(c:Campaign){
  const ctx=this.ctx,p=c.progress,raids=campaignRaids(c),preview=!p.started,attempt=c.defenseRetries[Math.floor(c.segment/3)];
  const next=raids[p.defenseBatch];this.arrowLanes=(preview?raids[0]:next)?.lanes.map(g=>g.lane)??[];
  if(preview)raids.forEach((r,i)=>{
   const x=75+i*105,old=raidsFor(c.segment,Math.max(0,attempt-1))[i],changed=attempt>0&&JSON.stringify(r)!==JSON.stringify(old);
   ctx.save();ctx.fillStyle='#24353ef5';ctx.fillRect(x-50,75,100,attempt?150:105);ctx.strokeStyle=changed?'#e8a33d':'#99b4bc';ctx.strokeRect(x-50,75,100,attempt?150:105);ctx.textAlign='center';ctx.fillStyle='#f9e9c6';ctx.font='bold 17px sans-serif';ctx.fillText(`第 ${i+1} 批`,x,99);ctx.fillText(`${r.at} 秒`,x,123);ctx.font='bold 13px sans-serif';r.lanes.forEach((g,n)=>ctx.fillText(`${LANE_NAMES[g.lane]} ${g.count} 隻`,x,146+n*18));
   if(attempt){ctx.fillStyle=changed?'#f4bd68':'#bcd1cd';ctx.fillText(changed?'有變動':'與上次相同',x,181);if(changed){ctx.fillText(`${old.at}→${r.at} 秒`,x,199);ctx.fillText(old.lanes.map((g,n)=>`${g.count}→${r.lanes[n].count} 隻`).join('／'),x,217);}}
   if(i<2){ctx.fillStyle='#f9e9c6';ctx.font='bold 15px sans-serif';ctx.fillText('→',x+53,122);}ctx.restore();
  });
  for(const [i,lane] of (['west','center','east'] as Lane[]).entries()){
   const x=75+i*105,soon=this.arrowLanes.includes(lane),rows=raids.flatMap((r,n)=>r.lanes.filter(g=>g.lane===lane).map(g=>({n:n+1,at:r.at,count:g.count})));
   ctx.save();ctx.textAlign='center';ctx.font='bold 15px sans-serif';

   if(preview){ctx.strokeStyle='#aabcb5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,attempt?264:188);ctx.lineTo(x,attempt?280:225);ctx.lineTo(x-7,attempt?268:213);ctx.moveTo(x,attempt?280:225);ctx.lineTo(x+7,attempt?268:213);ctx.stroke();}
   ctx.restore();
  }
  this.luredIds=[];
  for(const route of [...new Set([p.baitLeft>0?p.bait as Lane:null,this.previewLane].filter(Boolean))] as Lane[]){if(this.compactView)continue;const x=route==='west'?28:332,color=LANE_COLORS[route];ctx.save();ctx.fillStyle='#24323aee';ctx.fillRect(x-27,338,54,36);ctx.fillStyle=color;ctx.textAlign='center';ctx.font='bold 11px sans-serif';ctx.fillText(`${LANE_NAMES[route]}出口`,x,352);ctx.fillText(this.previewLane===route?'預計出界':'生效中',x,367);ctx.restore();}
  // Exit receipts are normal DOM rows above the canvas, never painted under legends.
  this.previewArrows=[];
  const tagged=p.enemies.filter(e=>e.escapedAt===undefined&&e.state!=='death'&&e.state!=='flung');
  const entries=tagged.map(e=>({e,a:this.actors.find(a=>a.id==='enemy-'+e.id)})).filter(v=>v.a);
  const denseCenter=entries.filter(v=>(v.e.lane??'center')==='center'&&!v.e.attracted&&!v.e.exit).length>=4;
  const routeGroups=new Map<string,Enemy[]>();
  for(const e of p.enemies){const lane=e.lane??'center',key=`${e.group??'legacy'}:${lane}`;routeGroups.set(key,[...(routeGroups.get(key)??[]),e]);}
  const routeSlots=new Map<number,{slot:number;bendX:number;exitY:number;endX:number}>();
  for(const [key,members] of routeGroups){const lane=key.slice(key.lastIndexOf(':')+1) as Lane,ordered=[...members].sort((a,b)=>a.id-b.id);ordered.forEach((e,index)=>{const {slot,exitY}=diversionExitPort(index,ordered.length),port=this.compactView?shortExitPort(this.compactView,lane,index,ordered.length):null;routeSlots.set(e.id,{slot,bendX:port?.bendX??(lane==='west'?8+slot*4:352-slot*4),exitY:port?.y??exitY,endX:port?.x??(lane==='west'?28:332)});});}
  entries.forEach(({e,a})=>{
   if(e.exit||p.baitLeft>0&&baitMatches(p.bait,e.lane??'center'))this.luredIds.push(e.id);
   const x=a!.x/this.cssScale,y=a!.y/this.cssScale,lane=e.lane??'center';
   // The tiny foot marker is local to the sprite. Departed actors are represented
   // by the durable group ledger, never by labels clamped back onto the battlefield.
   if(e.attracted)return;
   ctx.save();ctx.strokeStyle=LANE_COLORS[lane];ctx.lineWidth=2;
   const influenced=this.luredIds.includes(e.id),planned=!influenced&&this.previewLane===lane;
    const {slot,bendX:bend,exitY,endX:end}=routeSlots.get(e.id)??{slot:0,bendX:lane==='west'?8:352,exitY:300,endX:lane==='west'?28:332};
    if(influenced||planned){
     const routePath=()=>{ctx.beginPath();ctx.moveTo(x,y+5);ctx.lineTo(bend,y+18);ctx.lineTo(bend,exitY-22);ctx.lineTo(end,exitY);ctx.stroke();};
     ctx.strokeStyle='#111a20d9';ctx.setLineDash(planned?[9,4]:[5,4]);ctx.lineWidth=5.6;routePath();
     ctx.strokeStyle=planned?'#eadcff':'#f4c983';ctx.setLineDash(planned?[9,4]:[5,4]);ctx.lineWidth=3;routePath();
     ctx.setLineDash([]);ctx.lineJoin='round';
     const dx=end-bend,dy=22,length=Math.hypot(dx,dy),tx=dx/length,ty=dy/length,nx=-ty,ny=tx;
     for(const inset of [0,8]){const tipX=end-tx*inset,tipY=exitY-ty*inset;ctx.beginPath();ctx.moveTo(tipX-tx*10+nx*6,tipY-ty*10+ny*6);ctx.lineTo(tipX,tipY);ctx.lineTo(tipX-tx*10-nx*6,tipY-ty*10-ny*6);ctx.stroke();}
    }
   if(influenced){ctx.beginPath();ctx.ellipse(x,y+3,17,8,0,0,Math.PI*2);ctx.stroke();}
    if(planned){this.previewArrows.push({id:e.id,x,y,lane,slot,bendX:bend,endX:end,endY:exitY});ctx.setLineDash([]);ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y+3,17,8,0,0,Math.PI*2);ctx.stroke();}
    if(!influenced&&!planned){ctx.strokeStyle=DANGER_COLOR;ctx.setLineDash([]);ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y+3,17,8,0,0,Math.PI*2);ctx.stroke();if(!(denseCenter&&lane==='center')){ctx.fillStyle=DANGER_COLOR;ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText('!',x,y+7);}this.dangerMarkers.push({id:e.id,x,y:y+3,color:DANGER_COLOR,dash:[]});}

   if(!this.labelCapacity){ctx.restore();return;}
   // Anchors also describe hidden preview tags; drawnLabelIds records actual glyphs.
    if(denseCenter&&lane==='center'&&!influenced&&!planned){ctx.restore();return;}
    const lx=x,ly=y-a!.visibleHeight/this.cssScale-12,text=influenced?(lane==='west'?'‹':'›'):'!';
   this.labels.push({id:e.id,text,x:lx-9,y:ly-9,w:18,h:18});
   if(this.previewLane){ctx.restore();return;}
   this.drawnLabelIds.push(e.id);
   ctx.fillStyle='#24323aee';ctx.beginPath();ctx.arc(lx,ly,9,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle=influenced?LANE_COLORS[lane]:DANGER_COLOR;ctx.setLineDash([]);ctx.beginPath();ctx.arc(lx,ly,10,0,Math.PI*2);ctx.stroke();ctx.fillStyle=influenced?LANE_COLORS[lane]:DANGER_COLOR;ctx.textAlign='center';ctx.font='bold 11px sans-serif';ctx.fillText(text,lx,ly+4);ctx.restore();
  });

 }
 baitPoint(clientX:number,clientY:number):'west'|'center'|'east'|null{if(this.cssScale<.44)return null;const r=this.canvas.getBoundingClientRect(),t=this.transform,x=((clientX-r.left)*t.dpr-t.ox)/t.scale,y=((clientY-r.top)*t.dpr-t.oy)/t.scale;return y>=235&&y<=337?(['west','center','east'] as const).find((lane,i)=>Math.abs(x-(this.compactView?shortLaneX(this.compactView,lane):75+i*105))<=Math.max(27,22/this.cssScale))??null:null;}
 inspectPoint(clientX:number,clientY:number):'roof'|'window'|'passenger'|null{
  if(this.cssScale<.44)return null;
  const r=this.canvas.getBoundingClientRect(),t=this.transform,x=((clientX-r.left)*t.dpr-t.ox)/t.scale,y=((clientY-r.top)*t.dpr-t.oy)/t.scale,anY=this.sceneArt==='r5/train-wide.webp'?345:494;
  const an=this.actors.find(a=>a.id==='an'||a.id==='watch-2'),ax=an?an.x/this.cssScale:85,ay=an?an.y/this.cssScale:anY,half=an?Math.max(an.visibleWidth/this.cssScale/2,22/this.cssScale):64,height=an?Math.max(an.visibleHeight/this.cssScale,44/this.cssScale):160;
  if(Math.abs(x-ax)<=half&&y>ay-height&&y<ay+8)return 'passenger';
  return y<145&&x>100&&x<300?'roof':x<110&&y>140&&y<370?'window':null;
 }
 draw(c:Campaign,now:number){
  const {canvas,ctx}=this,rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#2b2620';ctx.fillRect(0,0,w,h);this.actors=[];this.damageMarkers=[];this.labels=[];this.drawnLabelIds=[];this.previewArrows=[];this.dangerMarkers=[];this.luredIds=[];this.poseCounts.clear();this.roofRatio=0;
  const m=modeFor(c.segment),p=c.progress,cover=c.screen==='intro'||c.screen==='ending';
  const defenseViewKey=`${w}x${h}`;
  if(m!=='defense'||this.defenseProgress!==p||this.defenseViewKey!==defenseViewKey){this.defenseLastPoints.clear();this.defenseProgress=m==='defense'?p:null;this.defenseViewKey=defenseViewKey;this.compactLastTime=p.time;}
  const signalSpace=!cover&&m==='train'?(parseFloat(getComputedStyle(canvas).getPropertyValue('--night-signal-space'))||0):0,fieldHeight=Math.max(1,rect.height-signalSpace),fieldPixels=Math.max(1,h-signalSpace*dpr);
  this.defenseChapter=Math.floor(c.segment/3);
  const nightWide=!cover&&m==='train'&&rect.width/fieldHeight>1.7,stationWide=!cover&&m==='defense'&&rect.width/rect.height>1.7;
  this.sceneArt=cover?'r5/departure.webp':m==='train'?(nightWide?'r5/train-wide.webp':'r5/train.webp'):m==='convoy'?'r2/road-0.webp':stationWide?'r5/outpost-wide.webp':'r4/outpost-ready.webp';
  if(!cover&&m==='defense'&&c.segment>=3)this.sceneArt=c.segment<6?'content-r2/coldstore.webp':'content-r2/lighthouse.webp';
  if(!cover&&m==='convoy')this.road(w,h,c.reduced?p.time*.55:p.time);else this.cover(this.sceneArt,w,fieldPixels,nightWide?.05:.5);
  const logicalHeight=nightWide?360:560,scale=Math.min(w/360,fieldPixels/logicalHeight),ox=(w-360*scale)/2,oy=(fieldPixels-logicalHeight*scale)/2;this.cssScale=scale/dpr;this.transform={scale,ox,oy,dpr};
  this.compactView=!cover&&m==='defense'?shortStationFrame(rect.width,fieldHeight,this.cssScale):null;
  const minimum=rect.width>=340&&rect.width<=700&&fieldHeight>260?40:24;
  this.labelCapacity=m==='defense'&&this.cssScale>=.65;
  ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.imageSmoothingEnabled=true;
  if(cover){this.sprite('r5/xi-side.png',238,480,78,145,0,'xi','departure',minimum);}
  else if(m==='convoy'){
   for(const [i,prop] of ['wreck','sign','luggage','concrete'].entries()){const y=((p.time*(c.reduced?28:52)+i*191)%820)-150,x=i%2?318:37;this.sprite('r2/'+prop+'.png',x,y,68,90);}
   const f=gunnerFrame(p.shot,.6);
   const b=this.bounds.get('r5/xi-gunner.png')![f],tb=this.bounds.get('r3/truck.png')![0];
   const roof=roofLayout(this.cssScale,b.w/b.h,tb.w);
   roof.truckWidth*=1.12; // Restore a believable climber/vehicle proportion, visual only.
   // A short landscape arena cannot fit a 40px gunner plus the whole convoy.
   // Use its existing 24px actor floor there; 390px portrait keeps the 40px floor.
   if(rect.height<300)for(const key of ['gunnerWidth','gunnerHeight','truckWidth','truckHeight'] as const)roof[key]*=.6;
   const vx=Math.max(roof.truckWidth/2+4,Math.min(360-roof.truckWidth/2-4,p.x));
   const vehicleHeight=roof.truckHeight*.85;
   this.image('r1/trailer.png',vx-26,438,52,95);
   this.sprite('r3/truck.png',vx,452,roof.truckWidth,vehicleHeight);
   const gy=452-vehicleHeight*.54;
   this.sprite('r5/xi-gunner.png',vx,gy,roof.gunnerWidth/b.w,roof.gunnerHeight/b.h,f,'xi','attack');
   this.roofRatio=Math.max(roof.gunnerWidth,roof.gunnerHeight)/(roof.truckWidth*tb.w);
   [...p.enemies].sort((a,b)=>a.y-b.y).forEach(e=>this.enemy(e,c.reduced,minimum,e.slot>=0?{x:vx+(e.slot%2?1:-1)*(roof.truckWidth*.47+20),y:452-(e.slot<2?vehicleHeight*.32:-26)}:{x:e.x,y:e.y+14}));
   // A directional trace follows an existing live target; it creates no shots or damage.
   const target=p.enemies.find(e=>e.slot<0&&(e.state==='walk'||e.state==='attack')&&e.y<320);
   ctx.save();ctx.strokeStyle=p.shot>.42?'#ffe1a5cc':'#ffe1a588';ctx.lineWidth=1.4;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(vx-9,gy-30);ctx.lineTo(target?.x??vx-45,target?target.y+14:gy-88);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();
   if(target)ctx.arc(target.x,target.y+14,9,0,Math.PI*2);
   else{ctx.moveTo(vx-46,gy-78);ctx.lineTo(vx-45,gy-88);ctx.lineTo(vx-35,gy-84);}ctx.stroke();ctx.restore();
   ctx.strokeStyle='#f5d88e';ctx.lineWidth=2;for(const b of p.shots){ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x,b.y+12);ctx.stroke();}
  }else if(m==='defense'){
   for(const [i,id] of ['west','center','east'].entries()){
    const x=this.compactView?shortLaneX(this.compactView,id):75+i*105,active=p.bait===id&&p.baitLeft>0&&c.screen!=='report';
    if(active){const g=ctx.createRadialGradient(x,282,3,x,282,55);g.addColorStop(0,'#e8a33d77');g.addColorStop(1,'#e8a33d00');ctx.fillStyle=g;ctx.fillRect(x-55,227,110,110);ctx.strokeStyle='#f4c46b77';ctx.lineWidth=1.5;const pulse=c.reduced?1:(p.time%1);ctx.beginPath();ctx.ellipse(x,286,22+pulse*22,7+pulse*9,0,0,Math.PI*2);ctx.stroke();}
    ctx.save();if(c.screen==='report'){ctx.filter='brightness(.65) saturate(.6)';}this.sprite('r5/bait.png',x,292,46,63);ctx.restore();

   }
   if(c.screen==='report'||p.time>28){this.sprite('r5/wreckage.png',this.compactView?shortSceneX(this.compactView,43):43,408,65,55);this.sprite('r5/fence.png',this.compactView?shortSceneX(this.compactView,310):310,400,60,62);}
   this.sprite('r5/battery.png',this.compactView?shortSceneX(this.compactView,306):306,512,42,48);
   this.image('r1/trailer.png',this.compactView?shortSceneX(this.compactView,274):274,404,48,87);
   const firing=p.shot>0&&c.screen==='play';
   const denseCenter=p.enemies.filter(e=>e.lane==='center'&&!e.exit&&e.state!=='flung').length>4;
   const hero=this.compactView?shortHeroPoint(this.compactView):{x:denseCenter?50:178,y:488};
   this.sprite(firing?'r5/xi-attack.png':'r5/xi-front.png',hero.x,hero.y,76,116,firing?gunnerFrame(p.shot,Math.max(.12,1.2/guardPower(c))):0,'xi',firing?'attack':'idle',minimum);
   const raids=campaignRaids(c),crowd=c.screen==='report'?[]:p.enemies.filter(e=>e.escapedAt===undefined).sort((a,b)=>a.id-b.id);
   const ordinal=(e:Enemy)=>{let first=1;for(const [batch,r] of raids.entries())for(const g of r.lanes){if(`${batch+1}:${g.lane}`===e.group)return e.id-first;first+=g.count;}return (e.id-1)%4;};
   const reserved=this.actors.map(a=>({x:a.x/this.cssScale,y:a.y/this.cssScale,w:a.visibleWidth/this.cssScale,h:a.visibleHeight/this.cssScale}));
   // Reserve the tallest real pose, not just the currently selected walk frame.
   const envelope={width:64,height:64,minHeight:minimum/this.cssScale,maxFootY:518};
   if(this.labelCapacity||this.compactView)for(const type of ['runner','shambler'])for(const action of ['walk','attack','hurt'])for(const b of this.bounds.get(`r5/${type}-${action}.png`)??[]){const k=Math.max(1,minimum/(64*b.w*this.cssScale),minimum/(64*b.h*this.cssScale));envelope.width=Math.max(envelope.width,64*b.w*k);envelope.height=Math.max(envelope.height,64*b.h*k);}
   const centralPoints=new Map<number,{x:number;y:number}>(),compactSlots=new Map<number,{index:number;count:number}>();
   for(const lane of ['west','center','east']){
    const group=crowd.filter(e=>e.lane===lane&&!e.exit&&e.state!=='flung');
    group.forEach((e,i)=>{compactSlots.set(e.id,{index:i,count:group.length});const point=laneChannelPoint(lane,i,group.length,this.labelCapacity?envelope.height:64);point.y+=Math.min(2,Math.max(0,e.y)*.01);centralPoints.set(e.id,point);});
   }
   const others=crowd.filter(e=>!centralPoints.has(e.id));
   const packed=defenseCrowd(others.map(e=>defensePoint(e,ordinal(e))),[...reserved,...[...centralPoints.values()].map(v=>({...v,w:envelope.width,h:envelope.height}))],this.labelCapacity?envelope:undefined);
   const points=crowd.map(e=>centralPoints.get(e.id)??packed[others.indexOf(e)]);
   const currentIds=new Set(crowd.map(e=>e.id));for(const id of this.defenseLastPoints.keys())if(!currentIds.has(id))this.defenseLastPoints.delete(id);
   const compactDt=Math.max(0,p.time-this.compactLastTime);this.compactLastTime=p.time;
   crowd.forEach((e,i)=>{
    const previous=this.defenseLastPoints.get(e.id),slot=compactSlots.get(e.id),nativeOrdinal=ordinal(e);
    const originalCount=raids[Number(e.group?.split(':')[0])-1]?.lanes.find(g=>g.lane===e.lane)?.count??slot?.count??1;
    const proposed=this.compactView?shortEnemyPoint(this.compactView,e.lane??'center',slot?.index??nativeOrdinal,slot?.count??originalCount,envelope.height*this.cssScale,e.x,e.y,e.exit,nativeOrdinal,originalCount):points[i];
    const settled=this.compactView?settleStationPoint(previous,proposed,this.cssScale,compactDt):proposed;
    const point=deathDisplayPoint(e.state,settled,previous);this.enemy(e,c.reduced,minimum,point,64);this.defenseLastPoints.set(e.id,point);
   });
   // Model projectiles still settle in campaign.ts; display only actual impact at its drawn target.
   this.damageMarkers=defenseImpactMarkers(crowd,this.actors,this.cssScale);
   for(const marker of this.damageMarkers){const radius=(3+2*marker.strength)/this.cssScale;ctx.save();ctx.globalAlpha=marker.strength;ctx.setLineDash([]);ctx.lineCap='round';ctx.strokeStyle='#2b2620';ctx.lineWidth=4/this.cssScale;
    const spark=()=>{ctx.beginPath();ctx.moveTo(marker.x-radius,marker.y);ctx.lineTo(marker.x+radius,marker.y);ctx.moveTo(marker.x,marker.y-radius);ctx.lineTo(marker.x,marker.y+radius);ctx.stroke();};
    spark();ctx.strokeStyle='#f4d88d';ctx.lineWidth=2/this.cssScale;spark();ctx.restore();}
   if(c.screen==='play')this.scout(c);
   for(const [i,id] of ['west','center','east'].entries()){const x=75+i*105,active=p.bait===id&&p.baitLeft>0;ctx.fillStyle='#292f32e8';ctx.fillRect(x-24,533,48,21);ctx.strokeStyle=active?'#ffd184':'#a5b6b8';ctx.strokeRect(x-24,533,48,21);ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillStyle=active?'#ffd184':'#eee5cd';ctx.fillText(['西側','中央','東側'][i],x,548);}ctx.textAlign='left';
  }else{
   const event=nightPresentation(c),blocked=event?.phase==='blocked',impact=event?.phase==='impact';
   const zone=event?.threat??actualThreat(c),windowBlock=zone==='window';
   const f=p.night?.voyage?.inspectedIds.length?2:c.reduced?0:Math.floor(now/2)%2;
   const duty=watchIdentity(c),poseState=watchPose(c),xiBlocks=poseState==='block'&&duty.person===1;
   if(c.relay[String(Math.floor(c.segment/3))]==='rescue'&&Math.floor(c.segment/3)===1){
    // Existing support roles appear in the upper carriage, above both foreground companions.
    const supportY=nightWide?Math.max(150,minimum*1.65/this.cssScale+10):264,spread=nightWide?30/this.cssScale:0;
    this.contactShadow(100-spread,supportY+2,nightWide?28:31,7);
    this.contactShadow(287+spread,supportY+2,nightWide?28:31,7);
    this.sprite('content-r16/rescue-support.webp',100-spread,supportY,nightWide?90:100,nightWide?120:150,0,'support-lin','repair',minimum);
    this.sprite('content-r16/rescue-support.webp',287+spread,supportY,nightWide?90:100,nightWide?120:150,1,'support-he','watch-window',minimum);
   }
   if(duty.person===1){
    const path=xiBlocks?(windowBlock?'content-r6/xi-brace.webp':'content-r9/xi-roof.webp'):'r5/xi-night.png',pose=xiBlocks?0:impact?(windowBlock?1:2):0;
    const im=this.images.get(path)!,bounds=this.bounds.get(path)![pose],cols=this.bounds.get(path)!.length,height=205/bounds.h,width=height*(im.width/cols)/im.height;
    this.sprite(path,220,nightWide?345:494,width,height,pose,'xi',xiBlocks?'block':impact?'react-'+zone:'listen',minimum);
   }else if(duty.person===0){const path=poseState==='block'?'content-r14/laoxi-watch.webp':'content-r15/laoxi-duty.webp',frame=poseState==='hurt'?1:0,im=this.images.get(path)!,b=this.bounds.get(path)![frame],height=205/b.h,width=height*(im.width/(path.includes('laoxi-duty')?2:1))/im.height;this.sprite(path,220,nightWide?345:494,width,height,frame,'watch-0',poseState,minimum);}
   else if(blocked&&zone==='roof')this.sprite('content-r14/an-duty.webp',220,nightWide?345:494,175,235,1,'watch-2','block',minimum);
   else this.sprite('r3/an-poses.png',220,nightWide?345:494,155,222,blocked?3:f,'watch-2',blocked?'block':'listen',minimum);
   if(duty.person!==2)this.sprite('content-r14/an-duty.webp',75,nightWide?345:494,110,150,0,'an','rest',minimum);
   if(event&&event.phase!=='selected'){
    const cx=windowBlock?55:196,cy=windowBlock?231:87;ctx.save();
    const flash=ctx.createRadialGradient(cx,cy,2,cx,cy,85);flash.addColorStop(0,blocked?'#d8ffed66':'#e8a33d55');flash.addColorStop(1,'#9ed6c800');ctx.fillStyle=flash;ctx.fillRect(cx-85,cy-85,170,170);
    // Short irregular impact strokes belong to the contact point, never a rectangular UI frame.
    ctx.strokeStyle=blocked?'#b6d4c5':'#e8c795';ctx.lineWidth=2;
    for(let i=0;i<5;i++){const x=cx-24+i*12,y=cy-15+(i%2)*5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+3,y+13);ctx.lineTo(x+1,y+21);ctx.stroke();}ctx.restore();
   }
   const roof=p.started&&zone==='roof',window=p.started&&!roof;
   if(roof||window){const cx=roof?196:55,cy=roof?87:231,g=ctx.createRadialGradient(cx,cy,2,cx,cy,roof?78:67);g.addColorStop(0,'#e8a33d35');g.addColorStop(1,'#e8a33d00');ctx.fillStyle=g;ctx.fillRect(cx-80,cy-80,160,160);}
   ctx.strokeStyle=roof?'#e8bc7080':'#a3bcc02a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(136,68);ctx.lineTo(138,96);ctx.moveTo(241,68);ctx.lineTo(239,96);ctx.stroke();
   ctx.strokeStyle=window?'#e8bd8190':'#b7d3df30';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<3;i++){ctx.moveTo(39+i*9,202);ctx.lineTo(33+i*9,246);}ctx.stroke();
   if(p.started&&!c.reduced){ctx.fillStyle=roof?'#d6b986a0':'#c4dce19a';for(let i=0;i<7;i++){const y=roof?90+(now*20+i*13)%58:190+(now*13+i*17)%88;ctx.fillRect(roof?135+i*19:41+i*6,y,1.5,3);}}
  }
  ctx.setTransform(1,0,0,1,0,0);
  const beam=ctx.createLinearGradient(w*.72,0,w,h*.3);beam.addColorStop(0,'#e8a33d12');beam.addColorStop(1,'#e8a33d00');ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(w-10,10);ctx.lineTo(w*.45,h*.14);ctx.lineTo(w*.60,h*.34);ctx.closePath();ctx.fill();
  const shade=ctx.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#15202844');shade.addColorStop(.25,'#15202800');shade.addColorStop(1,'#15202822');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
  const contact=nightPresentation(c);
  if(m==='train'&&contact?.phase==='impact'){
   // A brief full-scene exposure pulse plus directional falling dust marks impact.
   ctx.fillStyle=c.reduced?'#ffe5bd18':'#ffe5bd48';ctx.fillRect(0,0,w,h);
   ctx.fillStyle='#f4dfb8bb';for(let i=0;i<24;i++){const x=contact.threat==='roof'?w*(.22+(i%8)*.075):w*(.04+(i%5)*.025),y=h*(.12+((i*17+contact.age*120)%55)/100);ctx.beginPath();ctx.arc(x,y,Math.max(1,w/220),0,Math.PI*2);ctx.fill();}
  }
 }
}
