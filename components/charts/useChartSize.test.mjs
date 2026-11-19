import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { transform } from 'esbuild';

// 不启动浏览器，核对图表延迟挂载、尺寸变化、隐藏恢复及观察器清理。
const slots = [], observers = new Set();
let cursor = 0, dirty = false, effects = [], state;
const same = (a, b) => a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
const useState = initial => {
  const index = cursor++;
  if (!(index in slots)) slots[index] = initial;
  return [slots[index], next => {
    const value = typeof next === 'function' ? next(slots[index]) : next;
    if (!Object.is(value, slots[index])) { slots[index] = value; dirty = true; }
  }];
};
const useCallback = (callback, deps) => {
  const index = cursor++;
  if (!same(slots[index]?.deps, deps)) slots[index] = { deps, callback };
  return slots[index].callback;
};
const useEffect = (run, deps) => {
  const index = cursor++;
  if (!same(slots[index]?.deps, deps)) effects.push(() => { slots[index]?.cleanup?.(); slots[index] = { deps, cleanup: run() }; });
};
class ResizeObserver {
  constructor(callback) { this.callback = callback; }
  observe(element) { this.element = element; observers.add(this); }
  disconnect() { observers.delete(this); }
}
const context = vm.createContext({ useState, useCallback, useEffect, ResizeObserver });
const source = fs.readFileSync(new URL('./useChartSize.ts', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replaceAll('export ', '');
vm.runInContext((await transform(source, { loader: 'ts' })).code + '\nglobalThis.chartSize=useChartSize;', context);
const render = () => {
  do { dirty = false; cursor = 0; effects = []; state = context.chartSize({ width: 470, height: 238 }); effects.forEach(run => run()); } while (dirty);
};
render();
assert.equal(state.width, 470); assert.equal(state.height, 238); assert.equal(observers.size, 0);
const ref = state.ref;
ref({ clientWidth: 391, clientHeight: 216 }); render();
assert.equal(state.ref, ref, '观察器更新不替换挂载回调');
assert.equal(state.width, 391); assert.equal(state.height, 216); assert.equal(observers.size, 1);
const observer = [...observers][0];
observer.callback([{ contentRect: { width: 355.5, height: 210 } }]); render();
assert.equal(state.width, 355.5); assert.equal(state.height, 210, '绘图区采用真实布局尺寸，字号不用随SVG缩小');
observer.callback([{ contentRect: { width: 0, height: 0 } }]); render();
assert.equal(state.width, 355.5); assert.equal(state.height, 210, '隐藏状态不把坐标系压成零');
ref(null); render(); assert.equal(observers.size, 0, '空数据或卸载节点后清理观察器');
ref({ clientWidth: 420, clientHeight: 220 }); render();
assert.equal(state.width, 420); assert.equal(observers.size, 1, '重新出现图表后继续测量');
for (const slot of slots) slot?.cleanup?.();
assert.equal(observers.size, 0);
console.log('图表尺寸检查通过：延迟挂载、真实尺寸、隐藏恢复及卸载清理。');
