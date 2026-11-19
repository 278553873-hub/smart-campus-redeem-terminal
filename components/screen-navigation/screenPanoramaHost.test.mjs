import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { transform } from 'esbuild';

// 执行宿主组件的状态和事件逻辑，不启动浏览器。
const slots = [];
let cursor = 0, dirty = false, effects = [], tree;
const timers = new Map(), documentListeners = new Map(), windowListeners = new Map();
let timerId = 0;
const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
const useState = initial => {
  const i = cursor++;
  if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial;
  return [slots[i], next => { const value = typeof next === 'function' ? next(slots[i]) : next; if (!Object.is(value, slots[i])) { slots[i] = value; dirty = true; } }];
};
const useEffect = (fn, deps) => {
  const i = cursor++;
  if (!same(slots[i]?.deps, deps)) effects.push(() => { slots[i]?.cleanup?.(); slots[i] = { deps, cleanup: fn() }; });
};
const useCallback = (fn, deps) => {
  const i = cursor++;
  if (!same(slots[i]?.deps, deps)) slots[i] = { deps, fn };
  return slots[i].fn;
};
const React = { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) };
let mediaChange;
const media = { matches: false, addEventListener: (_, fn) => { mediaChange = fn; }, removeEventListener: () => {} };
const document = { hidden: false, addEventListener: (k, fn) => documentListeners.set(k, fn), removeEventListener: k => documentListeners.delete(k) };
let url = 'http://localhost/?app=data-screen&school=star';
const window = {
  location: { get href() { return url; }, get search() { return new URL(url).search; } },
  history: { state: null, replaceState: (_, __, next) => { url = String(next); } },
  matchMedia: () => media,
  setInterval: (fn, ms) => { const id = ++timerId; timers.set(id, { fn, ms }); return id; },
  clearInterval: id => timers.delete(id),
  addEventListener: (k, fn) => windowListeners.set(k, fn), removeEventListener: k => windowListeners.delete(k),
};
const navigationContext = { Provider: 'provider' };
const context = vm.createContext({ React, useState, useEffect, useCallback, SchoolPanorama: 'school', MoralPanorama: 'moral', PanoramaNavigationContext: navigationContext, document, window, URL, URLSearchParams });
const source = fs.readFileSync(new URL('./ScreenPanoramaHost.tsx', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replace('export const', 'const').replace('export default function', 'function');
vm.runInContext((await transform(source, { loader: 'tsx', jsx: 'transform' })).code + '\nglobalThis.renderHost = ScreenPanoramaHost;', context);
const render = () => {
  let attempts = 0;
  do {
    assert.ok(attempts++ < 20, '状态应稳定，不无限刷新');
    dirty = false; cursor = 0; effects = [];
    tree = context.renderHost({ initial: 'school' });
    effects.forEach(fn => fn());
  } while (dirty);
};
const layers = () => tree.props.children[0].props.children;
const isCurrent = i => layers()[i].props.className.includes('is-current');
const select = next => { tree.props.value(next); render(); };
render();
assert.ok(isCurrent(0));
assert.equal(timers.size, 0, '学校育人全景不创建自动切页计时器');
assert.equal(layers()[0].props.children[0].props.theme, 'dark');
assert.equal(layers()[1].props.children[0].props.theme, 'dark');
layers()[0].props.children[0].props.onThemeChange('light'); render();
assert.equal(layers()[0].props.children[0].props.theme, 'light');
assert.equal(layers()[1].props.children[0].props.theme, 'light', '学校页的太阳按钮同步切换德育页');
select('moral');
assert.ok(isCurrent(1));
assert.equal(layers()[1].props.children[0].props.theme, 'light', '切换页签保留整个驾驶舱的浅色模式');
layers()[1].props.children[0].props.onThemeChange('dark'); render();
assert.equal(layers()[0].props.children[0].props.theme, 'dark', '德育页的月亮按钮同步切换学校页');
assert.equal(layers()[1].props.children[0].props.theme, 'dark');
assert.equal(layers()[0].props.inert, true);
assert.equal(layers()[0].props.children[0].props.active, false, '隐藏页暂停内部动画');
assert.equal(layers()[1].props.children[0].type, 'moral', '不加载旧学生全景');
assert.equal(layers()[1].props.children[0].props.onCycleComplete, undefined, '德育页没有自动回切回调');
assert.ok(url.includes('app=moral-education-screen') && url.includes('school=star'), '切换只替换地址参数，不刷新页面');
assert.equal(timers.size, 0, '德育管理全景不自动切走');
tree.props.children[0].props.onFocusCapture({ target: { matches: () => true } }); render();
assert.ok(isCurrent(1), '聚焦不更换全景');
select('school'); assert.ok(isCurrent(0));
assert.equal(layers()[0].props.children[0].props.active, true, '手动切页清理上一页焦点暂停状态');
assert.equal(layers()[1].props.inert, true);
assert.equal(layers()[1].props['aria-hidden'], true);
assert.equal(timers.size, 0);
document.hidden = true; documentListeners.get('visibilitychange')(); render();
assert.equal(layers()[0].props.children[0].props.active, false, '后台暂停学校页内部动画');
assert.ok(isCurrent(0), '隐藏页面不改变手动选择');
document.hidden = false; documentListeners.get('visibilitychange')(); render();
assert.equal(layers()[0].props.children[0].props.active, true);
tree.props.children[0].props.onFocusCapture({ target: { matches: () => true } }); render();
assert.equal(layers()[0].props.children[0].props.active, false, '键盘操作时暂停学校页内部轮播');
tree.props.children[0].props.onBlurCapture({ currentTarget: { contains: () => false }, relatedTarget: null }); render();
assert.equal(layers()[0].props.children[0].props.active, true);
url = 'http://localhost/?app=student-growth-screen&school=star'; windowListeners.get('popstate')(); render();
assert.ok(isCurrent(1) && url.includes('app=moral-education-screen'), '旧学生地址兼容德育页');
url = 'http://localhost/?app=data-screen&school=star'; windowListeners.get('popstate')(); render();
assert.ok(isCurrent(0));
assert.equal(timers.size, 0, '所有路径均不恢复整页轮播');
for (const slot of slots) slot?.cleanup?.();
assert.equal(timers.size, 0, '卸载清理定时器');
assert.equal(documentListeners.size, 0);
assert.equal(windowListeners.size, 0);

// 同一个导航在宿主内拦截普通点击，同时保留新窗口和组合键的原生行为。
let selected;
const navContext = vm.createContext({ React, createContext: () => navigationContext, useContext: () => next => { selected = next; }, URLSearchParams, window });
const navSource = fs.readFileSync(new URL('./ScreenPanoramaNavigation.tsx', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replaceAll('export ', '');
vm.runInContext((await transform(navSource, { loader: 'tsx', jsx: 'transform' })).code + '\nglobalThis.renderNav = ScreenPanoramaNavigation;', navContext);
const nav = navContext.renderNav({ current: 'school' });
const moralLink = nav.props.children[0][1];
assert.equal(nav.props.children[0][0].props.children[0], '学校育人全景');
assert.equal(moralLink.props.children[0], '德育管理全景');
assert.ok(moralLink.props.href.includes('app=moral-education-screen') && moralLink.props.href.includes('school=star'));
let prevented = false;
moralLink.props.onClick({ button: 0, preventDefault: () => { prevented = true; } });
assert.equal(prevented, true); assert.equal(selected, 'moral');
prevented = false; selected = null;
moralLink.props.onClick({ button: 0, ctrlKey: true, preventDefault: () => { prevented = true; } });
assert.equal(prevented, false); assert.equal(selected, null);
console.log('全景切换检查通过：仅手动切页、新名称和地址、学生页替换、状态保留、隐藏/键盘暂停内部动画、旧地址兼容与组合键。');
