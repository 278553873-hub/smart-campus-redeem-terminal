import assert from 'node:assert/strict';
import fs from 'node:fs';

const sheet = fs.readFileSync(new URL('./MobileClassPickerSheet.tsx', import.meta.url), 'utf8');
const cascade = fs.readFileSync(new URL('./MobileClassCascadePicker.tsx', import.meta.url), 'utf8');
const publicDemo = fs.readFileSync(new URL('../../../components/PublicComponentsDemo.tsx', import.meta.url), 'utf8');
const guidelines = fs.readFileSync(new URL('../../../design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md', import.meta.url), 'utf8');

for (const required of [
  'export interface MobileClassSubjectOption',
  'export interface MobileClassPickerSingleValue',
  'MobileBottomSheet',
  'MobileClassCascadePicker',
  'MobileClassSubjectSelectionMode',
  'MobileClassSubjectValue',
  "selectionMode?: 'single'",
  "selectionMode: 'multiple'",
  "commitMode?: 'immediate' | 'confirm'",
  'showEducationStagePrefix?: boolean',
  'showGradeSelectAll?: boolean',
  'showClearButton?: boolean',
  'showAllClassesOption?: boolean',
  'subjectOptions?: ReadonlyArray<MobileClassSubjectOption>',
  'subjectSelectionMode?: MobileClassSubjectSelectionMode',
  'subjectValue?: string | ReadonlyArray<string>',
  'subjectRequired?: boolean',
  'onConfirm: (values: string[], subjectValue?: MobileClassSubjectValue) => void',
  'hasSubjectPicker &&',
  "hasSubjectPicker ? 'h-[280px]' : 'h-[min(420px,56dvh)]'",
  'disabled={clearDisabled}',
  'showHandle={false}',
]) {
  assert.ok(sheet.includes(required), `公共班级选择弹窗缺少：${required}`);
}

for (const required of [
  'grid-cols-[92px_1fr]',
  'hideGradeRailWhenSingleGroup',
  'h-[var(--tm-choice-pill-touch-height)] w-full',
  'min-h-[52px]',
  'border-[var(--tm-border-subtle)]',
  'text-[var(--tm-brand-primary)]',
  'before:bg-[var(--tm-brand-primary)]',
  'text-[length:var(--tm-font-size-body)]',
  'rounded-full border',
  "rounded-[6px] border",
  'showEducationStagePrefix',
  'allClassesSelected',
  'allClassesMixed',
  'onToggleAllClasses',
]) {
  assert.ok(cascade.includes(required), `公共班级级联控件缺少：${required}`);
}

assert.doesNotMatch(cascade, /active:scale|active:bg|transition-all/);
assert.doesNotMatch(sheet, /active:scale|active:bg/);
assert.doesNotMatch(cascade, /bg-\[var\(--tm-brand-primary\)\] text-\[var\(--tm-text-inverse\)\] \[box-shadow:var\(--tm-shadow-icon\)\]/);
assert.doesNotMatch(cascade, /selectedClassId === 'all'/);
assert.match(cascade, /multipleProps\?\.showAllClassesOption/);
assert.doesNotMatch(cascade.slice(cascade.indexOf('interface MobileClassCascadeSingleProps'), cascade.indexOf('export type MobileClassCascadePickerProps')), /showAllClassesOption/);

for (const required of [
  'MobileClassPickerSheet',
  '班级选择弹窗',
  '显示任教学科',
  '显示小初高学段前缀',
  '显示全部班级',
  '显示全选本年级',
  'subjectSelectionMode',
  'subjectOptions={showSubjectPicker ? subjectOptions : undefined}',
  'subjectRequired={showSubjectPicker && subjectRequiredPreview}',
  '数据与权限边界',
  '当前操作人可见的年级及班级',
  'PhoneMockup',
  'showDeviceFrame',
]) {
  assert.ok(publicDemo.includes(required), `公共组件页缺少班级选择器说明或预览：${required}`);
}

assert.match(guidelines, /MobileClassPickerSheet[\s\S]*左侧年级导航、右侧班级列表/);
assert.match(guidelines, /subjectOptions[\s\S]*未传入学科选项时不得保留标题或空白区域/);
assert.match(guidelines, /单选只允许选择具体班级，不展示“全部年级”或“全部班级”选项/);
assert.match(guidelines, /showEducationStagePrefix[\s\S]*小2025级1班/);
assert.match(guidelines, /subjectSelectionMode[\s\S]*控制单选或多选/);
assert.match(
  guidelines,
  /左栏年级只承担导航作用，统一使用透明列表项[\s\S]*当前年级使用品牌文字和细主题色侧标识定位，不使用圆角矩形选中底/,
);

console.log('MobileClassPickerSheet assertions passed.');
