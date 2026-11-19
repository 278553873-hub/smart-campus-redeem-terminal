import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { transform } from 'esbuild';

let clock=0, cursor=0, effects=[];
const slots=[], timers=new Map(); let timerId=0;
let enabled=true, cycle=0, completed=0;
const same=(a,b)=>a&&a.length===b.length&&a.every((v,i)=>Object.is(v,b[i]));
const useRef=initial=>{const i=cursor++;return slots[i]??(slots[i]={current:initial});};
const useEffect=(fn,deps)=>{const i=cursor++;if(!same(slots[i]?.deps,deps)) effects.push(()=>{slots[i]?.cleanup?.();slots[i]={deps,cleanup:fn()};});};
const context=vm.createContext({useRef,useEffect,Math,Date:{now:()=>clock},window:{
  setTimeout:(fn,ms)=>{const id=++timerId;timers.set(id,{fn,due:clock+ms});return id;},clearTimeout:id=>timers.delete(id),
}});
const source=fs.readFileSync(new URL('./useStudentGrowthPlayback.ts',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replaceAll('export ', '');
vm.runInContext((await transform(source,{loader:'ts'})).code+'\nglobalThis.playback=useStudentGrowthPlayback;',context);
const complete=()=>{completed++;enabled=false;};
const render=(callback=complete)=>{cursor=0;effects=[];context.playback(enabled,cycle,callback);effects.forEach(fn=>fn());};
const advance=ms=>{const end=clock+ms;while(true){const next=[...timers.entries()].filter(([,t])=>t.due<=end).sort((a,b)=>a[1].due-b[1].due)[0];if(!next)break;clock=next[1].due;timers.delete(next[0]);next[1].fn();render();}clock=end;};
render();advance(10000);assert.equal(completed,0);
enabled=false;render();assert.equal(timers.size,0);
advance(600000);assert.equal(completed,0,'隐藏页不消耗停留时间');
enabled=true;render();advance(49999);assert.equal(completed,0);
advance(1);assert.equal(completed,1,'恢复后补足剩余50秒，整页累计停留60秒');
enabled=true;cycle++;render();advance(40000);assert.equal(completed,1);
cycle++;render();advance(59999);assert.equal(completed,1,'重新进入重置停留时间');
advance(1);assert.equal(completed,2,'无需内部翻页，满60秒通知宿主');
enabled=true;cycle++;render(null);assert.equal(timers.size,0,'独立展示且无宿主回调时不启动无效计时');
advance(120000);assert.equal(completed,2);
for(const slot of slots)slot?.cleanup?.();assert.equal(timers.size,0);
console.log('学生整页计时检查通过：60秒停留、暂停续计、重新进入复位、无内部翻页及定时器清理。');
