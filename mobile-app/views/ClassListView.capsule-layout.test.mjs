import assert from 'node:assert/strict';
import fs from 'node:fs';

const classListSource = fs.readFileSync(new URL('./ClassListView.tsx', import.meta.url), 'utf8');
const phoneMockupSource = fs.readFileSync(new URL('../../components/PhoneMockup.tsx', import.meta.url), 'utf8');
const guidelineSource = fs.readFileSync(new URL('../../design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md', import.meta.url), 'utf8');
const floatingImageButtonSource = fs.readFileSync(new URL('../components/ui/MobileFloatingImageButton.tsx', import.meta.url), 'utf8');
const slidingSegmentedSource = fs.readFileSync(new URL('../components/ui/MobileSlidingSegmentedControl.tsx', import.meta.url), 'utf8');
const teacherMobileTokensSource = fs.readFileSync(new URL('../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');

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
  classListSource.includes('grid grid-cols-[minmax(0,1fr)_auto] gap-2'),
  '学校来源的筛选行应只保留年级与任教班级两个高频控件。',
);
assert.ok(classListSource.includes('任教班级'), '筛选文案应精简为“任教班级”。');
assert.ok(classListSource.includes('<MobileFloatingImageButton'), '排行榜应使用公共悬浮图片按钮。');
assert.ok(classListSource.includes('imageSrc={ASSETS.MANAGEMENT.CLASS_LEADERBOARD}'), '排行榜悬浮入口应使用独立图片素材。');
assert.ok(classListSource.includes('label="查看班级排行榜"'), '排行榜入口必须保留完整读屏名称。');
assert.ok(classListSource.includes('visibleLabel="班级排行榜"'), '排行榜入口必须展示由页面渲染的清晰文字。');
assert.ok(classListSource.includes('imageMode="full-bleed"'), '完整圆形排行榜图片必须铺满入口，不得再次嵌入空白圆框。');
assert.ok(classListSource.includes('placement="middle-right"'), '排行榜悬浮入口应位于班级页中部靠右。');
assert.ok(classListSource.includes('pb-[calc(var(--tm-floating-image-button-height)'), '班级列表必须为放大后的悬浮入口预留滚动空间。');
assert.ok(floatingImageButtonSource.includes('visibleLabel?: string;'), '公共悬浮图片按钮应提供可选的可见文字能力。');
assert.ok(floatingImageButtonSource.includes("imageMode?: 'contained' | 'full-bleed';"), '公共悬浮图片按钮应区分留白图标与完整圆形图片。');
assert.ok(floatingImageButtonSource.includes("? 'h-full w-full object-cover'"), '完整圆形图片必须铺满圆形展示区。');
assert.ok(floatingImageButtonSource.includes("placement?: 'middle-right' | 'above-tab-bar' | 'safe-bottom';"), '公共悬浮图片按钮应通过位置变体管理页面锚点。');
assert.ok(floatingImageButtonSource.includes("isMiddleRight ? 'top-1/2 -translate-y-1/2' : ''"), '中部靠右变体应相对页面垂直居中。');
assert.ok(floatingImageButtonSource.includes('border-[length:var(--tm-floating-image-button-border-width)]'), '带文字的悬浮图片按钮应消费组件边框 Token。');
assert.ok(floatingImageButtonSource.includes('[box-shadow:var(--tm-floating-image-button-shadow)]'), '带文字的悬浮图片按钮应消费组件阴影 Token。');
assert.ok(teacherMobileTokensSource.includes("'--tm-floating-image-button-width': '68px'"), '排行榜悬浮入口宽度应缩放为上一版的约 80%。');
assert.ok(teacherMobileTokensSource.includes("'--tm-floating-image-button-height': '72px'"), '排行榜悬浮入口高度应缩放为上一版的约 80%。');
assert.ok(teacherMobileTokensSource.includes("'--tm-floating-image-button-circle-size': '68px'"), '排行榜图标主体应使用圆形组件尺寸 Token。');
assert.ok(!classListSource.includes('TrophyIcon'), '班级列表不应继续使用奖杯线性图标。');
const toolbarStart = classListSource.indexOf("{activeListTab === 'class' && isSchoolSpace && (");
const toolbarEnd = classListSource.indexOf('{visibleClasses.map(renderClassCard)}');
const toolbarSource = classListSource.slice(toolbarStart, toolbarEnd);
assert.ok(toolbarStart >= 0 && toolbarEnd > toolbarStart, '应能识别学校版筛选工具行。');
assert.ok(!toolbarSource.includes('ring-[var(--tm-border-subtle)]'), '年级、任教班级与排行榜不应使用常驻外边框。');
assert.ok(toolbarSource.match(/\[box-shadow:var\(--tm-shadow-control\)\]/g)?.length >= 2, '两个筛选工具应统一使用控件阴影 Token。');

assert.ok(phoneMockupSource.includes("'--mini-program-capsule-right-inset'"), '演示手机壳必须注入胶囊安全区变量。');
assert.ok(phoneMockupSource.includes("'--mini-program-title-bar-height'"), '演示手机壳必须注入微信标题栏高度变量。');
assert.ok(phoneMockupSource.includes('simulatedCapsuleRightInset'), '胶囊安全区应跟随手机壳显示状态。');
assert.ok(guidelineSource.includes('wx.getMenuButtonBoundingClientRect()'), '教师手机端规范应记录真机胶囊定位规则。');

console.log('ClassListView capsule-safe toolbar assertions passed');
