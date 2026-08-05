import assert from 'node:assert/strict';
import { classReportIndicatorDemoPaths } from '../data/classReportIndicatorDemo.ts';
import {
  buildClassReportIndicatorTree,
  getClassReportIndicatorNode,
} from './classReportIndicatorTree.ts';

assert.equal(classReportIndicatorDemoPaths.length, 35, '学校 Demo 应完整保留附件中的35条三级指标。');

const tree = buildClassReportIndicatorTree(classReportIndicatorDemoPaths, 447);
assert.deepEqual(
  tree.map(node => node.label),
  ['崇德', '求知', '向阳', '尚美', '躬行', '乐创'],
  '五育报告应读取学校配置的全部一级指标，不得固定为五项。',
);
assert.deepEqual(
  tree.map(node => node.children.length),
  [3, 1, 3, 4, 3, 1],
  '真实学校指标体系的二级结构应保持完整。',
);
assert.equal(
  tree.reduce((sum, node) => sum + node.metrics.eventCount, 0),
  447,
  '一级指标事件数之和应与班级报告总记录数一致。',
);

const virtue = tree[0];
assert.equal(
  virtue.children.reduce((sum, node) => sum + node.metrics.eventCount, 0),
  virtue.metrics.eventCount,
  '二级指标事件数必须由三级指标向上汇总。',
);
assert.equal(
  getClassReportIndicatorNode(tree, [virtue.id, virtue.children[0].id])?.label,
  '文明守纪',
  '下钻路径应能稳定定位二级指标。',
);
assert.equal(
  virtue.metrics.netScore,
  virtue.metrics.addScore - virtue.metrics.deductScore,
  '每一级总分都应等于加分减扣分。',
);

const teacherTree = buildClassReportIndicatorTree(classReportIndicatorDemoPaths, 188);
assert.equal(
  teacherTree.reduce((sum, node) => sum + node.metrics.eventCount, 0),
  188,
  '切换数据来源后指标树应按新口径重新汇总。',
);

console.log('Class report configurable indicator tree assertions passed');
