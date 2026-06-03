import { readFileSync } from 'node:fs';

const parentSource = readFileSync(new URL('./ParentApp.tsx', import.meta.url), 'utf8');
const tokenSource = readFileSync(new URL('./parent-app/ParentStyleTokens.tsx', import.meta.url), 'utf8');
const uiSource = readFileSync(new URL('./parent-app/ParentUI.tsx', import.meta.url), 'utf8');
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
  "type Screen = 'binding' | 'growth' | 'reports' | 'reportDetail' | 'bank'",
  "const [screen, setScreen] = useState<Screen>('binding')",
  'shouldShowStudentBindFields',
  'canSubmitBinding',
  'submitBinding',
  'openBinding',
  'returnToChildSwitcher',
  'GrowthChildProfileCard',
  'GrowthSummaryCards',
  'activeChild.reports.map',
  "setActiveReportId(report.id); setScreen('reportDetail')",
  'activeReport.summary',
  'activeReport.highlights.map',
  "type BankTab = 'deposit' | 'list'",
  'PARENT_BANK_TERMS.map',
  'setSelectedBankScheme(scheme); setShowDepositConfirm(true);',
  'CURRENT_DEPOSIT_PROJECTION_DAYS.map',
  'showDepositReview && selectedBankScheme',
  'withdrawTarget &&',
  'ChildSwitcherSheet',
  '新增绑定',
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
]) {
  forbidText(parentSource, forbidden, `样式统一不得新增真实方案外入口或概念文案：${forbidden}`);
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
