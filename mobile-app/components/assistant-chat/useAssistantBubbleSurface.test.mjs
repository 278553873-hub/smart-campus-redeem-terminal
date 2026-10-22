import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { transform } from 'esbuild';

const source = fs.readFileSync(new URL('./useAssistantBubbleSurface.ts', import.meta.url), 'utf8')
    .replace(/import .* from 'react';/, '').replace('export function', 'function');
const { code } = await transform(source, { loader: 'ts', target: 'es2022' });

function mount() {
    const layout = { width: 57, height: 44, paragraphHeights: [] };
    const parent = { clientWidth: 320 };
    const frames = new Map();
    const motionListeners = new Map();
    let refIndex = 0;
    let time = 0;
    let nextFrame = 0;
    let cleanup;
    let commit;
    let reduced = false;
    const bubble = {
        dataset: {}, style: {}, parentElement: parent,
        getBoundingClientRect: () => ({
            height: layout.height,
            width: bubble.dataset.measuring ? layout.width
                : bubble.dataset.widthLocked ? parent.clientWidth : parseFloat(bubble.style.width) || layout.width,
        }),
        querySelectorAll: () => layout.paragraphHeights.map(height => ({ getBoundingClientRect: () => ({ height }) })),
    };
    const context = vm.createContext({
        useRef: initial => ({ current: refIndex++ ? initial : bubble }),
        useLayoutEffect: (effect, deps) => { if (deps) cleanup = effect(); else commit = effect; },
        window: { matchMedia: () => ({
            get matches() { return reduced; },
            addEventListener: (name, fn) => motionListeners.set(name, fn),
            removeEventListener: name => motionListeners.delete(name),
        }) },
        ResizeObserver: class { observe() {} disconnect() {} },
        getComputedStyle: () => ({ lineHeight: '24px', getPropertyValue: () => '200ms' }),
        requestAnimationFrame: fn => { const id = ++nextFrame; frames.set(id, fn); return id; },
        cancelAnimationFrame: id => frames.delete(id),
    });
    const tick = () => {
        time += 16;
        const pending = [...frames.values()]; frames.clear();
        pending.forEach(fn => fn(time));
    };
    vm.runInContext(code + '\nuseAssistantBubbleSurface();', context);
    commit();
    return {
        layout, parent, bubble, frames, tick, commit,
        get frameCount() { return nextFrame; },
        finish: () => { for (let i = 0; i < 100 && frames.size; i++) tick(); },
        reduce: () => { reduced = true; motionListeners.get('change')(); },
        cleanup: () => { cleanup(); assert.equal(frames.size, 0); assert.equal(motionListeners.size, 0); },
    };
}

const single = mount();
assert.equal(single.bubble.style.width, '57px', '三点状态保持紧凑');
single.layout.width = 150; single.layout.paragraphHeights = [24]; single.commit();
for (let i = 0; i < 4; i++) single.tick();
const before = parseFloat(single.bubble.style.width);
const frameCount = single.frameCount;
single.layout.width = 200; single.commit();
assert.equal(single.frameCount, frameCount, '连续文字不重启动画');
assert.equal(parseFloat(single.bubble.style.width), before, '单行宽度不瞬移');
single.tick(); assert.ok(parseFloat(single.bubble.style.width) > before);
single.finish(); assert.equal(single.bubble.style.width, '200px');
single.reduce(); single.layout.width = 240; single.commit();
assert.equal(single.bubble.style.width, '240px', '减少动态效果直接到位');
single.cleanup();

// 回归：正文已经换行，但外框宽度仍未达到320，旧实现不会锁宽。
const wrapped = mount();
wrapped.layout.width = 280; wrapped.layout.paragraphHeights = [48]; wrapped.layout.height = 76;
wrapped.commit();
assert.equal(wrapped.bubble.dataset.widthLocked, 'true', '第二行出现即锁满宽，不等待外框先到上限');
assert.equal(wrapped.bubble.getBoundingClientRect().width, 320, '同一次提交立即到最大宽度');
assert.equal(wrapped.frames.size, 0, '换行满宽不等待背景追赶');
assert.equal(wrapped.bubble.style.height, undefined, '正文始终自然撑高');
wrapped.parent.clientWidth = 280;
assert.equal(wrapped.bubble.getBoundingClientRect().width, 280, '满宽随屏幕宽度适配');
wrapped.cleanup();

// 截图回归：短首段“本周当前得分95.5分，年级第2名。”后出现“具体来看”。
const paragraphs = mount();
paragraphs.layout.width = 280; paragraphs.layout.paragraphHeights = [24]; paragraphs.commit();
assert.equal(paragraphs.bubble.dataset.widthLocked, undefined, '短单行可继续按文字增长');
paragraphs.layout.paragraphHeights = [24, 24]; paragraphs.layout.height = 88; paragraphs.commit();
assert.equal(paragraphs.bubble.dataset.widthLocked, 'true', '第二自然段出现也必须立即满宽');
assert.equal(paragraphs.bubble.style.width, '', '满宽交给容器，不保留动画中的窄像素值');
paragraphs.layout.width = 200; paragraphs.layout.paragraphHeights = [24, 96, 96]; paragraphs.commit();
assert.equal(paragraphs.bubble.getBoundingClientRect().width, 320, '后续多段与光标移除不收窄');
paragraphs.cleanup();
console.log('助理气泡第二行、短首段与连续宽度跟随检查通过');
