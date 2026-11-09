import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const projectRoot = path.resolve(import.meta.dirname, '../..');
const cacheRoot = path.join(projectRoot, 'node_modules/.cache');
fs.mkdirSync(cacheRoot, { recursive: true });
const workDirectory = fs.mkdtempSync(path.join(cacheRoot, 'student-demo-evaluation-screen-'));
try {
  const output = path.join(workDirectory, 'checks.mjs');
  const compiled = await build({
    stdin: {
      contents: `
        import assert from 'node:assert/strict';
        import React from 'react';
        import { renderToStaticMarkup } from 'react-dom/server';
        import { loadStudentEvaluationScreen, reconcileDemoGradeRecords, withDemoTeacherNames } from './components/demo-data-screen/studentEvaluationScreenService';
        import { createEvaluationScreenSnapshot, createDemoScreenEvaluation, applyScreenEvaluation, applyEvaluationToPeriods, percentage, SCREEN_PERIODS, maskScreenStudentName, screenIndicatorCoverage } from './components/demo-data-screen/studentEvaluationScreenModel';
        import { EvaluationScreenContent } from './components/demo-data-screen/StudentEvaluationDataScreen';
        import { FiveEducationHero } from './components/demo-data-screen/FiveEducationHero';
        import { TeacherEvaluationFootprints, LiveEvaluationFeed, StudentScoreChanges, GradeCoverage, GradeEvaluationRecords } from './components/demo-data-screen/StudentEvaluationCharts';
        import { getScreenCanvasLayout } from './components/demo-data-screen/useScreenCanvasLayout';
        import { getLeaderReportSnapshot } from './mobile-app/services/leaderReportService';

        const now = new Date('2026-11-06T10:30:00+08:00').getTime();
        const periods = await loadStudentEvaluationScreen(now);
        const originalBaseline = await getLeaderReportSnapshot({ period: 'week' });
        const baseline = withDemoTeacherNames(reconcileDemoGradeRecords(originalBaseline));
        const week = periods.week;
        assert.deepEqual(week.report, baseline, '历史动态节选不能重复增加存量统计');
        for (const { key } of SCREEN_PERIODS) {
          const report = periods[key].report;
          assert.equal(report.gradeCoverages.reduce((sum, grade) => sum + grade.evaluationRecords, 0), report.summary.totalEvaluationCount, '年级记录分项之和必须等于学校总记录条数');
          for (const grade of report.gradeCoverages) assert.equal(grade.classes.reduce((sum, item) => sum + item.evaluationRecords, 0), grade.evaluationRecords);
        }
        assert.deepEqual(originalBaseline, await getLeaderReportSnapshot({ period: 'week' }), 'Demo适配不能修改共享报表数据');
        assert.equal(week.schoolName, '星河实验学校');
        assert.equal(week.recentEvaluations.length, 8);
        assert.ok(week.recentEvaluations.every(event => event.students.every(student => student.displayName.includes('**'))));

        assert.equal(maskScreenStudentName('王明'), '王**');
        assert.equal(maskScreenStudentName('李宇航'), '李**航');
        assert.equal(maskScreenStudentName('李**航'), '李**航');
        assert.equal(maskScreenStudentName(''), '**');
        const usageFixture = [{ id: 'virtue', name: '崇德', children: [
          { id: 'a', name: '文明守纪', children: [
            { id: 'a1', name: '爱护公物', weekCount: 0, monthCount: 0, termCount: 3 },
            { id: 'a2', name: '遵守纪律', weekCount: 0, monthCount: 0, termCount: 0 },
          ] },
          { id: 'b', name: '诚信自律', children: [] },
        ] }];
        assert.deepEqual(screenIndicatorCoverage(usageFixture, 'term'), {
          second: { covered: 1, total: 2, percent: 50 }, third: { covered: 1, total: 2, percent: 50 },
        });
        assert.equal(screenIndicatorCoverage(usageFixture, 'week').third.percent, 0);
        assert.equal(screenIndicatorCoverage([], 'term').second.percent, 0);

        const batch = createDemoScreenEvaluation(week, 15, now + 5200);
        assert.equal(batch.students.length, 3);
        assert.equal(batch.indicatorPath.length, 3);
        assert.equal(batch.indicatorPath[2], batch.indicator);
        assert.ok(baseline.indicatorUsage.some(group => group.children.some(second => second.children.some(third => third.id === batch.indicatorId))));
        const updated = applyScreenEvaluation(week, batch);
        assert.equal(updated.report.summary.totalRecords, week.report.summary.totalRecords + 1, '评价三人只计一次评价');
        assert.equal(updated.report.summary.totalEvaluationCount, week.report.summary.totalEvaluationCount + 3, '评价三人生成三条成长记录');
        assert.equal(updated.report.summary.totalCoveredStudents, week.report.summary.totalCoveredStudents, '重复评价已覆盖学生不能增加覆盖人数');
        const oldDimension = week.report.fiveEducationStats.find(item => item.key === batch.dimension);
        const newDimension = updated.report.fiveEducationStats.find(item => item.key === batch.dimension);
        assert.equal(newDimension.plusScore - oldDimension.plusScore, batch.students.reduce((sum, student) => sum + student.delta, 0));
        assert.equal(newDimension.eventCount, oldDimension.eventCount + 3);
        const oldTeacher = week.report.teachers.find(teacher => teacher.id === batch.teacherId);
        const newTeacher = updated.report.teachers.find(teacher => teacher.id === batch.teacherId);
        assert.equal(newTeacher.records, oldTeacher.records + 1);
        assert.equal(newTeacher.evaluationCount, oldTeacher.evaluationCount + 3);
        const oldGrade = week.report.gradeCoverages.find(grade => grade.id === batch.gradeId);
        const newGrade = updated.report.gradeCoverages.find(grade => grade.id === batch.gradeId);
        assert.equal(newGrade.evaluationRecords, oldGrade.evaluationRecords + 3);
        const thirdById = report => report.indicatorUsage.flatMap(group => group.children).flatMap(second => second.children).find(third => third.id === batch.indicatorId);
        assert.equal(thirdById(updated.report).termCount, thirdById(week.report).termCount + 3);
        assert.equal(applyScreenEvaluation(updated, batch), updated, '同一事件不能重复入账');
        assert.equal(applyScreenEvaluation(week, { ...batch, teacherId: 'unknown' }), week, '未知学校成员的事件应被忽略');

        const negative = createDemoScreenEvaluation(updated, 14, now + 10400);
        assert.ok(negative.students[0].delta < 0);
        const afterNegative = applyScreenEvaluation(updated, negative);
        const previousNegativeDimension = updated.report.fiveEducationStats.find(item => item.key === negative.dimension);
        const negativeDimension = afterNegative.report.fiveEducationStats.find(item => item.key === negative.dimension);
        assert.equal(negativeDimension.minusScore, previousNegativeDimension.minusScore - negative.students[0].delta);
        assert.equal(negativeDimension.netScore, previousNegativeDimension.netScore + negative.students[0].delta);
        assert.equal(afterNegative.studentScores[negative.students[0].studentId], negative.students[0].afterScore);

        const synchronized = applyEvaluationToPeriods(periods, batch);
        for (const { key } of SCREEN_PERIODS) {
          assert.equal(synchronized[key].report.summary.totalRecords, periods[key].report.summary.totalRecords + 1, key + '周期应收到相同实时事件');
          assert.equal(synchronized[key].report.summary.totalEvaluationCount, periods[key].report.summary.totalEvaluationCount + 3);
          assert.equal(synchronized[key].studentScores[batch.students[0].studentId], batch.students[0].afterScore);
        }

        let running = afterNegative;
        for (let sequence = 20; sequence < 280; sequence += 1) {
          const event = createDemoScreenEvaluation(running, sequence, now + sequence * 5200);
          running = applyScreenEvaluation(running, event);
        }
        assert.equal(running.recentEvaluations.length, 12, '长期播报应限制动态列表大小');
        assert.equal(running.processedIds.length, 200, '长期播报应限制去重缓存大小');
        assert.ok(running.report.summary.activeTeachers <= running.report.summary.totalTeachers);
        assert.deepEqual(baseline, week.report, '增量聚合不得修改原报表');
        assert.equal(percentage(1, 0), 0);
        const emptyReport = { ...baseline, teachers: [], gradeCoverages: [], fiveEducationStats: [], summary: Object.fromEntries(Object.keys(baseline.summary).map(key => [key, 0])) };
        const empty = createEvaluationScreenSnapshot(emptyReport, '空学校', now);
        assert.equal(empty.recentEvaluations.length, 0);
        assert.equal(createDemoScreenEvaluation(empty, 1, now), null);

        for (const snapshot of [afterNegative, empty]) {
          const html = renderToStaticMarkup(React.createElement(EvaluationScreenContent, { snapshot, gradePage: 0, onGradePageChange: () => {} }));
          assert.ok(html.includes('成长记录条数'));
          assert.ok(html.includes('最新评价'));
          assert.ok(!html.includes('NaN') && !html.includes('Infinity'));
          assert.ok(!html.includes('本学期累计净得分'), '动态积分不能冒用学期累计口径');
          if (snapshot === empty) {
            assert.ok(html.includes('本周期暂无已归类的五育记录'));
            assert.ok(html.includes('暂无年级学生数据'));
            assert.ok(!html.includes('data-education='), '无五育记录时不显示空环图');
          }
        }
        const privacyEvent = { ...batch, indicatorPath: ['崇德', '文明守纪', '爱护公物'], students: [{ ...batch.students[0], displayName: '李宇航', delta: 3 }] };
        const studentHtml = renderToStaticMarkup(React.createElement(StudentScoreChanges, { events: [privacyEvent] }));
        assert.ok(studentHtml.includes('李**航') && !studentHtml.includes('李宇航'), '脱敏需覆盖可见文字、标题及辅助阅读信息');
        assert.ok(studentHtml.includes('崇德') && studentHtml.includes('+3分'));
        assert.ok(!studentHtml.includes('文明守纪') && !studentHtml.includes('爱护公物') && !studentHtml.includes('净得分从'));
        const feedHtml = renderToStaticMarkup(React.createElement(LiveEvaluationFeed, { events: [privacyEvent] }));
        assert.ok(feedHtml.includes('崇德-文明守纪-爱护公物') && feedHtml.includes('+3分'));
        assert.ok(!feedHtml.includes(batch.className) && !feedHtml.includes('李宇航') && !feedHtml.includes('×'));
        const contentHtml = renderToStaticMarkup(React.createElement(EvaluationScreenContent, { snapshot: afterNegative, gradePage: 0, onGradePageChange: () => {} }));
        for (const title of ['年级评价数', '指标使用情况', '二级指标', '三级指标']) assert.ok(contentHtml.includes(title));
        assert.ok(!contentHtml.includes('多人评价计1次') && !contentHtml.includes('1位学生计1条'));
        const secondPageHtml = renderToStaticMarkup(React.createElement(EvaluationScreenContent, { snapshot: periods.term, gradePage: 1, onGradePageChange: () => {} }));
        assert.ok(secondPageHtml.includes(periods.term.report.gradeCoverages[6].name), '年级评价数和覆盖率应同步显示后续年级');

        const liveSnapshot = { ...afterNegative, recentEvaluations: [{ ...batch, teacherName: '独立动态教师' }] };
        const periodHtml = renderToStaticMarkup(React.createElement(EvaluationScreenContent, { snapshot: periods.today, liveSnapshot, gradePage: 0, onGradePageChange: () => {} }));
        assert.ok(!periodHtml.includes('今日 · 已归类'));
        assert.ok(periodHtml.includes('五育事件占比'));
        assert.ok(periodHtml.includes('五育类别'));
        assert.ok(periodHtml.includes('独立动态教师'), '周期统计与最新动态使用各自的数据源');
        const heroHtml = renderToStaticMarkup(React.createElement(FiveEducationHero, { dimensions: week.report.fiveEducationStats, periodLabel: '本周', visible: true, reducedMotion: false }));
        assert.equal((heroHtml.match(/data-education=/g) ?? []).length, 5, '首次渲染应直接包含五育扇区，无需等待图表异步初始化');
        assert.ok(!heroHtml.includes('<polyline'), '移除外侧引导线，底部集中显示类别和占比');
        assert.ok(heroHtml.includes('hero-legend-label') && heroHtml.includes('hero-focus'));
        const singleDimension = week.report.fiveEducationStats.map((item, index) => ({ ...item, eventCount: index ? 0 : 10 }));
        const singleHeroHtml = renderToStaticMarkup(React.createElement(FiveEducationHero, { dimensions: singleDimension, periodLabel: '本周', visible: true, reducedMotion: false }));
        assert.equal((singleHeroHtml.match(/data-education=/g) ?? []).length, 1, '单一类别应绘制完整环形');
        assert.ok(!singleHeroHtml.includes('NaN') && !singleHeroHtml.includes('Infinity'));
        const fiveRowsFeed = renderToStaticMarkup(React.createElement(LiveEvaluationFeed, { events: week.recentEvaluations }));
        assert.equal((fiveRowsFeed.match(/<li /g) ?? []).length, 5, '最新评价固定五条');
        const fiveRowsStudents = renderToStaticMarkup(React.createElement(StudentScoreChanges, { events: week.recentEvaluations }));
        assert.equal((fiveRowsStudents.match(/<article /g) ?? []).length, 5, '学生积分变化固定五条');
        for (const hidden of ['前10位 · 评价次数', '已使用 / 总指标', '实时演示', '已覆盖 / 总人数', 'demo-evaluation-screen-grade-count', 'demo-evaluation-screen-gauge-count']) assert.ok(!contentHtml.includes(hidden));
        assert.ok(week.report.teachers.every(teacher => !teacher.name.includes('老师') && !teacher.name.includes('主任')));
        assert.ok(week.recentEvaluations.every(event => event.teacherName === week.report.teachers.find(teacher => teacher.id === event.teacherId).name));
        const rankGrades = Array.from({ length: 8 }, (_, index) => ({ id: 'rank-' + index, name: '年级' + index, shortName: String(index), covered: index + 1, total: 10, evaluationRecords: index + 1, classes: [] }));
        for (const Component of [GradeCoverage, GradeEvaluationRecords]) {
          for (const [page, expected] of [[0, 1], [1, 2]]) {
            const html = renderToStaticMarkup(React.createElement(Component, { grades: rankGrades, page, onPageChange: () => {} }));
            assert.equal((html.match(/class="is-top-grade"/g) ?? []).length, expected, '年级前三名按全校排名，不按当前页排名');
          }
        }
        const teacherHtml = renderToStaticMarkup(React.createElement(TeacherEvaluationFootprints, { teachers: periods.term.report.teachers }));
        assert.equal((teacherHtml.match(/<li>/g) ?? []).length, 10, '教师评价排行同时显示前10名');
        for (const [width, height] of [[1920, 1080], [2560, 1080], [1920, 1440], [320, 820]]) {
          const layout = getScreenCanvasLayout(width, height);
          assert.ok(Math.abs(layout.canvasWidth * layout.scale - width) < .001, '画布应铺满窗口宽度');
          assert.ok(Math.abs(layout.canvasHeight * layout.scale - height) < .001, '画布应铺满窗口高度');
          assert.ok(layout.canvasWidth >= 1920 && layout.canvasHeight >= 1080, '保留足够的内容排布空间');
        }
        console.log('学生评价大屏检查通过：多人评价口径、加减分、去重、覆盖人数、周期同步、缓存边界及真实组件渲染。');
      `,
      resolveDir: projectRoot,
      sourcefile: 'student-demo-evaluation-screen-checks.tsx',
      loader: 'tsx',
    },
    outfile: output,
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    loader: { '.css': 'empty' },
    logLevel: 'silent',
    metafile: true,
  });
  assert.ok(!Object.keys(compiled.metafile.inputs).some(file => file.startsWith('components/data-screen/')), 'Demo 方案不能依赖学校 PC 方案的组件、样式或演示状态');
  await import(pathToFileURL(output).href);
} finally {
  fs.rmSync(workDirectory, { recursive: true, force: true });
}
