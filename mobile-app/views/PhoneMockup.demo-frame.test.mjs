import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const phoneMockupSource = readFileSync(
  new URL('../../components/PhoneMockup.tsx', import.meta.url),
  'utf8',
);
const teacherAppSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

assert.doesNotMatch(
  phoneMockupSource,
  /fillContainerWhenFrameless/,
  '无实体机身时也不能铺满桌面演示容器。',
);
assert.match(phoneMockupSource, /const screenWidth = 393;/, '手机演示宽度应固定为 393px。');
assert.match(phoneMockupSource, /const screenHeight = 852;/, '手机演示高度应固定为 852px。');
assert.match(phoneMockupSource, /const simulatedStatusBarHeightValue = 54;/, '演示状态栏高度应为 54 像素。');
assert.match(phoneMockupSource, /const simulatedCapsuleTop = 60;/, '演示微信胶囊上边界应为 60 像素。');
assert.match(phoneMockupSource, /const simulatedCapsuleHeight = 32;/, '演示微信胶囊高度应为 32 像素。');
assert.match(
  phoneMockupSource,
  /const simulatedTitleBarHeight = \(simulatedCapsuleTop - simulatedStatusBarHeightValue\) \* 2 \+ simulatedCapsuleHeight;/,
  '微信标题栏高度应由状态栏与胶囊真实几何关系计算。',
);
assert.match(
  phoneMockupSource,
  /'--mini-program-title-bar-height': `\$\{simulatedTitleBarHeight\}px`/,
  '手机演示壳应向业务页面注入微信标题栏高度。',
);
assert.match(
  phoneMockupSource,
  /border border-slate-200 bg-white shadow-\[0_24px_80px_-40px_rgba\(15,23,42,0\.45\)\]/,
  '无实体机身的 C 端演示仍应保留屏幕细边框和轻阴影。',
);
assert.match(
  teacherAppSource,
  /className="teacher-mobile-app flex h-\[100dvh\] w-screen items-center justify-center bg-\[var\(--tm-bg-page\)\] p-4"/,
  '教师手机端桌面演示应保留与家长端一致的外围留白。',
);
assert.doesNotMatch(
  teacherAppSource,
  /fillContainerWhenFrameless/,
  '教师手机端不应请求无机身全屏填充。',
);

console.log('PhoneMockup demo frame regression checks passed.');
