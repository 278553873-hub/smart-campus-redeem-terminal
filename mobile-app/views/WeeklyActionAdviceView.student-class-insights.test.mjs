import fs from 'node:fs';

const promptSource = fs.readFileSync(new URL('../../prompt/student/班主任助理-周报/班主任周报.md', import.meta.url), 'utf8');
const prdSource = fs.readFileSync(new URL('../../docs/演示项目/教师手机端/PRD-班主任助理本周行动建议.md', import.meta.url), 'utf8');
const dataSource = fs.readFileSync(new URL('../data/weeklyActionAdvice.ts', import.meta.url), 'utf8');
const viewSource = fs.readFileSync(new URL('./WeeklyActionAdviceView.tsx', import.meta.url), 'utf8');
const adapterSource = fs.readFileSync(new URL('../domain/assistantReportAdapters.ts', import.meta.url), 'utf8');
const cardsSource = fs.readFileSync(new URL('../components/assistant-report/AssistantReportCards.tsx', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

const forbidText = (source, needle, message) => {
  if (source.includes(needle)) throw new Error(message);
};

for (const required of [
  '需要关注的学生',
  '同一行为在多个独立事件中重复',
  '不同场景出现反差',
  '周内改善或反复',
  '多个教师印证或呈现差异',
  '【statistics】',
  '数据的字段命名和取值代号不得出现在输出文本中',
  'evidence：说明为什么生成这一条',
]) {
  requireText(promptSource, required, `学生信号规则缺少：${required}`);
}

for (const required of [
  '班级信号',
  '多个不同学生、多个独立事件或多个教师共同支持',
  '特定场景集中',
  '具体优势机制',
  '分化表现',
  '不得从 records 重新计算',
  'context：真实场景、观察范围、评价来源或行动对象',
]) {
  requireText(promptSource, required, `班级信号规则缺少：${required}`);
}

requireText(promptSource, '具体执行动作只放在“本周重点行动”', '执行动作不应在其它板块重复展开。');
requireText(promptSource, '全班评价展开的学生明细不等于个体观察', '班级信号应防止全班事件虚增独立证据。');
forbidText(promptSource, '"suggestion": "1个核实动作和1个低风险跟进动作"', '学生洞察不应保留旧的建议字段。');

requireText(prdSource, '全班评价展开后的学生明细不能代替个体观察', 'PRD 应约束学生个体证据口径。');
requireText(prdSource, '单个学生的重复行为和一次全班评价不能证明稳定班风或普遍问题', 'PRD 应约束班级共性证据口径。');

requireText(dataSource, 'export interface StudentAdviceInsight', '演示数据应定义结构化学生洞察。');
requireText(dataSource, 'export interface ClassAdviceInsight', '演示数据应定义结构化班级洞察。');
for (const insightType of ['strength', 'context_contrast', 'context_pattern']) {
  requireText(dataSource, `insightType: '${insightType}'`, `演示数据缺少洞察类型：${insightType}`);
}

requireText(adapterSource, 'report.content.studentInsights.map', '适配层应格式化结构化学生洞察。');
requireText(adapterSource, 'report.content.classInsights.map', '适配层应格式化结构化班级洞察。');
requireText(adapterSource, 'verification:', '适配层应把核实重点与具体执行动作区分开。');
requireText(cardsSource, "{ label: '核实重点', value: item.verification }", '共享证据抽屉应展示核实重点。');

console.log('WeeklyActionAdvice student and class insight assertions passed');
