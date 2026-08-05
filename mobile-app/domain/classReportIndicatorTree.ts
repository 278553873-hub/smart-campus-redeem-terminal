import type { ClassReportIndicatorPath } from '../data/classReportIndicatorDemo';

export interface ClassReportIndicatorMetrics {
  eventCount: number;
  addScore: number;
  deductScore: number;
  netScore: number;
}

export interface ClassReportIndicatorNode {
  id: string;
  label: string;
  level: 1 | 2 | 3;
  toneIndex: number;
  metrics: ClassReportIndicatorMetrics;
  children: ClassReportIndicatorNode[];
}

interface MutableIndicatorNode extends Omit<ClassReportIndicatorNode, 'children'> {
  children: MutableIndicatorNode[];
}

const emptyMetrics = (): ClassReportIndicatorMetrics => ({
  eventCount: 0,
  addScore: 0,
  deductScore: 0,
  netScore: 0,
});

const addMetrics = (target: ClassReportIndicatorMetrics, source: ClassReportIndicatorMetrics) => {
  target.eventCount += source.eventCount;
  target.addScore += source.addScore;
  target.deductScore += source.deductScore;
  target.netScore += source.netScore;
};

const allocateEventCounts = (leafCount: number, totalRecords: number) => {
  if (leafCount === 0 || totalRecords <= 0) return Array.from({ length: leafCount }, () => 0);

  const weights = Array.from({ length: leafCount }, (_, index) => 8 + ((index * 7) % 11));
  const totalWeight = weights.reduce((sum, value) => sum + value, 0);
  const counts = weights.map(weight => Math.floor((totalRecords * weight) / totalWeight));
  let remainder = totalRecords - counts.reduce((sum, value) => sum + value, 0);

  for (let index = 0; remainder > 0; index = (index + 1) % counts.length) {
    counts[index] += 1;
    remainder -= 1;
  }

  return counts;
};

const createLeafMetrics = (eventCount: number, leafIndex: number): ClassReportIndicatorMetrics => {
  const positiveRatio = 0.72 + (leafIndex % 5) * 0.04;
  const positiveEvents = Math.min(eventCount, Math.round(eventCount * positiveRatio));
  const negativeEvents = eventCount - positiveEvents;
  const addScore = positiveEvents * (1 + (leafIndex % 3));
  const deductScore = negativeEvents * (1 + (leafIndex % 2));

  return {
    eventCount,
    addScore,
    deductScore,
    netScore: addScore - deductScore,
  };
};

const aggregateNode = (node: MutableIndicatorNode): ClassReportIndicatorMetrics => {
  if (node.children.length === 0) return node.metrics;

  const metrics = emptyMetrics();
  node.children.forEach(child => addMetrics(metrics, aggregateNode(child)));
  node.metrics = metrics;
  return metrics;
};

export const buildClassReportIndicatorTree = (
  paths: readonly ClassReportIndicatorPath[],
  totalRecords: number,
): ClassReportIndicatorNode[] => {
  const roots: MutableIndicatorNode[] = [];
  const eventCounts = allocateEventCounts(paths.length, Math.max(0, Math.round(totalRecords)));

  paths.forEach(([levelOne, levelTwo, levelThree], leafIndex) => {
    let root = roots.find(node => node.label === levelOne);
    if (!root) {
      const rootIndex = roots.length;
      root = {
        id: `indicator-${rootIndex + 1}`,
        label: levelOne,
        level: 1,
        toneIndex: rootIndex,
        metrics: emptyMetrics(),
        children: [],
      };
      roots.push(root);
    }

    let branch = root.children.find(node => node.label === levelTwo);
    if (!branch) {
      branch = {
        id: `${root.id}-${root.children.length + 1}`,
        label: levelTwo,
        level: 2,
        toneIndex: root.toneIndex,
        metrics: emptyMetrics(),
        children: [],
      };
      root.children.push(branch);
    }

    branch.children.push({
      id: `${branch.id}-${branch.children.length + 1}`,
      label: levelThree,
      level: 3,
      toneIndex: root.toneIndex,
      metrics: createLeafMetrics(eventCounts[leafIndex], leafIndex),
      children: [],
    });
  });

  roots.forEach(aggregateNode);
  return roots;
};

export const getClassReportIndicatorNode = (
  roots: readonly ClassReportIndicatorNode[],
  path: readonly string[],
) => {
  let nodes = roots;
  let current: ClassReportIndicatorNode | undefined;

  for (const id of path) {
    current = nodes.find(node => node.id === id);
    if (!current) return undefined;
    nodes = current.children;
  }

  return current;
};
