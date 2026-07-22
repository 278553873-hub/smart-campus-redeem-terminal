import assert from 'node:assert/strict';
import fs from 'node:fs';

const classListSource = fs.readFileSync(new URL('./ClassListView.tsx', import.meta.url), 'utf8');
const phoneMockupSource = fs.readFileSync(new URL('../../components/PhoneMockup.tsx', import.meta.url), 'utf8');
const guidelineSource = fs.readFileSync(new URL('../../design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md', import.meta.url), 'utf8');

assert.ok(
  classListSource.includes('[padding-right:var(--mini-program-capsule-right-inset,0px)]'),
  '顶部来源行必须消费微信胶囊右侧安全区。',
);
assert.ok(
  classListSource.includes("grid-cols-[minmax(72px,1fr)_auto_auto]"),
  '已开通排行榜的学校来源应在筛选行展示三个紧凑控件。',
);
assert.ok(classListSource.includes('任教班级'), '筛选文案应精简为“任教班级”。');
assert.ok(classListSource.includes('<TrophyIcon className="h-4 w-4" />\n                                    排行榜'), '排行榜入口应同时展示奖杯图标和文字。');
assert.ok(!classListSource.includes('\n                                班级排行榜\n'), '顶部不应继续展示“班级排行榜”长文案按钮。');
const toolbarStart = classListSource.indexOf('{isSchoolSpace && (');
const toolbarEnd = classListSource.indexOf('{visibleClasses.map(renderClassCard)}');
const toolbarSource = classListSource.slice(toolbarStart, toolbarEnd);
assert.ok(toolbarStart >= 0 && toolbarEnd > toolbarStart, '应能识别学校版筛选工具行。');
assert.ok(!toolbarSource.includes('ring-[var(--tm-border-subtle)]'), '年级、任教班级与排行榜不应使用常驻外边框。');
assert.ok(toolbarSource.match(/\[box-shadow:var\(--tm-shadow-control\)\]/g)?.length >= 3, '三个筛选工具应统一使用控件阴影 Token。');

assert.ok(phoneMockupSource.includes("'--mini-program-capsule-right-inset'"), '演示手机壳必须注入胶囊安全区变量。');
assert.ok(phoneMockupSource.includes('simulatedCapsuleRightInset'), '胶囊安全区应跟随手机壳显示状态。');
assert.ok(guidelineSource.includes('wx.getMenuButtonBoundingClientRect()'), '教师手机端规范应记录真机胶囊定位规则。');

console.log('ClassListView capsule-safe toolbar assertions passed');
