import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const screenSource = readFileSync(new URL('./SmartBigScreen.tsx', import.meta.url), 'utf8');
const displaySource = readFileSync(new URL('./student-performance/ClassroomStudentPerformance.tsx', import.meta.url), 'utf8');

assert.match(screenSource, /getStudentPerformanceLevel\(performance\.netScore\)/, '卡片等级应由净得分实时派生');
assert.match(screenSource, /w-\[160px\] h-\[208px\]/, '课堂大屏卡片应保持160像素宽度并适度增高');
assert.match(screenSource, /const CARD_GAP = 24;/, '学生卡应保持24像素间距');
assert.match(screenSource, /updateStudentPerformance\(targetStudentIds, scoreChange\)/, '点选评价应立即更新目标学生表现');
assert.match(screenSource, /updateStudentPerformance\(targets\.studentIds, scoreChange\)/, '语音评价应立即更新识别到的学生表现');
assert.match(screenSource, /updateStudentPerformance\(record\.studentIds, record\.scoreChange, 'revert'\)/, '撤销评价应同步恢复等级和次数');

for (const iconName of ['star', 'moon', 'sun', 'crown']) {
  assert.match(displaySource, new RegExp(`student-level-icons/${iconName}\\.png`), `课堂大屏应使用${iconName}正式等级素材`);
}

assert.match(displaySource, /stroke="#f2b84b"/, '头像进度环应统一使用金色');
assert.match(displaySource, /z-10 h-full w-full -rotate-90/, '头像进度环应位于头像上层');
assert.match(displaySource, /inset-\[7px\] h-\[62px\] w-\[62px\] rounded-full/, '圆形头像应与进度环保持清晰间隙');
assert.doesNotMatch(displaySource, /shadow-\[/, '头像外投影不应遮挡进度环');
assert.doesNotMatch(displaySource, /Mars|Venus/, '性别图标不应继续叠放在头像进度环上');
assert.match(screenSource, /student\.gender === 'male'[\s\S]*?<Mars[\s\S]*?<Venus/, '性别图标应移到学生姓名一行');
assert.match(displaySource, /bg-emerald-50/, '表扬次数应使用绿色轻色片');
assert.match(displaySource, /bg-rose-50/, '批评次数应使用红色轻色片');
assert.doesNotMatch(displaySource, /ThumbsUp|ThumbsDown/, '奖惩次数不应增加常驻图标');

console.log('SmartBigScreen student performance checks passed.');
