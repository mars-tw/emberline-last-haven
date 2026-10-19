/** Visual attack phases share the simulation's impact boundary. */
export function attackFrame(age:number,latched:boolean):number {
 const impact=latched?.2:.32;
 if(age<impact)return Math.min(1,Math.floor(Math.max(0,age)/impact*2));
 return age<impact+.06?2:3;
}

/** Current projectile emits at cooldown reset; prepare during the preceding tail. */
export function gunnerFrame(remaining:number,interval:number):number {
 const phase=remaining/interval;
 return phase>.85?2:phase>.6?3:phase>0&&phase<.2?1:0;
}
