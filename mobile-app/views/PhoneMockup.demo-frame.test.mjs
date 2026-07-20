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
assert.match(
  phoneMockupSource,
  /border border-slate-200 bg-white shadow-\[0_24px_80px_-40px_rgba\(15,23,42,0\.45\)\]/,
  '无实体机身的 C 端演示仍应保留屏幕细边框和轻阴影。',
);
assert.match(
  teacherAppSource,
  /className="flex h-\[100dvh\] w-screen items-center justify-center bg-\[var\(--tm-bg-page\)\] p-4"/,
  '教师手机端桌面演示应保留与家长端一致的外围留白。',
);
assert.doesNotMatch(
  teacherAppSource,
  /fillContainerWhenFrameless/,
  '教师手机端不应请求无机身全屏填充。',
);

console.log('PhoneMockup demo frame regression checks passed.');
