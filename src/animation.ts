/** Visual attack phases share the simulation's impact boundary. */
export function attackFrame(age:number,latched:boolean):number {
 const impact=latched?.2:.32;
 if(age<impact)return Math.min(1,Math.floor(Math.max(0,age)/impact*2));
 return age<impact+.06?2:3;
}
