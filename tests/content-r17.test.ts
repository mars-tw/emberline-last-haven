import {it,expect} from 'vitest';
import {newCampaign,VERSION,assignCrew} from '../src/campaign';
import {parse} from '../src/storage';
import {dispatchView} from '../src/dispatch-view';
import {diversionExitPort} from '../src/art-layout';

it('exit ports keep four and nine threats on distinct stable vertical slots',()=>{
 const four=Array.from({length:4},(_,i)=>diversionExitPort(i,4));
 expect(four.map(p=>p.exitY)).toEqual([266,289,311,334]);
 expect(new Set(four.map(p=>p.exitY)).size).toBe(4);
 const nine=Array.from({length:9},(_,i)=>diversionExitPort(i,9));
 expect(nine.map(p=>p.exitY)).toEqual([266,275,283,292,300,309,317,326,334]);
 expect(new Set(nine.map(p=>p.exitY)).size).toBe(9);
 expect(diversionExitPort(0,1).exitY).toBe(300);
 expect(diversionExitPort(99,4).exitY).toBe(334);
});

it('applied roster status has no second disabled action and gives fatigue and swap different symbols',()=>{
 const preview=dispatchView(newCampaign()),applied=dispatchView(newCampaign(),null,true);
 expect(applied).toContain('data-state="applied"');
 expect(applied).toContain('本次交換已套用。');
 expect(preview).toContain('斜線表示增加，虛框表示減少');
 expect(preview).toContain('↔ 標記這次預覽');
 expect(preview).not.toContain('虛線＝將交換');
});

it('0.16.0 saves migrate to the current version without losing the saved campaign',()=>{
 const old=newCampaign();
 old.version='0.16.0';
 delete (old.crew as any).planConfirmed;
 old.screen='report';
 old.crew.fatigue=[3,0,2];
 old.progress.attracted=4;
 old.receipts=['segment:1'];
 const current=parse(JSON.stringify(old));
 expect(VERSION).toBe('0.18.4');
 expect(current).not.toBeNull();
 expect(current?.version).toBe(VERSION);
 expect(current?.screen).toBe('report');
 expect(current?.crew.fatigue).toEqual([3,0,2]);
 expect(current?.progress.attracted).toBe(4);
 expect(current?.receipts).toEqual(['segment:1']);
 expect(current?.crew.planConfirmed).toBe(false);
 const older=structuredClone(old);older.version='0.14.0';
 const migrated14=parse(JSON.stringify(older));
 expect(migrated14?.version).toBe(VERSION);
 expect(migrated14?.crew.planConfirmed).toBe(false);
 expect(migrated14?.crew.shield).toBe(0);
});

it('a changed roster is confirmed in saved UI state',()=>{
 const c=newCampaign();
 expect(c.crew.planConfirmed).toBe(false);
 expect(assignCrew(c,'watch',2)).toBe(true);
 expect(c.crew.planConfirmed).toBe(true);
});
