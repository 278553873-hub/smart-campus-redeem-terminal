import assert from 'node:assert/strict';
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const projectRoot = path.resolve(import.meta.dirname, '../..');
const cacheRoot = path.join(projectRoot, 'node_modules/.cache');
fs.mkdirSync(cacheRoot, { recursive: true });
const directory = fs.mkdtempSync(path.join(cacheRoot, 'screen-insight-checks-'));
try {
  const output = path.join(directory, 'checks.mjs');
  await build({
    stdin: {
      contents: `
        import assert from 'node:assert/strict';
        import React from 'react';
        import { renderToStaticMarkup } from 'react-dom/server';
        import { loadStudentEvaluationScreen } from './components/demo-data-screen/studentEvaluationScreenService';
        import { buildScreenInsightDigest, refreshScreenInsightDigest, formatScreenInsightPeriod, SCREEN_INSIGHT_INTERVAL } from './components/demo-data-screen/studentEvaluationScreenInsights';
        import { getPrincipalWeeklyReport } from './mobile-app/data/principalPeriodicReports';
        import { AiEducationInsights } from './components/demo-data-screen/AiEducationInsights';
        import { PRINCIPAL_WEEKLY_SCHOOL_EVIDENCE as evidence } from './mobile-app/data/principalWeeklySchoolEvidence';
        import PrincipalPeriodicReportView from './mobile-app/views/PrincipalPeriodicReportView';
        import { GrowthActivityFeed } from './components/demo-data-screen/GrowthActivityFeed';
        import Screen, { EvaluationScreenContent } from './components/demo-data-screen/StudentEvaluationDataScreen';

        const now = new Date('2026-11-11T10:30:00+08:00').getTime();
        const periods = await loadStudentEvaluationScreen(now);
        const week = periods.week;
        const original = JSON.stringify(week);
        const digest = buildScreenInsightDigest(week);
        assert.equal(digest.periodLabel, '11月2日–11月8日');
        const monday = await loadStudentEvaluationScreen(new Date('2026-11-16T09:29:01+08:00').getTime());
        assert.equal(buildScreenInsightDigest(monday.week).periodLabel, '11月9日–11月15日', '周一显示刚结束的完整自然周');
        assert.equal(getPrincipalWeeklyReport(new Date('2026-11-15T23:59:59+08:00').getTime()).periodLabel, '2026.11.02 - 2026.11.08', '周日尚未结束，不提前切换分析周');
        assert.equal(getPrincipalWeeklyReport(new Date('2026-11-15T16:00:00Z').getTime()).periodLabel, '2026.11.09 - 2026.11.15', '周界以中国时区计算');
        assert.equal(getPrincipalWeeklyReport(new Date('2027-01-04T09:00:00+08:00').getTime()).periodLabel, '2026.12.28 - 2027.01.03', '跨年仍取完整周');
        assert.equal(formatScreenInsightPeriod('2026.10.08 - 2026.10.15'), '10月8日–10月15日');
        assert.equal(formatScreenInsightPeriod('2026.02.30 - 2026.03.01'), undefined);
        assert.equal(formatScreenInsightPeriod('本周'), undefined);
        assert.equal(JSON.stringify(week), original, '适配不修改校长报告或实时统计');
        assert.equal(SCREEN_INSIGHT_INTERVAL, 30000);
        assert.deepEqual(digest.insights.map(item => item.topic), ['育人亮点', '改进重点']);
        const [strength, concern] = digest.insights;
        const report = week.principalReports.weekly;
        assert.equal(strength.items.length, 3, '三条亮点在同一个页面数据内');
        assert.equal(concern.items.length, 1);
        for (const page of digest.insights) for (const item of page.items) {
          assert.equal(item.source.reportId, report.reportId, '两个栏目都取同一份周报');
          const finding = report.cards.flatMap(card => card.kind === 'insights' ? card.items : []).find(entry => entry.id === item.source.findingId);
          assert.equal(item.headline, finding.title);
          assert.equal(item.summary, finding.body, '逐字复用源报告');
          if (page.id === 'growth') assert.equal(item.action, undefined, '亮点不配建议');
          else {
            const action = report.cards.flatMap(card => card.kind === 'actions' ? card.items : []).find(entry => entry.id === item.source.actionId);
            assert.deepEqual(item.action, { title: action.title, body: action.body });
          }
        }
        assert.ok(evidence.cooperation.current.classCount <= evidence.school.activeClassCount);
        assert.ok(evidence.cooperation.current.gradeCount <= evidence.school.gradeCount);
        assert.equal(evidence.inputScope, 'single-report-week');
        assert.equal(evidence.independence.grades.length, evidence.school.gradeCount);
        assert.equal(evidence.independence.grades.reduce((total, item) => total + item.studentCount, 0), evidence.independence.studentCount);
        assert.ok(!('weeks' in evidence.independence) && !('previous' in evidence.cooperation) && !('beforeScenes' in evidence.responsibility), 'mock输入只有一个报告周，不补写历史数据');
        for (const page of digest.insights) for (const item of page.items) {
          assert.ok(!/45%|75%|持续改善|连续提高|越来越|从班级事务延伸|前期/.test(item.headline + item.summary), '单周输入不生成跨周变化');
        }
        assert.ok(evidence.participationGap.limitedParticipationStudents <= evidence.participationGap.cohortSize);
        assert.ok(strength.items[0].summary.includes('6个年级、12个班级'));
        assert.ok(strength.items[1].summary.includes('语文、数学和科学') && strength.items[1].summary.includes('6个年级'));
        assert.ok(strength.items[2].summary.includes('三至六年级8个班级'));
        assert.ok(concern.items[0].action.body.includes('两周') && concern.items[0].action.body.includes('2次') && concern.items[0].action.body.includes('每名孩子承担一项具体工作'));
        const clone = value => JSON.parse(JSON.stringify(value));
        const extra = clone(week);
        extra.principalReports.weekly.cards.find(card => card.key === 'highlights').items.push({ id: 'extra', title: '第四条', body: '不挤进同一页' });
        assert.equal(buildScreenInsightDigest(extra).insights[0].items.length, 3, '亮点最多3条，不追加第三页');
        assert.equal(buildScreenInsightDigest(extra).insights.length, 2);
        const fewer = clone(week);
        fewer.principalReports.weekly.cards.find(card => card.key === 'highlights').items.splice(1);
        assert.equal(buildScreenInsightDigest(fewer).insights[0].items.length, 1, '不足3条时不凑数');
        const reordered = clone(week);
        reordered.principalReports.weekly.cards.reverse();
        reordered.principalReports.weekly.cards.filter(card => card.kind === 'actions').forEach(card => card.items.reverse());
        assert.deepEqual(buildScreenInsightDigest(reordered).insights, digest.insights, '发现与建议不按数组下标配对');
        const withoutAction = clone(week);
        const actionCard = withoutAction.principalReports.weekly.cards.find(card => card.kind === 'actions');
        actionCard.items = actionCard.items.filter(item => item.id !== concern.items[0].source.actionId);
        assert.equal(buildScreenInsightDigest(withoutAction).insights[1].items.length, 0, '无对应建议时不跨报告拼接');
        assert.equal(buildScreenInsightDigest(withoutAction).insights[0].items.length, 3, '亮点不依赖建议');
        const withoutHighlights = clone(week);
        withoutHighlights.principalReports.weekly.cards = withoutHighlights.principalReports.weekly.cards.filter(card => card.key !== 'highlights');
        const missingDigest = buildScreenInsightDigest(withoutHighlights);
        assert.equal(missingDigest.insights[0].items.length, 0, '旧周报缺亮点时不回退月报');
        assert.ok(renderToStaticMarkup(React.createElement(AiEducationInsights, { digest: missingDigest })).includes('暂无可展示的育人亮点'));
        const monthlyOnly = { ...week, principalReports: { monthly: week.principalReports.monthly } };
        assert.deepEqual(buildScreenInsightDigest(monthlyOnly).insights, [], '月报不再是大屏亮点来源');
        const otherSchool = clone(week);
        otherSchool.principalReports.weekly.scope.name = '另一所学校';
        assert.deepEqual(buildScreenInsightDigest(otherSchool).insights, []);
        assert.equal(buildScreenInsightDigest(otherSchool).periodLabel, undefined, '不展示其他学校的报告日期');
        const updatedReport = clone(week);
        const finding = updatedReport.principalReports.weekly.cards.find(card => card.key === 'highlights').items[0];
        finding.body = '保留周报更新后的原句，不在大屏单独改写。';
        const updated = refreshScreenInsightDigest(digest, updatedReport);
        assert.notEqual(updated, digest);
        assert.equal(updated.insights[0].items[0].summary, finding.body);
        const nextEvent = { ...week, updatedAt: now + 5200, report: { ...week.report, summary: { ...week.report.summary, totalEvaluationCount: 999999 } } };
        assert.equal(refreshScreenInsightDigest(digest, nextEvent), digest);
        const empty = { ...week, principalReports: undefined };
        const emptyDigest = buildScreenInsightDigest(empty);
        assert.deepEqual(emptyDigest.insights, []);
        assert.equal(emptyDigest.periodLabel, undefined, '无报告不编造分析周期');
        assert.ok(refreshScreenInsightDigest(emptyDigest, week).insights.length);
        assert.ok(renderToStaticMarkup(React.createElement(AiEducationInsights, { digest: emptyDigest })).includes('暂无可展示的育人分析'));
        const mobile = renderToStaticMarkup(React.createElement(PrincipalPeriodicReportView, { kind: 'weekly', schoolName: week.schoolName, generated: true, onBack: () => {} }));
        for (const item of strength.items) assert.ok(mobile.includes(item.headline) && mobile.includes(item.summary), '手机端显示相同亮点原文');
        for (let index = 0; index < digest.insights.length; index++) {
          const page = digest.insights[index];
          const html = renderToStaticMarkup(React.createElement(AiEducationInsights, { digest, active: index }));
          assert.ok(html.includes('class="demo-insight-period">11月2日–11月8日</span>'), '两页在共同标题右侧显示同一份周报的日期');
          assert.equal((html.match(/role="tab"/g) ?? []).length, 2, '只有亮点和改进重点两页');
          for (const item of page.items) {
            assert.ok(html.includes(item.headline) && html.includes(item.summary));
            if (item.action) assert.ok(html.includes(item.action.title) && html.includes(item.action.body));
            assert.ok(!html.includes(item.source.reportId));
          }
          if (page.id === 'growth') {
            assert.equal((html.match(/class="demo-insight-item"/g) ?? []).length, 3, '亮点同页显示全部三条');
            assert.ok(!html.includes('demo-insight-suggestion') && !html.includes('学校可以先把每个孩子的分工安排清楚'));
            assert.ok(!html.includes('AI建议') && !html.includes('demo-insight-section-heading'), '亮点页不重复叠加区块标签');
          } else {
            assert.ok(!html.includes(strength.items[0].headline));
            assert.ok(html.includes('>AI洞察</h3>') && html.includes('>AI建议</h3>'));
            assert.ok(html.indexOf('>AI洞察</h3>') < html.indexOf(page.items[0].headline));
            assert.ok(html.indexOf('>AI建议</h3>') < html.indexOf(page.items[0].action.title));
            assert.ok(html.includes('class="demo-insight-finding-title"') && html.includes('class="demo-insight-advice-title"'));
            assert.ok(!html.includes('42名') && !html.includes('对照当前') && !html.includes('<dl'), '改进重点使用自然段，不创建专项名单或字段表');
          }
          for (const hidden of ['推广建议', '改进建议', '看变化', '超过13人', '高于13.8%', '示例', '演示', '模拟', '数据截至', '上周', '依据', '来源', '行动回看', '已采纳', '2026', 'demo-insight-chart']) assert.ok(!html.includes(hidden), hidden);
          const full = renderToStaticMarkup(React.createElement(EvaluationScreenContent, { snapshot: periods.term, liveSnapshot: week, insightDigest: digest, activeInsight: index }));
          assert.ok(full.includes('成长趋势') && full.includes('指标使用情况') && full.includes('成长动态'));
        }
        const privateEvent = { ...week.recentEvaluations[0], students: [{ ...week.recentEvaluations[0].students[0], displayName: '李宇航' }] };
        const feed = renderToStaticMarkup(React.createElement(GrowthActivityFeed, { events: [privateEvent] }));
        assert.ok(feed.includes('李*航') && !feed.includes('李宇航'), '动态可见文案与辅助阅读均脱敏');
        const root = renderToStaticMarkup(React.createElement(Screen, {theme:'dark',onThemeChange:()=>{}}));
        assert.ok(root.includes('<span>学生成长全景驾驶舱</span>') && !root.includes('AI素养评价系统'));
        assert.ok(root.includes('href="?app=data-screen" aria-current="page">学校育人全景</a>'));
        assert.ok(root.includes('href="?app=moral-education-screen">德育管理全景</a>'));
        globalThis.window = { localStorage: { getItem: key => key === 'campus-school-basic-info:v1:school-star' ? JSON.stringify({ version: 1, displayName: '星河实验小学', logoUrl: '', features: '' }) : null } };
        const namedRoot = renderToStaticMarkup(React.createElement(Screen, {theme:'dark',onThemeChange:()=>{}}));
        assert.ok(namedRoot.includes('aria-label="星河实验小学学生成长全景驾驶舱"'));
        assert.ok(namedRoot.includes('screen-panorama-school-name">星河实验小学</span><span>学生成长全景驾驶舱</span>'));
        assert.ok(!namedRoot.includes('<span title="星河实验小学">'), '左上角不重复显示学校名称');
        delete globalThis.window;
        assert.ok(!JSON.stringify(digest).includes('studentId') && !JSON.stringify(digest).includes('teacherName'), '公共分析结果不包含个体身份');
        console.log('AI育人洞察检查通过：周报三条亮点同页、无亮点建议、两页切换、手机端同文、报告更新及空态。');
      `,
      resolveDir: projectRoot, sourcefile: 'screen-insight-checks.tsx', loader: 'tsx',
    },
    outfile: output, bundle: true, platform: 'node', format: 'esm', packages: 'external', loader: { '.css': 'empty' }, logLevel: 'silent', metafile: true,
  });
  await import(pathToFileURL(output).href);
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
