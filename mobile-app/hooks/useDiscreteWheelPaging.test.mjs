import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { transform } from 'esbuild';

const source = fs.readFileSync(new URL('./useDiscreteWheelPaging.ts', import.meta.url), 'utf8')
  .replace(/import .* from 'react';/, '')
  .replace('export function', 'function');
const { code } = await transform(source, { loader: 'ts', target: 'es2022' });
const steps = [];
let listener;
let cleanup;
const target = {
  getBoundingClientRect: () => ({ width: 300 }),
  addEventListener(name, handler, options) {
    assert.equal(name, 'wheel');
    assert.equal(options.passive, false, '横向滚动必须可以阻止默认行为');
    listener = handler;
  },
  removeEventListener(name, handler) {
    assert.equal(name, 'wheel');
    assert.equal(handler, listener);
    listener = undefined;
  },
};
const context = vm.createContext({
  useEffect: effect => { cleanup = effect(); },
  targetRef: { current: target },
  onStep: direction => steps.push(direction),
});
vm.runInContext(code + '\nuseDiscreteWheelPaging(targetRef, onStep);', context);

let time = 0;
const wheel = (values = {}) => {
  let prevented = false;
  listener({
    timeStamp: time += 16,
    deltaX: 0, deltaY: 0, deltaMode: 0, ctrlKey: false, shiftKey: false, cancelable: true,
    preventDefault() { prevented = true; },
    ...values,
  });
  return prevented;
};
const newGesture = () => { time += 200; };

assert.equal(wheel({ deltaY: 120 }), false, '纵向手势继续滚动页面');
assert.equal(wheel({ deltaX: 12, deltaY: 48 }), false, '以纵向为主的斜向滚动不翻页');
assert.equal(wheel({ deltaX: 12 }), true);
assert.deepEqual(steps, [], '小幅横向滚动累计不足阈值时不翻页');
wheel({ deltaX: 18 });
assert.deepEqual(steps, [1], '300像素区域轻滑累计30像素即可翻页');
wheel({ deltaX: 140 });
wheel({ deltaX: -5 });
assert.deepEqual(steps, [1], '同一手势的惯性及回弹不得再次翻页');
wheel({ deltaX: 10 });
wheel({ deltaX: -12 });
wheel({ deltaX: -18 });
assert.deepEqual(steps, [1, -1], '反向轻滑达到阈值即可立即切回，不必等惯性停止');
wheel({ deltaX: -140 });
wheel({ deltaX: 5 });
wheel({ deltaX: -10 });
assert.deepEqual(steps, [1, -1], '反向切回后同方向惯性及轻微抖动不再翻页');
wheel({ deltaX: 12 });
wheel({ deltaX: 18 });
assert.deepEqual(steps, [1, -1, 1], '可连续往返切换，不需要等待固定冷却时间');
newGesture();
wheel({ deltaX: -30 });
assert.deepEqual(steps, [1, -1, 1, -1], '停顿后的新手势也保持正常');

newGesture();
assert.equal(wheel({ deltaX: 100, ctrlKey: true }), false, '不拦截触摸板双指缩放');
assert.deepEqual(steps, [1, -1, 1, -1]);
wheel({ deltaY: 60, shiftKey: true });
assert.deepEqual(steps, [1, -1, 1, -1, 1], '兼容 Shift 加滚轮的横向输入');
newGesture();
wheel({ deltaX: -4, deltaMode: 1 });
assert.deepEqual(steps, [1, -1, 1, -1, 1, -1], '兼容按行报告的滚动设备');
newGesture();
wheel({ deltaX: 1, deltaMode: 2 });
assert.deepEqual(steps, [1, -1, 1, -1, 1, -1, 1], '兼容按页报告的滚动设备');
cleanup();
assert.equal(listener, undefined, '离开页面后移除滚动监听');
console.log('触摸板整页切换检查通过');
