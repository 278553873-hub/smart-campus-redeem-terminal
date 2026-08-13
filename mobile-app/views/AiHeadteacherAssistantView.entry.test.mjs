import assert from 'node:assert/strict';
import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./AiHeadteacherAssistantV2View.tsx', import.meta.url), 'utf8');
const meSource = fs.readFileSync(new URL('./MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const accessSource = fs.readFileSync(new URL('../domain/teacherSpaceAccess.ts', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  assert.ok(source.includes(needle), message);
};

requireText(meSource, 'onOpenAiHeadteacherAssistant: () => void;', '我的页应暴露统一班主任助理入口回调。');
requireText(meSource, "title: '班主任助理'", '管理工具应显示统一班主任助理名称。');
assert.equal((meSource.match(/id: 'headteacherAssistant'/g) ?? []).length, 1, '我的页只能定义一个班主任助理入口。');
assert.ok(!meSource.includes("id: 'headteacherAssistantV2'"), '我的页不应定义独立 V2 入口。');

requireText(accessSource, "export type HeadteacherAssistantScope = 'student' | 'class';", '权限层应使用学生和班级两种助理能力范围。');
requireText(accessSource, 'headteacherAssistantEnabled?: boolean;', '学校配置应支持统一助理开关。');
requireText(accessSource, 'evaluationScopes?: HeadteacherAssistantScope[];', '学校配置应支持评价能力范围。');
requireText(accessSource, 'getHeadteacherAssistantScopes', '权限层应提供统一能力解析。');

requireText(appSource, "onOpenAiHeadteacherAssistant={() => navigateTo('ai_headteacher_assistant')}", '统一入口应进入唯一班主任助理页面。');
requireText(appSource, '<AiHeadteacherAssistantV2View', 'App 应以现有对话外壳渲染统一班主任助理。');
requireText(appSource, 'activeClassId={headteacherAssistantClassId}', '统一助理应维护一个班级上下文。');
assert.ok(!appSource.includes('weeklyAdviceClassId'), '学生报告不得继续维护第二份班级状态。');
requireText(appSource, "showStudentEvaluation={headteacherAssistantScopes.includes('student')}", '页面应接收学生评价能力。');
requireText(appSource, "showClassEvaluation={headteacherAssistantScopes.includes('class')}", '页面应接收班级评价能力。');
requireText(appSource, "'school-qinghe': {", '演示环境应保留仅学生评价学校。');
const qingheProfileSource = appSource.slice(
  appSource.indexOf("'school-qinghe': {", appSource.indexOf('INITIAL_TEACHER_PROFILES_BY_SPACE')),
  appSource.indexOf('\n    },', appSource.indexOf("'school-qinghe': {", appSource.indexOf('INITIAL_TEACHER_PROFILES_BY_SPACE'))),
);
requireText(qingheProfileSource, "homeroomClassIds: ['c_2025_3']", '仅学生评价学校必须绑定有效班主任班级，确保学生问题带入班级上下文。');

for (const label of ['本周学生情况洞察与班级跟进建议', '上月评价记录复盘与改进建议']) {
  requireText(viewSource, label, `统一页面应展示单行学生评价能力：${label}`);
}
requireText(viewSource, 'onOpenWeeklyActionAdvice(resolvedClassId)', '第一个学生问题应携带当前班级进入本周行动建议。');
requireText(viewSource, 'onOpenEvaluationReview(resolvedClassId)', '第二个学生问题应携带当前班级进入评价复盘。');
requireText(viewSource, 'aria-label="报告快捷入口"', '两项报告应使用独立高层级区域。');
requireText(viewSource, '<HomeroomClassPickerSheet', '统一助理应复用班级选择组件。');
requireText(viewSource, 'AI班主任助理形象', '统一助理应展示班主任助理形象。');
requireText(viewSource, 'ai-assistant-typewriter-shine', '统一助理应保留打字机扫光效果。');

console.log('Unified headteacher assistant entry assertions passed');
