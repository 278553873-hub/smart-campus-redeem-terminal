import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const bundle = await build({ stdin: { contents: "export * from './reporting'; export * from './data';", resolveDir: fileURLToPath(new URL('.', import.meta.url)), loader: 'ts' }, bundle: true, write: false, platform: 'node', format: 'esm' });
const { buildDevelopmentReport, reportRecords, personnelGroups, registeredProfileParts, TEACHERS, INITIAL_RECORDS, INDICATORS } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].contents).toString('base64')}`);
const period = '2026-autumn';
test('学校汇总包含零记录教师；待审、未通过与已通过严格分开', () => {
  const report = buildDevelopmentReport(TEACHERS, INITIAL_RECORDS, INDICATORS, period);
  assert.equal(report.teacherRows.length, 6);
  assert.deepEqual([report.approved.length, report.pending.length, report.returned.length], [8, 2, 1]);
  assert.equal(report.activeTeachers, 4);
  assert.equal(report.recordedTeachers, 5);
  assert.deepEqual(report.teacherRows.find(row => row.teacher.id === 't6').total, 0);
  assert.equal(report.teacherRows.find(row => row.teacher.id === 't6').score, 100);
  assert.equal(report.teacherRows.find(row => row.teacher.id === 't2').pending, 1);
});
test('个人视图不包含他人数据；每个图表分组与下钻记录数量一致', () => {
  const teachers = TEACHERS.filter(t => t.id === 't1');
  const report = buildDevelopmentReport(teachers, INITIAL_RECORDS, INDICATORS, period);
  assert.equal(report.teacherRows[0].score, 105);
  assert.deepEqual(report.months.map(m => [m.key, m.count]), [['2026-09', 2], ['2026-10', 2]]);
  for (const [rows, key] of [[report.dimensionRows, 'dimension'], [report.categoryRows, 'category'], [report.levelRows, 'level']]) {
    assert.equal(rows.reduce((n, row) => n + row.count, 0), 4);
    for (const row of rows) assert.equal(reportRecords(INITIAL_RECORDS, teachers, INDICATORS, period, { [key]: row.name }).length, row.count);
  }
  for (const month of report.months) assert.equal(reportRecords(INITIAL_RECORDS, teachers, INDICATORS, period, { month: month.key }).length, month.count);
  assert.equal(reportRecords(INITIAL_RECORDS, teachers, INDICATORS, period, { teacherId: 't3', status: 'all' }).length, 0);
});
test('状态下钻不混入撤回或其他周期；等级未知与不区分保持独立', () => {
  const records = [...INITIAL_RECORDS, { ...INITIAL_RECORDS[0], id: 'withdrawn', status: 'withdrawn' }];
  for (const status of ['approved', 'pending', 'returned', 'all']) {
    const rows = reportRecords(records, TEACHERS, INDICATORS, period, { status });
    assert.ok(rows.every(r => r.id !== 'withdrawn' && r.id !== 'r11'));
    if (status !== 'all') assert.ok(rows.every(r => r.status === status));
  }
  const report = buildDevelopmentReport(TEACHERS, records, INDICATORS, period);
  assert.equal(report.levelRows.find(row => row.name === '未识别等级').count, 1);
  assert.equal(report.levelRows.find(row => row.name === '不区分等级').count, 4);
});
test('指标表按上下限计算当前分，人员结构人数不依赖记录数量', () => {
  const records = [...INITIAL_RECORDS, ...Array.from({ length: 40 }, (_, i) => ({ ...INITIAL_RECORDS[1], id: `extra-${i}` }))];
  const personal = buildDevelopmentReport([TEACHERS[0]], records, INDICATORS, period);
  assert.equal(personal.indicatorRows.find(row => row.indicator.id === 'C06').score, 10);
  assert.equal(personal.teacherRows[0].score, 109);
  const school = buildDevelopmentReport(TEACHERS, records, INDICATORS, period);
  for (const key of ['subject', 'grade', 'title', 'education']) assert.equal(personnelGroups(school.teacherRows, key).reduce((n, row) => n + row.count, 0), 6);
  assert.equal(personnelGroups(school.teacherRows, 'education').find(row => row.name === '大学本科').count, 5);
});
test('空范围及历史月份不捏造数据；资料登记以现有内容判断', () => {
  const empty = buildDevelopmentReport([], INITIAL_RECORDS, INDICATORS, period);
  assert.equal(empty.current.length, 0);
  assert.equal(empty.teacherRows.length, 0);
  const spring = buildDevelopmentReport([TEACHERS[0]], INITIAL_RECORDS, INDICATORS, '2026-spring');
  assert.equal(spring.months.length, 7);
  assert.equal(spring.months.reduce((sum, m) => sum + m.count, 0), 1);
  const parts = registeredProfileParts({ ...TEACHERS[0], positions: [], qualifications: [{ name: '', number: '', issued: '', issuer: '' }] });
  assert.deepEqual(parts.filter(part => !part.present).map(part => part.name), ['任职情况', '资格证书']);
});
