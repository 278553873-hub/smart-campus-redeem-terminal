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
        import { alignDemoLevelOneStats } from './components/demo-data-screen/studentEvaluationScreenIndicators';
        import { createEvaluationScreenSnapshot, createDemoScreenEvaluation, applyScreenEvaluation, applyEvaluationToPeriods, percentage, SCREEN_PERIODS, maskScreenStudentName, screenIndicatorCoverage, screenFiveEducationStats } from './components/demo-data-screen/studentEvaluationScreenModel';
        import { EvaluationScreenContent } from './components/demo-data-screen/StudentEvaluationDataScreen';
        import { GradeEvaluationTimesChart } from './components/demo-data-screen/GradeEvaluationTimes';
        import { getGradeEvaluationPage } from './components/demo-data-screen/studentEvaluationScreenGrades';
        import { FiveEducationHero, getHeroCalloutLayout, getHeroSectorTransform, getHeroSectorPath } from './components/demo-data-screen/FiveEducationHero';
        import { HERO_SELECTION, interpolateHeroEmphasis } from './components/demo-data-screen/useHeroSectorMotion';
        import { TeacherEvaluationFootprints, LiveEvaluationFeed, StudentScoreChanges, GradeCoverage, GradeEvaluationRecords, IndicatorUsage, formatScreenUpdatedAt, formatScreenWeekday } from './components/demo-data-screen/StudentEvaluationCharts';
        import { GrowthTrend, getGrowthTrendScale } from './components/demo-data-screen/GrowthTrend';
        import { applyGrowthEvaluation, screenGrowthWeekStart, formatGrowthWeek } from './components/demo-data-screen/studentEvaluationScreenGrowth';
        import { getScreenCanvasLayout } from './components/demo-data-screen/useScreenCanvasLayout';
        import { getLeaderReportSnapshot } from './mobile-app/services/leaderReportService';
        import { classReportIndicatorDemoPaths } from './mobile-app/data/classReportIndicatorDemo';

        const now = new Date('2026-11-06T10:30:00+08:00').getTime();
        const catalogBefore = JSON.stringify(classReportIndicatorDemoPaths);
        const periods = await loadStudentEvaluationScreen(now);
        assert.equal(JSON.stringify(classReportIndicatorDemoPaths), catalogBefore, '大屏不得修改现有学生评价指标源');
        const originalBaseline = await getLeaderReportSnapshot({ period: 'week' });
        const week = periods.week;
        assert.equal(week.growthTrend.length, 7, '成长趋势展示本周及前六周');
        for (const period of Object.values(periods)) assert.deepEqual(period.growthTrend, week.growthTrend, '趋势独立于报表周期，不能把学期人数当作本周人数');
        for (const [index, item] of week.growthTrend.entries()) {
          assert.equal(item.weekStart, screenGrowthWeekStart(now) - (6 - index) * 7 * 86400000);
          assert.equal(new Set(item.recordedStudentIds).size, item.recordedStudentIds.length);
          assert.equal(new Set(item.praisedStudentIds).size, item.praisedStudentIds.length);
          assert.ok(item.praisedStudentIds.every(id => item.recordedStudentIds.includes(id)), '获表扬学生必须属于同周被记录学生');
          assert.ok(item.recordedStudentIds.length <= week.report.summary.totalStudents);
        }
        assert.equal(screenGrowthWeekStart(new Date('2027-01-03T23:59:59+08:00').getTime()), new Date('2026-12-28T00:00:00+08:00').getTime(), '跨年周仍从北京时间周一开始');
        assert.equal(screenGrowthWeekStart(new Date('2027-01-04T00:00:00+08:00').getTime()), new Date('2027-01-04T00:00:00+08:00').getTime());
        const baseline = alignDemoLevelOneStats(withDemoTeacherNames(reconcileDemoGradeRecords(originalBaseline)), week.report.indicatorUsage);
        assert.deepEqual(week.report, baseline, '历史动态节选不能重复增加存量统计');
        for (const { key } of SCREEN_PERIODS) {
          const report = periods[key].report;
          const sourceReport = await getLeaderReportSnapshot({ period: key });
          const schoolFirstNames = [...new Set(classReportIndicatorDemoPaths.map(path => path[0]))];
          assert.deepEqual(report.fiveEducationStats.map(item => item.name), schoolFirstNames, '主图及加减分使用学校配置的全部一级指标，乐创单独展示');
          assert.equal(new Set(report.fiveEducationStats.map(item => item.key)).size, schoolFirstNames.length, '各一级指标使用独立统计标识');
          for (const field of ['eventCount', 'positiveEventCount', 'negativeEventCount', 'plusScore', 'minusScore', 'netScore']) {
            assert.equal(report.fiveEducationStats.reduce((sum, item) => sum + item[field], 0), sourceReport.fiveEducationStats.reduce((sum, item) => sum + item[field], 0), '一级适配不能增减原有总量：' + key + ' ' + field);
          }
          assert.equal(report.gradeCoverages.reduce((sum, grade) => sum + grade.evaluationRecords, 0), report.summary.totalEvaluationCount, '年级记录分项之和必须等于学校总记录条数');
          assert.equal(periods[key].gradeEvaluationCounts.reduce((sum, grade) => sum + grade.evaluationTimes, 0), report.summary.totalRecords, '年级评价次数总和与全校次数一致，区别于成长记录条数');
          for (const grade of report.gradeCoverages) assert.equal(grade.classes.reduce((sum, item) => sum + item.evaluationRecords, 0), grade.evaluationRecords);
        }
        assert.deepEqual(originalBaseline, await getLeaderReportSnapshot({ period: 'week' }), 'Demo适配不能修改共享报表数据');
        assert.equal(week.schoolName, '星河实验学校');
        assert.equal(week.recentEvaluations.length, 8);
        assert.ok(week.recentEvaluations.every(event => event.students.every(student => Array.from(student.displayName)[1] === '*' && !student.displayName.includes('**'))));

        assert.equal(maskScreenStudentName('王明'), '王*');
        assert.equal(maskScreenStudentName('李宇航'), '李*航');
        assert.equal(maskScreenStudentName('李**航'), '李*航');
        assert.equal(maskScreenStudentName('欧阳慕晴'), '欧*慕晴');
        assert.equal(maskScreenStudentName('赵*航同学'), '赵*航');
        assert.equal(maskScreenStudentName(''), '*');
        const catalogPaths = classReportIndicatorDemoPaths.map(path => path.join('-'));
        const screenPaths = week.report.indicatorUsage.flatMap(first => first.children.flatMap(second => second.children.map(third => [first.name, second.name, third.name].join('-'))));
        assert.deepEqual(screenPaths, catalogPaths, '所有一级、二级、三级指标必须直接采用学生评价目录');
        const thirdUsage = week.report.indicatorUsage.flatMap(first => first.children).flatMap(second => second.children);
        for (const [period, field] of [['week', 'weekCount'], ['month', 'monthCount'], ['term', 'termCount']]) {
          assert.equal(thirdUsage.reduce((sum, third) => sum + third[field], 0), periods[period].report.summary.totalEvaluationCount, '模拟指标记录分项必须与对应周期总记录数一致');
        }
        assert.ok(thirdUsage.some(third => third.termCount === 0) && thirdUsage.some(third => third.termCount > 0), '保留未使用指标，不能把使用率固定为100%');
        assert.ok(thirdUsage.every(third => third.weekCount <= third.monthCount && third.monthCount <= third.termCount));
        assert.ok(week.recentEvaluations.every(event => catalogPaths.includes(event.indicatorPath.join('-'))));
        for (let sequence = 0; sequence < 66; sequence++) {
          const event = createDemoScreenEvaluation(week, sequence, now + sequence);
          const stat = week.report.fiveEducationStats.find(item => item.key === event.dimension);
          assert.equal(stat.name, event.indicatorPath[0], '轮播、加减分与动态使用同一一级名称');
          assert.equal(event.dimensionName, event.indicatorPath[0]);
        }
        const innovationEvent = createDemoScreenEvaluation(week, 5, now + 5);
        assert.equal(innovationEvent.indicatorPath[0], '乐创');
        assert.equal(innovationEvent.dimension, 'innovation');
        const afterInnovation = applyScreenEvaluation(week, innovationEvent);
        assert.deepEqual(afterInnovation.report.fiveEducationStats.find(item => item.key === 'wisdom'), week.report.fiveEducationStats.find(item => item.key === 'wisdom'), '乐创事件不能串入求知的统计');
        assert.equal(afterInnovation.report.fiveEducationStats.find(item => item.key === 'innovation').eventCount, week.report.fiveEducationStats.find(item => item.key === 'innovation').eventCount + innovationEvent.students.length);
        assert.equal(afterInnovation.report.indicatorUsage.find(group => group.name === '乐创').children[0].children.reduce((sum, item) => sum + item.weekCount, 0), week.report.indicatorUsage.find(group => group.name === '乐创').children[0].children.reduce((sum, item) => sum + item.weekCount, 0) + innovationEvent.students.length);
        assert.ok(week.recentEvaluations.every(event => thirdUsage.find(third => third.id === event.indicatorId).weekCount > 0), '历史节选只能使用周期内已记录的指标');
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
        const growthEvent = { ...batch, students: [
          { ...batch.students[0], studentId: 'praised', delta: 1 },
          { ...batch.students[0], studentId: 'praised', delta: 2 },
          { ...batch.students[0], studentId: 'negative', delta: -1 },
          { ...batch.students[0], studentId: 'neutral', delta: 0 },
        ] };
        const growth = applyGrowthEvaluation([], growthEvent);
        assert.equal(growth.at(-1).recordedStudentIds.length, 3, '多人、零分和负分记录均按学生标识去重');
        assert.equal(growth.at(-1).praisedStudentIds.length, 1, '仅正分记录计入获表扬人数');
        assert.deepEqual(applyGrowthEvaluation(growth, { ...growthEvent, id: 'repeat' }), growth, '同一周跨评价、跨指标的重复学生不重复计人');
        const nextGrowth = applyGrowthEvaluation(growth, { ...growthEvent, occurredAt: growthEvent.occurredAt + 7 * 86400000 });
        assert.equal(nextGrowth.length, 7);
        assert.equal(nextGrowth.at(-1).recordedStudentIds.length, 3, '同一学生在新的一周独立计人');
        assert.deepEqual(nextGrowth.at(-2), growth.at(-1), '跨周保留上一周人数');
        const advancedGrowth = applyGrowthEvaluation(growth, { ...growthEvent, occurredAt: growthEvent.occurredAt + 9 * 7 * 86400000 });
        assert.ok(advancedGrowth.slice(0, -1).every(item => !item.recordedStudentIds.length), '长期停留后按最近七周补空周并淘汰过期周');
        assert.equal(batch.students.length, 3);
        assert.equal(batch.indicatorPath.length, 3);
        assert.equal(batch.indicatorPath[2], batch.indicator);
        assert.ok(baseline.indicatorUsage.some(group => group.children.some(second => second.children.some(third => third.id === batch.indicatorId))));
        const updated = applyScreenEvaluation(week, batch);
        assert.equal(updated.gradeEvaluationCounts.find(grade => grade.id === batch.gradeId).evaluationTimes, week.gradeEvaluationCounts.find(grade => grade.id === batch.gradeId).evaluationTimes + 1, '一条多人评价只计1次');
        assert.deepEqual(updated.gradeEvaluationCounts.filter(grade => grade.id !== batch.gradeId), week.gradeEvaluationCounts.filter(grade => grade.id !== batch.gradeId));
        assert.deepEqual(applyScreenEvaluation(updated, batch).gradeEvaluationCounts, updated.gradeEvaluationCounts, '重复事件不增加次数');
        assert.deepEqual(updated.growthTrend, applyGrowthEvaluation(week.growthTrend, batch), '新评价同步更新成长趋势');
        assert.equal(updated.report.summary.totalRecords, week.report.summary.totalRecords + 1, '评价三人只计一次评价');
        assert.equal(updated.report.summary.totalEvaluationCount, week.report.summary.totalEvaluationCount + 3, '评价三人生成三条成长记录');
        assert.equal(updated.report.summary.totalCoveredStudents, week.report.summary.totalCoveredStudents, '重复评价已覆盖学生不能增加覆盖人数');
        const oldDimension = week.report.fiveEducationStats.find(item => item.key === batch.dimension);
        const newDimension = updated.report.fiveEducationStats.find(item => item.key === batch.dimension);
        assert.equal(newDimension.plusScore - oldDimension.plusScore, batch.students.reduce((sum, student) => sum + student.delta, 0));
        assert.equal(newDimension.eventCount, oldDimension.eventCount + 3);
        const positiveStudents = (snapshot, key) => screenFiveEducationStats(snapshot).find(item => item.key === key).positiveStudentCount;
        const expectedPositiveIds = new Set([...(week.positiveStudentIdsByDimension[batch.dimension] ?? []), ...batch.students.map(student => student.studentId)]);
        assert.equal(positiveStudents(updated, batch.dimension), expectedPositiveIds.size, '多人加分按本项学生标识去重统计人数');
        const repeatedStudents = applyScreenEvaluation(updated, { ...batch, id: batch.id + '-repeat' });
        assert.equal(positiveStudents(repeatedStudents, batch.dimension), positiveStudents(updated, batch.dimension), '相同学生再次加分不增加人数');
        assert.equal(repeatedStudents.report.fiveEducationStats.find(item => item.key === batch.dimension).plusScore, newDimension.plusScore + batch.students.reduce((sum, student) => sum + student.delta, 0), '重复学生的有效加分仍需累计');
        const newStudentEvent = { ...batch, id: batch.id + '-new-student', students: [{ ...batch.students[0], studentId: 'first-positive-student', delta: 2 }] };
        const newStudentSnapshot = applyScreenEvaluation(updated, newStudentEvent);
        assert.equal(positiveStudents(newStudentSnapshot, batch.dimension), positiveStudents(updated, batch.dimension) + 1);
        assert.equal(positiveStudents(updated, batch.dimension), expectedPositiveIds.size, '加分人数更新不能修改旧快照');
        const anotherDimension = week.report.fiveEducationStats.find(item => item.key !== batch.dimension);
        const otherDimensionSnapshot = applyScreenEvaluation(newStudentSnapshot, { ...newStudentEvent, id: batch.id + '-other-dimension', dimension: anotherDimension.key });
        assert.equal(positiveStudents(otherDimensionSnapshot, anotherDimension.key), positiveStudents(newStudentSnapshot, anotherDimension.key) + 1, '同一学生在不同五育项目中分别去重');
        assert.equal(positiveStudents(otherDimensionSnapshot, batch.dimension), positiveStudents(newStudentSnapshot, batch.dimension));
        for (const period of Object.values(periods)) for (const stat of screenFiveEducationStats(period)) {
          assert.ok(stat.positiveStudentCount >= 0 && stat.positiveStudentCount <= stat.positiveEventCount);
          assert.ok(stat.positiveStudentCount <= period.report.summary.totalCoveredStudents);
        }
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
        assert.deepEqual(afterNegative.positiveStudentIdsByDimension, updated.positiveStudentIdsByDimension, '扣分不能增加或减少历史加分学生人数');

        const synchronized = applyEvaluationToPeriods(periods, batch);
        for (const { key } of SCREEN_PERIODS) {
          assert.equal(synchronized[key].report.summary.totalRecords, periods[key].report.summary.totalRecords + 1, key + '周期应收到相同实时事件');
          assert.equal(synchronized[key].report.summary.totalEvaluationCount, periods[key].report.summary.totalEvaluationCount + 3);
          assert.equal(synchronized[key].studentScores[batch.students[0].studentId], batch.students[0].afterScore);
          assert.equal(positiveStudents(synchronized[key], batch.dimension), new Set([...(periods[key].positiveStudentIdsByDimension[batch.dimension] ?? []), ...batch.students.map(student => student.studentId)]).size, '各周期独立维护本项加分学生去重人数');
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
        assert.ok(empty.growthTrend.every(item => !item.recordedStudentIds.length && !item.praisedStudentIds.length));
        for (const trend of [week.growthTrend, empty.growthTrend]) {
          const html = renderToStaticMarkup(React.createElement(GrowthTrend, { weeks: trend }));
          for (const item of trend) assert.ok(html.includes(formatGrowthWeek(item.weekStart)), '七个周标签均展示');
          assert.ok(html.includes('成长趋势') && html.includes('获表扬人数') && html.includes('被记录人数'));
          assert.ok(!html.includes('NaN') && !html.includes('Infinity'));
        }
        for (const maximum of [0, 1, 6, 13, 1250, 2500]) {
          const scale = getGrowthTrendScale(maximum);
          assert.ok(scale.maximum >= maximum && Number.isInteger(scale.step) && scale.step > 0, '人数纵轴保留零基线、整数刻度和顶部空间');
        }
        assert.equal(empty.recentEvaluations.length, 0);
        assert.equal(createDemoScreenEvaluation(empty, 1, now), null);

        for (const snapshot of [afterNegative, empty]) {
          const html = renderToStaticMarkup(React.createElement(EvaluationScreenContent, { snapshot }));
          assert.ok(html.includes('记录条数'));
          assert.ok(html.includes('成长动态') && html.includes('AI 育人分析'));
          assert.ok(!html.includes('NaN') && !html.includes('Infinity'));
          assert.ok(!html.includes('本学期累计净得分'), '动态积分不能冒用学期累计口径');
          if (snapshot === empty) {
            assert.ok(html.includes('本周期暂无已归类的五育记录'));
            assert.ok(html.includes('暂无可展示的育人分析'));
            assert.ok(!html.includes('data-education='), '无五育记录时不显示空环图');
          }
        }
        const privacyEvent = { ...batch, indicatorPath: ['崇德', '文明守纪', '爱护公物'], students: [{ ...batch.students[0], displayName: '李宇航', delta: 3 }] };
        const studentHtml = renderToStaticMarkup(React.createElement(StudentScoreChanges, { events: [privacyEvent] }));
        assert.ok(studentHtml.includes('李*航同学') && !studentHtml.includes('李宇航'), '只隐藏第二字，且可见文字及辅助阅读信息使用同一脱敏姓名');
        assert.ok(studentHtml.includes('崇德') && studentHtml.includes('+3分'));
        assert.ok(studentHtml.includes('获得表扬'));
        assert.ok(!studentHtml.includes('文明守纪') && !studentHtml.includes('爱护公物') && !studentHtml.includes('净得分从'));
        const feedHtml = renderToStaticMarkup(React.createElement(LiveEvaluationFeed, { events: [privacyEvent] }));
        assert.ok(feedHtml.includes('崇德-文明守纪-爱护公物') && feedHtml.includes('老师，对学生的“崇德-文明守纪-爱护公物”事件进行了记录。'));
        assert.ok(!feedHtml.includes('+3分'));
        assert.ok(!feedHtml.includes(batch.className) && !feedHtml.includes('李宇航') && !feedHtml.includes('×'));
        const negativeStudentHtml = renderToStaticMarkup(React.createElement(StudentScoreChanges, { events: [{ ...privacyEvent, students: [{ ...privacyEvent.students[0], delta: -1 }] }] }));
        assert.ok(negativeStudentHtml.includes('有待改进的事件，-1分。'));
        assert.ok(!negativeStudentHtml.includes('获得表扬') && !negativeStudentHtml.includes('李宇航'));
        const contentHtml = renderToStaticMarkup(React.createElement(EvaluationScreenContent, { snapshot: afterNegative }));
        assert.ok(contentHtml.includes('成长趋势') && !contentHtml.includes('五育加减分'), '原加减分板块替换为成长趋势');
        for (const title of ['教师使用TOP10', '记录条数', '学生覆盖率', '指标使用情况', '二级指标', '三级指标', 'AI 育人分析', '成长动态']) assert.ok(contentHtml.includes(title));
        const rightColumnHtml = contentHtml.slice(contentHtml.indexOf('demo-evaluation-screen-right-column'));
        assert.ok(rightColumnHtml.includes('年级评价次数'));
        assert.ok(rightColumnHtml.indexOf('年级评价次数') < rightColumnHtml.indexOf('AI 育人分析'), '右侧年级在上、AI在下');
        assert.equal((contentHtml.match(/role="tablist"/g) ?? []).length, 1, '统计不增加Tab，AI专题轮播保留');
        const gradeFixture = Array.from({ length: 8 }, (_, index) => ({ id: 'g-' + index, name: '年级' + index, evaluationTimes: index * 10 }));
        assert.equal(getGradeEvaluationPage(gradeFixture.slice(0, 6), 0).pages, 1);
        assert.deepEqual(getGradeEvaluationPage(gradeFixture, 0).grades.map(grade => grade.id), ['g-0', 'g-1', 'g-2', 'g-3', 'g-4', 'g-5']);
        assert.deepEqual(getGradeEvaluationPage(gradeFixture, 1).grades.map(grade => grade.id), ['g-6', 'g-7']);
        assert.equal(getGradeEvaluationPage(gradeFixture, 2).current, 0, '超过六个分组循环，无遗漏');
        const gradeHtml = renderToStaticMarkup(React.createElement(GradeEvaluationTimesChart, { grades: gradeFixture, page: 1 }));
        assert.ok(gradeHtml.includes('年级6') && gradeHtml.includes('年级7') && !gradeHtml.includes('年级0'));
        assert.ok(gradeHtml.includes('评价70次') && !gradeHtml.includes('成长记录'));
        assert.ok(renderToStaticMarkup(React.createElement(GradeEvaluationTimesChart, { grades: [] })).includes('暂无年级评价数据'));
        const zeroGradeHtml = renderToStaticMarkup(React.createElement(GradeEvaluationTimesChart, { grades: [{ id: 'zero', name: '一年级', evaluationTimes: 0 }] }));
        assert.ok(zeroGradeHtml.includes('评价0次') && !zeroGradeHtml.includes('NaN') && !zeroGradeHtml.includes('Infinity'));
        assert.ok(!contentHtml.includes('多人评价计1次') && !contentHtml.includes('1位学生计1条'));
        for (const activeInsight of [0, 1]) {
          const html = renderToStaticMarkup(React.createElement(EvaluationScreenContent, { snapshot: periods.term, liveSnapshot: periods.week, activeInsight }));
          assert.ok(html.includes('育人亮点') && html.includes('改进重点'));
          assert.ok(html.includes(activeInsight === 0 ? '各年级都有孩子主动帮助同伴' : '学校可以先把每个孩子的分工安排清楚'));
          assert.ok(!html.includes('行动回看') && !html.includes('已采纳'));
        }

        const liveSnapshot = { ...afterNegative, recentEvaluations: [{ ...batch, teacherName: '独立动态教师' }] };
        const periodHtml = renderToStaticMarkup(React.createElement(EvaluationScreenContent, { snapshot: periods.today, liveSnapshot }));
        assert.ok(!periodHtml.includes('今日 · 已归类'));
        assert.ok(periodHtml.includes('五育并举，全面成长'));
        assert.ok(periodHtml.includes('五育类别'));
        assert.ok(periodHtml.includes('独立动态教师'), '周期统计与最新动态使用各自的数据源');
        const heroDimensions = screenFiveEducationStats(week);
        const heroHtml = renderToStaticMarkup(React.createElement(FiveEducationHero, { dimensions: heroDimensions, visible: true, reducedMotion: false }));
        assert.equal((heroHtml.match(/data-education=/g) ?? []).length, heroDimensions.filter(item => item.eventCount > 0).length, '首次渲染应直接包含有记录的一级指标扇区，无需等待图表异步初始化');
        for (const name of [...new Set(classReportIndicatorDemoPaths.map(path => path[0]))]) {
          assert.ok(heroHtml.includes('>' + name + '</span>'), '环图图例必须展示学校一级名称：' + name);
        }
        for (const oldName of ['育德', '慧智', '强体', '润美', '健劳']) assert.ok(!heroHtml.includes(oldName), '不能残留旧版一级名称');
        assert.equal((heroHtml.match(/<polyline/g) ?? []).length, 1, '只为当前选中五育项显示一条外侧引导线');
        assert.ok(heroHtml.includes('五育事件总数') && heroHtml.includes('hero-callout'));
        assert.ok(!heroHtml.includes('hero-event-count'), '分项明细移出环心');
        assert.ok(heroHtml.includes('hero-legend-label'));
        assert.ok(heroHtml.includes('总加分') && heroHtml.includes('加分学生数'));
        for (const stat of heroDimensions) {
          const visible = renderToStaticMarkup(React.createElement(FiveEducationHero, { dimensions: [stat], reducedMotion: true }));
          assert.ok(visible.includes('总加分' + stat.plusScore + '分，加分学生数' + stat.positiveStudentCount + '人'), '选中项目的无障碍说明包含对应统计');
          const text = visible.replace(/<[^>]*>/g, '');
          assert.ok(text.includes('+' + stat.plusScore.toLocaleString('zh-CN') + '分') && text.includes(stat.positiveStudentCount.toLocaleString('zh-CN') + '人'), '各类别环外标注展示自身加分与人数，不能写死');
        }
        for (let degrees = 0; degrees < 360; degrees += 1) {
          const angle = degrees / 180 * Math.PI;
          const layout = getHeroCalloutLayout(angle);
          assert.ok(layout.left >= -184 && layout.end <= 824, '左右标注均处于画布内');
          assert.ok(layout.titleY - 28 >= -20 && layout.titleY + 168 <= 610, '上下极值位置也保留完整四行明细');
          const outerEdge = 221 + HERO_SELECTION.radiusGrowth + HERO_SELECTION.offset;
          assert.ok(layout.end < 320 - outerEdge || layout.left > 320 + outerEdge, '明细区域位于扩张扇区外侧');
          assert.ok([...layout.start, ...layout.elbow, layout.anchorX].every(Number.isFinite));
          const [x, y] = getHeroSectorTransform(angle, 1).match(/-?\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?/gi).map(Number);
          assert.ok(Math.abs(Math.hypot(x, y) - HERO_SELECTION.offset) < .001, '各方向外移距离保持一致');
          for (const progress of [0, .25, .5, .75, 1]) {
            const frame = getHeroCalloutLayout(angle, progress);
            assert.ok(Math.abs(Math.hypot(frame.start[0] - 320, frame.start[1] - 286) - (221 + (HERO_SELECTION.radiusGrowth + HERO_SELECTION.offset) * progress + 3)) < .001, '引导线起点逐帧跟随扇区外缘');
            assert.equal(frame.titleY, layout.titleY, '运动过程中明细文字位置稳定');
          }
        }
        assert.equal(getHeroSectorTransform(0, 0), 'translate(0 0)', '非选中扇区保持原位置');
        assert.ok(getHeroSectorPath(0, 1, 1).includes('A245,245') && getHeroSectorPath(0, 1, 1).includes('A153,153'), '放大只扩张外缘，环宽明显增加，内缘不变');
        for (const [from, to] of [[0, 1], [1, 0], [.43, 0], [.37, 1]]) {
          const frames = Array.from({ length: 31 }, (_, frame) => interpolateHeroEmphasis(from, to, frame / 30 * HERO_SELECTION.duration));
          assert.equal(frames[0], from, '快速切换从当前帧继续，不能跳回初始位置');
          assert.equal(frames.at(-1), to, '动画在有限时间内准确到达目标');
          assert.ok(frames.every((value, index) => value >= Math.min(from, to) && value <= Math.max(from, to) && (!index || (value - frames[index - 1]) * (to - from) >= 0)), '平滑单调运动，无越界或反跳');
          assert.ok(Math.abs(frames[1] - from) < Math.abs(frames[15] - frames[14]) && Math.abs(to - frames[29]) < Math.abs(frames[15] - frames[14]), '起止缓速，中段连续运动');
        }
        const singleDimension = heroDimensions.map((item, index) => ({ ...item, eventCount: index ? 0 : 10 }));
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
        for (const [page, expected] of [[0, 1], [1, 2]]) {
          const html = renderToStaticMarkup(React.createElement(GradeEvaluationRecords, { grades: rankGrades, page, onPageChange: () => {} }));
          assert.equal((html.match(/class="is-top-grade"/g) ?? []).length, expected, '年级记录数仍按全校前三名强调');
          const coverageHtml = renderToStaticMarkup(React.createElement(GradeCoverage, { grades: rankGrades, page, onPageChange: () => {} }));
          assert.equal((coverageHtml.match(/class="is-high-coverage"/g) ?? []).length, page ? 1 : 0, '覆盖率只按80%阈值强调，不随排名或分页变化');
        }
        for (const percent of [0, 79, 80, 100]) {
          const boundaryGrade = { ...rankGrades[0], total: 100, covered: percent };
          const coverageHtml = renderToStaticMarkup(React.createElement(GradeCoverage, { grades: [boundaryGrade], page: 0, onPageChange: () => {} }));
          const groups = [{ id: 'virtue', name: '崇德', children: Array.from({ length: 100 }, (_, index) => ({
            id: 'second-' + index, name: '二级' + index, children: [{ id: 'third-' + index, name: '三级' + index, weekCount: index < percent ? 1 : 0, monthCount: 0, termCount: 0 }]
          })) }];
          const indicatorHtml = renderToStaticMarkup(React.createElement(IndicatorUsage, { groups, period: 'week' }));
          assert.equal((indicatorHtml.match(/ is-high-coverage/g) ?? []).length, percent >= 80 ? 2 : 0, '二三级指标共用80%边界规则');
          for (const html of [coverageHtml, indicatorHtml]) {
            assert.equal(html.includes('--es-coverage-color:url('), percent >= 80, '高覆盖图形与数值共用同一黄色渐变');
            assert.equal(html.includes('--es-coverage-color:var(--es-text)'), percent < 80, '低覆盖回退白色');
          }
        }
        const noStudentsHtml = renderToStaticMarkup(React.createElement(GradeCoverage, { grades: [{ ...rankGrades[0], total: 0 }], page: 0, onPageChange: () => {} }));
        assert.ok(noStudentsHtml.includes('暂无学生数据') && !noStudentsHtml.includes('is-high-coverage'));
        const updatedAt = new Date(2026, 10, 10, 8, 6, 3).getTime();
        assert.deepEqual([formatScreenUpdatedAt(updatedAt), formatScreenWeekday(updatedAt)], ['2026年11月10日 08:06:03', '星期二'], '顶部日期时间与中文星期分两行展示');
        const teacherHtml = renderToStaticMarkup(React.createElement(TeacherEvaluationFootprints, { teachers: periods.term.report.teachers }));
        assert.equal((teacherHtml.match(/<li>/g) ?? []).length, 10, '教师评价排行同时显示前10名');
        for (const [width, height] of [[1920, 1080], [2560, 1080], [1920, 1440], [320, 820]]) {
          const layout = getScreenCanvasLayout(width, height);
          assert.ok(Math.abs(layout.canvasWidth * layout.scale - width) < .001, '画布应铺满窗口宽度');
          assert.ok(Math.abs(layout.canvasHeight * layout.scale - height) < .001, '画布应铺满窗口高度');
          assert.ok(layout.canvasWidth >= 1920 && layout.canvasHeight >= 1080, '保留足够的内容排布空间');
        }
        console.log('学生评价大屏检查通过：指标同源、记录守恒、姓名脱敏、五育总加分、分项加分人数去重、周期同步、动画连续性、80%配色边界、完整更新时间及真实组件渲染。');
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
