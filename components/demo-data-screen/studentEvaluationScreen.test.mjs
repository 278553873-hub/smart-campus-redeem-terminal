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
        import { loadStudentEvaluationScreen } from './components/demo-data-screen/studentEvaluationScreenService';
        import { createEvaluationScreenSnapshot, createDemoScreenEvaluation, applyScreenEvaluation, applyEvaluationToPeriods, percentage, SCREEN_PERIODS } from './components/demo-data-screen/studentEvaluationScreenModel';
        import { EvaluationScreenContent } from './components/demo-data-screen/StudentEvaluationDataScreen';
        import { getLeaderReportSnapshot } from './mobile-app/services/leaderReportService';

        const now = new Date('2026-11-06T10:30:00+08:00').getTime();
        const periods = await loadStudentEvaluationScreen(now);
        const baseline = await getLeaderReportSnapshot({ period: 'week' });
        const week = periods.week;
        assert.deepEqual(week.report, baseline, '历史动态节选不能重复增加存量统计');
        assert.equal(week.schoolName, '星河实验学校');
        assert.equal(week.recentEvaluations.length, 8);
        assert.ok(week.recentEvaluations.every(event => event.students.every(student => student.displayName.endsWith('同学'))));

        const batch = createDemoScreenEvaluation(week, 15, now + 5200);
        assert.equal(batch.students.length, 3);
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
          const html = renderToStaticMarkup(React.createElement(EvaluationScreenContent, { snapshot, gradePage: 0, onGradePageChange: () => {}, playing: true }));
          assert.ok(html.includes('成长记录条数'));
          assert.ok(html.includes('校园评价正在发生'));
          assert.ok(!html.includes('NaN') && !html.includes('Infinity'));
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
