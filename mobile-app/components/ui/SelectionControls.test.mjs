import assert from 'node:assert/strict';
import fs from 'node:fs';

const compactSource = fs.readFileSync(new URL('./CompactSegmentedControl.tsx', import.meta.url), 'utf8');
const pillSource = fs.readFileSync(new URL('./PillSelectionControl.tsx', import.meta.url), 'utf8');
const textSource = fs.readFileSync(new URL('./TextSelectionControl.tsx', import.meta.url), 'utf8');
const tokenSource = fs.readFileSync(new URL('../../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');
const guidelineSource = fs.readFileSync(new URL('../../../design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md', import.meta.url), 'utf8');

for (const required of [
  'h-[var(--tm-selection-touch-height)]',
  'min-h-[var(--tm-selection-touch-height)]',
  'h-[var(--tm-selection-segment-visible-height)]',
  'bg-[var(--tm-selection-segment-track-bg)]',
  'bg-[var(--tm-selection-segment-active-bg)] text-[var(--tm-selection-segment-active-text)] [box-shadow:var(--tm-selection-segment-active-shadow)]',
  'text-[var(--tm-selection-segment-inactive-text)]',
  "role={semantics === 'tabs' ? 'tablist' : 'group'}",
  "aria-selected={semantics === 'tabs' ? selected : undefined}",
  "aria-pressed={semantics === 'group' ? selected : undefined}",
]) {
  assert.ok(compactSource.includes(required), `紧凑分段控件缺少结构或状态约束：${required}`);
}

for (const required of [
  'min-h-[var(--tm-selection-touch-height)]',
  "? 'font-semibold text-[var(--tm-selection-text-active)]'",
  "'text-[var(--tm-selection-text-inactive)]'",
  "role={semantics === 'tabs' ? 'tablist' : 'group'}",
  "aria-selected={semantics === 'tabs' ? selected : undefined}",
  "aria-pressed={semantics === 'group' ? selected : undefined}",
]) {
  assert.ok(textSource.includes(required), `仅文字选择控件缺少结构或状态约束：${required}`);
}

for (const forbidden of [
  "? 'bg-[var(--tm-brand-primary-soft)]",
  "? 'bg-[var(--tm-bg-surface)]",
  'box-shadow',
]) {
  assert.equal(textSource.includes(forbidden), false, `仅文字选中态不得使用底色或阴影：${forbidden}`);
}

for (const required of [
  'min-h-[var(--tm-selection-touch-height)]',
  'min-w-[var(--tm-selection-pill-min-width)]',
  'h-[var(--tm-selection-pill-visible-height)]',
  'rounded-[var(--tm-selection-pill-radius)]',
  'border-[var(--tm-selection-pill-active-border)] bg-[var(--tm-selection-pill-active-bg)] text-[var(--tm-selection-pill-active-text)] active:bg-[var(--tm-selection-pill-pressed-bg)]',
  'border-[var(--tm-selection-pill-inactive-border)] bg-[var(--tm-selection-pill-inactive-bg)] text-[var(--tm-selection-pill-inactive-text)] active:bg-[var(--tm-selection-pill-inactive-pressed-bg)]',
  "role={semantics === 'tabs' ? 'tablist' : 'group'}",
  "aria-selected={semantics === 'tabs' ? selected : undefined}",
  "aria-pressed={semantics === 'group' ? selected : undefined}",
]) {
  assert.ok(pillSource.includes(required), `胶囊筛选控件缺少结构、边框或状态约束：${required}`);
}

assert.equal(pillSource.includes('[box-shadow:'), false, '胶囊筛选控件不得通过阴影增强选中层级。');

for (const [token, value] of [
  ['--tm-selection-touch-height', 'var(--tm-size-touch)'],
  ['--tm-selection-segment-visible-height', '36px'],
  ['--tm-selection-segment-track-bg', 'var(--tm-bg-surface-muted)'],
  ['--tm-selection-segment-active-bg', 'var(--tm-bg-surface)'],
  ['--tm-selection-segment-active-text', 'var(--tm-brand-primary)'],
  ['--tm-selection-segment-inactive-text', 'var(--tm-text-secondary)'],
  ['--tm-selection-segment-active-shadow', 'var(--tm-shadow-control)'],
  ['--tm-selection-text-active', 'var(--tm-brand-primary)'],
  ['--tm-selection-text-inactive', 'var(--tm-text-secondary)'],
  ['--tm-selection-pill-visible-height', '32px'],
  ['--tm-selection-pill-min-width', '60px'],
  ['--tm-selection-pill-radius', '8px'],
  ['--tm-selection-pill-active-bg', 'var(--tm-brand-primary)'],
  ['--tm-selection-pill-active-border', 'var(--tm-brand-primary)'],
  ['--tm-selection-pill-active-text', 'var(--tm-text-inverse)'],
  ['--tm-selection-pill-inactive-bg', 'var(--tm-bg-surface)'],
  ['--tm-selection-pill-inactive-border', 'var(--tm-border-subtle)'],
  ['--tm-selection-pill-inactive-text', 'var(--tm-text-secondary)'],
  ['--tm-selection-pill-pressed-bg', 'var(--tm-brand-primary-pressed)'],
  ['--tm-selection-pill-inactive-pressed-bg', 'var(--tm-bg-surface-soft)'],
]) {
  assert.ok(tokenSource.includes(`'${token}': '${value}'`), `选择控件缺少组件 Token：${token}`);
}

for (const forbidden of ['--tm-brand-primary-strong', 'h-8', 'min-w-[60px]', 'rounded-[8px]']) {
  assert.equal(
    compactSource.includes(forbidden) || textSource.includes(forbidden) || pillSource.includes(forbidden),
    false,
    `共享选择控件不得绕过组件 Token：${forbidden}`,
  );
}

for (const required of [
  '多组切换控件连续出现时，视觉强度必须逐级下降',
  '不得使用偏深的 `--tm-brand-primary-strong` 代替普通 Tab',
  '问卷采集详情是页面级例外',
  '答卷状态无论为两项还是三项，都必须单行等分',
  '业务页面只选择共享组件及其语义参数',
]) {
  assert.ok(guidelineSource.includes(required), `教师手机端规范缺少选择控件约束：${required}`);
}

console.log('Selection controls tests passed.');
