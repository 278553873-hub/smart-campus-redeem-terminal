import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./MeFeatureViews.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const featureStart = source.indexOf('export const SubjectManagementView');
const sheetStart = source.indexOf('interface EditSheetProps');

if (featureStart < 0 || sheetStart < 0) {
  throw new Error('未找到“我的”页管理子页面或其操作弹层。');
}

const featureSource = source.slice(featureStart, sheetStart);
const sheetSource = source.slice(sheetStart);

const requireText = (haystack, needle, message) => {
  if (!haystack.includes(needle)) throw new Error(message);
};

for (const required of [
  'const FeaturePageBody',
  'const FeaturePanel',
  'bg-[var(--tm-bg-surface-glass)] shadow-[0_12px_32px_-26px_var(--tm-shadow-neutral-color)]',
  "const featurePrimaryButtonClass = 'flex h-12 w-full",
  'bg-[var(--tm-brand-primary)]',
  'text-[var(--tm-status-negative)]',
]) {
  requireText(source, required, `管理子页面缺少品牌化基础样式：${required}`);
}

const featurePageBodyClass = source.match(/const FeaturePageBody:[\s\S]*?<div className="([^"]+)"/)?.[1] ?? '';
if (featurePageBodyClass.includes('bg-[') || featurePageBodyClass.includes('gradient')) {
  throw new Error('管理子页面不应再自绘整页渐变背景，顶部氛围光应由屏幕级背景统一提供。');
}

if (source.includes('const PageBody') || source.includes('const WhitePanel')) {
  throw new Error('设置页不应继续保留旧版蓝色渐变骨架，应与科目/部门等子页面共用统一品牌页面骨架。');
}

requireText(source, 'export const MineSettingsView', '设置页应继续提供。');
const settingsSource = source.slice(source.indexOf('export const MineSettingsView'), featureStart);
requireText(settingsSource, '<FeaturePageBody>', '设置页应使用统一品牌页面骨架，保证顶部标题栏与页面氛围光一致。');

const screenBackgroundList = appSource.match(/const hasScreenLevelBackground = \[([^\]]+)\]/)?.[1] ?? '';
const phoneScreenBackgroundList = appSource.match(/if \(\[([^\]]+)\]\.includes\(currentView\)\) \{\s*return <TeacherMobileScreenBackground/)?.[1] ?? '';
for (const viewName of ["'mine_settings'", "'subject_management'", "'department_management'", "'coin_issuance'", "'suggestion_feedback'"]) {
  if (!screenBackgroundList.includes(viewName) || !phoneScreenBackgroundList.includes(viewName)) {
    throw new Error(viewName + ' 应纳入屏幕级背景，标题栏才能与页面氛围光融为一体。');
  }
}

for (const required of [
  'export const SubjectManagementView',
  'onDragStart={() => onDragStart(item.id)}',
  'onDragOver(item.id)',
  '新增科目',
  'export const DepartmentManagementView',
  '新增部门',
  'export const CoinIssuanceView',
  'onPointerDown={() => setShowIssuanceHelp(true)}',
  'role="tooltip"',
  '开启后，系统将按设置的周期和预算自动向班级发放货币。',
  'appearance-none border-0 bg-transparent',
  '[&::-webkit-slider-runnable-track]:border-0',
  '[&::-moz-range-track]:border-0',
  'backgroundSize: \'100% 8px\'',
  'bg-[var(--tm-brand-reward)]',
  'text-[var(--tm-brand-reward-strong)]',
  'export const SuggestionFeedbackView',
  'const canSubmit = Boolean(text.trim())',
  'aria-label="上传反馈图片"',
  'border border-dashed border-[var(--tm-brand-primary-soft-strong)] bg-white',
]) {
  requireText(featureSource, required, `管理子页面迁移后缺少原有能力或语义色：${required}`);
}

if (featureSource.includes('accent-[var(--tm-brand-primary)]')) {
  throw new Error('阳光保底比例不应继续使用带系统灰色底轨的 accent 样式。');
}

for (const legacyColor of ['#1E9AAA', 'cyan-', 'blue-', 'rgba(30,154,170']) {
  if (featureSource.includes(legacyColor) || sheetSource.includes(legacyColor)) {
    throw new Error(`管理子页面仍残留旧青蓝视觉颜色：${legacyColor}`);
  }
}

const featurePanelClass = source.match(/const FeaturePanel:[\s\S]*?<section className={`([^`]+)`}/)?.[1] ?? '';
if (!featurePanelClass || featurePanelClass.includes(' ring-') || featurePanelClass.includes(' border ')) {
  throw new Error('管理子页面卡片不应保留显性描边或环形边框。');
}

if ((featureSource.match(/<FeaturePageBody/g) ?? []).length !== 4) {
  throw new Error('科目、部门、货币、建议四页应全部使用统一品牌页面骨架。');
}

for (const required of [
  'bg-[var(--tm-mask)]',
  'bg-[var(--tm-brand-primary-soft)]',
  'text-[var(--tm-brand-primary)]',
  'bg-[var(--tm-status-negative-soft)]',
  'text-[var(--tm-status-negative)]',
]) {
  requireText(sheetSource, required, `科目/部门操作弹层未使用品牌或删除语义 Token：${required}`);
}

console.log('Me feature views brand color assertions passed');
