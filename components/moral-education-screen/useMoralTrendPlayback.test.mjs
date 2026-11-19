import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { transform } from 'esbuild';

// 用虚拟时钟执行真实Hook，验证无人值守切换及离开页面后的计时器清理。
const slots = [], timers = new Map();
let cursor = 0, dirty = false, effects = [], nextId = 0, state;
const same = (a,b) => a && b && a.length === b.length && a.every((value,index)=>Object.is(value,b[index]));
const useState = initial => {
  const index=cursor++;
  if (!(index in slots)) slots[index]=initial;
  return [slots[index],next=>{ const value=typeof next==='function'?next(slots[index]):next; if(!Object.is(value,slots[index])) {slots[index]=value;dirty=true;} }];
};
const useEffect = (run,deps) => {
  const index=cursor++;
  if(!same(slots[index]?.deps,deps)) effects.push(()=>{ slots[index]?.cleanup?.();slots[index]={deps,cleanup:run()}; });
};
const window = {setInterval:(run,interval)=>{const id=++nextId;timers.set(id,{run,interval});return id;},clearInterval:id=>timers.delete(id)};
const context=vm.createContext({useState,useEffect,window});
const source=fs.readFileSync(new URL('./useMoralTrendPlayback.ts',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replaceAll('export ','');
vm.runInContext((await transform(source,{loader:'ts'})).code+'\nglobalThis.playback=useMoralTrendPlayback;',context);
let active=true;
const render=()=>{do {dirty=false;cursor=0;effects=[];state=context.playback(active);effects.forEach(run=>run());} while(dirty);};
const tick=()=>{assert.equal(timers.size,1);const timer=[...timers.values()][0];assert.equal(timer.interval,10000);timer.run();render();};
render();assert.equal(state.metric,'averageScore');
tick();assert.equal(state.metric,'deduction');tick();assert.equal(state.metric,'averageScore');
active=false;render();assert.equal(timers.size,0,'离开全景、隐藏浏览器或空数据时停止轮播');
active=true;render();assert.equal(timers.size,1,'返回后自动继续');
state.setMetric('deduction');render();assert.equal(state.metric,'deduction');assert.equal(timers.size,1,'手动选择标签后仍保持单一定时器');
tick();assert.equal(state.metric,'averageScore','继续自动切换');
for(const slot of slots) slot?.cleanup?.();
assert.equal(timers.size,0,'卸载清理计时器');
console.log('德育趋势轮播检查通过：两标签每10秒循环、离开或隐藏暂停、返回继续、手动切换及卸载清理。');
