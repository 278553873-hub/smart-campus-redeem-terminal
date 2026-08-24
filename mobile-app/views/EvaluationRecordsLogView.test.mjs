import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const viewSource = readFileSync(new URL('./EvaluationRecordsLogView.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const classCascadeSource = readFileSync(new URL('../components/ui/MobileClassCascadePicker.tsx', import.meta.url), 'utf8');
const indicatorCascadeSource = readFileSync(new URL('../components/evaluation/EvaluationIndicatorCascadePicker.tsx', import.meta.url), 'utf8');
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
assert.ok((viewSource.match(/<EvaluationIndicatorPath indicatorPath=/g)?.length ?? 0) >= 2, '评价列表卡片和详情弹窗应复用同一个指标路径标签组件。');
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
  'title={detailSheetTitle}',
  '>AI识别</h3>',
  '>原始记录</h3>',
  '>识别日期：</span>',
  '>识别对象：</span>',
  '>匹配指标：</span>',
  '>匹配理由：</span>',
  '<EvaluationIndicatorPath indicatorPath={activeRecord.indicatorPath} variant="compact-full"',
  'text-[var(--tm-evaluation-ai-editable-text)]',
  "activeRecord.sourceType === 'voice'",
  'playRecordAudio(activeRecord)',
  'activeRecord.audioTranscript ?? activeRecord.originalContent',
  'rounded-[var(--tm-radius-control)]',
  'border-[var(--tm-evaluation-source-border)]',
  'bg-[var(--tm-evaluation-source-bg)]',
]) {
  assert.ok(viewSource.includes(required), `评价详情应展示完整来源、理由和三级指标，缺少：${required}`);
}
for (const required of [
  'teacherEvaluationSourceSemantic',
  "background: '#F3F8FC'",
  "border: '#D5E5F0'",
  "'--tm-evaluation-source-bg'",
  "'--tm-evaluation-source-border'",
  "controlText: teacherReportChartSemantic.dataDefaultText",
  "'--tm-evaluation-source-control-text'",
]) {
  assert.ok(tokenSource.includes(required), `原始记录内容框应由独立的浅雾蓝组件变量管理，缺少：${required}`);
}
assert.ok(tokenSource.includes('teacherEvaluationAiSemantic') && tokenSource.includes('editableText: teacherReportChartSemantic.dataDefaultText') && tokenSource.includes("'--tm-evaluation-ai-editable-text'"), 'AI识别可编辑值应通过独立语义变量复用已有数据蓝。');
const detailStartPosition = viewSource.indexOf('{activeRecord && !isEditingRecord && (');
const detailAiTitlePosition = viewSource.indexOf('>AI识别</h3>', detailStartPosition);
const detailAiPanelPosition = viewSource.indexOf('bg-[var(--tm-bg-surface)]', detailAiTitlePosition);
const detailDatePosition = viewSource.indexOf('{formatRecognitionDate(activeRecord.occurredAt)}</time>', detailAiPanelPosition);
const detailClassPosition = viewSource.indexOf('{activeRecord.className}</span>', detailDatePosition);
const detailIndicatorPosition = viewSource.indexOf('<EvaluationIndicatorPath indicatorPath={activeRecord.indicatorPath} variant="compact-full"', detailClassPosition);
const detailScorePosition = viewSource.indexOf('{formatScore(activeRecord.score)}', detailIndicatorPosition);
const detailReasonPosition = viewSource.indexOf('{activeRecord.reason}</p>', detailScorePosition);
const detailOriginalPosition = viewSource.indexOf('>原始记录</h3>', detailReasonPosition);
const detailSourcePanelPosition = viewSource.indexOf('bg-[var(--tm-evaluation-source-bg)]', detailOriginalPosition);
const detailTranscriptPosition = viewSource.indexOf('activeRecord.audioTranscript ?? activeRecord.originalContent', detailSourcePanelPosition);
const detailTimePosition = viewSource.indexOf('{formatRecordTime(activeRecord.recordedAt, today)}</time>', detailOriginalPosition);
const detailOperatorPosition = viewSource.indexOf('{activeRecord.operator}</span>', detailTimePosition);
const detailAudioPosition = viewSource.indexOf('onClick={() => playRecordAudio(activeRecord)}', detailOperatorPosition);
assert.ok(
  detailStartPosition < detailAiTitlePosition
  && detailAiTitlePosition < detailAiPanelPosition
  && detailAiPanelPosition < detailDatePosition
  && detailDatePosition < detailClassPosition
  && detailClassPosition < detailIndicatorPosition
  && detailIndicatorPosition < detailScorePosition
  && detailIndicatorPosition < detailReasonPosition
  && detailReasonPosition < detailOriginalPosition
  && detailOriginalPosition < detailSourcePanelPosition
  && detailSourcePanelPosition < detailTranscriptPosition
  && detailTranscriptPosition < detailTimePosition
  && detailTimePosition < detailOperatorPosition
  && detailOperatorPosition < detailAudioPosition,
  '评价详情应按AI识别结果、原始记录证据块稳定分组，并保持内部信息顺序。',
);
const detailViewSource = viewSource.slice(detailStartPosition, viewSource.indexOf('{activeRecord && isEditingRecord', detailStartPosition));
assert.ok(!detailViewSource.includes('<section className="py-3">'), '评价时间和评价人不应继续作为原始记录框外的独立板块。');
assert.ok(!detailViewSource.includes('>原始语音</span>') && !detailViewSource.includes('>语音转文字') && !detailViewSource.includes('Mic2') && !detailViewSource.includes('border-t border-[var(--tm-evaluation-source-border)]'), '原始记录框不得重复解释语音来源或增加内部层级线。');
assert.ok(detailViewSource.includes('border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]') && !detailViewSource.includes('divide-y') && !detailViewSource.includes('>评分理由</h3>'), 'AI识别结果应使用白底轻量框完整承载，不再通过灰底、横线和重复标题暗示只读。');
assert.ok(detailViewSource.includes('>识别日期：</span>') && detailViewSource.includes('>识别对象：</span>') && detailViewSource.includes('>匹配指标：</span>') && detailViewSource.includes('>匹配分数：</span>') && detailViewSource.includes('>匹配理由：</span>'), 'AI识别框应按日期、对象、指标、分数和理由建立稳定字段结构。');
assert.ok(detailIndicatorPosition < detailScorePosition && detailScorePosition < detailReasonPosition, '匹配分数应位于匹配指标下一行、匹配理由上一行，保持单向阅读顺序。');
assert.ok(detailViewSource.includes('<div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-1">\n                                    <span className="text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">匹配指标：</span>'), '匹配指标标签与三级指标路径应保持在同一行，避免视线折返。');
assert.ok(
  detailViewSource.includes('variant="compact-full"')
  && viewSource.includes('text-[length:var(--tm-font-size-badge)]')
  && viewSource.includes("compactFull ? 'h-5 shrink-0 px-1'"),
  '详情指标应使用11像素紧凑标签并完整保留三级路径。',
);
assert.ok(detailViewSource.includes('<p className="w-full') && !detailViewSource.includes('<div className="flex items-start gap-3">'), '原始记录正文应始终独占完整一行，不因语音控件改变宽度。');
assert.ok(detailViewSource.includes('text-[var(--tm-evaluation-source-control-text)]') && detailViewSource.includes('flex h-7 items-center gap-1 rounded-[var(--tm-radius-control)] border border-[var(--tm-evaluation-source-border)] bg-[var(--tm-bg-surface)]'), '语音播放键和秒数应使用已有数据蓝派生的紧凑描边圆角控件。');
assert.ok(detailViewSource.includes('className="h-3 w-3 stroke-[2.25]"') && detailViewSource.includes('className="h-3 w-3 fill-current stroke-[1.5]"'), '播放与暂停图标应统一使用紧凑的12像素视觉尺寸。');
assert.ok(!viewSource.includes('text-[24px] font-bold') && !viewSource.includes('>详细指标</h3>'), '评价详情不应保留过重的顶部得分或重复的详细指标标题。');
const detailHeaderPosition = viewSource.indexOf('<header className="flex h-14');
const deleteActionPosition = viewSource.indexOf('aria-label="删除评价记录"', detailHeaderPosition);
const closeActionPosition = viewSource.indexOf('aria-label={`关闭', detailHeaderPosition);
assert.ok(detailHeaderPosition < deleteActionPosition && deleteActionPosition < closeActionPosition, '评价详情顶部操作应只按删除、关闭排列。');
assert.ok(!viewSource.includes('aria-label="编辑评价记录"') && !viewSource.includes("startEditingRecord('all')"), '已有分类编辑入口时，详情顶部不得重复保留批量编辑按钮。');
assert.ok(viewSource.includes('footerDivider={false}'), '评价字段编辑弹窗的底部按钮区不应显示顶部分隔线。');
assert.ok(!viewSource.includes('>删除评价'), '评价详情内容底部不应重复展示删除按钮或分隔区。');
const recordValidationPosition = viewSource.indexOf('const recordDraftInvalid =');
const recordValidationSource = viewSource.slice(recordValidationPosition, viewSource.indexOf('useEffect', recordValidationPosition));
for (const scope of ['date', 'class', 'indicator', 'score']) {
  assert.ok(recordValidationSource.includes(`recordEditScope === '${scope}'`), `评价编辑只应校验当前字段，缺少${scope}字段校验。`);
}
assert.ok(!viewSource.includes('请完整填写识别日期、记录对象与三级指标') && !viewSource.includes('<p role="alert"'), '指标级联过程中不得展示与当前操作无关的全局红色错误说明。');
for (const required of [
  "type RecordEditScope = 'date' | 'class' | 'indicator' | 'score'",
  'const startEditingRecord = (scope: RecordEditScope)',
  "onClick={() => startEditingRecord('date')}",
  'aria-label={`修改识别日期，当前${formatRecognitionDate(activeRecord.occurredAt)}`}',
  "onClick={() => startEditingRecord('class')}",
  'aria-label={`修改记录对象，当前${activeRecord.className}`}',
  "onClick={() => startEditingRecord('indicator')}",
  'aria-label="修改匹配指标"',
  "onClick={() => startEditingRecord('score')}",
  'aria-label={`修改得分，当前${formatScore(activeRecord.score)}`}',
  "recordEditScope === 'date'",
  "recordEditScope === 'class'",
  "recordEditScope === 'indicator'",
  "recordEditScope === 'score'",
]) {
  assert.ok(viewSource.includes(required), `AI识别内容应支持按字段渐进修改，缺少：${required}`);
}
for (const required of [
  'occurredOn: string',
  'recordedAt: Date',
  'occurredOn: toDateInputValue(record.occurredAt)',
  'type="date"',
  'value={recordDraft.occurredOn}',
  'const occurredOn = event.currentTarget.value',
  'setRecordDraft(current => current ? { ...current, occurredOn } : current)',
  'nextOccurredAt.setFullYear(year, month - 1, day)',
  'occurredAt: nextOccurredAt',
  'formatRecordTime(activeRecord.recordedAt, today)',
]) {
  assert.ok(viewSource.includes(required), `识别日期应可修改，同时保留原始录入时间，缺少：${required}`);
}
for (const required of [
  'const evaluationIndicatorPaths = recordTemplates.map',
  'const getEvaluationIndicatorOptions =',
  'const updateDraftIndicator = (depth: number, value: string)',
  'nextPath[depth] = value',
  "nextPath[index] = ''",
  '<EvaluationIndicatorCascadePicker',
  'options={[levelOneIndicatorOptions, levelTwoIndicatorOptions, levelThreeIndicatorOptions]}',
  'onChange={updateDraftIndicator}',
]) {
  assert.ok(viewSource.includes(required), `指标修改应按一、二、三级建立真实联动选择，缺少：${required}`);
}
for (const required of [
  'grid-cols-3',
  "const columnLabels = ['一级', '二级', '三级'] as const",
  'aria-label="三级指标横向级联选择"',
  'role="listbox"',
  'role="option"',
  'aria-selected={selected}',
  'min-h-11',
  'bg-[var(--tm-evaluation-indicator-editor-selected-bg)]',
  'text-[var(--tm-evaluation-indicator-editor-selected-text)]',
]) {
  assert.ok(indicatorCascadeSource.includes(required), `指标编辑器应使用可触控的横向三级联动，缺少：${required}`);
}
assert.ok(!indicatorCascadeSource.includes('<select') && !viewSource.includes('aria-label="选择一级指标"'), '指标编辑不得继续显示为三个纵向下拉框。');
for (const required of [
  'teacherEvaluationIndicatorEditorSemantic',
  'selectedBackground: teacherReportChartSemantic.dataDefaultSoft',
  'selectedText: teacherReportChartSemantic.dataDefaultText',
  'focusRing: teacherReportChartSemantic.dataDefault',
  "'--tm-evaluation-indicator-editor-selected-bg'",
  "'--tm-evaluation-indicator-editor-selected-text'",
  "'--tm-evaluation-indicator-editor-focus-ring'",
]) {
  assert.ok(tokenSource.includes(required), `横向指标级联选中态应复用已有数据蓝令牌，缺少：${required}`);
}
for (const required of [
  'canDeleteRecords &&',
  'aria-label="删除评价记录"',
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

assert.ok(guidelineSource.includes('左侧切换年级后，右侧立即刷新') && guidelineSource.includes('默认只显示“全部年级”') && guidelineSource.includes('记录以独立轻量卡片展示') && guidelineSource.includes('“AI识别”和“原始记录”两个同级板块') && guidelineSource.includes('识别日期') && guidelineSource.includes('横向三列级联') && guidelineSource.includes('播放键 + 具体秒数') && guidelineSource.includes('只进入对应字段的修改态') && guidelineSource.includes('删除 → 关闭') && guidelineSource.includes('不显示顶部分隔线') && guidelineSource.includes('应用层权限显式传入'), '教师手机端规范应固化双栏筛选、卡片摘要、AI识别分组和渐进编辑能力。');

console.log('Evaluation records detail checks passed.');
