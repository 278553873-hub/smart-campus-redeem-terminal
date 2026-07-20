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
  '【教师评价洞察】',
  '不设置固定洞察条数上限',
  '只写评价次数、占比、正负向数量、覆盖人数或排名不构成洞察',
  '原始评价事件数',
  '学生明细记录数',
  'teacher_evaluation_statistics_json',
  'teacher_names',
  'insight_type',
  'finding',
  'evidence',
  'implication',
]) {
  requireText(promptSource, required, `教师评价洞察提示词缺少：${required}`);
}

forbidText(promptSource, 'evaluation_insights 最多2条', '教师评价洞察不应保留旧的2条上限。');
requireText(prdSource, '评价参与度统一使用原始评价事件数', 'PRD 应明确教师参与度统计口径。');
requireText(prdSource, '不是教师排行榜或教师考核', 'PRD 应明确教师评价洞察的使用边界。');
requireText(dataSource, 'export interface TeacherEvaluationInsight', '演示数据应使用结构化教师评价洞察。');

for (const insightType of ['participation', 'orientation', 'target_scope']) {
  requireText(dataSource, `insightType: '${insightType}'`, `演示内容缺少教师评价洞察类型：${insightType}`);
}

requireText(viewSource, 'formatTeacherEvaluationInsight', '页面应将结构化教师评价洞察转换为可读内容。');

console.log('WeeklyActionAdvice teacher evaluation insight assertions passed');
