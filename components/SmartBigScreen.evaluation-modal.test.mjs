import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const screenSource = readFileSync(new URL('./SmartBigScreen.tsx', import.meta.url), 'utf8');

assert.match(
  screenSource,
  /relative flex flex-col overflow-hidden rounded-\[2\.5rem\][\s\S]*maxHeight: 'calc\(100vh - 32px\)'/,
  '评价弹窗应受视口高度约束，并使用纵向弹性布局',
);
assert.match(
  screenSource,
  /flex shrink-0 flex-wrap items-center justify-between[\s\S]*border-b border-slate-100 bg-white[\s\S]*min-h-0 flex-1 overflow-y-auto/,
  '评价弹窗标题栏应固定，不随评价内容滚动',
);
assert.match(
  screenSource,
  /min-h-0 flex-1 overflow-y-auto bg-\[#f8fafc\] custom-scrollbar/,
  '评价内容超过弹窗可视高度时应支持纵向滚动',
);

console.log('SmartBigScreen evaluation modal checks passed.');
