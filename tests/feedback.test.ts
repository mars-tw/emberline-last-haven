import {it,expect} from 'vitest';
import {newCampaign,begin,finish} from '../src/campaign';
import {countdown,reportSummary,controlKey} from '../src/feedback';
it('keeps convoy overtime numeric and defense group progress free of a second countdown',()=>{
 const c=newCampaign();begin(c);c.progress.time=49;const before=structuredClone(c);
 expect(countdown(c)).toBe('加程 29 秒 · 甩落 0/2');expect(c).toEqual(before);
 c.segment=1;c.progress.started=true;c.progress.time=41;expect(countdown(c)).toBe('已引離 0／2 群');
 c.progress.time=61;expect(countdown(c)).toBe('已引離 0／2 群');
});
it('separates the untimed bait decision from combat and displays earned rewards',()=>{
 const c=newCampaign();begin(c);c.segment=1;expect(countdown(c)).toBe('選落點後開始');finish(c);
 expect(countdown(c)).toContain(`補給 +${c.reward}`);expect(reportSummary(c)).toContain('共引離 0 隻');
});
it('shows rescued people and guard power in the report while retaining full journal',()=>{
 const c=newCampaign();begin(c);c.progress.flung=4;finish(c);expect(reportSummary(c)).toContain('救回 4 人');expect(reportSummary(c)).toContain('守衛火力 3');expect(c.lastReport).toContain('搶修');
});
it('keeps a held steering control stable across logs, spawns and cooldowns',()=>{
 const c=newCampaign();begin(c);const key=controlKey(c);c.log.push('hit');c.progress.serial++;c.progress.cooldown=8;expect(controlKey(c)).toBe(key);
 c.screen='report';expect(controlKey(c)).not.toBe(key);
});
