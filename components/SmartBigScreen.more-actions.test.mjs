import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const screenSource = readFileSync(new URL('./SmartBigScreen.tsx', import.meta.url), 'utf8');
const displaySource = readFileSync(new URL('./student-performance/ClassroomStudentPerformance.tsx', import.meta.url), 'utf8');

for (const text of [
  'aria-label="更多操作"',
  'aria-label="课堂大屏更多操作"',
  'title="更多操作"',
  '显示学生等级',
  '显示正向统计',
  '显示负面统计',
  '仅计算本学期',
  '累计所有学期',
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
assert.match(screenSource, /<Drawer[\s\S]*?width=\{GROUP_DRAWER_WIDTH\}[\s\S]*?visible=\{isMoreActionsOpen\}[\s\S]*?title="更多操作"/, '更多操作与小组管理必须复用同一Arco抽屉基础样式');
assert.match(screenSource, /checked=\{studentCardDisplaySettings\.showLevel\}[\s\S]*aria-label="显示学生等级"/, '等级开关应由公共组件提供状态与无障碍语义');
assert.match(screenSource, /studentCardDisplaySettings\.showLevel && \([\s\S]*等级展示规则[\s\S]*仅计算本学期[\s\S]*累计所有学期/, '等级展示规则应作为显示学生等级的渐进披露子配置');
assert.doesNotMatch(screenSource, /relative h-7 w-12[\s\S]*translate-x-6/, '课堂大屏不应手写开关轨道、圆点和位移');
assert.match(screenSource, /displaySettings=\{studentCardDisplaySettings\}/, '学生卡片应接收统一展示设置');
assert.match(displaySource, /showPraiseCount\?\: boolean[\s\S]*showCriticismCount\?\: boolean/, '通用卡片统计组件应支持正负向次数独立显示');
assert.match(displaySource, /if \(visibleCountLabels\.length === 0\) return null/, '关闭全部统计后不应渲染空统计容器');
assert.match(screenSource, /const \[recountTarget, setRecountTarget\] = useState<'student' \| 'group' \| null>\(null\)/, '学生与小组重新计数应共享明确的目标状态');
assert.match(screenSource, /const \[recountSelectedIds, setRecountSelectedIds\] = useState<Set<string>>\(new Set\(\)\)/, '重新计数应使用独立的对象选择集合');
assert.match(screenSource, /recountSelectedCount > 0[\s\S]*重新计数（\$\{recountSelectedCount\}）/, '重新计数主操作应在有选择时显示已选择人数');
assert.match(screenSource, /const startRecountSelection = \(target: 'student' \| 'group'\) =>/, '点击更多操作中的重新计数应按当前视图进入对应选择态');
assert.match(screenSource, /const openRecountConfirmation = \(\) => \{[\s\S]*if \(recountSelectedCount === 0\) return;/, '未选择学生时不能打开确认弹窗');
assert.match(screenSource, /recountSelectedStudents\.forEach\(student => \{/, '确认重新计数只能为所选学生创建检查点');
assert.match(screenSource, /recountSelectedGroups\.forEach\(group => \{/, '确认重新计数只能为所选小组创建检查点');
assert.doesNotMatch(screenSource, /const openRecountConfirmation = \(\) => \{[\s\S]*setRecountConfirmationOpen\(true\)[\s\S]*students\.forEach/, '重新计数入口不应直接对全班打开确认并重置');

console.log('SmartBigScreen more actions assertions passed');
