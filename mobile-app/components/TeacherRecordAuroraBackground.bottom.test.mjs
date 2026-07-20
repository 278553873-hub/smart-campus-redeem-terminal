import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('mobile-app/components/TeacherRecordAuroraBackground.tsx', 'utf8');

assert.doesNotMatch(
  source,
  /bottom-\[-3[026]%\]/,
  '记录页极光背景不应在底部放置大面积色块，否则悬浮录入控件背后会出现额外渐变底'
);

assert.match(
  source,
  /bg-\[linear-gradient\(180deg,transparent_0%,var\(--tm-bg-surface-glass\)_72%,var\(--tm-bg-surface\)_100%\)\]/,
  '记录页背景底部应通过表面令牌形成轻微收净层，让悬浮控件后方保持干净'
);
