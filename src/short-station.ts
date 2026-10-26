/** CSS-sized station presentation. Never writes campaign positions or clocks. */
import type {Point} from './impact-feedback';

export type ShortStation={width:number;height:number;scale:number;ox:number};
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));

export function shortStationFrame(width:number,height:number,scale:number):ShortStation|null{
 if(![width,height,scale].every(Number.isFinite)||width<280||height<=0||scale<=0||height>=260||width/height<=1.7)return null;
 return{width,height,scale,ox:(width-360*scale)/2};
}

export function stationWorldPoint(view:ShortStation,x:number,y:number):Point{
 return{x:(x-view.ox)/view.scale,y:y/view.scale};
}

export function stationCSSPoint(view:ShortStation,point:Point):Point{
 return{x:view.ox+point.x*view.scale,y:point.y*view.scale};
}

export function shortSceneX(view:ShortStation,x:number):number{
 return stationWorldPoint(view,view.width*x/360,0).x;
}

export function shortLaneX(view:ShortStation,lane:string):number{
 const column=lane==='west'?.5:lane==='east'?5.5:3;
 return stationWorldPoint(view,62+column*(view.width-82)/6,0).x;
}

export function shortHeroPoint(view:ShortStation):Point{
 return stationWorldPoint(view,24,view.height-8);
}

export function shortExitPort(view:ShortStation,lane:string,index:number,count:number){
 const fraction=count<=1?.5:clamp(index,0,count-1)/(count-1);
 const point=stationWorldPoint(view,lane==='west'?-20:view.width+20,view.height*(.35+.45*fraction));
 return{...point,bendX:stationWorldPoint(view,lane==='west'?12:view.width-12,0).x};
}

export function shortEnemyPoint(view:ShortStation,lane:string,index:number,count:number,bodyHeightCSS:number,
 modelX:number,modelY:number,exit:string|undefined,spawnOrdinal:number,originalCount=count):Point{
 const columns=lane==='center'?3:2,column=(lane==='west'?0:lane==='east'?5:2)+index%columns;
 const rows=Math.max(3,Math.ceil(count/columns));
 const rowStep=Math.min(bodyHeightCSS+8,(view.height-12-bodyHeightCSS)/(rows-1));
 const drift=clamp(modelY*.02,0,4);
 const x=62+column*(view.width-82)/6;
 const y=bodyHeightCSS+4+Math.floor(index/columns)*rowStep+drift;
 const base=stationWorldPoint(view,x,y);
 if(!exit)return base;
 const home=(lane==='west'?75:lane==='east'?285:180)+(spawnOrdinal%3-1)*24;
 const travel=exit==='west'?clamp((home-modelX)/(home+48),0,1):clamp((modelX-home)/(408-home),0,1);
 const port=shortExitPort(view,exit,spawnOrdinal,originalCount);
 return{x:base.x+(port.x-base.x)*travel,y:base.y+(port.y-base.y)*travel};
}

/** Slot changes settle in simulation time; a paused screenshot cannot move bodies. */
export function settleStationPoint(previous:Point|undefined,next:Point,scale:number,dt:number):Point{
 if(!previous)return{...next};
 const distance=Math.hypot(next.x-previous.x,next.y-previous.y);
 const step=70*Math.max(0,Math.min(.1,dt))/scale;
 if(distance<=step)return{...next};
 if(step===0||distance===0)return{...previous};
 return{x:previous.x+(next.x-previous.x)*step/distance,y:previous.y+(next.y-previous.y)*step/distance};
}
