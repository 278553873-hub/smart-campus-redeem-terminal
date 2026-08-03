import assert from 'node:assert/strict';
import {
  formatReportSourceRecordCount,
  formatReportSourceRecordCountAria,
  getPeriodForDays,
  getReportSourceRecordCount,
  getReportSourceOptions,
  getValidDaysInRange,
  reportSourceDefinitions,
  resolveReportSourceKey,
} from './classReportSource.ts';

assert.deepEqual(
  getReportSourceOptions('day').map(source => source.label),
  ['全班汇总', '我的记录', '张怡'],
  '今日只应展示当前周期内有评价记录的来源。',
);

assert.deepEqual(
  getReportSourceOptions('week').map(source => source.label),
  ['全班汇总', '我的记录', '周三论', '张怡'],
  '本周应在今日来源基础上展示本周新增的评价老师。',
);

assert.deepEqual(
  getReportSourceOptions('month').map(source => source.label),
  ['全班汇总', '我的记录', '周三论', '张怡', '王蕾', '陈嘉'],
  '本月应展示本月所有产生过评价记录的老师。',
);

const sourcesWithoutMyRecords = reportSourceDefinitions.map(source => source.key === 'mine'
  ? { ...source, recordShareByPeriod: { ...source.recordShareByPeriod, week: 0 } }
  : source);
assert.deepEqual(
  getReportSourceOptions('week', sourcesWithoutMyRecords).map(source => source.label),
  ['全班汇总', '我的记录', '周三论', '张怡'],
  '我的记录是固定个人视角，本周期为0条时仍应展示。',
);
assert.equal(
  getReportSourceRecordCount(getReportSourceOptions('week', sourcesWithoutMyRecords)[1], 447),
  0,
  '我的记录为0条时应展示真实的0，不能补成1条。',
);
assert.equal(
  getReportSourceRecordCount(getReportSourceOptions('week')[1], 447),
  188,
  '老师来源后的条数应根据当前周期总量与该老师数据占比计算。',
);
assert.equal(formatReportSourceRecordCount(999), '999', '三位数来源条数应完整展示。');
assert.equal(formatReportSourceRecordCount(1000), '999+', '四位数来源条数应封顶展示为999+。');
assert.equal(formatReportSourceRecordCountAria(1000), '999条以上', '封顶条数应提供一致的无障碍语义。');
for (const period of ['day', 'week', 'month', 'semester']) {
  const sourceOptions = getReportSourceOptions(period);
  const individualSourceTotal = sourceOptions
    .filter(source => source.key !== 'all')
    .reduce((total, source) => total + source.recordShare, 0);
  assert.ok(
    Math.abs(individualSourceTotal - 1) < Number.EPSILON * 10,
    `${period}周期内个人来源占比合计应与全班汇总一致。`,
  );
}

assert.equal(
  resolveReportSourceKey(getReportSourceOptions('day'), 'teacher:wang-lei'),
  'all',
  '切换周期后当前老师无记录时应回到全班汇总。',
);
assert.equal(
  resolveReportSourceKey(getReportSourceOptions('month'), 'teacher:wang-lei'),
  'teacher:wang-lei',
  '当前老师在新周期仍有记录时应保留选中状态。',
);

assert.equal(getValidDaysInRange('', '2026-07-30'), null, '自定义日期未填写完整时不应应用。');
assert.equal(getValidDaysInRange('2026-07-31', '2026-07-30'), null, '自定义日期倒置时不应应用。');
assert.equal(getValidDaysInRange('2026-07-24', '2026-07-30'), 7, '自定义日期应按包含首尾日期计算天数。');
assert.equal(getPeriodForDays(1), 'day');
assert.equal(getPeriodForDays(7), 'week');
assert.equal(getPeriodForDays(31), 'month');
assert.equal(getPeriodForDays(32), 'semester');

console.log('Class report source assertions passed');
