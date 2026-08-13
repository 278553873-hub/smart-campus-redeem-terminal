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

assert.ok(classListSource.includes('min-h-8 items-center text-[13px] text-[var(--tm-text-secondary)]'), '班级卡片应紧凑展示年级和人数。');
assert.ok(!classListSource.includes('onClick={() => copyClassCode(classInfo)}'), '班级卡片不应常驻班级号复制入口。');
assert.ok(classListSource.includes('copyClassCode(activeActionClass)'), '班级号复制入口应收进更多操作抽屉。');

assert.ok(classListSource.includes("message: '班级号已复制', success: true"), '复制成功必须提供明确反馈。');
assert.ok(classListSource.includes("message: '复制失败，请重试', success: false"), '复制失败必须提供可操作反馈。');
assert.ok(classListSource.includes('role="status"'), '复制结果应提供读屏状态语义。');
assert.ok(classListSource.includes('aria-live="polite"'), '复制结果应在不打断用户的情况下播报。');

assert.ok(classListSource.includes('bg-[var(--tm-brand-primary-soft)] text-sm font-semibold text-[var(--tm-brand-primary)]'), '学生列表应使用品牌主入口样式。');
assert.ok(classListSource.includes('bg-[var(--tm-bg-surface-soft)] text-sm font-semibold text-[var(--tm-text-primary)]'), '班级报告应保留中性常用入口样式。');
assert.ok(classListSource.includes('onClick={() => onViewClassReport(classInfo.id)}'), '班级报告应继续在班级卡片外层直接进入。');
assert.ok(guidelinesSource.includes('学生列表和班级报告均为班级卡片的常用入口'), '教师手机端规范应同步记录卡片操作层级。');

console.log('ClassListView card content and action hierarchy assertions passed');
