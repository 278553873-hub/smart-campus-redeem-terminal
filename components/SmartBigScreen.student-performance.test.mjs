import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const screenSource = readFileSync(new URL('./SmartBigScreen.tsx', import.meta.url), 'utf8');
const displaySource = readFileSync(new URL('./student-performance/ClassroomStudentPerformance.tsx', import.meta.url), 'utf8');
const studentCardSource = screenSource.slice(
  screenSource.indexOf('const StudentCard'),
  screenSource.indexOf('const SmartBigScreen')
);

assert.match(screenSource, /getStudentPerformanceLevel\(performance\.netScore\)/, '卡片等级应由净得分实时派生');
assert.match(studentCardSource, /layout\.fullHeight[\s\S]*layout\.countsHeight[\s\S]*layout\.identityOnlyHeight/, '学生卡片应根据可见信息使用三档高度');
assert.match(studentCardSource, /style=\{\{ width: layout\.width, height: cardHeight \}\}/, '学生卡片宽高应来自统一课堂展示配置');
assert.match(screenSource, /px-1 pb-2 pt-1/, '学生姓名与卡片底部应保留呼吸空间');
assert.match(screenSource, /gap: `\$\{deckGap\}px`/, '学生单元间距应来自当前展示档位');
assert.match(screenSource, /rounded-lg border-2 bg-white/, '学生单元应保留清晰的白色卡片形状');
assert.match(screenSource, /updateStudentPerformance\(targetStudentIds, scoreChange\)/, '点选评价应立即更新目标学生表现');
assert.match(screenSource, /updateStudentPerformance\(targets\.studentIds, scoreChange\)/, '语音评价应立即更新识别到的学生表现');
assert.match(screenSource, /updateStudentPerformance\(record\.studentIds, record\.scoreChange, 'revert'\)/, '撤销评价应同步恢复等级和次数');

for (const iconName of ['sprout', 'star', 'moon', 'sun', 'crown']) {
  assert.match(displaySource, new RegExp(`student-level-icons/${iconName}\\.png`), `课堂大屏应使用${iconName}正式等级素材`);
}

