import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const screenSource = readFileSync(new URL('./SmartBigScreen.tsx', import.meta.url), 'utf8');
const displaySource = readFileSync(new URL('./student-performance/ClassroomStudentPerformance.tsx', import.meta.url), 'utf8');
const studentCardSource = screenSource.slice(
  screenSource.indexOf('const StudentCard'),
  screenSource.indexOf('const SmartBigScreen')
);

assert.match(screenSource, /getStudentPerformanceLevel\(performance\.netScore\)/, '卡片等级应由净得分实时派生');
assert.match(screenSource, /h-\[148px\] w-\[136px\]/, '课堂大屏学生卡片应使用136乘148像素的高密度布局');
assert.match(screenSource, /px-1 pb-2 pt-1/, '学生姓名与卡片底部应保留呼吸空间');
assert.match(screenSource, /const CARD_GAP = 12;/, '学生单元应使用12像素间距稳定实现1280视口每行8人');
assert.match(screenSource, /rounded-lg border-2 bg-white/, '学生单元应保留清晰的白色卡片形状');
assert.match(screenSource, /updateStudentPerformance\(targetStudentIds, scoreChange\)/, '点选评价应立即更新目标学生表现');
assert.match(screenSource, /updateStudentPerformance\(targets\.studentIds, scoreChange\)/, '语音评价应立即更新识别到的学生表现');
assert.match(screenSource, /updateStudentPerformance\(record\.studentIds, record\.scoreChange, 'revert'\)/, '撤销评价应同步恢复等级和次数');

for (const iconName of ['sprout', 'star', 'moon', 'sun', 'crown']) {
  assert.match(displaySource, new RegExp(`student-level-icons/${iconName}\\.png`), `课堂大屏应使用${iconName}正式等级素材`);
}

assert.match(displaySource, /stroke="#f2b84b"/, '头像进度环应统一使用金色');
assert.match(displaySource, /z-10 h-full w-full -rotate-90/, '头像进度环应位于头像上层');
assert.match(displaySource, /compact \? 'inset-1\.5 h-14 w-14'/, '紧凑圆形头像应扩大到56像素并与进度环保持间隙');
assert.match(displaySource, /compact \? 'h-\[68px\] w-\[68px\]'/, '紧凑头像进度环应扩大到68像素');
assert.doesNotMatch(displaySource, /shadow-\[/, '头像外投影不应遮挡进度环');
assert.doesNotMatch(displaySource, /Mars|Venus/, '性别图标不应继续叠放在头像进度环上');
assert.match(studentCardSource, /isSelectable && \([\s\S]*?<Check/, '批量选择时学生卡片右上角应显示勾选控件');
assert.doesNotMatch(studentCardSource, /Mars|Venus|student\.gender/, '学生卡片不应展示或朗读性别信息');
assert.match(screenSource, /max-w-\[84px\][\s\S]*?>\{student\.name\}<\/h3>/, '姓名应作为身份行主体相对卡片居中，不再携带性别图标');
assert.match(displaySource, /bg-emerald-50/, '表扬次数应使用绿色轻色片');
assert.match(displaySource, /bg-rose-50/, '批评次数应使用红色轻色片');
assert.doesNotMatch(displaySource, /ThumbsUp|ThumbsDown/, '奖惩次数不应增加常驻图标');
assert.match(displaySource, /Array\.from\(\{ length: level\.iconCount \}/, '课堂大屏应按实际等级数量逐个展示等级图标');
assert.match(displaySource, /level\.iconCount === 0[\s\S]*?src=\{sproutLevelIcon\}/, '课堂大屏未点亮等级图标时应展示一株小豆苗');
assert.match(displaySource, /className="h-5 w-5 shrink-0/, '紧凑等级图标应扩大到20像素');
assert.match(displaySource, /compact \? 'h-5 min-w-20 gap-0'/, '四枚紧凑等级图标应保持居中并与学号留出间隙');
assert.doesNotMatch(displaySource, /×\{level\.iconCount\}/, '等级图标不应使用乘号加数量的缩写方式');
assert.match(screenSource, /student\.studentNo\.slice\(-2\)/, '课堂大屏卡片应只展示学号后两位');
assert.match(screenSource, /inline-flex min-w-0 max-w-\[110px\] items-center justify-center gap-1[\s\S]*?h-\[18px\] w-\[22px\] shrink-0[\s\S]*?text-\[11px\][\s\S]*?text-slate-600/, '两位学号与姓名应组成稳定宽度的居中身份组');
assert.match(studentCardSource, /text-\[16px\] font-semibold leading-\[18px\][\s\S]*?>\{student\.name\}<\/h3>/, '课堂大屏姓名应使用16像素、600字重，保持远距离可读且不过重');
assert.match(screenSource, /resolveStudentsBySpokenNumbers\(normalized, students\)/, '语音评价应使用通用学号解析模块映射当前班级学生');
assert.match(studentCardSource, /flex h-5 w-full items-center justify-center[\s\S]*?<ClassroomStudentLevelIcons level=\{level\} compact \/>/, '等级图标应独占顶部并相对整张卡片居中');
assert.match(studentCardSource, /mt-1\.5 flex h-\[18px\] w-full shrink-0 items-center justify-center text-center[\s\S]*?inline-flex min-w-0 max-w-\[110px\] items-center justify-center gap-1[\s\S]*?>\{student\.name\}<\/h3>/, '学号与姓名应作为一个完整身份组相对卡片居中');
assert.doesNotMatch(studentCardSource, /right-\[calc\(100%\+4px\)\]/, '学号不应再使用绝对定位，避免四字姓名时越出卡片');
assert.match(displaySource, /h-\[18px\] w-full gap-2/, '紧凑卡片的正负向统计应在头像下方独立成行');
assert.match(screenSource, /mt-1\.5 flex h-\[18px\][\s\S]*?leading-\[18px\]/, '姓名与正负向统计之间应保持6像素的清晰间距');
assert.doesNotMatch(screenSource, /w-\[112px\].*bg-white\/95/, '正负向统计不应使用遮挡头像的白色背景条');

console.log('SmartBigScreen student performance checks passed.');
