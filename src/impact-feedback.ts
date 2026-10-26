/** Read-only display feedback. Combat positions, damage and clocks stay in campaign.ts. */
export type Point={x:number;y:number};
export type AlphaBounds={left:number;right:number;top:number;bottom:number};

export function frameContactPoint(data:Uint8ClampedArray,imageWidth:number,frameX:number,frameWidth:number,height:number,bounds:AlphaBounds):Point|null{
 if(bounds.right<bounds.left||bounds.bottom<bounds.top)return null;
 const cx=(bounds.left+bounds.right+1)/2,cy=(bounds.top+bounds.bottom+1)/2;
 let chosen:Point|null=null,distance=Infinity;
 for(let y=bounds.top;y<=bounds.bottom;y++)for(let x=bounds.left;x<=bounds.right;x++){
  if(data[(y*imageWidth+frameX+x)*4+3]<=80)continue;
  const delta=(x+.5-cx)**2+(y+.5-cy)**2;
  if(delta<distance){distance=delta;chosen={x:(x+.5)/frameWidth,y:(y+.5)/height};}
 }
 return chosen;
}

export function projectContactPoint(contact:Point,x:number,y:number,w:number,h:number,
 matrix:{a:number;b:number;c:number;d:number;e:number;f:number},view:{ox:number;oy:number;dpr:number}):Point{
 const lx=x-w/2+w*contact.x,ly=y-h+h*contact.y;
 return{x:(matrix.a*lx+matrix.c*ly+matrix.e-view.ox)/view.dpr,
        y:(matrix.b*lx+matrix.d*ly+matrix.f-view.oy)/view.dpr};
}

export function deathDisplayPoint(state:string,proposed:Point,previous?:Point):Point{
 return {...(state==='death'&&previous?previous:proposed)};
}

export type ContactActor={id:string;contactX?:number;contactY?:number};
export type ImpactMarker={targetId:number;sourceState:'hurt'|'death';age:number;x:number;y:number;cssX:number;cssY:number;strength:number};
export function defenseImpactMarkers(enemies:readonly{id:number;state:string;age:number}[],actors:readonly ContactActor[],cssScale:number):ImpactMarker[]{
 if(!Number.isFinite(cssScale)||cssScale<=0)return [];
 const markers:ImpactMarker[]=[],seen=new Set<number>();
 for(const enemy of enemies){
  if(!['hurt','death'].includes(enemy.state)||!Number.isFinite(enemy.age)||enemy.age<0||enemy.age>=.12||seen.has(enemy.id))continue;
  const actor=actors.find(a=>a.id==='enemy-'+enemy.id);
  if(!actor||!Number.isFinite(actor.contactX)||!Number.isFinite(actor.contactY))continue;
  const cssX=actor.contactX!,cssY=actor.contactY!;
  markers.push({targetId:enemy.id,sourceState:enemy.state as 'hurt'|'death',age:enemy.age,
   x:cssX/cssScale,y:cssY/cssScale,cssX,cssY,strength:1-enemy.age/.12});
  seen.add(enemy.id);
 }
 return markers;
}
