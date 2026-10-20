import {modeFor,actualThreat,nightPresentation,guardPower,campaignRaids,type Campaign,type Enemy} from './campaign';
import {LANE_NAMES,LANE_COLORS,raidComparison,raidsFor,baitMatches,type Lane} from './journey';
import {lureState} from './feedback';
import {attackFrame,gunnerFrame} from './animation';
import {roofLayout,defensePoint,defenseCrowd} from './art-layout';
const paths=['content-r1/relay-table.webp','r1/trailer.png','r3/truck.png','r3/an-poses.png',...['wreck','sign','luggage','concrete'].map(p=>'r2/'+p+'.png'),...Array.from({length:3},(_,i)=>'r2/road-'+i+'.webp'),...['climber-attack.png','xi-gunner.png','xi-attack.png',...['runner','shambler'].flatMap(e=>['walk','attack','hurt','death'].map(a=>e+'-'+a+'.png'))].map(p=>'r5/'+p),...['departure.webp','train.webp','train-wide.webp','outpost-wide.webp','xi-front.png','xi-side.png','xi-night.png','bait.png','wreckage.png','fence.png','battery.png'].map(p=>'r5/'+p),'r4/outpost-ready.webp'];
type Actor={id:string;action:string;frame:number;visibleWidth:number;visibleHeight:number;path:string;x:number;y:number};
paths.push('content-r6/xi-brace.webp','content-r9/xi-roof.webp','content-r2/coldstore.webp','content-r2/lighthouse.webp');
export class Renderer {
 images=new Map<string,HTMLImageElement>();ready:Promise<void>;ctx:CanvasRenderingContext2D;
 bounds=new Map<string,{w:number;h:number}[]>();actors:Actor[]=[];cssScale=1;
 transform={scale:1,ox:0,oy:0,dpr:1};
 blockEvent='';blockUntil=0;
 previewLane:Lane|null=null;
 defenseChapter=0;
 labels:{id:number;text:string;x:number;y:number;w:number;h:number}[]=[];sceneArt='';roofRatio=0;poseCounts=new Map<string,number>();luredIds:number[]=[];arrowLanes:string[]=[];
 constructor(public canvas:HTMLCanvasElement){
  this.ctx=canvas.getContext('2d',{alpha:false})!;
  this.ready=Promise.all(paths.map(path=>new Promise<void>((resolve,reject)=>{
   const im=new Image();im.onload=()=>{this.images.set(path,im);
    if(path.endsWith('.png')){const cols=path.includes('an-poses')||/-(walk|attack|hurt|death|gunner|night)\.png/.test(path)?4:1,fw=im.width/cols;
     const scratch=document.createElement('canvas');scratch.width=im.width;scratch.height=im.height;const sc=scratch.getContext('2d')!;sc.drawImage(im,0,0);const data=sc.getImageData(0,0,im.width,im.height).data;
     this.bounds.set(path,Array.from({length:cols},(_,i)=>{let left=fw,right=0,top=im.height,bottom=0;for(let y=0;y<im.height;y++)for(let x=0;x<fw;x++)if(data[(y*im.width+i*fw+x)*4+3]>80){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}return{w:(right-left+1)/fw,h:(bottom-top+1)/im.height};}));
    }resolve();};im.onerror=()=>reject(new Error('素材無法載入：'+path));im.src='/art/'+path;
  }))).then(()=>{});
 }
 image(path:string,x:number,y:number,w:number,h:number){const im=this.images.get(path);if(im)this.ctx.drawImage(im,x,y,w,h);}
 cover(path:string,w:number,h:number,anchorY=.5){const im=this.images.get(path);if(!im)return;const s=Math.max(w/im.width,h/im.height),sw=w/s,sh=h/s;this.ctx.drawImage(im,(im.width-sw)/2,(im.height-sh)*anchorY,sw,sh,0,0,w,h);}
 sprite(path:string,x:number,y:number,w:number,h:number,frame=0,id='',action='idle',minimum=0){
  const im=this.images.get(path);if(!im)return;const bounds=this.bounds.get(path)??[{w:1,h:1}],b=bounds[frame]??bounds[0];
  const k=Math.max(1,minimum/(w*b.w*this.cssScale),minimum/(h*b.h*this.cssScale));w*=k;h*=k;
  this.ctx.drawImage(im,frame*im.width/bounds.length,0,im.width/bounds.length,im.height,x-w/2,y-h,w,h);
  if(id)this.actors.push({id,action,frame,path,x:x*this.cssScale,y:y*this.cssScale,visibleWidth:w*b.w*this.cssScale,visibleHeight:h*b.h*this.cssScale});
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
  ctx.save();if(climbing&&e.slot%2){ctx.translate(point.x*2,0);ctx.scale(-1,1);}
  if(size===64&&this.defenseChapter===2)ctx.filter='sepia(.35) saturate(1.25)';
  this.sprite(path,point.x,point.y,climbing?70:size,climbing?70:size,frame,'enemy-'+e.id,action,action==='death'?0:minimum);ctx.restore();
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

   if(soon||preview){ctx.strokeStyle='#f4f1e8';ctx.lineWidth=soon?3:2;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(x,preview?(attempt?264:188):88);ctx.lineTo(x,preview&&attempt?280:225);ctx.lineTo(x-10,preview&&attempt?265:210);ctx.moveTo(x,preview&&attempt?280:225);ctx.lineTo(x+10,preview&&attempt?265:210);ctx.stroke();ctx.setLineDash([]);}
   ctx.restore();
  }
  for(const e of p.enemies.filter(e=>e.state!=='death'&&e.state!=='flung'&&lureState(c,e)==='unaffected')){const a=this.actors.find(a=>a.id==='enemy-'+e.id);if(!a)continue;ctx.save();ctx.strokeStyle='#e2dfd0';ctx.lineWidth=2;ctx.setLineDash([3,3]);ctx.beginPath();ctx.ellipse(a.x/this.cssScale,a.y/this.cssScale+3,17,8,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
  this.luredIds=[];
  const route=this.previewLane??(p.baitLeft>0?p.bait as Lane:null);
  if(route){const x=180+({west:-5,center:0,east:5}[route])*21,from={west:75,center:180,east:285}[route],color=LANE_COLORS[route];ctx.save();ctx.strokeStyle=color;ctx.lineWidth=4;ctx.setLineDash(this.previewLane?[6,4]:[]);ctx.beginPath();ctx.moveTo(from-22,170);ctx.quadraticCurveTo(x-28,205,x,281);ctx.stroke();ctx.beginPath();ctx.moveTo(x-8,267);ctx.lineTo(x,281);ctx.lineTo(x+8,267);ctx.stroke();ctx.fillStyle='#24323aee';ctx.fillRect(x-36,338,72,24);ctx.fillStyle=color;ctx.textAlign='center';ctx.font='bold 13px sans-serif';ctx.fillText(`${LANE_NAMES[route]}${this.previewLane?'預覽':'誘餌'}`,x,355);ctx.restore();}
  const tagged=p.enemies.filter(e=>e.escapedAt===undefined&&e.state!=='death'&&e.state!=='flung');
  const entries=tagged.map(e=>({e,a:this.actors.find(a=>a.id==='enemy-'+e.id)})).filter(v=>v.a);
  entries.forEach(({e,a})=>{
   if(e.exit||p.baitLeft>0&&baitMatches(p.bait,e.lane??'center'))this.luredIds.push(e.id);
   const x=a!.x/this.cssScale,y=a!.y/this.cssScale,lane=e.lane??'center';
   // The tiny foot marker is local to the sprite. Departed actors are represented
   // by the durable group ledger, never by labels clamped back onto the battlefield.
   if(e.attracted)return;
   ctx.save();ctx.strokeStyle=LANE_COLORS[lane];ctx.lineWidth=2;
   ctx.beginPath();ctx.ellipse(x,y+3,17,8,0,0,lureState(c,e)==='turning'?Math.PI:Math.PI*2);ctx.stroke();
   // The tag follows this actor's head, never a battlefield-wide slot.
   const lx=x,ly=y-a!.visibleHeight/this.cssScale-12,text=String(e.id);
   this.labels.push({id:e.id,text,x:lx-9,y:ly-9,w:18,h:18});
   ctx.fillStyle='#24323aee';ctx.beginPath();ctx.arc(lx,ly,9,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle=LANE_COLORS[lane];ctx.setLineDash(this.luredIds.includes(e.id)||this.previewLane===lane?[]:[2,2]);ctx.beginPath();if(lane==='west'){ctx.moveTo(lx,ly-10);ctx.lineTo(lx+10,ly);ctx.lineTo(lx,ly+10);ctx.lineTo(lx-10,ly);ctx.closePath();}else if(lane==='center')ctx.rect(lx-9,ly-9,18,18);else{ctx.moveTo(lx,ly-11);ctx.lineTo(lx+10,ly+9);ctx.lineTo(lx-10,ly+9);ctx.closePath();}ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=LANE_COLORS[lane];ctx.textAlign='center';ctx.font='bold 11px sans-serif';ctx.fillText(text,lx,ly+4);ctx.restore();
  });

 }
 baitPoint(clientX:number,clientY:number):'west'|'center'|'east'|null{if(this.cssScale<.44)return null;const r=this.canvas.getBoundingClientRect(),t=this.transform,x=((clientX-r.left)*t.dpr-t.ox)/t.scale,y=((clientY-r.top)*t.dpr-t.oy)/t.scale;return y>=235&&y<=337?(['west','center','east'] as const).find((_,i)=>Math.abs(x-(75+i*105))<=Math.max(27,22/this.cssScale))??null:null;}
 inspectPoint(clientX:number,clientY:number):'roof'|'window'|'passenger'|null{
  if(this.cssScale<.44)return null;
  const r=this.canvas.getBoundingClientRect(),t=this.transform,x=((clientX-r.left)*t.dpr-t.ox)/t.scale,y=((clientY-r.top)*t.dpr-t.oy)/t.scale,anY=this.sceneArt==='r5/train-wide.webp'?318:420;
  if(Math.abs(x-132)<=Math.max(46,22/this.cssScale)&&y>anY-140&&y<anY+8)return 'passenger';
  return y<145&&x>100&&x<300?'roof':x<110&&y>140&&y<370?'window':null;
 }
 draw(c:Campaign,now:number){
  const {canvas,ctx}=this,rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#2b2620';ctx.fillRect(0,0,w,h);this.actors=[];this.labels=[];this.poseCounts.clear();this.roofRatio=0;
  const m=modeFor(c.segment),p=c.progress,cover=c.screen==='intro'||c.screen==='ending';
  this.defenseChapter=Math.floor(c.segment/3);
  const nightWide=!cover&&m==='train'&&rect.width/rect.height>1.7,stationWide=!cover&&m==='defense'&&rect.width/rect.height>1.7;
  this.sceneArt=cover?'r5/departure.webp':m==='train'?(nightWide?'r5/train-wide.webp':'r5/train.webp'):m==='convoy'?'r2/road-0.webp':stationWide?'r5/outpost-wide.webp':'r4/outpost-ready.webp';
  if(!cover&&m==='defense'&&c.segment>=3)this.sceneArt=c.segment<6?'content-r2/coldstore.webp':'content-r2/lighthouse.webp';
  if(!cover&&m==='convoy')this.road(w,h,c.reduced?p.time*.55:p.time);else this.cover(this.sceneArt,w,h,nightWide?.05:.5);
  const logicalHeight=nightWide?360:560,scale=Math.min(w/360,h/logicalHeight),ox=(w-360*scale)/2,oy=(h-logicalHeight*scale)/2;this.cssScale=scale/dpr;this.transform={scale,ox,oy,dpr};
  const minimum=rect.width>=340&&rect.width<=700&&rect.height>260?40:24;
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
    const x=75+i*105,active=p.bait===id&&p.baitLeft>0&&c.screen!=='report';
    if(active){const g=ctx.createRadialGradient(x,282,3,x,282,55);g.addColorStop(0,'#e8a33d77');g.addColorStop(1,'#e8a33d00');ctx.fillStyle=g;ctx.fillRect(x-55,227,110,110);ctx.strokeStyle='#f4c46b77';ctx.lineWidth=1.5;const pulse=c.reduced?1:(p.time%1);ctx.beginPath();ctx.ellipse(x,286,22+pulse*22,7+pulse*9,0,0,Math.PI*2);ctx.stroke();}
    ctx.save();if(c.screen==='report'){ctx.filter='brightness(.65) saturate(.6)';}this.sprite('r5/bait.png',x,292,46,63);ctx.restore();

   }
   if(c.screen==='report'||p.time>28){this.sprite('r5/wreckage.png',43,408,65,55);this.sprite('r5/fence.png',310,400,60,62);}
   this.sprite('r5/battery.png',306,512,42,48);
   this.image('r1/trailer.png',274,404,48,87);
   const firing=p.shot>0&&c.screen==='play';
   this.sprite(firing?'r5/xi-attack.png':'r5/xi-front.png',178,488,76,116,firing?gunnerFrame(p.shot,Math.max(.12,1.2/guardPower(c))):0,'xi',firing?'attack':'idle',minimum);
   const raids=campaignRaids(c),crowd=p.enemies.filter(e=>e.escapedAt===undefined).sort((a,b)=>a.id-b.id);
   const ordinal=(e:Enemy)=>{let first=1;for(const [batch,r] of raids.entries())for(const g of r.lanes){if(`${batch+1}:${g.lane}`===e.group)return e.id-first;first+=g.count;}return (e.id-1)%4;};
   const reserved=this.actors.map(a=>({x:a.x/this.cssScale,y:a.y/this.cssScale,w:a.visibleWidth/this.cssScale,h:a.visibleHeight/this.cssScale}));
   const points=defenseCrowd(crowd.map(e=>defensePoint(e,ordinal(e))),reserved);
   crowd.forEach((e,i)=>this.enemy(e,c.reduced,minimum,points[i],64));
   ctx.fillStyle='#f4d88d';for(const b of p.shots)ctx.fillRect(b.x-1,b.y,3,10);
   for(const [i,id] of ['west','center','east'].entries()){const x=75+i*105,active=p.bait===id&&p.baitLeft>0;ctx.fillStyle='#292f32e8';ctx.fillRect(x-24,309,48,21);ctx.strokeStyle=active?'#ffd184':'#a5b6b8';ctx.strokeRect(x-24,309,48,21);ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillStyle=active?'#ffd184':'#eee5cd';ctx.fillText(['西側','中央','東側'][i],x,324);}ctx.textAlign='left';
   if(c.screen==='play')this.scout(c);
  }else{
   const f=p.impacts?3:p.night?.voyage?.inspectedIds.length?2:c.reduced?0:Math.floor(now/2)%2;
   ctx.save();ctx.globalAlpha=.72;this.sprite('r3/an-poses.png',132,nightWide?318:420,78,112,f,'an','listen',minimum);ctx.restore();
   // Xi is physically present in the foreground, with An still the observed passenger.
   const xiPose=p.impacts?3:p.started&&actualThreat(c)==='roof'?2:p.started?1:0;
   const event=nightPresentation(c),blocked=event?.phase==='blocked',impact=event?.phase==='impact';
   const zone=event?.threat??actualThreat(c),windowBlock=zone==='window';
   if(event){const cx=windowBlock?55:196,cy=windowBlock?231:87;ctx.save();const flash=ctx.createRadialGradient(cx,cy,2,cx,cy,100);flash.addColorStop(0,blocked?'#e6f8ebb8':'#f4bd6888');flash.addColorStop(1,'#9ed6c800');ctx.fillStyle=flash;ctx.fillRect(cx-100,cy-100,200,200);ctx.strokeStyle=blocked?'#d8ffed':'#f4bd68';ctx.lineWidth=blocked?5:3;ctx.strokeRect(windowBlock?29:130,windowBlock?186:62,windowBlock?70:120,windowBlock?91:45);
    if(impact){ctx.strokeStyle='#f0e7d5';for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(cx-22+i*10,cy-18);ctx.lineTo(cx-16+i*10,cy+20);ctx.stroke();}}
    ctx.fillStyle='#24323af5';ctx.fillRect(cx-38,cy+24,76,24);ctx.fillStyle=blocked?'#d8ffed':'#f4bd68';ctx.textAlign='center';ctx.font='bold 16px sans-serif';ctx.fillText(impact?'撞擊！':blocked?'擋下！':event.outcome==='damaged'?'受損':'已反制',cx,cy+42);ctx.restore();
   }
   const xiBlocks=blocked&&c.crew.plan.watch===1;
   this.sprite(xiBlocks?(windowBlock?'content-r6/xi-brace.webp':'content-r9/xi-roof.webp'):'r5/xi-night.png',xiBlocks?(windowBlock?125:196):244,xiBlocks?(windowBlock?(nightWide?365:480):(nightWide?345:460)):(nightWide?345:524),xiBlocks?(windowBlock?(nightWide?225:270):(nightWide?217:310)):174,xiBlocks?(windowBlock?(nightWide?250:300):(nightWide?258:370)):232,xiBlocks?0:xiPose,'xi',xiBlocks?'block':'listen',minimum);
   const roof=p.started&&zone==='roof',window=p.started&&!roof;
   if(roof||window){const cx=roof?196:55,cy=roof?87:231,g=ctx.createRadialGradient(cx,cy,2,cx,cy,roof?78:67);g.addColorStop(0,'#e8a33d35');g.addColorStop(1,'#e8a33d00');ctx.fillStyle=g;ctx.fillRect(cx-80,cy-80,160,160);}
   ctx.strokeStyle=roof?'#e8bc7080':'#a3bcc02a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(136,68);ctx.lineTo(138,96);ctx.moveTo(241,68);ctx.lineTo(239,96);ctx.stroke();
   ctx.strokeStyle=window?'#e8bd8190':'#b7d3df30';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<3;i++){ctx.moveTo(39+i*9,202);ctx.lineTo(33+i*9,246);}ctx.stroke();
   if(p.started&&!c.reduced){ctx.fillStyle=roof?'#d6b986a0':'#c4dce19a';for(let i=0;i<7;i++){const y=roof?90+(now*20+i*13)%58:190+(now*13+i*17)%88;ctx.fillRect(roof?135+i*19:41+i*6,y,1.5,3);}}
  }
  ctx.setTransform(1,0,0,1,0,0);
  const beam=ctx.createLinearGradient(w*.72,0,w,h*.3);beam.addColorStop(0,'#e8a33d12');beam.addColorStop(1,'#e8a33d00');ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(w-10,10);ctx.lineTo(w*.45,h*.14);ctx.lineTo(w*.60,h*.34);ctx.closePath();ctx.fill();
  const shade=ctx.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#15202844');shade.addColorStop(.25,'#15202800');shade.addColorStop(1,'#15202822');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
 }
}
