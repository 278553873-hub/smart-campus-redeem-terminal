import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

// 分开推进“布局完成”和“首次绘制”，验证真实组件不会先画出旧设备的缩放比例。
const bundle = await build({
  entryPoints: ['components/PhoneMockup.tsx'],
  bundle: true, platform: 'node', format: 'esm', jsx: 'transform', write: false, logLevel: 'silent',
  tsconfigRaw: { compilerOptions: { jsx: 'react' } },
  plugins: [{ name: 'preview-layout-runtime', setup(build) {
    build.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'preview-layout' }));
    build.onLoad({ filter: /.*/, namespace: 'preview-layout' }, () => ({ contents:
      ['useState', 'useRef', 'useLayoutEffect', 'useEffect'].map(name => `export const ${name} = (...args) => globalThis.previewLayoutRuntime.${name}(...args);`).join('\n')
      + '\nexport default { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) };',
    }));
    build.onResolve({ filter: /SimulatedMiniProgramChrome$/ }, () => ({ path: 'chrome', namespace: 'preview-chrome' }));
    build.onLoad({ filter: /.*/, namespace: 'preview-chrome' }, () => ({ contents: 'export default () => null;' }));
  } }],
});
const directory = await mkdtemp(join(tmpdir(), 'phone-preview-layout-'));
let PhoneMockup;
try {
  const file = join(directory, 'component.mjs');
  await writeFile(file, bundle.outputFiles[0].text);
  ({ default: PhoneMockup } = await import(pathToFileURL(file).href));
} finally {
  await rm(directory, { recursive: true, force: true });
}

const slots = [];
const layouts = [];
const effects = [];
const observers = new Set();
const container = {
  clientWidth: 1368, clientHeight: 868,
  getBoundingClientRect() { return { left: 16, top: 16, width: this.clientWidth, height: this.clientHeight }; },
};
let cursor = 0;
let dirty = false;
let bounds;
let props = { deviceType: 'phone', onDeviceBoundsChange: value => { bounds = value; }, children: '当前页面内容' };

const registerEffect = queue => (effect, dependencies) => {
  const index = cursor++;
  const previous = slots[index];
  if (!previous || dependencies.some((value, i) => !Object.is(value, previous.dependencies[i]))) {
    const slot = { dependencies, cleanup: previous?.cleanup };
    slots[index] = slot;
    queue.push(() => { slot.cleanup?.(); slot.cleanup = effect(); });
  }
};
globalThis.previewLayoutRuntime = {
  useState(initial) {
    const index = cursor++;
    const slot = slots[index] ??= { value: initial };
    return [slot.value, next => {
      const value = typeof next === 'function' ? next(slot.value) : next;
      if (!Object.is(value, slot.value)) { slot.value = value; dirty = true; }
    }];
  },
  useRef(initial) { return slots[cursor++] ??= { current: initial }; },
  useLayoutEffect: registerEffect(layouts),
  useEffect: registerEffect(effects),
};
globalThis.ResizeObserver = class {
  constructor(callback) { this.callback = callback; }
  observe() { observers.add(this); }
  disconnect() { observers.delete(this); }
};

function nodes(node) {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(nodes);
  return [node, ...nodes(node.props?.children)];
}

function paint(deviceType) {
  props = { ...props, deviceType };
  let tree;
  let commits = 0;
  do {
    assert.ok(++commits < 10, '布局更新必须收敛，不能形成循环');
    dirty = false;
    cursor = 0;
    tree = PhoneMockup(props);
    for (const node of nodes(tree)) if (node.props?.ref) node.props.ref.current = container;
    while (layouts.length) layouts.shift()();
  } while (dirty);

  const device = nodes(tree).find(node => node.props?.style?.transform?.startsWith('scale('));
  const frame = {
    scale: Number(device.props.style.transform.slice(6, -1)),
    width: Number.parseFloat(device.props.style.width),
    height: Number.parseFloat(device.props.style.height),
    bounds,
  };
  // 普通 effect 在首次绘制后才执行，不能用它修正已经闪过的画面。
  while (effects.length) effects.shift()();
  return frame;
}

function checkFirstPaint(deviceType) {
  const frame = paint(deviceType);
  const expectedHeight = container.clientHeight - 40;
  assert.ok(Math.abs(frame.height * frame.scale - expectedHeight) < 0.001, '第一帧就应适合容器高度，不能沿用上个设备的比例');
  const bezel = deviceType === 'tablet' ? 20 : 8;
  assert.ok(frame.bounds, '首次绘制前就应提供机身位置，不能延迟两帧定位控件');
  assert.ok(Math.abs(frame.bounds.right - (16 + container.clientWidth / 2 + (frame.width / 2 + bezel) * frame.scale)) < 0.001, '控件收到的右边界必须与首帧机身一致');
  assert.ok(Math.abs(frame.bounds.top - (16 + container.clientHeight / 2 - (frame.height / 2 + bezel) * frame.scale)) < 0.001, '控件收到的顶部必须与首帧机身一致');
}

for (let round = 0; round < 4; round++) {
  container.clientWidth = 1368;
  checkFirstPaint('phone');
  container.clientWidth = 1064;
  checkFirstPaint('tablet');
}
container.clientWidth = 880;
container.clientHeight = 650;
for (const observer of observers) observer.callback();
checkFirstPaint('tablet');
for (const slot of slots) slot?.cleanup?.();
delete globalThis.previewLayoutRuntime;
delete globalThis.ResizeObserver;
console.log('手机与平板连续切换及窗口缩放的首帧布局检查通过。');
