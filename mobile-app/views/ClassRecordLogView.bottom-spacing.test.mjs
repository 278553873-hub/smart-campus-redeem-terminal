import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('mobile-app/views/ClassRecordLogView.tsx', 'utf8');

assert.doesNotMatch(
  source,
  /h-\[600px\]\s+max-h-full\s+overflow-y-auto/,
  '记录页内容滚动区域不应固定为 600px，否则在较高展示容器中会露出下方白色背景'
);

assert.match(
  source,
  /flex-1\s+min-h-0\s+overflow-y-auto\s+p-4\s+space-y-6\s+pb-28\s+no-scrollbar\s+relative\s+z-10/,
  '记录页内容滚动区域应填满剩余高度，同时保留底部悬浮控件避让'
);