assert.match(displaySource, /stroke="#f2b84b"/, '头像进度环应统一使用金色');
assert.match(displaySource, /z-10 h-full w-full/, '头像进度环应位于头像上层');
assert.match(displaySource, /transform=\{`rotate\(-90 \$\{size \/ 2\} \$\{size \/ 2\}\)`\}/, '头像进度弧应使用SVG原生变换并围绕明确圆心旋转，避免浏览器采用不同旋转基准点');
assert.doesNotMatch(displaySource, /-rotate-90/, '头像进度环不得依赖存在浏览器差异的CSS旋转');
assert.match(displaySource, /size: requestedSize/, '紧凑圆形头像应支持由课堂展示档位传入动态尺寸');
assert.match(displaySource, /const size = requestedSize \?\? \(compact \? 68 : 76\)/, '紧凑头像应保留标准尺寸兜底');
assert.doesNotMatch(displaySource, /shadow-\[/, '头像外投影不应遮挡进度环');
assert.doesNotMatch(displaySource, /Mars|Venus/, '性别图标不应继续叠放在头像进度环上');
assert.match(studentCardSource, /isSelectable && \([\s\S]*?<Check/, '批量选择时学生卡片右上角应显示勾选控件');
assert.doesNotMatch(studentCardSource, /Mars|Venus|student\.gender/, '学生卡片不应展示或朗读性别信息');
assert.match(screenSource, /layout\.nameFontSize[\s\S]*?>\{student\.name\}<\/h3>/, '姓名应作为身份行主体相对卡片居中，并随展示档位放大');
assert.match(displaySource, /bg-emerald-50/, '表扬次数应使用绿色轻色片');
assert.match(displaySource, /bg-rose-50/, '批评次数应使用红色轻色片');
assert.match(displaySource, /itemHeight\?: number[\s\S]*itemMinWidth\?: number[\s\S]*gap\?: number/, '表扬和批评次数的色块尺寸与间距应支持课堂展示档位');
assert.match(studentCardSource, /itemHeight=\{layout\.countItemHeight\}[\s\S]*itemMinWidth=\{layout\.countItemMinWidth\}[\s\S]*gap=\{layout\.countGap\}/, '学生卡片统计色块应读取统一展示档位');
assert.match(screenSource, /<GroupPerformanceMeta[\s\S]*fontSize=\{layout\.countFontSize\}[\s\S]*itemHeight=\{layout\.countItemHeight\}[\s\S]*itemMinWidth=\{layout\.countItemMinWidth\}[\s\S]*gap=\{layout\.countGap\}/, '小组卡片统计应读取统一展示档位');
assert.doesNotMatch(screenSource, /!isSelectable && \(displaySettings\.showPraiseCount/, '小组卡片在选择状态下也应保留统计信息');
assert.doesNotMatch(displaySource, /ThumbsUp|ThumbsDown/, '奖惩次数不应增加常驻图标');
assert.match(displaySource, /Array\.from\(\{ length: level\.iconCount \}/, '课堂大屏应按实际等级数量逐个展示等级图标');
assert.match(displaySource, /level\.iconCount === 0[\s\S]*?src=\{sproutLevelIcon\}/, '课堂大屏未点亮等级图标时应展示一株小豆苗');
assert.match(displaySource, /style=\{\{ width: iconSize, height: iconSize \}\}/, '紧凑等级图标应随展示档位动态放大');
assert.match(displaySource, /compact \? 'h-5 min-w-20 gap-0'/, '四枚紧凑等级图标应保持居中并与学号留出间隙');
assert.doesNotMatch(displaySource, /×\{level\.iconCount\}/, '等级图标不应使用乘号加数量的缩写方式');
assert.match(screenSource, /student\.studentNo\.slice\(-2\)/, '课堂大屏卡片应只展示学号后两位');
assert.match(screenSource, /inline-flex min-w-0 items-center justify-center gap-1[\s\S]*?layout\.rosterFontSize[\s\S]*?layout\.nameFontSize[\s\S]*?>\{student\.name\}<\/h3>/, '两位学号与姓名应组成稳定宽度的居中身份组，并随档位调整字号');
assert.match(studentCardSource, /font-semibold[\s\S]*?layout\.nameFontSize[\s\S]*?>\{student\.name\}<\/h3>/, '课堂大屏姓名应使用统一配置字号，保持远距离可读且不过重');
assert.match(screenSource, /resolveStudentsBySpokenNumbers\(normalized, students\)/, '语音评价应使用通用学号解析模块映射当前班级学生');
assert.match(studentCardSource, /flex h-5 w-full items-center justify-center[\s\S]*?<ClassroomStudentLevelIcons level=\{level\} compact iconSize=\{layout\.levelIconSize\} \/>/, '等级图标应独占顶部并相对整张卡片居中');
assert.match(studentCardSource, /relative flex h-auto w-auto flex-col items-center justify-center/, '学生卡片的可选信息区域应在卡片内垂直居中');
assert.match(studentCardSource, /mt-1\.5 flex h-\[18px\] w-full shrink-0 items-center justify-center text-center[\s\S]*?inline-flex min-w-0 items-center justify-center gap-1[\s\S]*?>\{student\.name\}<\/h3>/, '学号与姓名应作为一个完整身份组相对卡片居中');
assert.doesNotMatch(studentCardSource, /right-\[calc\(100%\+4px\)\]/, '学号不应再使用绝对定位，避免四字姓名时越出卡片');
assert.match(displaySource, /h-\[18px\] w-full gap-2/, '紧凑卡片的正负向统计应在头像下方独立成行');
assert.match(screenSource, /mt-1\.5 flex h-\[18px\][\s\S]*?layout\.nameLineHeight/, '姓名与正负向统计之间应保持6像素的清晰间距');
assert.doesNotMatch(screenSource, /w-\[112px\].*bg-white\/95/, '正负向统计不应使用遮挡头像的白色背景条');

console.log('SmartBigScreen student performance checks passed.');
