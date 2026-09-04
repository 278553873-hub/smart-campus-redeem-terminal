import assert from 'node:assert/strict';
import fs from 'node:fs';

const classListSource = fs.readFileSync(new URL('./ClassListView.tsx', import.meta.url), 'utf8');
const tokenSource = fs.readFileSync(new URL('../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');
const phoneMockupSource = fs.readFileSync(new URL('../../components/PhoneMockup.tsx', import.meta.url), 'utf8');
const guidelineSource = fs.readFileSync(new URL('../../design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md', import.meta.url), 'utf8');
const slidingSegmentedSource = fs.readFileSync(new URL('../components/ui/MobileSlidingSegmentedControl.tsx', import.meta.url), 'utf8');

assert.ok(
  classListSource.includes('[padding-right:var(--mini-program-capsule-right-inset,0px)]'),
  '顶部页签行必须消费微信胶囊右侧安全区。',
);
assert.ok(
  classListSource.includes('h-[var(--mini-program-title-bar-height,44px)] items-center [padding-right:var(--mini-program-capsule-right-inset,0px)]'),
  '顶部页签行必须使用微信标题栏高度，并让页签上下居中。',
);
assert.ok(!classListSource.includes('ClassSourceTrigger'), '班级页顶部不得保留来源切换。');
const titleBarStart = classListSource.indexOf('h-[var(--mini-program-title-bar-height,44px)] items-center');
const titleBarEnd = classListSource.indexOf("activeListTab === 'class' && canManagePersonal");
const titleBarSource = classListSource.slice(titleBarStart, titleBarEnd);
assert.ok(titleBarStart >= 0 && titleBarEnd > titleBarStart, '应能识别班级页标题栏。');
assert.ok(titleBarSource.includes('<MobileSlidingSegmentedControl'), '班级与社团页签必须位于标题栏，并使用公共滑块控件。');
assert.ok(titleBarSource.includes('ariaLabel="班级内容分类"'), '班级与社团页签必须保留明确的无障碍名称。');
assert.ok(titleBarSource.includes('w-[192px]'), '顶部页签应在接近记录对象切换尺寸的同时，为“社团与团队”保留舒适宽度。');
assert.ok(slidingSegmentedSource.includes('bg-[var(--tm-bg-surface-glass)]'), '顶部页签底轨应沿用记录对象切换的轻玻璃样式，不得铺灰色底。');
assert.ok(titleBarSource.includes('bg-[var(--tm-record-student-soft)]'), '班级选中态应使用记录页同源的暖色弱底。');
assert.ok(titleBarSource.includes('bg-[var(--tm-record-class-soft)]'), '社团与团队选中态应使用记录页同源的青色弱底。');
assert.ok(!titleBarSource.includes('--tm-selection-segment-track-bg'), '顶部页签不得继续使用通用灰色分段控件底轨。');
assert.ok(slidingSegmentedSource.includes('transition-[transform,background-color] [transition-duration:220ms]'), '选中滑块必须通过可中断的位移与颜色过渡完成切换。');
assert.ok(slidingSegmentedSource.includes('motion-reduce:transition-none'), '选中滑块必须尊重系统减少动态效果设置。');
assert.ok(!classListSource.includes('aria-label="打开班级操作"'), '标题栏不得继续放置添加班级按钮。');
assert.ok(classListSource.includes('班级管理'), '个人来源应在标题栏下方提供语义明确的班级管理入口。');
assert.ok(!classListSource.includes('<MobileFloatingCreateButton'), '班级页不得使用语义不完整的悬浮加号。');
assert.ok(
  classListSource.includes("addDemoTopBreathingSpace ? 'pt-5' : 'pt-0'"),
  '真实手机效果下不得在状态栏后额外增加顶部留白。',
);
assert.ok(
  !classListSource.includes("addDemoTopBreathingSpace ? 'pt-5' : 'pt-3'"),
  '班级页不得继续通过 12 像素补白将标题栏控件整体下移。',
);
assert.ok(
  classListSource.includes('flex min-h-11 items-center justify-between gap-2 max-[359px]:flex-wrap'),
  '学校来源的筛选区应使用单行弹性布局，让左侧筛选条件与右侧排行榜保持两端对齐。',
);
assert.ok(!classListSource.includes("isSchoolSpace ? 'space-y-3' : 'space-y-0'"), '班级页筛选行应紧接标题栏，不额外增加12像素间距。');
assert.ok(classListSource.includes('任教班级'), '筛选文案应精简为“任教班级”。');
assert.ok(classListSource.includes('className="inline-flex min-h-11 shrink-0 items-center justify-self-end'), '排行榜入口应固定在筛选区第一行右侧，并保留完整触控高度。');
assert.ok(classListSource.includes('aria-label="查看班级排行榜"'), '排行榜入口必须保留完整读屏名称。');
assert.ok(classListSource.includes('text-[var(--tm-brand-primary)]'), '排行榜入口应使用标准品牌色文字建立重要操作识别。');
assert.ok(classListSource.includes('pb-[calc(var(--teacher-tabbar-height,66px)'), '班级列表底部只需为底部导航预留滚动空间。');
assert.ok(!classListSource.includes('<MobileFloatingImageButton'), '排行榜不应继续使用中部悬浮图片入口。');
assert.ok(!classListSource.includes('TrophyIcon'), '班级列表不应继续使用奖杯线性图标。');
const toolbarStart = classListSource.indexOf("{activeListTab === 'class' && isSchoolSpace && (");
const toolbarEnd = classListSource.indexOf('{visibleClasses.map(renderClassCard)}');
const toolbarSource = classListSource.slice(toolbarStart, toolbarEnd);
assert.ok(toolbarStart >= 0 && toolbarEnd > toolbarStart, '应能识别学校版筛选工具行。');
assert.ok(!toolbarSource.includes('ring-[var(--tm-border-subtle)]'), '年级、任教班级与排行榜不应使用常驻外边框。');
assert.ok(toolbarSource.includes('aria-haspopup="dialog"'), '年级筛选应通过底部弹窗展示选项。');
assert.ok(toolbarSource.includes('showGradeFilter'), '年级筛选应维护底部弹窗打开状态。');
assert.ok(toolbarSource.includes('inline-flex min-h-11 w-[96px] shrink-0 items-center gap-['), '年级筛选触发器应使用可容纳“全部年级”的固定宽度，并保留完整触控高度。');
assert.ok(toolbarSource.includes('gap-[var(--tm-space-1)]'), '年级文字与下拉箭头应使用最小基础间距紧邻排列。');
assert.ok(!toolbarSource.includes('absolute right-3 top-1/2'), '年级箭头不得继续跟随整列宽度靠右定位。');
assert.ok(toolbarSource.includes('bg-transparent px-2.5'), '任教班级应保持透明，只通过勾选框表达状态。');
assert.ok(!toolbarSource.includes('[box-shadow:var(--tm-shadow-control)]'), '年级与任教班级筛选不得继续使用实体控件阴影。');
assert.ok(toolbarSource.includes("gradeFilter === '全部' ? '全部年级' : gradeFilter"), '年级筛选默认文案应明确展示“全部年级”。');
assert.ok(toolbarSource.includes('{visibleClasses.length}个班级'), '筛选行最右侧应展示当前可见班级数量。');
assert.ok(toolbarSource.includes('aria-live="polite"'), '班级数量变化应提供克制的动态读屏反馈。');
assert.ok(toolbarSource.includes('block h-[18px] whitespace-nowrap pl-3 text-[12px]'), '班级统计应使用18像素普通信息行，不再单独占用44像素触控行。');
assert.ok(!toolbarSource.includes('grid-rows-[44px_44px]'), '紧凑筛选区不应再为班级统计单独保留44像素行。');
assert.ok(toolbarSource.includes('flex min-h-11 items-center justify-between gap-2'), '筛选条件和排行榜应共享同一44像素工具行。');
assert.ok(tokenSource.includes("'--tm-class-list-toolbar-card-gap': '8px'"), '统计信息与第一张卡片之间应保留8像素视觉留白。');

assert.ok(phoneMockupSource.includes("'--mini-program-capsule-right-inset'"), '演示手机壳必须注入胶囊安全区变量。');
assert.ok(phoneMockupSource.includes("'--mini-program-title-bar-height'"), '演示手机壳必须注入微信标题栏高度变量。');
assert.ok(phoneMockupSource.includes('simulatedCapsuleRightInset'), '胶囊安全区应跟随手机壳显示状态。');
assert.ok(guidelineSource.includes('wx.getMenuButtonBoundingClientRect()'), '教师手机端规范应记录真机胶囊定位规则。');

console.log('ClassListView capsule-safe toolbar assertions passed');
