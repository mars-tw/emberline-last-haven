import { modeFor, actualThreat, type Campaign, type Enemy } from './campaign';
import {attackFrame} from './animation';
const paths=['env/land.png','env/kenney_road_debris.png','vehicles/land.png','vehicles/trailer.png','vehicles/xi_gunner_attack.png','story/xi.png','ui/start-atmosphere-r79-low.png','train/carriages/sleep.webp','train/a07-clips/listen.webp','train/a07-clips/startle.webp',...['runner','shambler'].flatMap(e=>['walk','attack','hurt','death'].map(a=>`enemies/oga_${e}_${a}.png`))];
export class Renderer {
 images=new Map<string,HTMLImageElement>();ready:Promise<void>;ctx:CanvasRenderingContext2D;
 constructor(public canvas:HTMLCanvasElement){this.ctx=canvas.getContext('2d',{alpha:false})!;this.ready=Promise.all(paths.map(path=>new Promise<void>((resolve,reject)=>{const im=new Image();im.onload=()=>{this.images.set(path,im);resolve();};im.onerror=()=>reject(new Error(`素材無法載入：${path}`));im.src='/art/'+path;}))).then(()=>{});}
 image(path:string,x:number,y:number,w:number,h:number){const im=this.images.get(path);if(im)this.ctx.drawImage(im,x,y,w,h);}
 cover(path:string,w:number,h:number){const im=this.images.get(path);if(!im)return;const s=Math.max(w/im.width,h/im.height),sw=w/s,sh=h/s;this.ctx.drawImage(im,(im.width-sw)/2,(im.height-sh)/2,sw,sh,0,0,w,h);}
 enemy(e:Enemy,reduced:boolean){const action=e.state==='flung'?'hurt':e.state;const im=this.images.get(`enemies/oga_${e.type}_${action}.png`);if(!im)return;const frames=action==='walk'?[0,1,2]:Array.from({length:im.width/40},(_,i)=>i);const n=frames.length;const duration=action==='death'?.65:action==='hurt'?.24:.65;const frame=action==='attack'?attackFrame(e.age,e.slot>=0):action==='walk'?Math.floor(e.age/(reduced?.28:.16))%n:Math.min(n-1,Math.floor(e.age/duration*n));this.ctx.drawImage(im,frames[frame]*40,0,40,40,e.x-27,e.y-40,54,54);}
 draw(c:Campaign,now:number){const {canvas,ctx}=this;const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);const w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#243e46';ctx.fillRect(0,0,w,h);
 const m=modeFor(c.segment),p=c.progress;
 this.cover(c.screen==='intro'||c.screen==='ending'?'ui/start-atmosphere-r79-low.png':m==='train'?'train/carriages/sleep.webp':'env/land.png',w,h);
 ctx.fillStyle='rgba(17,34,41,.25)';ctx.fillRect(0,0,w,h);
 // World/colliders never depend on responsive CSS pixels. All sprites share one stage.
 const scale=Math.min(w/360,h/560),ox=(w-360*scale)/2,oy=(h-560*scale)/2;ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.imageSmoothingEnabled=false;
 if(c.screen==='intro'||c.screen==='ending') {this.image('vehicles/trailer.png',165,280,76,138);this.image('vehicles/land.png',130,125,105,203);this.image('story/xi.png',40,320,86,129);}
 else if(m==='convoy') {
  // Moving road marks are environment geometry, not character animation.
  ctx.strokeStyle='#e2c48e';ctx.lineWidth=3;ctx.setLineDash([18,42]);ctx.lineDashOffset=c.reduced?0:-p.time*95;ctx.beginPath();ctx.moveTo(180,0);ctx.lineTo(180,560);ctx.stroke();ctx.setLineDash([]);
  this.image('vehicles/trailer.png',p.x-27,375,54,98);this.image('vehicles/land.png',p.x-35,285,70,136);
  const gun=this.images.get('vehicles/xi_gunner_attack.png');if(gun){const f=p.shot>.5?2:p.shot>.25?3:p.shot>0&&p.shot<.15?1:0;ctx.drawImage(gun,f*256,0,256,384,p.x-24,302,48,72);}
  p.enemies.forEach(e=>this.enemy(e,c.reduced));
  ctx.strokeStyle='#f9dfa4';ctx.lineWidth=2;for(const b of p.shots){ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x,b.y+12);ctx.stroke();}
  ctx.fillStyle='#fff1c5';ctx.font='bold 14px sans-serif';ctx.fillText('北方燈塔 ↑',138,42);
 } else if(m==='defense') {
  // Three real tactical landing points, with a common screen-space/world mapping.
  for(const [i,id] of ['west','center','east'].entries()) {const x=75+i*105;ctx.strokeStyle=p.bait===id&&p.baitLeft>0?'#edba7c':'#b4c7bf';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,285,30,14,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fff1c5';ctx.font='13px sans-serif';ctx.fillText(['西側','中央','東側'][i],x-13,318);if(p.bait===id&&p.baitLeft>0){ctx.fillStyle='#db8462';ctx.beginPath();ctx.arc(x,279,7,0,Math.PI*2);ctx.fill();}}
  this.image('vehicles/trailer.png',268,400,45,82);this.image('story/xi.png',145,395,60,90);
  const debris=this.images.get('env/kenney_road_debris.png');if(debris)for(let i=0;i<5;i++)ctx.drawImage(debris,0,0,32,32,45+i*55,455,48,48);
  p.enemies.forEach(e=>this.enemy(e,c.reduced));ctx.fillStyle='#f7d28a';for(const b of p.shots)ctx.fillRect(b.x-1,b.y,3,10);
 } else {
  const path=p.impacts?'train/a07-clips/startle.webp':'train/a07-clips/listen.webp',im=this.images.get(path);if(im){const f=Math.floor((c.reduced?0:now)*5)%8;ctx.drawImage(im,f*192,0,192,192,85,270,190,190);}
  if(p.started){const roof=actualThreat(c)==='roof';ctx.strokeStyle='#efad7a';ctx.lineWidth=4;ctx.beginPath();if(roof){ctx.moveTo(135,76);ctx.lineTo(180,60);ctx.lineTo(225,76);}else{ctx.ellipse(66,222,33,58,0,0,Math.PI*2);}ctx.stroke();ctx.fillStyle='#f6e8bc';ctx.font='bold 16px sans-serif';ctx.fillText(roof?'頭頂傳來拖曳聲':'敲擊緊貼玻璃',roof?103:26,roof?105:151);}
 }
 // Overlaid vignette keeps old source art within one lighting direction.
 ctx.setTransform(1,0,0,1,0,0);const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(18,38,45,.42)');g.addColorStop(.4,'rgba(18,38,45,0)');g.addColorStop(1,'rgba(18,38,45,.38)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 }
}
