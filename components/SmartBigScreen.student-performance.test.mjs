import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const screenSource = readFileSync(new URL('./SmartBigScreen.tsx', import.meta.url), 'utf8');
const displaySource = readFileSync(new URL('./student-performance/ClassroomStudentPerformance.tsx', import.meta.url), 'utf8');
const performanceValuesSource = readFileSync(new URL('./classroom/ClassroomPerformanceValues.tsx', import.meta.url), 'utf8');
const rosterBadgeSource = readFileSync(new URL('./classroom/ClassroomRosterBadge.tsx', import.meta.url), 'utf8');
const classroomDisplaySource = readFileSync(new URL('../shared/classroomDisplay.ts', import.meta.url), 'utf8');
const studentCardSource = screenSource.slice(
  screenSource.indexOf('const StudentCard'),
  screenSource.indexOf('const SmartBigScreen')
);

assert.match(studentCardSource, /getStudentPerformanceLevel\(resolvedLevelNetScore\)/, '卡片等级应由所选统计范围内的净得分实时派生');
assert.match(screenSource, /createDemoStudentLevelEvaluationRecords\(student, CURRENT_CLASSROOM_TERM\)/, '课堂大屏演示数据应提供本学期与历史评价记录');
assert.match(screenSource, /getStudentLevelNetScore\(demoRecords, 'term', CURRENT_CLASSROOM_TERM\) \+ liveTermDelta/, '等级始终按本学期统计，并保留本学期实时评价变化');
assert.match(screenSource, /levelNetScore=\{getStudentLevelScore\(student, performance\)\}/, '学生列表应把所选统计范围的等级分值传入卡片');
assert.match(studentCardSource, /displaySettings\.showLevel && displaySettings\.levelForm === 'icon'/, '图标形式才展示星级图标并保留头像进度环');
assert.match(studentCardSource, /displaySettings\.showLevel && displaySettings\.levelForm === 'score'/, '分值形式才在等级行展示净得分');
assert.match(studentCardSource, /showLevelProgress=\{showLevelIcons\}/, '分值形式下不应展示头像进度环');
assert.match(studentCardSource, /layout\.fullHeight[\s\S]*layout\.countsHeight[\s\S]*layout\.identityOnlyHeight/, '学生卡片应根据可见信息使用三档高度');
assert.match(studentCardSource, /displaySettings\.showEvaluation && displaySettings\.showPraise/, '关闭加扣分总开关后学生卡片不应继续展示加分');
assert.match(studentCardSource, /displaySettings\.showEvaluation && displaySettings\.showCriticism/, '关闭加扣分总开关后学生卡片不应继续展示扣分');
assert.match(studentCardSource, /style=\{\{ width: layout\.width, height: cardHeight \}\}/, '学生卡片宽高应来自统一课堂展示配置');
assert.match(screenSource, /px-1 pb-1 pt-0\.5/, '学生卡片应使用紧凑外边距，把空间留给身份信息与内容间距');
assert.match(screenSource, /gap: `\$\{deckGap\}px`/, '学生单元间距应来自当前展示档位');
assert.match(screenSource, /rounded-lg border-2 bg-white/, '学生单元应保留清晰的白色卡片形状');
assert.match(screenSource, /updateStudentPerformance\(targetStudentIds, scoreChange\)/, '点选评价应立即更新目标学生表现');
assert.match(screenSource, /updateStudentPerformance\(targets\.studentIds, scoreChange\)/, '语音评价应立即更新识别到的学生表现');
assert.match(screenSource, /updateStudentPerformance\(record\.studentIds, record\.scoreChange, 'revert'\)/, '撤销评价应同步恢复等级和次数');

for (const iconName of ['sprout', 'star', 'moon', 'sun', 'crown']) {
  assert.match(displaySource, new RegExp(`student-level-icons/${iconName}\\.png`), `课堂大屏应使用${iconName}正式等级素材`);
}

