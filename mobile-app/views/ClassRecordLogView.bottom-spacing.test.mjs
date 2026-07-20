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
  /relative\s+z-10\s+flex-1\s+min-h-0\s+space-y-3\.5\s+overflow-y-auto\s+px-5\s+pb-44\s+pt-0\s+no-scrollbar/,
  '记录页内容滚动区域应保持完整高度，并通过尾部留白保证最后一条记录可滚动到录入条上方'
);
