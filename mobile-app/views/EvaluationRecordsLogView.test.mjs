import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const viewSource = readFileSync(new URL('./EvaluationRecordsLogView.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const classCascadeSource = readFileSync(new URL('../components/ui/MobileClassCascadePicker.tsx', import.meta.url), 'utf8');
const tokenSource = readFileSync(new URL('../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');
const guidelineSource = readFileSync(new URL('../../design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md', import.meta.url), 'utf8');

for (const required of [
  'classes: ClassInfo[]',
  'canEditRecords: boolean',
  'canDeleteRecords: boolean',
  "const [selectedGrade, setSelectedGrade] = useState('all')",
  "const [selectedClassId, setSelectedClassId] = useState('all')",
  'const selectedScopeLabel = selectedClass?.name ?? selectedGradeLabel',
  'aria-label={`筛选班级，当前${selectedScopeLabel}`}',
  '{selectedScopeLabel}',
  'open={showClassFilterSheet}',
  'title="选择班级范围"',
  '<MobileClassCascadePicker',
  'selectionMode="single"',
  "{ gradeLabel: 'all', displayLabel: '全部年级', classes: [] }",
  "setDraftSelectedClassId('all')",
  'onActiveGradeChange={handleDraftGradeChange}',
  'onSelectClass={setDraftSelectedClassId}',
  'allClassesLabel="全部班级"',
  "if (selectedClassId !== 'all' && record.classId !== selectedClassId) return false",
  "if (selectedGrade !== 'all')",
  'const selectedClass = classes.find(classInfo => classInfo.id === selectedClassId)',
  "selectedClassId === 'all' && (",
  '{record.className}',
]) {
  assert.ok(viewSource.includes(required), `评价记录明细应支持按班级选择和过滤，缺少：${required}`);
}

assert.ok(viewSource.indexOf('<ReportDateRangeTabs') < viewSource.indexOf('aria-label={`筛选班级，当前${selectedScopeLabel}`}'), '评价明细日期筛选应位于最上方，班级筛选入口位于其下。');
assert.ok(viewSource.includes('min-h-[var(--tm-size-touch)] items-center justify-between gap-3') && viewSource.includes('{filteredRecords.length}条记录'), '班级筛选结果应与记录数量位于同一行。');
assert.ok(!viewSource.includes('班级范围</span>') && !viewSource.includes('recordScopeLabel'), '班级筛选结果和记录摘要不得展示重复的固定范围文案。');
assert.ok(!viewSource.includes('aria-label="选择年级"') && !viewSource.includes('aria-label="选择班级"'), '评价明细抽屉不得使用两个独立下拉筛选器。');
assert.ok(classCascadeSource.includes('const classSelectionOptionClass =') && classCascadeSource.includes("border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)]"), '班级行应使用白色表面，仅通过选择标记表达选中状态。');
assert.ok(viewSource.includes('ariaLabel="评价记录时间范围"') && viewSource.includes('handleTimeRangeChange'), '评价明细应复用报告日期栏并按时间过滤。');
assert.ok(viewSource.includes('<MobileBottomSheet') && viewSource.includes('title="选择日期范围"') && viewSource.includes('应用日期'), '自定义日期应通过公共底部抽屉渐进披露。');
assert.ok(viewSource.includes('recordDay >= start && recordDay <= end'), '自定义日期应实际过滤记录，而不是仅改变选中状态。');
assert.ok(viewSource.includes('<ol className="space-y-4"') && viewSource.includes('[box-shadow:var(--tm-shadow-card)]'), '评价记录应使用留白充足的独立轻量卡片展示。');
assert.ok(viewSource.includes('onClick={() => openRecordDetail(record)}') && viewSource.includes('{record.reason}') && viewSource.includes('formatScore(record.score)'), '评价卡片应可进入详情，并展示解析理由和两位小数得分。');
assert.ok(viewSource.includes("const formatScore = (score: number) => `${score > 0 ? '+' : ''}${score.toFixed(2)}`;") && !viewSource.includes("${score.toFixed(2)}分`"), '加减分数值不应重复展示“分”单位。');
assert.ok(viewSource.includes("selectedClassId === 'all' && (") && viewSource.includes('{record.className}</p>') && viewSource.includes('{record.operator}'), '未筛选具体班级时卡片应展示班级，并始终展示评价人。');
for (const required of [
  'const EvaluationIndicatorPath:',
  "const indicatorParts = indicatorPath.split(' / ')",
  'grid-cols-[minmax(0,1fr)_auto]',
  '>›</span>',
  "index === indicatorParts.length - 1 ? 'shrink-0' : 'min-w-0 truncate'",
  'bg-[var(--tm-evaluation-indicator-bg)]',
  'border-[var(--tm-evaluation-indicator-border)]',
  'text-[var(--tm-evaluation-indicator-text)]',
  'text-[length:var(--tm-font-size-meta)] font-medium',
  'font-normal leading-6',
]) {
  assert.ok(viewSource.includes(required), `评价卡片应使用统一颜色的三个连续标签保持完整单行指标路径，缺少：${required}`);
}
assert.equal(viewSource.match(/<EvaluationIndicatorPath indicatorPath=/g)?.length, 2, '评价列表卡片和详情弹窗应复用同一个指标路径标签组件。');
assert.ok(!viewSource.includes('text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">{targetIndicator}'), '三级指标不得通过不同字号和字重破坏复合标签的一致性。');
for (const required of [
  'teacherEvaluationIndicatorSemantic',
  "text: '#35566E'",
  "background: '#F3F8FC'",
  "border: '#DFEBF4'",
  "'--tm-evaluation-indicator-bg'",
  "'--tm-evaluation-indicator-border'",
]) {
  assert.ok(tokenSource.includes(required), `指标标签颜色应由统一的最浅雾蓝组件变量管理，缺少：${required}`);
}
assert.ok(!tokenSource.includes('evaluation-indicator-level-'), '三个指标标签不应再维护用户无法理解的层级色阶。');
const classNamePosition = viewSource.indexOf('{record.className}</p>');
const indicatorPosition = viewSource.indexOf('<EvaluationIndicatorPath indicatorPath={record.indicatorPath}', classNamePosition);
const reasonPosition = viewSource.indexOf('{record.reason}</p>');
const timePosition = viewSource.indexOf('{formatRecordTime(record.occurredAt, today)}</time>', reasonPosition);
assert.ok(classNamePosition < indicatorPosition && indicatorPosition < reasonPosition && reasonPosition < timePosition, '评价卡片信息强度应按班级、指标与得分、评分理由、时间与评价人稳定递减。');
for (const required of [
  'title={isEditingRecord ? \'修改评价\' : \'评价详情\'}',
  '>评分理由</h3>',
  '>原始记录</h3>',
  '>详细指标</h3>',
  '<EvaluationIndicatorPath indicatorPath={activeRecord.indicatorPath} className="mt-3" />',
  "activeRecord.sourceType === 'voice'",
  'playRecordAudio(activeRecord)',
  '>语音转文字',
  'activeRecord.audioTranscript ?? activeRecord.originalContent',
]) {
  assert.ok(viewSource.includes(required), `评价详情应展示完整来源、理由和三级指标，缺少：${required}`);
}
for (const required of [
  'canEditRecords &&',
  'aria-label="编辑评价记录"',
  'canDeleteRecords &&',
  '>删除评价',
  '<MobileConfirmSheet',
  'tone="danger"',
  'canEditRecords={canEditClassEvaluationRecords}',
  'canDeleteRecords={canDeleteClassEvaluationRecords}',
]) {
  assert.ok(viewSource.includes(required) || appSource.includes(required), `评价编辑删除应由权限控制并提供二次确认，缺少：${required}`);
}
assert.ok(viewSource.includes('step="0.01"') && viewSource.includes('draftScore.toFixed(2)') && viewSource.includes('recordDraft.indicatorPath'), '评价编辑应支持修改记录对象、三级指标和两位小数分数。');
assert.ok(!viewSource.includes('Math.random') && !viewSource.includes('bg-blue-') && !viewSource.includes('text-blue-'), '评价记录数据应稳定，并移除旧蓝色硬编码样式。');
assert.ok(!viewSource.includes('ArrowLeft') && !viewSource.includes('<h1'), '评价明细不应自绘标题栏，应复用应用层导航。');
assert.ok(viewSource.includes('<MobileEmptyState') && viewSource.includes('暂无评价记录'), '评价记录筛选无结果时应提供空状态。');

for (const required of [
  "'class_evaluation_records'",
  "case 'class_evaluation_records': return '评价记录明细'",
  "navigateTo('class_evaluation_records')",
  '<EvaluationRecordsLogView',
  'canEditRecords={canEditClassEvaluationRecords}',
  'canDeleteRecords={canDeleteClassEvaluationRecords}',
]) {
  assert.ok(appSource.includes(required), `评价记录明细应接入教师手机端正式导航，缺少：${required}`);
}

assert.ok(guidelineSource.includes('左侧切换年级后，右侧立即刷新') && guidelineSource.includes('默认只显示“全部年级”') && guidelineSource.includes('记录以独立轻量卡片展示') && guidelineSource.includes('语音转写文字') && guidelineSource.includes('应用层权限显式传入'), '教师手机端规范应固化双栏筛选、卡片摘要、详情语音和权限操作。');

console.log('Evaluation records detail checks passed.');
