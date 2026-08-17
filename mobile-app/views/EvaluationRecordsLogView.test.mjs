import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const viewSource = readFileSync(new URL('./EvaluationRecordsLogView.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const guidelineSource = readFileSync(new URL('../../design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md', import.meta.url), 'utf8');

for (const required of [
  'classes: ClassInfo[]',
  "const [selectedGrade, setSelectedGrade] = useState('all')",
  "const [selectedClassId, setSelectedClassId] = useState('all')",
  'aria-label={`筛选班级范围，当前${selectedGradeLabel}，${selectedClassLabel}`}',
  '{selectedGradeLabel} · {selectedClassLabel}',
  'open={showClassFilterSheet}',
  'title="选择班级范围"',
  'aria-label="选择年级"',
  'aria-label="选择班级"',
  'disabled={draftSelectedGrade === \'all\'}',
  "setDraftSelectedClassId('all')",
  'draftGradeClasses.map(classInfo =>',
  "if (selectedClassId !== 'all' && record.classId !== selectedClassId) return false",
  "if (selectedGrade !== 'all')",
  'const selectedClass = classes.find(classInfo => classInfo.id === selectedClassId)',
  "selectedClassId === 'all' && <span",
  '{record.className}',
]) {
  assert.ok(viewSource.includes(required), `评价记录明细应支持按班级选择和过滤，缺少：${required}`);
}

assert.ok(viewSource.indexOf('班级范围</span>') < viewSource.indexOf('<ReportDateRangeTabs'), '评价明细页面只应展示一个班级范围入口，并位于日期筛选之前。');
assert.ok(viewSource.indexOf('aria-label="选择年级"') < viewSource.indexOf('aria-label="选择班级"'), '评价明细抽屉内应先选择年级，再选择班级。');
assert.equal((viewSource.match(/aria-label="选择年级"/g) ?? []).length, 1, '页面不得并排铺开年级选择器，只能在级联抽屉内出现。');
assert.ok(viewSource.includes('ariaLabel="评价记录时间范围"') && viewSource.includes('handleTimeRangeChange'), '评价明细应复用报告日期栏并按时间过滤。');
assert.ok(viewSource.includes('<MobileBottomSheet') && viewSource.includes('title="选择日期范围"') && viewSource.includes('应用日期'), '自定义日期应通过公共底部抽屉渐进披露。');
assert.ok(viewSource.includes('recordDay >= start && recordDay <= end'), '自定义日期应实际过滤记录，而不是仅改变选中状态。');
assert.ok(viewSource.includes('<ol className="overflow-hidden') && viewSource.includes('border-b border-[var(--tm-border-subtle)]'), '评价记录应使用单一连续列表表面。');
assert.ok(!viewSource.includes('Math.random') && !viewSource.includes('bg-blue-') && !viewSource.includes('text-blue-'), '评价记录数据应稳定，并移除旧蓝色硬编码样式。');
assert.ok(!viewSource.includes('ArrowLeft') && !viewSource.includes('<h1'), '评价明细不应自绘标题栏，应复用应用层导航。');
assert.ok(viewSource.includes('<MobileEmptyState') && viewSource.includes('暂无评价记录'), '评价记录筛选无结果时应提供空状态。');

for (const required of [
  "'class_evaluation_records'",
  "case 'class_evaluation_records': return '评价记录明细'",
  "navigateTo('class_evaluation_records')",
  '<EvaluationRecordsLogView classes={activeSpaceClasses} />',
]) {
  assert.ok(appSource.includes(required), `评价记录明细应接入教师手机端正式导航，缺少：${required}`);
}

assert.ok(guidelineSource.includes('默认显示“全部年级 · 全部班级”') && guidelineSource.includes('年级为“全部”时班级保持“全部”') && guidelineSource.includes('选择“全部班级”时每条记录必须展示所属班级') && guidelineSource.includes('不为每条记录创建独立卡片'), '教师手机端规范应固化单入口级联筛选、默认全部口径和连续列表结构。');

console.log('Evaluation records detail checks passed.');