assert.match(displaySource, /stroke="#f2b84b"/, '头像进度环应统一使用金色');
assert.match(displaySource, /stroke="#edf1f5"/, '头像进度环轨道应降低存在感，避免批量卡片显得杂乱');
assert.match(displaySource, /z-10 h-full w-full/, '头像进度环应位于头像上层');
assert.match(displaySource, /showLevelProgress && \(/, '关闭等级时应同时隐藏头像等级进度环');
assert.match(displaySource, /transform=\{`rotate\(-90 \$\{size \/ 2\} \$\{size \/ 2\}\)`\}/, '头像进度弧应使用SVG原生变换并围绕明确圆心旋转，避免浏览器采用不同旋转基准点');
assert.doesNotMatch(displaySource, /-rotate-90/, '头像进度环不得依赖存在浏览器差异的CSS旋转');
assert.match(displaySource, /size: requestedSize/, '紧凑圆形头像应支持由课堂展示档位传入动态尺寸');
assert.match(displaySource, /const size = requestedSize \?\? \(compact \? 68 : 76\)/, '紧凑头像应保留标准尺寸兜底');
assert.doesNotMatch(displaySource, /shadow-\[/, '头像外投影不应遮挡进度环');
assert.doesNotMatch(displaySource, /Mars|Venus/, '性别图标不应继续叠放在头像进度环上');
assert.match(studentCardSource, /isSelectable && \([\s\S]*?<Check/, '批量选择时学生卡片右上角应显示勾选控件');
assert.doesNotMatch(studentCardSource, /Mars|Venus|student\.gender/, '学生卡片不应展示或朗读性别信息');
assert.match(screenSource, /layout\.nameFontSize[\s\S]*?>\{student\.name\}<\/h3>/, '姓名应作为身份行主体相对卡片居中，并随展示档位放大');
assert.match(performanceValuesSource, /bg-emerald-50[\s\S]*text-emerald-700/, '加分数据应使用高对比度绿色轻色片');
assert.match(performanceValuesSource, /bg-rose-50[\s\S]*text-rose-700/, '扣分数据应使用高对比度红色轻色片');
assert.match(performanceValuesSource, /font-sans font-bold tabular-nums/, '学生和小组加扣分应统一使用系统无衬线字体和700字重');
assert.match(performanceValuesSource, /itemHeight\?: number[\s\S]*itemMinWidth\?: number[\s\S]*gap\?: number/, '加扣分色块尺寸与间距应支持课堂展示档位');
assert.match(performanceValuesSource, /valueMode === 'score' \? formatSignedScore\(summary\.praiseScore, '\+'\) : formatSignedCount/, '课堂大屏应支持把加分数据切换为累计分值');
assert.match(performanceValuesSource, /const formatSignedScore = \(score: number, sign: '\+' \| '-'\) => score === 0 \? '0' : `\$\{sign\}\$\{formatScore\(score\)\}`/, '课堂大屏学生卡片分值不应重复显示“分”单位');
assert.match(performanceValuesSource, /累计加分\$\{summary\.praiseScore\}分/, '课堂大屏卡片读屏文案应继续保留分值单位');
assert.match(studentCardSource, /itemHeight=\{layout\.countItemHeight\}[\s\S]*itemMinWidth=\{layout\.countItemMinWidth\}[\s\S]*gap=\{layout\.countGap\}/, '学生卡片统计色块应读取统一展示档位');
assert.match(screenSource, /<ClassroomPerformanceValues[\s\S]*ariaLabelPrefix="小组"[\s\S]*fontSize=\{layout\.countFontSize\}[\s\S]*itemHeight=\{layout\.countItemHeight\}[\s\S]*itemMinWidth=\{layout\.countItemMinWidth\}[\s\S]*gap=\{layout\.countGap\}/, '小组卡片统计应复用PC公共组件并读取统一展示档位');
assert.doesNotMatch(screenSource, /!isSelectable && \(displaySettings\.showPraise/, '小组卡片在选择状态下也应保留统计信息');
assert.doesNotMatch(displaySource, /ThumbsUp|ThumbsDown/, '奖惩次数不应增加常驻图标');
assert.match(displaySource, /Array\.from\(\{ length: level\.iconCount \}/, '课堂大屏应按实际等级数量逐个展示等级图标');
assert.match(displaySource, /level\.iconCount === 0[\s\S]*?src=\{sproutLevelIcon\}/, '课堂大屏未点亮等级图标时应展示一株小豆苗');
assert.match(displaySource, /style=\{\{ width: iconSize, height: iconSize \}\}/, '紧凑等级图标应随展示档位动态放大');
assert.match(displaySource, /bg-blue-50 text-blue-700/, '等级总分应使用浅蓝底色与深蓝文字');
assert.match(displaySource, /compact \? 'h-5 min-w-20 gap-0'/, '四枚紧凑等级图标应保持居中并与学号留出间隙');
assert.doesNotMatch(displaySource, /×\{level\.iconCount\}/, '等级图标不应使用乘号加数量的缩写方式');
assert.match(rosterBadgeSource, /trailingDigits\.slice\(-2\)\.padStart\(2, '0'\)/, '课堂大屏编号组件应只展示学号后两位');
assert.match(rosterBadgeSource, /bg-slate-100[\s\S]*font-\[NumberFont\][\s\S]*text-slate-800/, '两位学号应使用专用数字字体和高对比度身份样式');
assert.match(rosterBadgeSource, /font-extrabold/, '学生卡片学号应使用800字重强化定位效率');
assert.match(studentCardSource, /<ClassroomRosterBadge studentNo=\{student\.studentNo\} fontSize=\{layout\.rosterFontSize\} width=\{layout\.rosterWidth\} height=\{layout\.rosterHeight\}/, '学生卡片编号字号与紧凑色块尺寸应来自统一展示档位');
assert.match(screenSource, /<ClassroomFullStudentNumber[\s\S]*studentNo=\{evalStudent\.studentNo\}[\s\S]*fontSize=\{classroomDisplay\.evaluation\.studentNoFontSize\}/, '点评弹窗应完整显示学号并使用统一学生编号组件');
assert.match(rosterBadgeSource, /\{studentNo\}/, '点评弹窗应显示完整学号');
assert.doesNotMatch(rosterBadgeSource, /学号\{studentNo\}/, '点评弹窗完整学号不应增加学号前缀');
assert.match(rosterBadgeSource, /whitespace-nowrap/, '点评弹窗完整学号应保持单行显示');
assert.match(screenSource, /order-3 flex basis-full justify-center md:order-2/, '窄窗口点评弹窗应将页签换到第二行，避免挤压完整学号');
assert.match(screenSource, /whitespace-nowrap font-black leading-none tracking-tight text-slate-700/, '点评弹窗学生姓名应保持单行显示');
assert.match(screenSource, /inline-flex min-w-0 items-center justify-center gap-1[\s\S]*?layout\.rosterFontSize[\s\S]*?layout\.rosterWidth[\s\S]*?layout\.nameFontSize[\s\S]*?>\{student\.name\}<\/h3>/, '两位学号与姓名应组成稳定宽度的居中身份组，并随档位调整字号');
assert.match(studentCardSource, /font-semibold[\s\S]*?layout\.nameFontSize[\s\S]*?>\{student\.name\}<\/h3>/, '课堂大屏姓名应使用统一配置字号，保持远距离可读且不过重');
assert.match(screenSource, /resolveStudentsBySpokenNumbers\(normalized, students\)/, '语音评价应使用通用学号解析模块映射当前班级学生');
assert.match(studentCardSource, /displaySettings\.showLevel && \([\s\S]*?flex w-full shrink-0 items-center justify-center[\s\S]*?\{showLevelIcons && <ClassroomStudentLevelIcons level=\{level\} compact iconSize=\{layout\.levelIconSize\} \/>\}/, '图标形式的等级图标应独占顶部并相对整张卡片居中');
assert.match(studentCardSource, /relative flex h-auto w-auto flex-col items-center justify-center/, '学生卡片的可选信息区域应在卡片内垂直居中');
assert.match(studentCardSource, /marginTop: layout\.countIdentityGap[\s\S]*?inline-flex min-w-0 items-center justify-center gap-1[\s\S]*?>\{student\.name\}<\/h3>/, '学号与姓名应作为一个完整身份组，并通过档位间距与加扣分分层');
assert.doesNotMatch(studentCardSource, /right-\[calc\(100%\+4px\)\]/, '学号不应再使用绝对定位，避免四字姓名时越出卡片');
assert.match(studentCardSource, /flex h-\[18px\] w-full shrink-0 items-center justify-center/, '紧凑卡片的正负向统计应在头像下方独立成行');
assert.match(screenSource, /layout\.levelAvatarGap[\s\S]*marginTop: layout\.avatarCountGap[\s\S]*marginTop: layout\.countIdentityGap/, '等级、头像、加扣分和身份行应使用三段独立档位间距');
assert.doesNotMatch(screenSource, /w-\[112px\].*bg-white\/95/, '正负向统计不应使用遮挡头像的白色背景条');

for (const expectedScale of [
  ['小档', 'countFontSize: 11', 'rosterFontSize: 15', 'rosterWidth: 24', 'fullHeight: 152'],
  ['标准档', 'countFontSize: 13', 'rosterFontSize: 17', 'rosterWidth: 26', 'fullHeight: 180'],
  ['大档', 'countFontSize: 15', 'rosterFontSize: 19', 'rosterWidth: 30', 'fullHeight: 204'],
]) {
  const [label, ...tokens] = expectedScale;
  for (const token of tokens) {
    assert.ok(classroomDisplaySource.includes(token), `${label}应包含${token}`);
  }
}

console.log('SmartBigScreen student performance checks passed.');
