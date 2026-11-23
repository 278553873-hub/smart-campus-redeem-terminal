import assert from 'node:assert/strict';
import fs from 'node:fs';
import postcss from 'postcss';

const view = fs.readFileSync('mobile-app/views/TeacherProfileSetupView.tsx', 'utf8');
const app = fs.readFileSync('mobile-app/App.tsx', 'utf8');
const demo = fs.readFileSync('App.tsx', 'utf8');
const schoolAccess = fs.readFileSync('mobile-app/views/TeacherSchoolAccessView.tsx', 'utf8');
const styles = fs.readFileSync('mobile-app/views/TeacherProfileSetupView.css', 'utf8');

assert.match(schoolAccess, /个人版（免费试用）/);
assert.doesNotMatch(schoolAccess, /个人版（试用）/);

assert.ok(app.includes("import TeacherProfileSetupView from './views/TeacherProfileSetupView'"));
assert.ok(app.includes("session?.spaceId === 'personal'"));
assert.ok(app.includes('if (personalProfileSetup) {'));
assert.match(app, /onSubmit={handlePersonalProfileSubmit}/);
assert.match(app, /onProfileSetupVisibilityChange\?\.\(isAuthenticated && personalProfileSetup\)/);
assert.match(app, /const visible = isAuthenticated && !personalProfileSetup[\s\S]*?onGradientPreviewVisibilityChange\?\.\(visible\)/);
assert.match(demo, /onProfileSetupVisibilityChange=\{setShowTeacherProfileSetupPreview\}/);
assert.match(demo, /currentApp === 'admin' && showTeacherProfileSetupPreview && \([\s\S]*?<TeacherDemoSearchExample\s+label="完善信息预览设置"\s+title="预览设置"\s+instruction="在「学校」输入框输入下方关键词"\s+example="实验"/);
assert.doesNotMatch(view, /实验|预览设置/);

assert.match(view, /<MobilePageHeader title="完善信息" onBack=\{onBack\}/);
assert.match(view, />姓名</);
assert.match(view, />学校</);
assert.match(view, /placeholder="请输入姓名"/);
assert.match(view, /placeholder="请输入学校名称"/);
assert.match(view, /填写学校后，可更快找到同校老师创建的班级/);
assert.match(view, /<MobileFormActionBar type="submit" label="进入体验" disabled=\{!canSubmit\}/);
assert.doesNotMatch(view, /填写姓名和学校，即可开始个人版体验/); // 不必再展示引导句
assert.match(view, /<form[^\n]*bg-\[var\(--tm-page-plain-content-bg\)\]/);
assert.match(view, /const fieldCardClass = '[^']*--tm-form-card-radius[^']*bg-\[var\(--tm-bg-surface\)\]/);
assert.match(view, /disabled={!canSubmit}/);
assert.match(view, /const canSubmit = Boolean\(trimmedName && trimmedSchoolName\)/);
assert.match(view, /onSubmit\({ name: trimmedName, schoolName: trimmedSchoolName }\)/);
assert.doesNotMatch(view, /#[0-9A-Fa-f]{6}|rgba\(/);

assert.match(view, /findBEndSchools\(schoolName\)/);
assert.ok(view.includes("import { AutoComplete } from '@arco-design/web-react'"));
assert.match(view, /<AutoComplete/);
assert.match(view, /data={schoolOptions}/);
assert.match(view, /onSelect={handleSchoolSelect}/);
assert.match(view, /getPopupContainer=/);
assert.match(view, /teacher-school-autocomplete-popup/);
assert.doesNotMatch(view, /role="listbox"/); // 下拉列表交给成熟组件，不手写
assert.match(view, /setBlockedSchool\(matchedSchool\)/);
assert.ok(view.includes('normalizeSchoolName(school.name) === normalizeSchoolName(trimmedSchoolName)'));
assert.match(view, /该学校已启用试用/);
assert.match(view, /学校已完成学生信息导入，无需自行创建账号。请联系学校负责人，将您的账号添加到后台。/);
assert.match(view, /MobileBottomSheet/);
assert.match(styles, /\.teacher-school-autocomplete \.arco-input-inner-wrapper/);
assert.match(styles, /\.arco-select-popup \.arco-select-option/);
assert.match(styles, /height: 48px/);
assert.doesNotMatch(view, /const fieldClass = '[^']*focus:/);

const inputWrapper = '.teacher-school-autocomplete .arco-input-inner-wrapper';
const inputAppearance = postcss.parse(styles).nodes.find(rule =>
  rule.type === 'rule' && rule.selectors.includes(`${inputWrapper}.arco-input-inner-wrapper-focus`),
);
assert.ok(inputAppearance, '学校输入框需要覆盖 Arco 聚焦样式');
for (const selector of [inputWrapper, `${inputWrapper}:hover`, `${inputWrapper}:focus`]) {
  assert.ok(inputAppearance.selectors.includes(selector), '学校输入框在所有交互状态下应使用同一套样式');
}
for (const [property, value] of [
  ['border-color', 'var(--tm-input-border)'],
  ['background', 'var(--tm-input-bg)'],
  ['box-shadow', 'none'],
]) {
  const declaration = inputAppearance.nodes.find(node => node.type === 'decl' && node.prop === property);
  assert.equal(declaration?.value, value);
  assert.equal(declaration.important, true, `${property} 应覆盖全局后台样式`);
}

console.log('TeacherProfileSetupView onboarding assertions passed');
