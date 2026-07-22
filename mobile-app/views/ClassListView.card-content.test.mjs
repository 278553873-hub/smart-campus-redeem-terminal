import assert from 'node:assert/strict';
import fs from 'node:fs';

const classListSource = fs.readFileSync(new URL('./ClassListView.tsx', import.meta.url), 'utf8');
const typesSource = fs.readFileSync(new URL('../types.ts', import.meta.url), 'utf8');
const guidelinesSource = fs.readFileSync(new URL('../../design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md', import.meta.url), 'utf8');

assert.ok(typesSource.includes('deputyHomeroomClassIds?: string[];'), '教师资料应支持副班主任班级关系。');
assert.ok(classListSource.includes("isDeputyHeadTeacher ? '副班主任'"), '班级卡片应根据教师关系展示副班主任标签。');
assert.ok(classListSource.includes('subjectTags.map(tag => ('), '班级卡片应完整展示教师的多个任教学科。');
assert.ok(classListSource.includes('{hasRelationshipTags && ('), '无任教关系的班级不应保留空标签区。');
assert.ok(classListSource.includes('...deputyHomeroomClassIds'), '任教班级筛选应包含副班主任班级。');

assert.ok(classListSource.includes('gap-y-1 text-[13px] text-[var(--tm-text-secondary)]'), '年级、人数和班级号应共享13像素元信息字号。');
assert.ok(!classListSource.includes('gap-y-1 border-b border-[var(--tm-border-subtle)]'), '卡片元信息与操作区之间不应使用横线分割。');
assert.ok(classListSource.includes('px-2 text-[13px] font-normal'), '班级号标签应与左侧元信息字号一致。');

assert.ok(classListSource.includes("message: '班级号已复制', success: true"), '复制成功必须提供明确反馈。');
assert.ok(classListSource.includes("message: '复制失败，请重试', success: false"), '复制失败必须提供可操作反馈。');
assert.ok(classListSource.includes('role="status"'), '复制结果应提供读屏状态语义。');
assert.ok(classListSource.includes('aria-live="polite"'), '复制结果应在不打断用户的情况下播报。');

assert.ok(classListSource.includes('bg-[var(--tm-brand-primary-soft)] text-sm font-semibold text-[var(--tm-brand-primary)]'), '学生列表应使用品牌主入口样式。');
assert.ok(classListSource.includes('bg-[var(--tm-bg-surface-soft)] text-sm font-semibold text-[var(--tm-text-primary)]'), '班级报告应使用中性次入口样式。');
assert.ok(guidelinesSource.includes('学生列表是班级卡片的高频主要入口'), '教师手机端规范应同步记录卡片操作层级。');

console.log('ClassListView card content and action hierarchy assertions passed');
