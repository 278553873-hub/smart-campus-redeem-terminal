import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const screenSource = readFileSync(new URL('./SmartBigScreen.tsx', import.meta.url), 'utf8');
const displaySource = readFileSync(new URL('./student-performance/ClassroomStudentPerformance.tsx', import.meta.url), 'utf8');
const classroomDisplaySource = readFileSync(new URL('../shared/classroomDisplay.ts', import.meta.url), 'utf8');

for (const text of [
  'aria-label="更多操作"',
  'aria-label="课堂大屏更多操作"',
  'title="更多操作"',
  '显示学生等级',
  '显示学生加扣分',
  '显示内容',
  "label: '加分'",
  "label: '扣分'",
  '数值形式',
  '次数',
  '分值',
  '统计范围',
  '本学期',
  '历史累计',
  '从现在开始重新统计表扬次数和批评次数',
  '重新计数',
  '重置后不可恢复，我已知晓',
  '秒后可确认',
  '请选择${isGroupRecountSelection ? \'小组\' : \'学生\'}卡片',
  '已选${recountSelectedCount}${isGroupRecountSelection ? \'个小组\' : \'名学生\'}',
  'createEvaluationCountCheckpoint',
  'getEvaluationCountsSinceCheckpoint',
]) {
  assert.ok(screenSource.includes(text), `课堂大屏应包含${text}`);
}

