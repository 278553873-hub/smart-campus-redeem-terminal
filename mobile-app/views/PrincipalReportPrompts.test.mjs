import fs from 'node:fs';

const weeklyPrompt = fs.readFileSync(new URL('../../docs/校长助理_本周管理建议_内容生成提示词.md', import.meta.url), 'utf8');
const monthlyPrompt = fs.readFileSync(new URL('../../docs/校长助理_上月学校复盘_内容生成提示词.md', import.meta.url), 'utf8');
const termPrompt = fs.readFileSync(new URL('../../docs/校长助理_学期学校报告_内容生成提示词.md', import.meta.url), 'utf8');
const prdSource = fs.readFileSync(new URL('../../docs/PRD-校长助理周月学期报告.md', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

for (const [name, prompt, version, reportType] of [
  ['周报告', weeklyPrompt, 'principal_weekly_advice_v1', 'weekly_advice'],
  ['月报告', monthlyPrompt, 'principal_monthly_review_v1', 'monthly_review'],
  ['学期报告', termPrompt, 'principal_term_report_v1', 'term_report'],
]) {
  for (const required of [
    version,
    reportType,
    'System Prompt',
    'User Prompt模板',
    '输入JSON',
    '输出JSON',
    '只依据输入JSON',
    '不得自行计数',
    '生成后校验',
  ]) {
    requireText(prompt, required, `${name}提示词缺少关键规则：${required}`);
  }
}

for (const required of [
  'docs/校长助理_本周管理建议_内容生成提示词.md',
  'docs/校长助理_上月学校复盘_内容生成提示词.md',
  'docs/校长助理_学期学校报告_内容生成提示词.md',
  '周报告建议最多60条代表记录',
  '月报告建议最多100条代表记录',
  '学期报告每个章节建议最多120条代表记录',
]) {
  requireText(prdSource, required, `校长助理PRD缺少提示词或输入预算：${required}`);
}

console.log('Principal report prompt assertions passed');
