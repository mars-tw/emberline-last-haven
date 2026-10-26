import {it,expect} from 'vitest';
import {newCampaign,begin,VERSION} from '../src/campaign';
import {parse,load,KEY} from '../src/storage';
it('upgrades a valid R4 active save without losing supplies, actors, receipts or source text',()=>{
 const old=newCampaign();begin(old);old.version='0.5.0';old.supplies=37;old.progress.time=12;old.progress.flung=4;old.receipts=['segment:0'];old.archives={storm:{wave:7,money:90}};
 const raw=JSON.stringify(old),storage={getItem:(key:string)=>key===KEY?raw:null,setItem:()=>{throw Error('read must not write');}};
 const r=load(storage);expect(r.found).toBe(true);expect(r.campaign).toEqual({...old,version:VERSION});expect(JSON.parse(raw).version).toBe('0.5.0');expect(parse(raw)?.progress.flung).toBe(4);
});
it('keeps validation strict for malformed old saves and unknown future versions',()=>{
 const old:any=newCampaign();old.version='0.5.0';old.progress.warning='bad';expect(parse(JSON.stringify(old))).toBeNull();
 const future=newCampaign();future.version='99.0.0';expect(parse(JSON.stringify(future))).toBeNull();
});
