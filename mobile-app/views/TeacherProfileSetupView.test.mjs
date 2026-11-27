import assert from 'node:assert/strict';
import fs from 'node:fs';

const view = fs.readFileSync('mobile-app/views/TeacherProfileSetupView.tsx', 'utf8');
const app = fs.readFileSync('mobile-app/App.tsx', 'utf8');
const demo = fs.readFileSync('App.tsx', 'utf8');
const schoolAccess = fs.readFileSync('mobile-app/views/TeacherSchoolAccessView.tsx', 'utf8');

assert.match(schoolAccess, /个人版（免费试用）/);
assert.doesNotMatch(schoolAccess, /个人版（试用）/);

assert.ok(app.includes("import TeacherProfileSetupView from './views/TeacherProfileSetupView'"));
assert.ok(app.includes("session?.spaceId === 'personal'"));
assert.ok(app.includes('if (personalProfileSetup) {'));
assert.match(app, /onSubmit={handlePersonalProfileSubmit}/);
assert.match(app, /const visible = isAuthenticated && !personalProfileSetup[\s\S]*?onGradientPreviewVisibilityChange\?\.\(visible\)/);
assert.doesNotMatch(app, /onProfileSetupVisibilityChange/);
assert.doesNotMatch(demo, /showTeacherProfileSetupPreview|完善信息预览设置/);

assert.match(view, /<MobilePageHeader title="完善信息" onBack=\{onBack\}/);
assert.match(view, />姓名</);
assert.match(view, />学校</);
assert.match(view, /placeholder="请输入姓名"/);
assert.match(view, /<input\s+id=\{schoolId\}[\s\S]*?autoComplete="off"[\s\S]*?placeholder="请输入学校名称"/);
assert.match(view, /填写学校后，可更快找到同校老师创建的班级/);
assert.match(view, /<MobileFormActionBar type="submit" label="进入体验" disabled=\{!canSubmit\}/);
assert.doesNotMatch(view, /填写姓名和学校，即可开始个人版体验/); // 不必再展示引导句
assert.match(view, /<form[^\n]*bg-\[var\(--tm-page-plain-content-bg\)\]/);
assert.match(view, /const fieldCardClass = '[^']*--tm-form-card-radius[^']*bg-\[var\(--tm-bg-surface\)\]/);
assert.match(view, /const canSubmit = Boolean\(trimmedName && trimmedSchoolName\)/);
assert.match(view, /if \(!canSubmit\) return;\s+onSubmit\({ name: trimmedName, schoolName: trimmedSchoolName }\)/);
assert.doesNotMatch(view, /#[0-9A-Fa-f]{6}|rgba\(/);

assert.doesNotMatch(view, /<AutoComplete|teacherSchoolDirectory|该学校已启用试用|<MobileBottomSheet/);
assert.doesNotMatch(view, /const fieldClass = '[^']*focus:/);

console.log('TeacherProfileSetupView onboarding assertions passed');
