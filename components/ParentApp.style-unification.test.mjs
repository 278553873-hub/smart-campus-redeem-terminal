import { readFileSync } from 'node:fs';

const parentSource = readFileSync(new URL('./ParentApp.tsx', import.meta.url), 'utf8');
const tokenSource = readFileSync(new URL('./parent-app/ParentStyleTokens.tsx', import.meta.url), 'utf8');
const uiSource = readFileSync(new URL('./parent-app/ParentUI.tsx', import.meta.url), 'utf8');
const fluidNavSource = readFileSync(new URL('./parent-app/ParentFluidGlassNav.tsx', import.meta.url), 'utf8');
const failures = [];

const requireText = (source, text, message) => {
  if (!source.includes(text)) failures.push(message ?? `缺少：${text}`);
};

const forbidText = (source, text, message) => {
  if (source.includes(text)) failures.push(message ?? `不应出现：${text}`);
};

const requireToken = (source, objectName, propertyName) => {
  requireText(source, `export const ${objectName}`, `家长端 token 缺少导出：${objectName}`);
  if (!source.includes(`${propertyName}:`)) {
    failures.push(`家长端 token 缺少：${objectName}.${propertyName}`);
  }
};

for (const required of [
  "type Screen = 'binding' | 'growth' | 'reports' | 'archiveList' | 'archiveDetail' | 'questionnaireForm' | 'questionnaireDetail' | 'reportDetail' | 'bank' | 'growthRecords' | 'todo'",
  "useState<Screen>(() => defaultHasBoundChild ? 'growth' : 'binding')",
  'shouldShowStudentBindFields',
  'canSubmitBinding',
  'submitBinding',
  'openBinding',
  'returnToChildSwitcher',
  'GrowthChildProfileCard',
  'GrowthSummaryCards',
  'MessageBellEntry',
  'TodoPage',
  'getPendingQuestionnaireMessages',
  'aria-label={`待办，${messageCount}项待处理`}',
  "setScreen('todo')",
  'Bell',
  '待办',
  '待家长填写问卷',
  '待学生填写问卷',
  'ClipboardList',
  '填写',
  '提交成功',
  'QuestionnaireForm',
  'pendingQuestionnaires',
  '家长问卷',
  '孩子问卷',
  'canViewArchive',
  'activeChild.canViewArchive && activeChild.archives.length > 0',
  'questionnaireStepIndex',
  'questionnaireAnswers',
  'showQuestionnaireSubmitConfirm',
  'questionnaireTextAnswers',
  'optionNeedsTextInput',
  'selectedTextOptionsComplete',
  'questionPrompt',
  'questionTypeLabel',
  'placeholder="请填写具体内容"',
  'rows={3}',
  'min-h-[96px] w-full resize-none',
  '请补充内容',
  'progressPercent',
  'currentStepNumber',
  'questionTotal',
  '上一题',
  '下一题',
  '单选',
  '多选',
  'text-[18px] font-black leading-[1.4]',
  'absolute bottom-0 left-0 right-0 z-30',
  'sticky top-0 z-40',
  'aria-label="返回成长页"',
  '确认提交',
  '我再看看',
  'SubmitSuccessToast',
  'aria-live="polite"',
  'updateQuestionnaireAnswer',
  'openQuestionnaireForm',
  "setScreen('questionnaireForm')",
  '学生档案',
  '档案明细',
  'title="档案"',
  'aria-label={`查看${activeChild.name}档案`}',
  'archives',
  'templateName',
  'healthInfo',
  'contentGroups',
  'sourceRecords',
  '来源记录',
  '健康信息',
  '档案摘要',
  'activeArchive.summary.map',
  '综合印象',
  '优势线索',
  '近期关注',
  '基础信息',
  '档案内容',
  '建档来源',
  '学习与认知',
  '兴趣与交往',
  '家庭与发展目标',
  '的档案',
  '档案类型',
  '一年级学生初始档案袋',
  '学业基础',
  '兴趣偏好',
  '认知特点',
  '交往风格',
  '性格与家庭',
  '优先发展目标',
  '初始光芒定位',
  '未来一学期内驱力培养的优先关注方向',
  '一年级学生家长问卷',
  '一年级学生访谈信息表',
  '一年级教师观察表',
  'formIntro',
  'formSections',
  'isLongIntroLabel',
  'splitArchiveOptions',
  'isArchiveOptionSelected',
  'getQuestionTypeLabel',
  '孩子有没有需要老师特别留意的健康问题（如过敏、哮喘等）？',
  '遇到不懂的事，你会问“为什么”吗？',
  '课堂专注 / (上课/集会)',
  "setScreen('archiveList')",
  "setScreen('archiveDetail')",
  "setScreen('questionnaireDetail')",
  'activeChild.reports.map',
  "setActiveReportId(report.id); setScreen('reportDetail');",
  'activeReport.summary',
  'activeReport.highlights.map',
  'activeReport.focus',
  'activeReport.suggestion',
  '总览',
  '亮点',
  '关注',
  '建议',
  "type BankTab = 'deposit' | 'list'",
  'PARENT_BANK_TERMS.map',
  'activeChild.deposits.length',
  '定期到期日',
  '到期可得',
  'attentionSoft',
  '未到期取出将按活期利息计算',
  '到账金额',
  '确认提前取出',
  'setSelectedBankScheme(scheme); setShowDepositConfirm(true);',
  'CURRENT_DEPOSIT_PROJECTION_DAYS.map',
  'showDepositReview && selectedBankScheme',
  'withdrawTarget &&',
  'ChildSwitcherSheet',
  '绑定其他孩子',
]) {
  requireText(parentSource, required, `家长端真实功能边界被破坏：${required}`);
}

