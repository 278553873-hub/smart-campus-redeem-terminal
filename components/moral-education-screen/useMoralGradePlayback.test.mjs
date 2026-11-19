import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { transform } from 'esbuild';

// 执行真实轮播Hook，以虚拟定时器覆盖暂停和清理，不启动浏览器。
const slots = [], timers = new Map();
let cursor = 0, dirty = false, effects = [], nextId = 0, state;
const same = (a,b) => a && b && a.length === b.length && a.every((value,index)=>Object.is(value,b[index]));
const useState = initial => {
  const index=cursor++;
  if (!(index in slots)) slots[index]=initial;
  return [slots[index],next=>{ const value=typeof next==='function'?next(slots[index]):next; if(!Object.is(value,slots[index])) { slots[index]=value; dirty=true; } }];
};
const useEffect = (run,deps) => {
  const index=cursor++;
  if(!same(slots[index]?.deps,deps)) effects.push(()=>{ slots[index]?.cleanup?.(); slots[index]={deps,cleanup:run()}; });
};
const window = {setInterval:(run,interval)=>{ const id=++nextId; timers.set(id,{run,interval}); return id; },clearInterval:id=>timers.delete(id)};
const context=vm.createContext({useState,useEffect,window});
const source=fs.readFileSync(new URL('./useMoralGradePlayback.ts',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replaceAll('export ','');
vm.runInContext((await transform(source,{loader:'ts'})).code+'\nglobalThis.playback=useMoralGradePlayback;',context);
let pageCount=2,active=true;
const render=()=>{ do { dirty=false;cursor=0;effects=[];state=context.playback(pageCount,active);effects.forEach(run=>run()); } while(dirty); };
const tick=()=>{ assert.equal(timers.size,1); const timer=[...timers.values()][0]; assert.equal(timer.interval,30000);timer.run();render(); };
render(); assert.equal(state.pages,2);assert.equal(state.page,0);
tick();assert.equal(state.page,1);tick();assert.equal(state.page,0,'自动循环展示所有年级，不需要操作');
assert.deepEqual(Object.keys(state).sort(),['page','pages'],'只提供自动播放状态，不保留手动暂停等无用交互状态');
active=false;render();assert.equal(timers.size,0,'切换全景或浏览器隐藏时暂停');active=true;render();
assert.equal(timers.size,1,'返回后自动继续，无需播放键');
pageCount=4;render();assert.equal(state.pages,4);const startPage=state.page;for(let index=1;index<=4;index++){tick();assert.equal(state.page,(startPage+index)%4,'完整名册页面自动循环');}
pageCount=1;render();assert.equal(state.pages,1);assert.equal(state.page,0);assert.equal(timers.size,0);
pageCount=0;render();assert.equal(timers.size,0);assert.equal(state.page,0);
for(const slot of slots) slot?.cleanup?.();
assert.equal(timers.size,0,'卸载清理所有计时器');
console.log('年级榜轮播检查通过：30秒自动循环、无操作控制状态、离开或隐藏暂停、返回自动继续、单屏不设定时器及卸载清理。');
