import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./MobileGradePickerSheet.tsx', import.meta.url), 'utf8');
const bottomSheet = fs.readFileSync(new URL('./MobileBottomSheet.tsx', import.meta.url), 'utf8');
const classList = fs.readFileSync(new URL('../../views/ClassListView.tsx', import.meta.url), 'utf8');
const leaderboard = fs.readFileSync(new URL('../../views/ClassLeaderboardView.tsx', import.meta.url), 'utf8');
const profile = fs.readFileSync(new URL('../../views/TeacherProfileEditView.tsx', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8');
const inventoryDemo = fs.readFileSync(new URL('../../../components/ComponentReuseDemo.tsx', import.meta.url), 'utf8');
const publicComponentsDemo = fs.readFileSync(new URL('../../../components/PublicComponentsDemo.tsx', import.meta.url), 'utf8');
const inventory = fs.readFileSync(new URL('../../../public/demos/component-reuse-inventory.html', import.meta.url), 'utf8');
const teacherMobileGuidelines = fs.readFileSync(new URL('../../../design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md', import.meta.url), 'utf8');
const teacherMobileTokens = fs.readFileSync(new URL('../../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');

for (const required of [
  'export interface MobileGradePickerOption',
  "export type MobileGradeStage = '小学' | '初中' | '高中'",
  'stage?: MobileGradeStage',
  'showStageName?: boolean',
  'showClearButton?: boolean',
  'MobileBottomSheet',
  "selectionMode?: 'single'",
  "selectionMode: 'multiple'",
  'onConfirm: (values: string[]) => void',
  'onClose();',
  'footerDivider={false}',
  'showHandle={false}',
  'h-[var(--tm-choice-pill-touch-height)]',
  'justify-center rounded-[var(--tm-choice-pill-radius)] text-center',
  'grid grid-cols-3 gap-x-[var(--tm-space-3)] gap-y-[var(--tm-space-1)]',
  'h-[var(--tm-choice-pill-visible-height)]',
  'rounded-[var(--tm-choice-pill-radius)]',
  'border-[var(--tm-choice-pill-selected-border)] bg-[var(--tm-choice-pill-selected-bg)]',
  'text-[var(--tm-choice-pill-selected-text)]',
  'border-[var(--tm-choice-pill-default-border)] bg-[var(--tm-choice-pill-default-bg)]',
  'text-[var(--tm-choice-pill-default-text)]',
  'showClearButton &&',
  'size="content"',
  'disabled={selectedCount === 0}',
  'if (selectedCount === 0) return;',
  'aria-pressed={selected}',
]) {
  assert.ok(source.includes(required), `公共年级选择弹窗缺少：${required}`);
}

for (const [name, file] of [['班级列表', classList], ['班级排行榜', leaderboard], ['教师资料', profile], ['报告生成', app]]) {
  assert.match(file, /MobileGradePickerSheet/, `${name}应接入公共年级选择弹窗`);
}

assert.match(profile, /selectionMode="multiple"/);
assert.match(profile, /showClearButton/);
assert.match(inventoryDemo, /src="\/demos\/component-reuse-inventory\.html"/);
assert.doesNotMatch(inventoryDemo, /MobileGradePickerSheet/);
assert.match(publicComponentsDemo, /MobileGradePickerSheet/);
assert.match(publicComponentsDemo, /年级选择弹窗/);
assert.match(publicComponentsDemo, /stage: '小学'/);
assert.match(publicComponentsDemo, /stage: '初中'/);
assert.match(publicComponentsDemo, /stage: '高中'/);
assert.match(publicComponentsDemo, /showStageName/);
assert.match(publicComponentsDemo, /showClearButton/);
assert.match(publicComponentsDemo, /gradePreviewMode/);
assert.match(publicComponentsDemo, /updateGradePreviewMode/);
assert.match(publicComponentsDemo, /显示学段分组/);
assert.match(publicComponentsDemo, /显示清空操作/);
assert.match(publicComponentsDemo, /<div className="mt-3 flex flex-col gap-1">[\s\S]*显示学段分组[\s\S]*显示清空操作/);
assert.match(publicComponentsDemo, /selectionMode="single"/);
assert.match(publicComponentsDemo, /selectionMode="multiple"/);
assert.match(publicComponentsDemo, /gradeSheetVisible/);
assert.match(publicComponentsDemo, /打开年级选择器/);
assert.match(publicComponentsDemo, /onClose=\{\(\) => updateGradeSheetVisible\(false\)\}/);
assert.doesNotMatch(publicComponentsDemo, /size="full"/);
assert.doesNotMatch(source, /size\?: 'content' \| 'tall' \| 'full'/);
assert.doesNotMatch(publicComponentsDemo, /\['size'/);
assert.match(publicComponentsDemo, /PhoneMockup/);
assert.match(publicComponentsDemo, /showDeviceFrame/);
assert.match(publicComponentsDemo, /screenOverlayRootId="teacher-mobile-overlay-root"/);
assert.match(publicComponentsDemo, /核心入参/);
assert.match(publicComponentsDemo, /当前操作人可见的年级列表/);
assert.match(publicComponentsDemo, /数据与权限边界/);
assert.match(publicComponentsDemo, /组件不接收操作人身份/);
assert.doesNotMatch(publicComponentsDemo, /pickerOpen|setPickerOpen|setGrade|ChevronDown/);
assert.doesNotMatch(source, /<Check|from 'lucide-react'/);
assert.doesNotMatch(source, /selectedCount > 0 \? `（\$\{selectedCount\}）`/);
assert.doesNotMatch(source, /showClearButton && selectedCount > 0/);
assert.match(inventory, /id="grade-picker"/);
assert.match(inventory, /MobileGradePickerSheet/);
assert.match(teacherMobileGuidelines, /MobileGradePickerSheet[\s\S]*固定每行三项/);
assert.match(teacherMobileGuidelines, /胶囊可见高度为 44 像素[\s\S]*使用全圆角与居中文案/);
assert.match(teacherMobileGuidelines, /选中态[\s\S]*不显示勾选图标/);
assert.match(teacherMobileGuidelines, /默认按内容自适应高度/);
assert.match(teacherMobileGuidelines, /开启清空能力后[\s\S]*当前没有已选年级时进入禁用态/);
assert.match(teacherMobileGuidelines, /胶囊可见高度为 44 像素[\s\S]*外层触控高度为 48 像素/);
assert.match(teacherMobileGuidelines, /--tm-choice-pill-\*/);

for (const [token, value] of [
  ['--tm-choice-pill-touch-height', '48px'],
  ['--tm-choice-pill-visible-height', '44px'],
  ['--tm-choice-pill-radius', '9999px'],
  ['--tm-choice-pill-default-bg', 'var(--tm-bg-surface)'],
  ['--tm-choice-pill-default-text', 'var(--tm-text-secondary)'],
  ['--tm-choice-pill-selected-bg', 'var(--tm-brand-primary-soft)'],
  ['--tm-choice-pill-selected-border', 'var(--tm-brand-primary)'],
  ['--tm-choice-pill-default-border', 'var(--tm-border-subtle)'],
  ['--tm-choice-pill-selected-text', 'var(--tm-brand-primary)'],
]) {
  assert.ok(teacherMobileTokens.includes(`'${token}': '${value}'`), `缺少通用选择胶囊 Token：${token}`);
}

assert.doesNotMatch(teacherMobileTokens, /'--tm-choice-pill-default-border': teacherBrandPalette\.neutral\[300\]/);

const optionButtonSource = source.slice(source.indexOf('const optionButtonClass'), source.indexOf('const MobileGradePickerSheet'));
const confirmButtonSource = source.slice(source.indexOf('onClick={handleConfirm}'), source.indexOf('</button>', source.indexOf('onClick={handleConfirm}')));
const clearButtonSource = source.slice(source.indexOf('onClick={handleClear}'), source.indexOf('</button>', source.indexOf('onClick={handleClear}')));
const sheetCloseButtonSource = bottomSheet.slice(bottomSheet.lastIndexOf('onClick={onClose}'), bottomSheet.indexOf('</button>', bottomSheet.lastIndexOf('onClick={onClose}')));
const classGradeTriggerSource = classList.slice(classList.indexOf('aria-label="按年级筛选班级"'), classList.indexOf('</button>', classList.indexOf('aria-label="按年级筛选班级"')));
const leaderboardGradeTriggerSource = leaderboard.slice(leaderboard.indexOf('aria-label="班级排行榜年级筛选"'), leaderboard.indexOf('</button>', leaderboard.indexOf('aria-label="班级排行榜年级筛选"')));
assert.doesNotMatch(optionButtonSource, /active:scale|active:bg/);
assert.doesNotMatch(confirmButtonSource, /active:|transition-/);
assert.doesNotMatch(clearButtonSource, /active:|transition-/);
assert.doesNotMatch(sheetCloseButtonSource, /active:bg|transition-/);
assert.doesNotMatch(classGradeTriggerSource, /active:scale|active:bg/);
assert.doesNotMatch(leaderboardGradeTriggerSource, /active:scale|active:bg/);
assert.match(bottomSheet, /const \[rendered, setRendered\] = useState\(open\)/, '公共底部弹窗需要保留退出动画期间的 DOM。');
assert.match(bottomSheet, /translate-y-full opacity-0/, '公共底部弹窗关闭时应向下退出。');
assert.match(bottomSheet, /translate-y-0 opacity-100/, '公共底部弹窗打开时应滑入并显示。');
assert.match(bottomSheet, /transition-\[transform,opacity\]/, '公共底部弹窗应只过渡位移和透明度。');
assert.match(bottomSheet, /prefers-reduced-motion/, '公共底部弹窗应尊重减少动态效果设置。');
assert.match(bottomSheet, /secondFrame = window\.requestAnimationFrame/, '公共底部弹窗打开时应保留一帧隐藏态，避免视觉上瞬间出现。');
assert.match(bottomSheet, /--tm-duration-sheet-enter/, '公共底部弹窗打开动效应使用独立的 350 毫秒令牌。');
assert.match(teacherMobileTokens, /'--tm-duration-sheet-enter': '350ms'/, '公共底部弹窗打开动效应为 350 毫秒。');
assert.match(publicComponentsDemo, /!gradeSheetVisible/, '多选年级弹窗关闭后也应保留重新打开入口。');

console.log('MobileGradePickerSheet integration assertions passed.');
