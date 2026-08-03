import assert from 'node:assert/strict';
import fs from 'node:fs';

const canonicalPath = 'mobile-app/styles/teacherMobileTokens.ts';
const canonical = fs.readFileSync(canonicalPath, 'utf8');
const app = fs.readFileSync('mobile-app/App.tsx', 'utf8');
const css = fs.readFileSync('mobile-app/index.css', 'utf8');
const parent = fs.readFileSync('components/ParentApp.tsx', 'utf8');
const guidelines = fs.readFileSync('design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md', 'utf8');

assert.equal(fs.existsSync('mobile-app/styles/teacherBrandTokens.ts'), false);
assert.equal(fs.existsSync('mobile-app/styles/phoneTokens.ts'), false);
assert.equal(fs.existsSync('mobile-app/styles/teacherMobileTokens.css'), false);
assert.equal(fs.existsSync('design-system/teacher-mobile/design-token.md'), false);

for (const required of [
  "'--tm-brand-primary'",
  "'--tm-brand-primary-strong'",
  "'--tm-record-student-text'",
  "'--tm-record-class-text'",
  "'--tm-nav-item-default'",
  "'--tm-radius-card'",
  "'--tm-shadow-card'",
  "'--tm-size-touch'",
  "'--tm-size-floating-action'",
  "'--tm-border-control'",
  "'--tm-input-bg'",
  "'--tm-input-border'",
  "'--tm-input-text'",
  "'--tm-input-placeholder'",
  "'--tm-input-disabled-bg'",
  "'--tm-input-disabled-border'",
  "'--tm-input-disabled-text'",
  "'--tm-input-readonly-bg'",
  "'--tm-input-readonly-border'",
  "'--tm-input-readonly-text'",
  "'--tm-input-focus-border'",
  "'--tm-focus-ring'",
  "'--tm-input-focus-ring'",
  "'--tm-page-plain-header-bg'",
  "'--tm-page-plain-content-bg'",
  "'--tm-font-size-document-title'",
  "'--tm-font-size-compact'",
  "'--tm-font-size-metric'",
  "'--tm-audience-guardian-primary'",
  "'--tm-audience-student-primary'",
  "'--tm-role-headteacher-primary'",
  "'--tm-role-principal-primary'",
  "'--tm-report-source-pill-height'",
  "'--tm-report-date-indicator-width'",
  "'--tm-report-filter-padding-pinned'",
]) {
  assert.match(canonical, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

assert.match(app, /from '\.\/styles\/teacherMobileTokens'/);
assert.doesNotMatch(app, /\b(?:blue|indigo|violet|purple)-\d+/);
assert.doesNotMatch(parent, /teacherMobileTokens/);
assert.match(guidelines, /mobile-app\/styles\/teacherMobileTokens\.ts/);
assert.match(canonical, /textTertiary: teacherBrandPalette\.neutral\[550\]/);
assert.match(canonical, /'--tm-text-tertiary': teacherBrandSemantic\.textTertiary/);
assert.match(canonical, /'--tm-input-bg': teacherBrandSemantic\.surface/);
assert.match(canonical, /'--tm-input-border': teacherBrandSemantic\.borderControl/);
assert.match(canonical, /'--tm-input-disabled-bg': teacherBrandSemantic\.surfaceMuted/);
assert.match(canonical, /'--tm-input-readonly-bg': teacherBrandSemantic\.surfaceSoft/);
assert.match(guidelines, /禁止把可编辑输入框默认画成灰底/);
assert.match(canonical, /metric: 'text-\[24px\]/);
assert.match(canonical, /negative: teacherBrandPalette\.red\[500\]/);
assert.match(canonical, /negativeStrong: teacherBrandPalette\.red\[700\]/);
assert.match(canonical, /negativeSoft: teacherBrandPalette\.red\[50\]/);
assert.match(canonical, /'--tm-record-negative-border': teacherBrandPalette\.red\[100\]/);
assert.doesNotMatch(canonical, /teacherBrandPalette\.rose|\brose:\s*\{/);
assert.match(guidelines, /不得维护或引入独立暗红色板/);

const luminance = hex => {
  const channels = [1, 3, 5].map(index => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
  return channels
    .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
};
const contrast = (foreground, background) => {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
};

assert.ok(contrast('#BA352E', '#FFF1F1') >= 4.5, '学生模式浅底文字对比度不足');
assert.ok(contrast('#FFFFFF', '#E02727') >= 4.5, '品牌主色上的白色小字对比度不足');
assert.ok(contrast('#FFFFFF', '#BA352E') >= 4.5, '品牌深色上的白色小字对比度不足');
assert.ok(contrast('#B83F00', '#FFF5EC') >= 4.5, '班级模式浅底文字对比度不足');
assert.ok(contrast('#155B54', '#ECF8F6') >= 4.5, '学生受众浅底文字对比度不足');
assert.ok(contrast('#126B5B', '#EFFAF7') >= 4.5, '班主任助理正文对比度不足');
assert.ok(contrast('#1F9E84', '#FFFFFF') >= 3, '班主任助理图标与白色前景对比度不足');
assert.ok(contrast('#6D6764', '#FFFFFF') >= 4.5, '弱提示文字对比度不足');
assert.ok(contrast('#918985', '#FFF9F6') >= 3, '表单控件边界对比度不足');
assert.ok(contrast('#7B7572', '#FFFFFF') >= 4.5, '三级弱文字对比度不足');
assert.ok(contrast('#14A085', '#FFFFFF') >= 3, '五育美育分类色白底对比度不足');
assert.ok(contrast('#C88100', '#FFFFFF') >= 3, '五育劳育分类色白底对比度不足');
assert.ok(contrast('#48A04D', '#FFFFFF') >= 3, '五育体育分类色白底对比度不足');
assert.ok(contrast('#E02727', '#FFFFFF') >= 3, '五育德育分类色白底对比度不足');
assert.ok(contrast('#F75C03', '#FFFFFF') >= 3, '五育智育分类色白底对比度不足');

for (const legacy of [
  '--ai-primary',
  '--ai-secondary',
  '--student-primary',
  '--class-primary',
  '#6366F1',
  '#06B6D4',
  '#7C3AED',
  '#C026D3',
]) {
  assert.equal(css.includes(legacy), false, `全局样式仍残留旧教师端令牌：${legacy}`);
}

console.log('teacher mobile token single-source assertions passed');