for (const forbidden of [
  '高光时刻',
  '智能生成状态',
  '成长画像',
  'AI成长洞察',
  '收益预估入口',
  '查看成长报告',
  '老师邀请你补充孩子信息',
  '需要你协助孩子完成',
  '最常被家长看到的变化',
  '家庭支持重点',
  '模拟答案',
  "key: 'questionnaire'",
  "key: 'archive', label: '档案'",
  'parentNoticeMarquee',
  'parent-notice-marquee',
  '请补充孩子信息',
  '请协助孩子完成',
  '补充孩子入学信息',
  '和孩子一起完成',
  '<p className="min-w-0 truncate text-[15px] font-black leading-5 text-slate-950">{questionnaire.title}</p>',
  'h-2 w-2 shrink-0 rounded-full bg-orange-400',
  'rounded-full border border-orange-200 bg-orange-50/80',
  'grid min-h-[50px] grid-cols-[48px_1fr_auto] items-stretch',
  '去填写',
  '<span className="text-[12px] font-black text-orange-600">待办</span>',
  '{questionnaireCount}份',
  'aria-label="待填写问卷提醒"',
  '-mx-5 mt-3 border-y border-slate-200 bg-white',
  '选择填写对象',
  'QuestionnairePickerSheet',
  'showQuestionnairePicker',
  'title="消息"',
  'aria-label={`消息，${messageCount}条待处理`}',
  'showMessageCenter',
  'ParentMessageCenterSheet',
  'min-h-[430px]',
  'shadow-[0_18px_36px_-30px_rgba(16,185,129,0.6)]',
  '<Header title="待填写问卷" showBack',
  '<Header title="问卷" showBack',
  '<Header title="" showBack',
  '可选择多项',
  'text-[20px] font-black leading-[1.35]',
  'placeholder="请填写"',
  'pl-[50px]',
  'border-emerald-500 bg-emerald-500 text-white',
  'CheckCircle2 size={12}',
  'shadow-[0_10px_24px_-22px_rgba(16,185,129,0.65)]',
]) {
  forbidText(parentSource, forbidden, `样式统一不得新增真实方案外入口或概念文案：${forbidden}`);
}

for (const forbidden of [
  "const labels = ['成长', '档案', '银行']",
  "['表扬 +3', '档案', '920', '银行']",
  "const labels = ['成长', '报告', '银行']",
  "['表扬 +3', '报告', '920', '银行']",
]) {
  forbidText(fluidNavSource, forbidden, `家长端底栏残留了旧一级入口：${forbidden}`);
}

for (const required of [
  "const labels = ['成长', '报告', '我的']",
  "['表扬 +3', '报告', '家长', '我的']",
]) {
  requireText(fluidNavSource, required, `家长端底栏应保持成长/报告/我的：${required}`);
}

for (const forbiddenStyle of [
  'bg-slate-900 text-white',
  'bg-slate-950 text-white',
  'bg-[#FFC210] text-[#653C16]',
  'parent-teacher-token-primary-button',
]) {
  forbidText(parentSource, forbiddenStyle, `家长端新视觉不应继续使用旧冲突按钮/教师端 token：${forbiddenStyle}`);
}

for (const requiredStyle of [
  'ParentPageShell',
  'ParentCard',
  'ParentGradientIcon',
  'ParentChildAvatar',
  'ParentPrimaryButton',
  'ParentBottomSheet',
]) {
  requireText(parentSource, requiredStyle, `家长端应使用新的通用组件：${requiredStyle}`);
}

for (const [objectName, propertyName] of [
  ['parentSurface', 'background'],
  ['parentSurface', 'card'],
  ['parentIconTone', 'blue'],
  ['parentIconTone', 'green'],
  ['parentIconTone', 'orange'],
  ['parentButtonTone', 'primary'],
  ['parentRadius', 'card'],
  ['parentShadow', 'card'],
]) {
  requireToken(tokenSource, objectName, propertyName);
}

for (const requiredExport of [
  'export const ParentPageShell',
  'export const ParentCard',
  'export const ParentGradientIcon',
  'export const ParentChildAvatar',
  'export const ParentPrimaryButton',
  'export const ParentSecondaryButton',
  'export const ParentBottomSheet',
]) {
  requireText(uiSource, requiredExport, `家长端通用 UI 组件缺少导出：${requiredExport}`);
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('parent style unification assertions passed');
