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

assert.ok(classListSource.includes('min-h-5 items-center text-[13px] font-[450] text-[var(--tm-text-secondary)]'), '班级卡片应紧凑展示年级和人数。');
assert.ok(classListSource.includes('text-lg font-[550] text-[var(--tm-text-primary)]'), '班级名称应使用550字重。');
assert.ok(classListSource.includes('text-[13px] font-[450] text-[var(--tm-text-secondary)]'), '年级和人数信息应使用450字重。');
assert.ok(classListSource.includes('bg-[var(--tm-brand-primary-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--tm-brand-primary)]'), '班主任和副班主任应使用浅品牌红背景及品牌红文字标签。');
assert.ok(classListSource.includes('bg-[var(--tm-brand-secondary-soft)] px-2 py-0.5 text-[11px] tm-font-regular text-[var(--tm-brand-secondary)]'), '任教科目应使用浅橙背景及橙色文字标签。');
assert.ok(classListSource.includes("hasRelationshipTags ? 'min-h-[var(--tm-class-list-card-min-height)]' : 'min-h-[var(--tm-class-list-card-compact-min-height)]'"), '无任教关系的班级卡片应使用更紧凑的高度。');
assert.equal((classListSource.match(/text-sm font-medium text-\[var\(--tm-text-secondary\)\] transition-colors active:bg-\[var\(--tm-bg-surface-soft\)\]/g) ?? []).length, 2, '学生列表和班级报告应统一使用#6D6764次级文字颜色。');
assert.equal((classListSource.match(/className="h-\[var\(--tm-class-list-action-icon-size\)\] w-\[var\(--tm-class-list-action-icon-size\)\] text-\[var\(--tm-brand-primary\)\] \[stroke-width:2\.2\]"/g) ?? []).length, 2, '两个按钮图标应统一使用明亮的品牌红和略粗线条。');
assert.equal((classListSource.match(/h-\[var\(--tm-class-list-action-icon-size\)\]/g) ?? []).length, 2, '两个按钮图标应使用统一的文案匹配尺寸。');
assert.ok(classListSource.includes('className="relative min-w-0 flex-1 pr-10"'), '卡片上方信息区应吸收剩余空间。');
assert.ok(classListSource.includes('h-[var(--tm-class-list-card-action-content-height)]'), '卡片底部操作内容区应按48像素空间收紧。');
assert.ok(!classListSource.includes('onClick={() => copyClassCode(classInfo)}'), '班级卡片不应常驻班级号复制入口。');
assert.ok(classListSource.includes('copyClassCode(activeActionClass)'), '班级号复制入口应收进更多操作抽屉。');

assert.ok(classListSource.includes("message: '班级号已复制', success: true"), '复制成功必须提供明确反馈。');
assert.ok(classListSource.includes("message: '复制失败，请重试', success: false"), '复制失败必须提供可操作反馈。');
assert.ok(classListSource.includes('role="status"'), '复制结果应提供读屏状态语义。');
assert.ok(classListSource.includes('aria-live="polite"'), '复制结果应在不打断用户的情况下播报。');

assert.ok(classListSource.includes('onClick={() => onViewClassReport(classInfo.id)}'), '班级报告应继续在班级卡片外层直接进入。');
assert.ok(guidelinesSource.includes('学生列表和班级报告均为班级卡片的常用入口'), '教师手机端规范应同步记录卡片操作层级。');

console.log('ClassListView card content and action hierarchy assertions passed');
