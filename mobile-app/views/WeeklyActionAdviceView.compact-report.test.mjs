import fs from 'node:fs';
import ts from 'typescript';

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

for (const source of [promptSource, prdSource, dataSource, viewSource]) {
  forbidText(source, 'class_overview', '紧凑周报不应保留 class_overview 字段。');
  forbidText(source, 'classOverview', '紧凑周报不应保留 classOverview 字段。');
}
forbidText(viewSource, "title: '班级速览'", '页面不应继续展示班级速览。');

for (const required of ['<details', '<summary', '查看依据', '收起依据', 'min-h-11', 'var(--tm-border-subtle)', 'var(--tm-text-secondary)']) {
  requireText(viewSource, required, `渐进披露交互缺少：${required}`);
}
requireText(promptSource, '默认展开的报告正文控制在500至700个汉字以内', '提示词应约束默认展开正文长度。');
requireText(prdSource, '默认展开的报告正文长度', 'PRD 应记录紧凑正文指标。');

const sourceFile = ts.createSourceFile('weeklyActionAdvice.ts', dataSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
let reportContent;

const visit = (node) => {
  if (ts.isVariableDeclaration(node) && node.name.getText(sourceFile) === 'FULL_REPORT_CONTENT' && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
    reportContent = node.initializer;
  }
  ts.forEachChild(node, visit);
};
visit(sourceFile);

if (!reportContent) throw new Error('未找到 FULL_REPORT_CONTENT。');

const propertyValue = (object, name) => {
  const property = object.properties.find((item) => ts.isPropertyAssignment(item) && item.name.getText(sourceFile) === name);
  if (!property || !ts.isPropertyAssignment(property)) throw new Error(`缺少属性：${name}`);
  return property.initializer;
};

const stringValue = (object, name) => {
  const value = propertyValue(object, name);
  if (!ts.isStringLiteral(value)) throw new Error(`${name} 必须是字符串。`);
  return value.text;
};

const objectItems = (name) => {
  const value = propertyValue(reportContent, name);
  if (!ts.isArrayLiteralExpression(value)) throw new Error(`${name} 必须是数组。`);
  return value.elements.map((item) => {
    if (!ts.isObjectLiteralExpression(item)) throw new Error(`${name} 必须包含对象。`);
    return item;
  });
};

const namesValue = (object, name) => {
  const value = propertyValue(object, name);
  if (!ts.isArrayLiteralExpression(value)) throw new Error(`${name} 必须是数组。`);
  return value.elements.map((item) => {
    if (!ts.isStringLiteral(item)) throw new Error(`${name} 必须包含字符串。`);
    return item.text;
  }).join('、');
};

const studentSummaries = objectItems('studentInsights').map((item) => (
  `${namesValue(item, 'studentNames')}：${stringValue(item, 'finding')}。${stringValue(item, 'evidence')}。`
));
const teacherSummaries = objectItems('evaluationInsights').map((item) => (
  `${namesValue(item, 'teacherNames')}：${stringValue(item, 'finding')}。${stringValue(item, 'evidence')}。`
));
const classSummaries = objectItems('classInsights').map((item) => (
  `${stringValue(item, 'finding')}。${stringValue(item, 'evidence')}。`
));

const actionsValue = propertyValue(reportContent, 'actions');
if (!ts.isArrayLiteralExpression(actionsValue)) throw new Error('actions 必须是数组。');
const actions = actionsValue.elements.map((item) => {
  if (!ts.isStringLiteral(item)) throw new Error('actions 必须包含字符串。');
  return item.text;
});

for (const summary of studentSummaries) {
  if (summary.length > 70) throw new Error(`学生洞察主结论超过70字：${summary}`);
}
for (const summary of teacherSummaries) {
  if (summary.length > 65) throw new Error(`评价洞察主结论超过65字：${summary}`);
}
for (const summary of classSummaries) {
  if (summary.length > 70) throw new Error(`班级洞察主结论超过70字：${summary}`);
}
for (const action of actions) {
  if (action.length > 35) throw new Error(`本周重点行动超过35字：${action}`);
}

const mainTextLength = [...studentSummaries, ...teacherSummaries, ...classSummaries, ...actions].join('').length;
if (mainTextLength < 500 || mainTextLength > 700) {
  throw new Error(`默认展开正文应为500至700字，当前为${mainTextLength}字。`);
}

console.log(`WeeklyActionAdvice compact report assertions passed (${mainTextLength} chars)`);
