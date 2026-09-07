import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./classroomDisplay.ts', import.meta.url), 'utf8');

assert.match(source, /if \(viewportWidth >= 1920 \|\| viewportHeight >= 1080\) return 'distant';/);
assert.match(source, /if \(viewportWidth >= 1440 \|\| viewportHeight >= 810\) return 'classroom';/);
assert.match(source, /return 'standard';/);

for (const config of [
  'classMenuItemHeight: 40',
  'classMenuItemHeight: 48',
  'classMenuItemHeight: 56',
  'groupPlanActionItemHeight: 32',
  'groupPlanActionItemHeight: 40',
  'groupPlanActionItemHeight: 48',
  'statusFontSize: 14',
  'statusFontSize: 16',
  'statusFontSize: 18',
]) {
  assert.ok(source.includes(config), `档位配置缺少 ${config}`);
}

console.log('classroomDisplay configuration checks passed');
