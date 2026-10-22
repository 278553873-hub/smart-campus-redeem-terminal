import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { transform } from 'esbuild';

// 用可控帧时钟模拟真实滚动输入，不启动浏览器。
const source = fs.readFileSync(new URL('./useAssistantScrollFollow.ts', import.meta.url), 'utf8')
    .replace(/import .* from 'react';/, '')
    .replace('export function', 'function');
const { code } = await transform(source, { loader: 'ts', target: 'es2022' });
const listeners = new Map();
const frames = new Map();
let nextFrame = 1;
let cleanup;
let resize;
let reduced = false;
const scroller = {
    scrollTop: 0, scrollHeight: 1000, clientHeight: 400, children: [],
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: name => listeners.delete(name),
};
const context = vm.createContext({
    useRef: current => ({ current }), useCallback: fn => fn,
    useEffect: fn => { cleanup = fn(); },
    window: { matchMedia: () => ({ get matches() { return reduced; } }) },
    requestAnimationFrame: fn => { const id = nextFrame++; frames.set(id, fn); return id; },
    cancelAnimationFrame: id => frames.delete(id),
    ResizeObserver: class { constructor(callback) { resize = callback; } observe() {} disconnect() {} },
    MutationObserver: class { observe() {} disconnect() {} },
    scrollRef: { current: scroller },
});
vm.runInContext(code + '\nvar resume = useAssistantScrollFollow(scrollRef);', context);
let time = 0;
const tick = () => {
    time += 16;
    const pending = [...frames.values()]; frames.clear();
    pending.forEach(fn => fn(time));
    listeners.get('scroll')?.();
};
for (let i = 0; i < 60; i++) tick();
assert.equal(scroller.scrollTop, 600, '初次发问后跟随到底部');
scroller.scrollHeight += 200; resize(); tick();
assert.ok(scroller.scrollTop > 600 && scroller.scrollTop < 800, '内容长高时平滑跟随');
listeners.get('wheel')({ deltaY: -10 });
scroller.scrollTop = 500; listeners.get('scroll')();
scroller.scrollHeight += 100; resize();
for (let i = 0; i < 60; i++) tick();
assert.equal(scroller.scrollTop, 500, '上滑后新增文字不得抢回位置');
scroller.scrollTop = 895; listeners.get('scroll')();
for (let i = 0; i < 60; i++) tick();
assert.equal(scroller.scrollTop, 900, '回到底部恢复跟随');
listeners.get('touchstart')({ touches: [{ clientY: 100 }] });
listeners.get('touchmove')({ touches: [{ clientY: 120 }] });
scroller.scrollTop = 700; listeners.get('scroll')();
scroller.scrollHeight += 100; resize(); tick();
assert.equal(scroller.scrollTop, 700, '手指向下拖动查看上方记录时停止跟随');
context.resume();
for (let i = 0; i < 60; i++) tick();
assert.equal(scroller.scrollTop, 1000, '主动发送可恢复跟随');
reduced = true;
scroller.scrollHeight += 100; resize(); tick();
assert.equal(scroller.scrollTop, 1100, '减少动态效果模式直接到位');
cleanup();
assert.equal(frames.size, 0);
assert.equal(listeners.size, 0);
console.log('助理滚动跟随检查通过');
