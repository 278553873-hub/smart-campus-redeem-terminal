import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { ClassReportIndicatorNode } from '../../domain/classReportIndicatorTree';
import { getClassReportIndicatorNode } from '../../domain/classReportIndicatorTree';
import {
  TeacherReportBarChart,
  TeacherReportDonutChart,
  type TeacherReportBarSeries,
  type TeacherReportChartColor,
} from './TeacherReportChart';
import MobileBottomSheet from '../ui/MobileBottomSheet';

export type ClassReportIndicatorDrilldownMode = 'score' | 'event';

interface ClassReportIndicatorDrilldownProps {
  open: boolean;
  mode: ClassReportIndicatorDrilldownMode;
  roots: ClassReportIndicatorNode[];
  initialPath?: string[];
  onClose: () => void;
  onRootChange?: (rootId: string) => void;
}

const indicatorChartColors: TeacherReportChartColor[] = [
  'indicator1',
  'indicator2',
  'indicator3',
  'indicator4',
  'indicator5',
  'indicator6',
] as const;

const ScoreLegend = () => (
  <div aria-label="得分图例" className="flex h-8 items-center justify-end gap-3 text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-text-secondary)]">
    <span className="flex items-center gap-1.5">
      <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[3px] bg-[var(--tm-chart-positive)]" />
      加分
    </span>
    <span className="flex items-center gap-1.5">
      <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[3px] bg-[var(--tm-chart-negative)]" />
      扣分
    </span>
    <span className="flex items-center gap-1.5">
      <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[3px] bg-[var(--tm-chart-data-default)]" />
      总分
    </span>
  </div>
);

const ClassReportIndicatorDrilldown: React.FC<ClassReportIndicatorDrilldownProps> = ({
  open,
  mode,
  roots,
  initialPath = [],
  onClose,
  onRootChange,
}) => {
  const [path, setPath] = useState<string[]>(initialPath);

  useEffect(() => {
    if (open) setPath(initialPath);
  }, [initialPath, open]);

  const pathNodes = useMemo(() => path.reduce<ClassReportIndicatorNode[]>((nodes, id) => {
    const parentChildren = nodes.length === 0 ? roots : nodes[nodes.length - 1].children;
    const node = parentChildren.find(item => item.id === id);
    return node ? [...nodes, node] : nodes;
  }, []), [path, roots]);
  const currentNode = getClassReportIndicatorNode(roots, path);
  const visibleNodes = currentNode?.children ?? [];
  const scoreSeries = useMemo<TeacherReportBarSeries[]>(() => [
    { name: '加分', values: visibleNodes.map(node => node.metrics.addScore), color: 'positive' },
    { name: '扣分', values: visibleNodes.map(node => node.metrics.deductScore), color: 'negative' },
    { name: '总分', values: visibleNodes.map(node => node.metrics.netScore), color: 'data' },
  ], [visibleNodes]);
  const eventData = useMemo(() => visibleNodes.map((node, index) => ({
    name: node.label,
    value: node.metrics.eventCount,
    color: indicatorChartColors[index % indicatorChartColors.length],
  })), [visibleNodes]);
  const hasNextLevel = visibleNodes.some(node => node.children.length > 0);
  const title = mode === 'score' ? '五育得分明细' : '五育事件明细';

  const selectNode = (node: ClassReportIndicatorNode) => {
    if (node.children.length === 0) return;
    setPath(current => [...current, node.id]);
  };

  const selectCategory = (label: string) => {
    const node = visibleNodes.find(item => item.label === label);
    if (node) selectNode(node);
  };

  const selectRoot = (root: ClassReportIndicatorNode) => {
    setPath([root.id]);
    onRootChange?.(root.id);
  };

  return (
    <MobileBottomSheet open={open} title={title} onClose={onClose}>
      <nav aria-label="一级指标切换" className="-mt-1 flex min-h-[var(--tm-size-touch)] items-center gap-4 overflow-x-auto whitespace-nowrap no-scrollbar">
        {roots.map(root => {
          const selected = path[0] === root.id;
          return (
            <button
              key={root.id}
              type="button"
              onClick={() => selectRoot(root)}
              aria-pressed={selected}
              className={`relative flex min-h-[var(--tm-size-touch)] shrink-0 items-center text-[length:var(--tm-font-size-compact)] font-semibold ${
                selected ? 'text-[var(--tm-text-primary)]' : 'text-[var(--tm-text-secondary)]'
              }`}
            >
              {root.label}
              {selected && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[var(--tm-brand-primary)]" />}
            </button>
          );
        })}
      </nav>

      {pathNodes.length > 1 && (
        <nav aria-label="指标层级" className="flex min-h-8 items-center whitespace-nowrap text-[length:var(--tm-font-size-meta)]">
          <button
            type="button"
            onClick={() => setPath(path.slice(0, 1))}
            className="font-medium text-[var(--tm-text-secondary)]"
          >
            {pathNodes[0].label}
          </button>
          <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--tm-text-disabled)]" />
          <span className="font-semibold text-[var(--tm-text-primary)]">{pathNodes[pathNodes.length - 1].label}</span>
        </nav>
      )}

      <div aria-label={`${title}，当前${currentNode?.label ?? '未选择指标'}`}>
        {mode === 'score' ? (
          <div>
            <ScoreLegend />
            <div className="-mx-[var(--tm-space-4)] overflow-x-auto no-scrollbar">
              <div
                className="px-[var(--tm-space-4)]"
                style={{ width: `${Math.max(360, visibleNodes.length * 84)}px` }}
              >
                <TeacherReportBarChart
                  ariaLabel={visibleNodes.map(node => (
                    `${node.label}加分${node.metrics.addScore}、扣分${node.metrics.deductScore}、总分${node.metrics.netScore}`
                  )).join('；')}
                  categories={visibleNodes.map(node => node.label)}
                  series={scoreSeries}
                  optionKey={`indicator-score-${path.join('-')}`}
                  className="h-64"
                  showLegend={false}
                  onCategorySelect={hasNextLevel ? selectCategory : undefined}
                />
              </div>
            </div>
          </div>
        ) : (
          <TeacherReportDonutChart
            ariaLabel={visibleNodes.map(node => `${node.label}${node.metrics.eventCount}条`).join('；')}
            data={eventData}
            optionKey={`indicator-event-${path.join('-')}`}
            className="h-80"
            onCategorySelect={hasNextLevel ? selectCategory : undefined}
          />
        )}
      </div>
    </MobileBottomSheet>
  );
};

export default ClassReportIndicatorDrilldown;
