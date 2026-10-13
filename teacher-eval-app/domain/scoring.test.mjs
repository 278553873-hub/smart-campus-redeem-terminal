import assert from 'node:assert/strict';
import { DEMO_GROWTH_RECORDS, DEMO_TEACHER_PROFILE } from './demoData.ts';
import {
  CURRENT_ACADEMIC_YEAR,
  CURRENT_TERM,
  PREVIOUS_ACADEMIC_YEAR,
  formatPoints,
  getRecordPoints,
  summarizeGrowth,
  summarizeTotalPoints,
} from './scoring.ts';
import { GROWTH_SCORE_TABLE, GROWTH_SCORE_YEARLY_CAP } from './scoringTable.ts';
import { GROWTH_CATEGORY_DEFINITIONS, GROWTH_RECORD_CATEGORIES, getCategoryDefinition } from './growthRecord.ts';
import {
  PHOTO_CAPTURE_SCENES,
  VOICE_CAPTURE_SCENE,
  buildRecordFromCaptureScene,
} from './aiCapture.ts';

// 赋分表必须覆盖全部类别与全部级别，避免出现查不到分值的空档。
for (const definition of GROWTH_CATEGORY_DEFINITIONS) {
  const rule = GROWTH_SCORE_TABLE[definition.id];
  assert.ok(rule, definition.id + ' 缺少赋分规则');
  assert.equal(rule.dimension, definition.dimension, definition.id + ' 的维度必须与类别定义一致');
  for (const [level, tiers] of Object.entries(rule.tierScores)) {
    assert.equal(tiers.length, 4, definition.id + ' ' + level + ' 必须给出四个等次的分值');
    assert.deepEqual(
      [...tiers].sort((left, right) => right - left),
      [...tiers],
      definition.id + ' ' + level + ' 的分值必须从一等奖递减',
    );
  }
}

// 演示数据：13 条记录、覆盖六个维度、含一条未通过。
assert.equal(DEMO_GROWTH_RECORDS.length, 13);
assert.equal(new Set(DEMO_GROWTH_RECORDS.map(record => record.dimension)).size, 6, '演示记录应覆盖六个评价维度');
assert.equal(DEMO_GROWTH_RECORDS.filter(record => record.reviewStatus === '未通过').length, 1);
assert.equal(DEMO_TEACHER_PROFILE.school, '四川省成都市玉林中学');
for (const record of DEMO_GROWTH_RECORDS) {
  assert.equal(record.points, getRecordPoints(record.category, record.level, record.rank), record.id + ' 的积分与赋分表不一致');
}

// 本学期：未通过的记录不计入积分，积分口径为 4 分。
const termSummary = summarizeGrowth(DEMO_GROWTH_RECORDS, CURRENT_TERM);
assert.equal(termSummary.countedPoints, 4);
assert.equal(termSummary.recordCount, 4);
assert.equal(termSummary.pendingCount, 1);
assert.equal(termSummary.rejectedCount, 1);
assert.ok(!termSummary.aggregates.some(aggregate => aggregate.category === '荣誉表彰'), '未通过的荣誉记录不得参与聚合');

// 同类取最高：上学期示范引领同时有省级三等奖(1.5)与校级一等奖(1)，只计 1.5。
const previousYear = summarizeGrowth(DEMO_GROWTH_RECORDS, PREVIOUS_ACADEMIC_YEAR);
const leadingAggregate = previousYear.aggregates.find(aggregate => aggregate.category === '示范引领');
assert.equal(leadingAggregate.countedPoints, 1.5);
assert.equal(leadingAggregate.recordCount, 2);
assert.equal(leadingAggregate.rawPoints, 2.5);

// 累计积分按学年分别封顶后相加。
assert.equal(summarizeTotalPoints(DEMO_GROWTH_RECORDS, [PREVIOUS_ACADEMIC_YEAR, CURRENT_ACADEMIC_YEAR]), 19.8);

// 学年合计封顶：每个类别都拿到满档分值后，合计必须收敛到封顶分值。
const fullCoverageRecords = GROWTH_RECORD_CATEGORIES.map((category, index) => ({
  id: 'full-' + index,
  title: category,
  category,
  dimension: getCategoryDefinition(category).dimension,
  level: '国家级',
  rank: '一等奖',
  issuer: '测试颁发单位',
  issuedAt: '2026-09-0' + ((index % 9) + 1),
  points: getRecordPoints(category, '国家级', '一等奖'),
  source: 'manual',
  reviewStatus: '已通过',
}));
const rawTotal = fullCoverageRecords.reduce((sum, record) => sum + record.points, 0);
assert.ok(rawTotal > GROWTH_SCORE_YEARLY_CAP, '测试数据必须超过学年封顶分值');
const cappedSummary = summarizeGrowth(fullCoverageRecords, CURRENT_TERM);
assert.equal(cappedSummary.countedPoints, GROWTH_SCORE_YEARLY_CAP);
assert.equal(cappedSummary.rawCountedPoints, rawTotal);
assert.equal(cappedSummary.capped, true);
assert.equal(termSummary.capped, false, '演示数据不应触发学年封顶');

// AI 填报场景：提交后的积分必须真的增加，演示时才能看到变化。
const scenes = [VOICE_CAPTURE_SCENE, ...PHOTO_CAPTURE_SCENES];
for (const scene of scenes) {
  const record = buildRecordFromCaptureScene(scene, 'scene-' + scene.id);
  assert.equal(record.reviewStatus, '待审核');
  assert.equal(record.source, scene.channel);
  assert.equal(record.points, getRecordPoints(scene.parsed.category, scene.parsed.level, scene.parsed.rank));
  const before = summarizeGrowth(DEMO_GROWTH_RECORDS, CURRENT_TERM).countedPoints;
  const after = summarizeGrowth([...DEMO_GROWTH_RECORDS, record], CURRENT_TERM).countedPoints;
  assert.ok(after > before, scene.id + ' 提交后本学期积分应增加');
}
assert.equal(
  new Set(scenes.map(scene => scene.id)).size,
  scenes.length,
  '每个填报场景的 id 必须唯一',
);

assert.equal(formatPoints(0.5), '0.5');
assert.equal(formatPoints(4), '4');
assert.equal(formatPoints(1.05), '1.05');

console.log('教师评价积分口径断言通过');
