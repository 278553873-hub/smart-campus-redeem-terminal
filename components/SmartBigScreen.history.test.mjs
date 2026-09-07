import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const screenSource = readFileSync(new URL('./SmartBigScreen.tsx', import.meta.url), 'utf8');
const displaySource = readFileSync(new URL('../shared/classroomDisplay.ts', import.meta.url), 'utf8');

for (const config of [
  'historySidebar: { width: 400, titleFontSize: 20, bodyFontSize: 15, metaFontSize: 13',
  'historySidebar: { width: 480, titleFontSize: 24, bodyFontSize: 17, metaFontSize: 15',
  'historySidebar: { width: 560, titleFontSize: 28, bodyFontSize: 19, metaFontSize: 17',
]) {
  assert.ok(displaySource.includes(config), `点评记录三档字号应包含配置：${config}`);
}

assert.match(screenSource, /点评记录<\/h3>/, '点评记录名称应保持原有业务表达');
assert.match(screenSource, /text-slate-900[\s\S]*?>\{record\.originalInput\}<\/p>/, '原始录入正文应使用高对比度文字');
assert.match(screenSource, /text-slate-500[\s\S]*?>\{record\.time\}<\/span>/, '点评时间不得继续使用接近禁用态的浅灰色');
assert.match(screenSource, /text-blue-700[\s\S]*AI 分析/, 'AI分析标签应使用适合投影观看的深蓝色');
assert.match(screenSource, /classroomDisplay\.toolbar\.countFontSize[\s\S]*>点评记录<\/span>/, '底部点评记录入口字号应随课堂展示档位放大');

console.log('SmartBigScreen history checks passed.');
