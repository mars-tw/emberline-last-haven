import {it,expect} from 'vitest';
import {attackFrame} from '../src/animation';
import {newCampaign,begin,tick} from '../src/campaign';
it.each([true,false])('keeps anticipation, impact and recovery aligned for latched=%s',latched=>{const impact=latched?.2:.32;expect(attackFrame(0,latched)).toBe(0);expect(attackFrame(impact-.001,latched)).toBe(1);expect(attackFrame(impact,latched)).toBe(2);expect(attackFrame(impact+.059,latched)).toBe(2);expect(attackFrame(impact+.061,latched)).toBe(3);});
it('actual bite and impact artwork begin together',()=>{const c=newCampaign();begin(c);c.progress.spawn=99;c.progress.enemies=[{id:0,x:180,y:350,hp:3,state:'attack',age:.15,slot:0,type:'runner',hit:false,attracted:false}];expect(attackFrame(c.progress.enemies[0].age,true)).toBe(1);tick(c,.05);expect(c.hull).toBe(98);expect(attackFrame(c.progress.enemies[0].age,true)).toBe(2);});
