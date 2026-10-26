import {modeFor,note,type Campaign} from './campaign';
export const RADIO_SIGNALS=[
 {name:'阿岑',code:'短・長・短',west:'長・短・短',east:'短・長・短',answer:'east',line:'阿岑：「我一個人在東側月台等車。現在上車了，兩份補給也帶上了。」'},
 {name:'林叔',code:'長・短・長',west:'長・短・長',east:'短・長・長',answer:'west',line:'林叔：「西側工作燈是我留的。我一個人上車，帶了兩份備用糧。」'},
 {name:'以寧',code:'短・短・長',west:'短・長・短',east:'短・短・長',answer:'east',line:'以寧：「我一個人守著東側的燈。人和兩份補給都上車了，可以走了。」'}
] as const;
export type RadioGroup='call'|'west'|'east';
export const RADIO_SHORT_MS=240,RADIO_LONG_MS=720,RADIO_GAP_MS=180;
/** The UI uses this same timeline for visible lamps and audible carrier tones. */
export function radioTimeline(code:string){let at=0;return code.split('・').map((beat,i)=>{const duration=beat==='長'?RADIO_LONG_MS:RADIO_SHORT_MS;const frame={beat,index:i,start:at,duration};at+=duration+RADIO_GAP_MS;return frame;});}
export type RadioLog={heard:string[];choice:'west'|'east'|null;done:boolean;attempts:number};
export const radioLog=(c:Campaign):RadioLog=>c.radio[String(Math.floor(c.segment/3))]??{heard:[],choice:null,done:false,attempts:0};
export function radioAction(c:Campaign,action:'west'|'east'|'call'|'send-west'|'send-east'){
 if(c.screen!=='play'||modeFor(c.segment)!=='defense'||c.progress.started)return false;
 const key=String(Math.floor(c.segment/3)),r=c.radio[key]??={heard:[],choice:null,done:false,attempts:0};if(r.done)return false;
 if(!action.startsWith('send-')){if(!r.heard.includes(action))r.heard.push(action);return true;}
 if(r.heard.length<3)return false;
 const chosen=action==='send-west'?'west':'east',signal=RADIO_SIGNALS[Number(key)];r.choice=chosen;r.attempts++;
 if(chosen!==signal.answer){note(c,'燈號不符，尚未派車。重新比對求援口令與兩側燈號，不消耗補給。');return true;}
 r.done=true;c.people++;c.supplies+=2;note(c,`${signal.line} ${chosen==='west'?'西側':'東側'}接應成功：同行 +1、補給 +2。本站電台已封存。`);return true;
}
export function radioView(c:Campaign){
 const r=radioLog(c),s=RADIO_SIGNALS[Math.floor(c.segment/3)],ready=r.heard.length===3,code=s.code.split('・');
 const mismatch=r.choice?s[r.choice].split('・').flatMap((beat,i)=>beat!==code[i]?[i+1]:[]):[];
 const missing=(['call','west','east'] as const).filter(k=>!r.heard.includes(k)).map(k=>({call:'求援',west:'西側',east:'東側'}[k]));
 return `<img class="radio-art" src="/art/content-r10/radio.webp" alt="手搖電台、雙向月台與海霧鐵道"><p>接收三組節奏，找出與求援相同的一側。短亮0.24秒，長亮0.72秒；可免費重播。</p><div class="radio-stations">${(['call','west','east'] as const).map((k,i)=>{const heard=r.heard.includes(k),beats=s[k==='call'?'code':k].split('・');return `<section data-radio-group="${k}"><button id="radio-${k}" aria-pressed="${heard}">${heard?'重播':'接收'}${['求援','西側','東側'][i]}</button><p>${k==='call'?s.name+'的口令':k==='west'?'西側燈號':'東側燈號'}</p><div class="rhythm" aria-label="${heard?beats.join('・'):'尚未接收'}">${beats.map((beat,n)=>`<span data-beat="${n+1}" data-mismatch="${Boolean(r.choice)&&ready&&k===r.choice&&beat!==code[n]}"><b>${heard?beat:'？'}</b><small>第${n+1}拍</small></span>`).join('')}</div></section>`;}).join('')}</div><p id="radio-playback" role="status">${missing.length?'尚缺：'+missing.join('、'):'三組已接收。比對三拍後再派車。'}</p><p id="radio-feedback" role="status">${r.done?`${s.line} 接回 1 人、補給 +2，接應成功；目前同行 ${c.people} 人／補給 ${c.supplies}。已保存，不能重領。`:r.choice?`這側燈號不符：第 ${mismatch.join('、')} 拍與口令不同。不派車、不扣款；目前同行 ${c.people} 人／補給 ${c.supplies}。`:'尚未派車。選錯可重新比對，不消耗補給。'}</p><div class="radio-send">${(['west','east'] as const).map(k=>`<button id="radio-send-${k}" ${r.done||!ready?'disabled':''}>${!ready?'缺'+missing.join('／')+'・':''}接應${k==='west'?'西':'東'}側</button>`).join('')}</div>`;
}
