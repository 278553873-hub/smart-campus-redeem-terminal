import fs from 'node:fs';

const promptSource = fs.readFileSync(new URL('../../prompt/student/班主任助理-周报/班主任周报.md', import.meta.url), 'utf8');
const prdSource = fs.readFileSync(new URL('../../docs/演示项目/教师手机端/PRD-班主任助理本周行动建议.md', import.meta.url), 'utf8');
const dataSource = fs.readFileSync(new URL('../data/weeklyActionAdvice.ts', import.meta.url), 'utf8');
const viewSource = fs.readFileSync(new URL('./WeeklyActionAdviceView.tsx', import.meta.url), 'utf8');
const adapterSource = fs.readFileSync(new URL('../domain/assistantReportAdapters.ts', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

const forbidText = (source, needle, message) => {
  if (source.includes(needle)) throw new Error(message);
};

for (const required of [
  '评价视角：只描述上周记录呈现的评价来源',
  '4. 评价视角：1 至 4 条',
  '次数、分数、正负向标签、排名、单条普通表扬或一次全班评价，不足以单独形成模式结论',
  '原始评价事件数',
  '学生明细数',
  '【statistics】',
  '没有应参与教师范围时只能说“记录来源集中”',
  '不能据此评价教师好坏',
  'item_title',
  'evidence',
]) {
  requireText(promptSource, required, `评价视角提示词缺少：${required}`);
}

forbidText(promptSource, 'evaluation_insights 最多2条', '提示词不应保留旧的洞察条数上限。');
requireText(prdSource, '评价参与度统一使用原始评价事件数', 'PRD 应明确教师参与度统计口径。');
requireText(prdSource, '不是教师排行榜或教师考核', 'PRD 应明确教师评价洞察的使用边界。');
requireText(dataSource, 'export interface TeacherEvaluationInsight', '演示数据应使用结构化教师评价洞察。');

for (const insightType of ['participation', 'orientation', 'target_scope']) {
  requireText(dataSource, `insightType: '${insightType}'`, `演示内容缺少教师评价洞察类型：${insightType}`);
}

requireText(adapterSource, 'report.content.evaluationInsights.map', '适配层应将结构化教师评价洞察转换为统一卡片内容。');

console.log('WeeklyActionAdvice teacher evaluation insight assertions passed');