assert.match(screenSource, /import \{[^}]*Switch[^}]*\} from '@arco-design\/web-react'/, 'PC端展示设置应复用Arco公共开关组件');
assert.match(screenSource, /<Drawer[\s\S]*?width=\{groupDrawerWidth\}[\s\S]*?visible=\{isMoreActionsOpen\}[\s\S]*?title="更多操作"/, '更多操作与小组管理必须复用同一Arco抽屉基础样式');
assert.match(screenSource, /CLASSROOM_DISPLAY_MODE_OPTIONS[\s\S]*?getClassroomDisplayConfig/, '课堂大屏应通过统一配置提供展示档位');
assert.match(classroomDisplaySource, /\{ value: 'auto', label: '自动' \}[\s\S]*\{ value: 'standard', label: '小' \}[\s\S]*\{ value: 'classroom', label: '标准' \}[\s\S]*\{ value: 'distant', label: '大' \}/, '显示大小应使用自动、小、标准、大的直观文案');
assert.match(screenSource, /aria-label="显示大小"/, '显示大小控件应使用面向老师的语义名称');
assert.match(screenSource, /const displayModeControl = !isRecountSelection[\s\S]*CLASSROOM_DISPLAY_MODE_OPTIONS/, '展示档位应作为底部常驻操作控件');
assert.match(screenSource, /<footer[\s\S]*displayModeControl/, '展示档位应放在底部操作区');
assert.match(screenSource, /<footer className="grid[\s\S]*grid-cols-\[minmax\(0,1fr\)_auto_minmax\(0,1fr\)\]/, '底部操作区应使用左右等宽、中间自适应的三列布局');
assert.match(screenSource, /min-w-0 justify-self-start[\s\S]*displayModeControl/, '正常状态下展示档位应固定在底部左侧');
assert.match(screenSource, /min-w-0 items-center justify-self-center[\s\S]*批量评价[\s\S]*随机点/, '批量评价和随机点名应位于底部中央主操作区');
assert.match(screenSource, /min-w-0 justify-self-end[\s\S]*setHistoryOpen\(true\)/, '点评记录应固定在底部右侧');
assert.match(screenSource, /!isMultiSelect && !isRecountSelection && displayModeControl/, '进入选择态后应隐藏左侧展示档位，保持任务聚焦');
assert.doesNotMatch(screenSource, /当前：\{classroomDisplay\.label\}/, '展示档位的选中态已表达当前设置，不应重复显示当前档位文案');
assert.doesNotMatch(screenSource, /<section className="mb-8">[\s\S]{0,500}展示档位/, '展示档位不应继续放在更多操作抽屉');
assert.match(screenSource, /classroomDisplay\.toolbar\.height[\s\S]*classroomDisplay\.toolbar\.fontSize[\s\S]*classroomDisplay\.toolbar\.iconSize/, '底部操作控件应按展示档位同步放大');
assert.match(screenSource, /shell\.classMenuWidth[\s\S]*shell\.classMenuItemHeight[\s\S]*shell\.classMenuFontSize/, '班级切换菜单应按展示档位同步放大');
assert.match(screenSource, /classroom-display-input[\s\S]*classroomDisplayInputStyle/, 'Arco 输入框内部文字应通过局部样式跟随展示档位');
assert.match(screenSource, /min-h-0 flex-1 overflow-y-auto custom-scrollbar/, '随机点名结果区应在弹窗内独立滚动');
assert.match(screenSource, /gridTemplateColumns: `repeat\(auto-fill, minmax\(\$\{classroomDisplay\.modal\.avatarOptionMinWidth\}px, 1fr\)\)`/, '头像选择网格应按展示档位自适应列数');
assert.match(screenSource, /checked=\{studentCardDisplaySettings\.showLevel\}[\s\S]*aria-label="显示学生等级"/, '等级开关应由公共组件提供状态与无障碍语义');
assert.match(screenSource, /studentCardDisplaySettings\.showLevel && \([\s\S]*统计范围[\s\S]*本学期[\s\S]*历史累计/, '统计范围应作为显示学生等级的渐进披露子配置');
assert.doesNotMatch(screenSource, /relative h-7 w-12[\s\S]*translate-x-6/, '课堂大屏不应手写开关轨道、圆点和位移');
assert.match(screenSource, /checked=\{activeCardDisplaySettings\.showEvaluation\}[\s\S]*aria-label=\{viewMode === 'group' \? '显示小组加扣分' : '显示学生加扣分'\}/, '加扣分应先使用公共开关控制整体显示');
assert.match(screenSource, /activeCardDisplaySettings\.showEvaluation && \([\s\S]*aria-label="加扣分显示内容"[\s\S]*\{ value: 'all' as const, label: '全部' \}[\s\S]*\{ value: 'praise' as const, label: '加分' \}[\s\S]*\{ value: 'criticism' as const, label: '扣分' \}/, '开启加扣分后应渐进展示全部、加分、扣分三种互斥内容模式');
assert.match(screenSource, /displaySettings=\{studentCardDisplaySettings\}/, '学生卡片应接收统一展示设置');
assert.match(displaySource, /showPraise\?\: boolean[\s\S]*showCriticism\?\: boolean[\s\S]*valueMode\?\: EvaluationCardValueMode/, '通用卡片统计组件应支持加扣分独立显示与共用数值类型');
assert.match(displaySource, /if \(visibleValueLabels\.length === 0\) return null/, '关闭全部统计后不应渲染空统计容器');
assert.match(screenSource, /activeCardDisplaySettings\.showEvaluation && \([\s\S]*显示内容[\s\S]*数值形式/, '关闭加扣分时应同时隐藏内容和数值形式配置');
assert.match(screenSource, /const \[recountTarget, setRecountTarget\] = useState<'student' \| 'group' \| null>\(null\)/, '学生与小组重新计数应共享明确的目标状态');
assert.match(screenSource, /const \[recountSelectedIds, setRecountSelectedIds\] = useState<Set<string>>\(new Set\(\)\)/, '重新计数应使用独立的对象选择集合');
assert.match(screenSource, /recountSelectedCount > 0[\s\S]*重新计数（\$\{recountSelectedCount\}）/, '重新计数主操作应在有选择时显示已选择人数');
assert.match(screenSource, /const startRecountSelection = \(target: 'student' \| 'group'\) =>/, '点击更多操作中的重新计数应按当前视图进入对应选择态');
assert.match(screenSource, /const openRecountConfirmation = \(\) => \{[\s\S]*if \(recountSelectedCount === 0\) return;/, '未选择学生时不能打开确认弹窗');
assert.match(screenSource, /recountSelectedStudents\.forEach\(student => \{/, '确认重新计数只能为所选学生创建检查点');
assert.match(screenSource, /recountSelectedGroups\.forEach\(group => \{/, '确认重新计数只能为所选小组创建检查点');
assert.doesNotMatch(screenSource, /const openRecountConfirmation = \(\) => \{[\s\S]*setRecountConfirmationOpen\(true\)[\s\S]*students\.forEach/, '重新计数入口不应直接对全班打开确认并重置');

console.log('SmartBigScreen more actions assertions passed');
