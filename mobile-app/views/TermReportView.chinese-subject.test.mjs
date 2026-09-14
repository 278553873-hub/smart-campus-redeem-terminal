import assert from 'node:assert/strict';
import fs from 'node:fs';

const reportSource = fs.readFileSync(new URL('./TermReportView.tsx', import.meta.url), 'utf8');
const chartSource = fs.readFileSync(new URL('../components/SubjectRadarChart.tsx', import.meta.url), 'utf8');
const constantsSource = fs.readFileSync(new URL('../constants.ts', import.meta.url), 'utf8');
const demoDataSource = fs.readFileSync(new URL('../data/firstGradeChineseTermReport.ts', import.meta.url), 'utf8');

for (const dimension of ['课堂小明星', '识字小达人', '小小书法家', '朗读小明星', '自信小话家']) {
  assert.match(demoDataSource, new RegExp(dimension), `一年级语文雷达图应包含“${dimension}”。`);
}

assert.match(reportSource, /scale=\{usesFirstGradeChineseRubric \? 'stars' : 'score'\}/);
assert.match(reportSource, /usesFirstGradeChineseRubric \? '期末总评' : '学期等级'/);
assert.match(reportSource, /return `\$\{Math\.round\(averageStars\)\}星`/);
assert.match(reportSource, /role="tablist" aria-label="切换学科报告"/);
assert.match(reportSource, /min-h-\[var\(--tm-size-touch\)\]/);
assert.match(reportSource, /className="flex min-h-full w-full flex-col bg-white animate-in slide-in-from-right duration-300"/);
assert.doesNotMatch(reportSource, /w-full h-full bg-white z-\[60\] flex flex-col sticky top-0/);
assert.match(chartSource, /scale\?: 'score' \| 'stars'/);
assert.match(chartSource, /scale === 'stars' \? clampedScore === 4 : rate >= 85/);
assert.match(chartSource, /const scoreRadius = Math\.max\(18, pointRadius - 16\)/);
assert.doesNotMatch(chartSource, /scoreRadius = \(\(item\.normalizedScore \/ 5\) \* radius\) \+ 25/);
assert.match(constantsSource, /'语文': FIRST_GRADE_CHINESE_GENERATED_REPORT/);
assert.match(demoDataSource, /dailyEvaluationRecords: \[/);
assert.match(demoDataSource, /indicatorPath: \['语文综合素质评价', '朗读小明星', '正确、流利、有感情地朗读课文'\]/);
assert.match(demoDataSource, /老师很欣慰地发现/);
assert.match(demoDataSource, /细心观察、主动联想和乐于表达/);
assert.match(demoDataSource, /不妨每天挑一小段喜欢的文字/);
assert.match(demoDataSource, /evidenceRecordIds: \['chinese-record-06', 'chinese-record-07'\]/);

const generatedContents = [...demoDataSource.matchAll(/content: '([^']+)'/g)].map(match => match[1]);
assert.equal(generatedContents.length, 3, '语文学科报告应保留三个原有内容板块。');

for (const content of generatedContents) {
  assert.ok(content.length >= 60 && content.length <= 150, '每段报告内容应为60～150字。');
  assert.doesNotMatch(content, /^(恭喜你|希望你|再接再厉)/, '报告不应使用万能套话开头。');
  assert.doesNotMatch(content, /该生|\*\*|<strong>/, '报告应直接与学生交流，并保持纯文本。');
}

console.log('TermReportView 一年级语文学科报告测试通过');
