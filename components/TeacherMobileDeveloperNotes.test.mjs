import assert from 'node:assert/strict';
import fs from 'node:fs';

const rootApp = fs.readFileSync('App.tsx', 'utf8');
const notes = fs.readFileSync('components/TeacherMobileDeveloperNotes.tsx', 'utf8');

assert.match(rootApp, /useState\(false\).*showTeacherDeveloperNotes|showTeacherDeveloperNotes.*useState\(false\)/s, '开发标注必须默认关闭。');
assert.match(rootApp, /hasTeacherDeveloperNotesContext/, 'Demo 外壳应维护当前页面是否存在开发标注。');
assert.match(rootApp, /new MutationObserver\(syncTeacherDeveloperNotesContext\)/, 'Demo 外壳应在页面状态变化后重新检测标注上下文。');
assert.match(rootApp, /teacherPhoneScreenRef\.current\?\.querySelector\('\.student-compact-select-grid'\)/, '选择学生网格应作为当前开发标注的具体页面触发条件。');
assert.match(rootApp, /currentApp === 'admin' && hasTeacherDeveloperNotesContext && \(\s*<TeacherMobileDeveloperNotes/, '开发标注开关只能在对应页面状态中出现。');
assert.match(rootApp, /if \(!hasContext\) setShowTeacherDeveloperNotes\(false\)/, '离开对应页面状态后应同时收起开发标注面板。');
assert.match(notes, /\{open && \(/, '规则面板只应在开关开启时渲染。');
assert.match(notes, /< 480px：4列；≥ 480px：5列/, '开发标注应说明四列与五列的响应式规则。');
assert.match(notes, /按选择内容区宽度，不按浏览器窗口/, '开发标注应避免开发误用外层浏览器宽度。');
assert.match(notes, /18×18px；卡片右上外移4px/, '开发标注应说明勾选角标的位置与尺寸。');
assert.match(notes, /等级、表扬\/批评次数、性别/, '开发标注应明确选择卡片不展示的冗余信息。');

console.log('教师手机端开发标注断言通过');
