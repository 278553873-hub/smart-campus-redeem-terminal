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
  /bg-\[linear-gradient\(180deg,transparent_0%,rgba\(255,255,255,0\.82\)_72%,rgba\(255,255,255,0\.96\)_100%\)\]/,
  '记录页背景底部应有轻微收净层，让悬浮控件后方保持干净'
);
