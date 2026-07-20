import fs from 'node:fs';

const promptSource = fs.readFileSync(new URL('../../docs/班主任助理_本周行动建议_内容生成提示词.md', import.meta.url), 'utf8');
const prdSource = fs.readFileSync(new URL('../../docs/PRD-班主任助理本周行动建议.md', import.meta.url), 'utf8');
const dataSource = fs.readFileSync(new URL('../data/weeklyActionAdvice.ts', import.meta.url), 'utf8');
const viewSource = fs.readFileSync(new URL('./WeeklyActionAdviceView.tsx', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

const forbidText = (source, needle, message) => {
  if (source.includes(needle)) throw new Error(message);
};

for (const required of [
  '【学生洞察】',
  '连续信号',
  '情境反差',
  '变化轨迹',
  '跨教师印证或差异',
  'student_statistics_json',
  'student_names',
  'verification_focus',
]) {
  requireText(promptSource, required, `学生洞察规则缺少：${required}`);
}

for (const required of [
  '【班级洞察】',
  '共性信号',
  '情境模式',
  '班级优势机制',
  '分化信号',
  'class_pattern_statistics_json',
  'condition',
]) {
  requireText(promptSource, required, `班级洞察规则缺少：${required}`);
}

requireText(promptSource, '真正需要班主任执行的动作统一收敛到 actions', '学生洞察不应重复展开执行动作。');
requireText(promptSource, '一次全班评价展开出的多条学生明细仍只算一个独立事件', '班级洞察应防止全班事件虚增独立证据。');
forbidText(promptSource, '"suggestion": "1个核实动作和1个低风险跟进动作"', '学生洞察不应保留旧的建议字段。');

requireText(prdSource, '全班评价展开后的学生明细不能代替个体观察', 'PRD 应约束学生个体证据口径。');
requireText(prdSource, '单个学生的重复行为不得上升为班级共性', 'PRD 应约束班级共性证据口径。');

requireText(dataSource, 'export interface StudentAdviceInsight', '演示数据应定义结构化学生洞察。');
requireText(dataSource, 'export interface ClassAdviceInsight', '演示数据应定义结构化班级洞察。');
for (const insightType of ['strength', 'context_contrast', 'context_pattern']) {
  requireText(dataSource, `insightType: '${insightType}'`, `演示数据缺少洞察类型：${insightType}`);
}

requireText(viewSource, 'formatStudentInsight', '页面应格式化结构化学生洞察。');
requireText(viewSource, 'formatClassInsight', '页面应格式化结构化班级洞察。');
requireText(viewSource, '核实重点：', '页面应把核实重点与具体执行动作区分开。');

console.log('WeeklyActionAdvice student and class insight assertions passed');
