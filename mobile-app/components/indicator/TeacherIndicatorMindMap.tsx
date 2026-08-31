import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dagre from '@dagrejs/dagre';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { teacherIndicatorCanvasMetrics } from '../../styles/teacherMobileTokens';
import type {
  TeacherIndicatorCatalog,
  TeacherIndicatorLeaf,
  TeacherIndicatorLevelTwo,
} from '../../data/teacherIndicatorCatalog';

interface TeacherIndicatorMindMapProps {
  catalog: TeacherIndicatorCatalog;
  onSelectLeaf: (leaf: TeacherIndicatorLeaf, path: [string, string, string]) => void;
}

type FocusTarget =
  | { kind: 'overview' }
  | { kind: 'branch'; branchId: string }
  | { kind: 'group'; groupId: string };

interface IndicatorNodeData extends Record<string, unknown> {
  kind: 'root' | 'levelOne' | 'levelTwo' | 'leafGroup';
  label: string;
  branchId?: string;
  groupId?: string;
  branchColor?: string;
  expanded?: boolean;
  leaves?: TeacherIndicatorLeaf[];
  path?: [string, string];
  onReturnToOverview: () => void;
  onToggleBranch?: (branchId: string) => void;
  onToggleGroup?: (branchId: string, groupId: string) => void;
  onSelectLeaf: (leaf: TeacherIndicatorLeaf, path: [string, string, string]) => void;
}

type IndicatorCanvasNode = Node<IndicatorNodeData>;

const branchColors = [
  'var(--tm-indicator-canvas-branch-1)',
  'var(--tm-indicator-canvas-branch-2)',
  'var(--tm-indicator-canvas-branch-3)',
  'var(--tm-indicator-canvas-branch-4)',
  'var(--tm-indicator-canvas-branch-5)',
  'var(--tm-indicator-canvas-branch-6)',
];

const hiddenHandleClass = '!h-px !w-px !border-0 !bg-transparent !opacity-0';

const RootNode = ({ data }: NodeProps<IndicatorCanvasNode>) => (
  <button
    type="button"
    onClick={data.onReturnToOverview}
    className="nodrag nopan flex h-[var(--tm-indicator-canvas-root-height)] w-[var(--tm-indicator-canvas-root-width)] items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-indicator-canvas-root-bg)] px-[var(--tm-space-3)] text-center text-[length:var(--tm-indicator-canvas-root-font-size)] font-bold leading-5 text-[var(--tm-indicator-canvas-root-text)] shadow-[var(--tm-shadow-control)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] focus-visible:ring-offset-2"
    aria-label="返回指标体系总览"
  >
    {data.label}
    <Handle type="source" position={Position.Right} className={hiddenHandleClass} />
  </button>
);

const LevelOneNode = ({ data }: NodeProps<IndicatorCanvasNode>) => (
  <button
    type="button"
    onClick={() => data.branchId && data.onToggleBranch?.(data.branchId)}
    className="nodrag nopan flex h-[var(--tm-indicator-canvas-level-one-height)] w-[var(--tm-indicator-canvas-level-one-width)] items-center overflow-hidden rounded-[var(--tm-radius-control)] px-[var(--tm-space-3)] text-left text-[length:var(--tm-indicator-canvas-level-one-font-size)] font-bold text-[var(--tm-text-primary)] shadow-[var(--tm-shadow-control)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] focus-visible:ring-offset-2"
    style={{
      borderLeft: `4px solid ${data.branchColor}`,
      backgroundColor: data.expanded
        ? 'var(--tm-indicator-canvas-level-one-active-bg)'
        : 'var(--tm-indicator-canvas-node-bg)',
    }}
    aria-label={`${data.expanded ? '收起' : '展开'}${data.label}`}
    aria-expanded={data.expanded}
  >
    <Handle type="target" position={Position.Left} className={hiddenHandleClass} />
    <span className="min-w-0 flex-1 break-words leading-5">{data.label}</span>
    {data.expanded
      ? <ChevronDown className="h-[var(--tm-indicator-canvas-icon-size)] w-[var(--tm-indicator-canvas-icon-size)] shrink-0 text-[var(--tm-action-icon-neutral)]" aria-hidden="true" />
      : <ChevronRight className="h-[var(--tm-indicator-canvas-icon-size)] w-[var(--tm-indicator-canvas-icon-size)] shrink-0 text-[var(--tm-action-icon-neutral)]" aria-hidden="true" />}
    <Handle type="source" position={Position.Right} className={hiddenHandleClass} />
  </button>
);

const LevelTwoNode = ({ data }: NodeProps<IndicatorCanvasNode>) => (
  <button
    type="button"
    onClick={() => data.branchId && data.groupId && data.onToggleGroup?.(data.branchId, data.groupId)}
    className="nodrag nopan flex h-[var(--tm-indicator-canvas-level-two-height)] w-[var(--tm-indicator-canvas-level-two-width)] items-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] px-[var(--tm-space-3)] text-left text-[length:var(--tm-indicator-canvas-level-two-font-size)] font-semibold text-[var(--tm-text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] focus-visible:ring-offset-2"
    style={{
      backgroundColor: data.expanded
        ? 'var(--tm-indicator-canvas-level-two-active-bg)'
        : 'var(--tm-indicator-canvas-level-two-bg)',
    }}
    aria-label={`${data.expanded ? '收起' : '展开'}${data.label}`}
    aria-expanded={data.expanded}
  >
    <Handle type="target" position={Position.Left} className={hiddenHandleClass} />
    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: data.branchColor }} aria-hidden="true" />
    <span className="min-w-0 flex-1 break-words leading-5">{data.label}</span>
    {data.expanded
      ? <ChevronDown className="h-4 w-4 shrink-0 text-[var(--tm-action-icon-neutral)]" aria-hidden="true" />
      : <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-action-icon-neutral)]" aria-hidden="true" />}
    <Handle type="source" position={Position.Right} className={hiddenHandleClass} />
  </button>
);

const LeafGroupNode = ({ data }: NodeProps<IndicatorCanvasNode>) => (
  <div className="w-[var(--tm-indicator-canvas-leaf-group-width)]">
    <Handle type="target" position={Position.Left} className={hiddenHandleClass} />
    <div className="grid grid-cols-1 gap-[var(--tm-indicator-canvas-leaf-gap)]">
      {data.leaves?.map(leaf => (
        <button
          key={leaf.id}
          type="button"
          onClick={() => data.path && data.onSelectLeaf(leaf, [data.path[0], data.path[1], leaf.name])}
          className="nodrag nopan flex min-h-[var(--tm-indicator-canvas-leaf-height)] min-w-0 items-center rounded-[var(--tm-indicator-canvas-leaf-radius)] bg-[var(--tm-indicator-canvas-leaf-bg)] px-[var(--tm-space-3)] text-left text-[length:var(--tm-indicator-canvas-leaf-font-size)] font-medium leading-5 text-[var(--tm-text-primary)] transition-colors active:bg-[var(--tm-brand-primary-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]"
        >
          <span className="min-w-0 break-words">{leaf.name}</span>
        </button>
      ))}
    </div>
  </div>
);

const nodeTypes: NodeTypes = {
  root: RootNode,
  levelOne: LevelOneNode,
  levelTwo: LevelTwoNode,
  leafGroup: LeafGroupNode,
};

const getLeafGroupHeight = (levelTwo: TeacherIndicatorLevelTwo) => (
  levelTwo.children.length * teacherIndicatorCanvasMetrics.leafHeight
  + Math.max(0, levelTwo.children.length - 1) * teacherIndicatorCanvasMetrics.leafGap
);

const layoutNodes = (nodes: IndicatorCanvasNode[], edges: Edge[]) => {
  const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: 'LR',
    align: 'UL',
    nodesep: teacherIndicatorCanvasMetrics.nodeGap,
    ranksep: teacherIndicatorCanvasMetrics.rankGap,
    marginx: teacherIndicatorCanvasMetrics.canvasPadding,
    marginy: teacherIndicatorCanvasMetrics.canvasPadding,
  });

  nodes.forEach(node => {
    const width = node.width ?? teacherIndicatorCanvasMetrics.levelTwoWidth;
    const height = node.height ?? teacherIndicatorCanvasMetrics.levelTwoHeight;
    graph.setNode(node.id, { width, height });
  });
  edges.forEach(edge => graph.setEdge(edge.source, edge.target));
  dagre.layout(graph);

  return nodes.map(node => {
    const position = graph.node(node.id);
    const width = node.width ?? teacherIndicatorCanvasMetrics.levelTwoWidth;
    const height = node.height ?? teacherIndicatorCanvasMetrics.levelTwoHeight;
    return {
      ...node,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      position: {
        x: position.x - width / 2,
        y: position.y - height / 2,
      },
    };
  });
};

const buildCanvasGraph = ({
  catalog,
  expandedLevelOneIds,
  expandedLevelTwoIds,
  onReturnToOverview,
  onToggleBranch,
  onToggleGroup,
  onSelectLeaf,
}: {
  catalog: TeacherIndicatorCatalog;
  expandedLevelOneIds: Set<string>;
  expandedLevelTwoIds: Set<string>;
  onReturnToOverview: () => void;
  onToggleBranch: (branchId: string) => void;
  onToggleGroup: (branchId: string, groupId: string) => void;
  onSelectLeaf: TeacherIndicatorMindMapProps['onSelectLeaf'];
}) => {
  const nodes: IndicatorCanvasNode[] = [{
    id: 'indicator-root',
    type: 'root',
    position: { x: 0, y: 0 },
    width: teacherIndicatorCanvasMetrics.rootWidth,
    height: teacherIndicatorCanvasMetrics.rootHeight,
    data: {
      kind: 'root',
      label: '指标体系',
      onReturnToOverview,
      onSelectLeaf,
    },
  }];
  const edges: Edge[] = [];

  catalog.levels
    .map((levelOne, branchIndex) => ({ levelOne, branchIndex }))
    .reverse()
    .forEach(({ levelOne, branchIndex }) => {
      const levelOneNodeId = `level-one:${levelOne.id}`;
      const branchColor = branchColors[branchIndex % branchColors.length];
      const branchExpanded = expandedLevelOneIds.has(levelOne.id);
      nodes.push({
        id: levelOneNodeId,
        type: 'levelOne',
        position: { x: 0, y: 0 },
        width: teacherIndicatorCanvasMetrics.levelOneWidth,
        height: teacherIndicatorCanvasMetrics.levelOneHeight,
        data: {
          kind: 'levelOne',
          label: levelOne.name,
          branchId: levelOne.id,
          branchColor,
          expanded: branchExpanded,
          onReturnToOverview,
          onToggleBranch,
          onToggleGroup,
          onSelectLeaf,
        },
      });
      edges.push({
        id: `edge:root:${levelOne.id}`,
        type: 'step',
        source: 'indicator-root',
        target: levelOneNodeId,
        style: { stroke: branchColor, strokeWidth: 1.5, opacity: 0.5 },
      });

      if (!branchExpanded) return;

      [...levelOne.children].reverse().forEach(levelTwo => {
        const levelTwoNodeId = `level-two:${levelTwo.id}`;
        const groupExpanded = expandedLevelTwoIds.has(levelTwo.id);
        nodes.push({
          id: levelTwoNodeId,
          type: 'levelTwo',
          position: { x: 0, y: 0 },
          width: teacherIndicatorCanvasMetrics.levelTwoWidth,
          height: teacherIndicatorCanvasMetrics.levelTwoHeight,
          data: {
            kind: 'levelTwo',
            label: levelTwo.name,
            branchId: levelOne.id,
            groupId: levelTwo.id,
            branchColor,
            expanded: groupExpanded,
            onReturnToOverview,
            onToggleBranch,
            onToggleGroup,
            onSelectLeaf,
          },
        });
        edges.push({
          id: `edge:${levelOne.id}:${levelTwo.id}`,
          type: 'step',
          source: levelOneNodeId,
          target: levelTwoNodeId,
          style: { stroke: branchColor, strokeWidth: 1.25, opacity: 0.38 },
        });

        if (!groupExpanded) return;

        const leafGroupNodeId = `leaf-group:${levelTwo.id}`;
        nodes.push({
          id: leafGroupNodeId,
          type: 'leafGroup',
          position: { x: 0, y: 0 },
          width: teacherIndicatorCanvasMetrics.leafGroupWidth,
          height: getLeafGroupHeight(levelTwo),
          data: {
            kind: 'leafGroup',
            label: levelTwo.name,
            branchId: levelOne.id,
            groupId: levelTwo.id,
            branchColor,
            leaves: levelTwo.children,
            path: [levelOne.name, levelTwo.name],
            onReturnToOverview,
            onToggleBranch,
            onToggleGroup,
            onSelectLeaf,
          },
        });
        edges.push({
          id: `edge:${levelTwo.id}:leaves`,
          type: 'step',
          source: levelTwoNodeId,
          target: leafGroupNodeId,
          style: { stroke: branchColor, strokeWidth: 1, opacity: 0.28 },
        });
      });
    });

  return { nodes: layoutNodes(nodes, edges), edges };
};

const TeacherIndicatorMindMap: React.FC<TeacherIndicatorMindMapProps> = ({ catalog, onSelectLeaf }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<ReactFlowInstance<IndicatorCanvasNode, Edge> | null>(null);
  const pendingFocusRef = useRef<FocusTarget>({ kind: 'overview' });
  const currentFocusRef = useRef<FocusTarget>({ kind: 'overview' });
  const [browseMode, setBrowseMode] = useState<'guided' | 'all'>('guided');
  const [expandedLevelOneIds, setExpandedLevelOneIds] = useState<Set<string>>(() => new Set());
  const [expandedLevelTwoIds, setExpandedLevelTwoIds] = useState<Set<string>>(() => new Set());

  const allLevelOneIds = useMemo(() => catalog.levels.map(item => item.id), [catalog]);
  const allLevelTwoIds = useMemo(
    () => catalog.levels.flatMap(item => item.children.map(levelTwo => levelTwo.id)),
    [catalog],
  );

  const positionAtReadingAnchor = useCallback((node: IndicatorCanvasNode, duration = 260) => {
    const instance = instanceRef.current;
    const canvas = canvasRef.current;
    if (!instance || !canvas) return;
    const zoom = teacherIndicatorCanvasMetrics.readingZoom;
    const nodeHeight = node.measured?.height ?? node.height ?? teacherIndicatorCanvasMetrics.levelTwoHeight;
    void instance.setViewport({
      x: teacherIndicatorCanvasMetrics.readingAnchorX - node.position.x * zoom,
      y: canvas.clientHeight / 2 - (node.position.y + nodeHeight / 2) * zoom,
      zoom,
    }, { duration });
  }, []);

  const focusTarget = useCallback((target: FocusTarget, duration = 260) => {
    const instance = instanceRef.current;
    if (!instance) return;
    const availableNodes = instance.getNodes();
    if (target.kind === 'overview') {
      const overviewNodes = availableNodes.filter(node => (
        node.data.kind === 'root' || node.data.kind === 'levelOne'
      ));
      void instance.fitView({
        nodes: overviewNodes,
        padding: 0.08,
        minZoom: teacherIndicatorCanvasMetrics.overviewMinZoom,
        maxZoom: teacherIndicatorCanvasMetrics.overviewMaxZoom,
        duration,
      });
      return;
    }

    const targetNode = availableNodes.find(node => (
      target.kind === 'branch'
        ? node.data.kind === 'levelOne' && node.data.branchId === target.branchId
        : node.data.kind === 'levelTwo' && node.data.groupId === target.groupId
    ));
    if (targetNode) positionAtReadingAnchor(targetNode, duration);
  }, [positionAtReadingAnchor]);

  const queueFocus = useCallback((target: FocusTarget) => {
    pendingFocusRef.current = target;
    currentFocusRef.current = target;
  }, []);

  const returnToOverview = useCallback(() => {
    queueFocus({ kind: 'overview' });
    setBrowseMode('guided');
    setExpandedLevelOneIds(new Set());
    setExpandedLevelTwoIds(new Set());
  }, [queueFocus]);

  const handleToggleBranch = useCallback((branchId: string) => {
    const branchExpanded = expandedLevelOneIds.has(branchId);
    if (browseMode === 'all') {
      queueFocus({ kind: 'branch', branchId });
      setExpandedLevelOneIds(current => {
        const next = new Set(current);
        if (next.has(branchId)) next.delete(branchId);
        else next.add(branchId);
        return next;
      });
      setExpandedLevelTwoIds(current => {
        if (!branchExpanded) return current;
        const branchGroupIds = new Set(
          catalog.levels.find(item => item.id === branchId)?.children.map(item => item.id) ?? [],
        );
        return new Set([...current].filter(id => !branchGroupIds.has(id)));
      });
      return;
    }

    if (branchExpanded) {
      returnToOverview();
      return;
    }

    queueFocus({ kind: 'branch', branchId });
    setExpandedLevelOneIds(new Set([branchId]));
    setExpandedLevelTwoIds(new Set());
  }, [browseMode, catalog.levels, expandedLevelOneIds, queueFocus, returnToOverview]);

  const handleToggleGroup = useCallback((branchId: string, groupId: string) => {
    const groupExpanded = expandedLevelTwoIds.has(groupId);
    queueFocus(groupExpanded
      ? { kind: 'branch', branchId }
      : { kind: 'group', groupId });

    if (browseMode === 'all') {
      setExpandedLevelTwoIds(current => {
        const next = new Set(current);
        if (next.has(groupId)) next.delete(groupId);
        else next.add(groupId);
        return next;
      });
      return;
    }

    setExpandedLevelOneIds(new Set([branchId]));
    setExpandedLevelTwoIds(groupExpanded ? new Set() : new Set([groupId]));
  }, [browseMode, expandedLevelTwoIds, queueFocus]);

  const { nodes, edges } = useMemo(() => buildCanvasGraph({
    catalog,
    expandedLevelOneIds,
    expandedLevelTwoIds,
    onReturnToOverview: returnToOverview,
    onToggleBranch: handleToggleBranch,
    onToggleGroup: handleToggleGroup,
    onSelectLeaf,
  }), [catalog, expandedLevelOneIds, expandedLevelTwoIds, handleToggleBranch, handleToggleGroup, onSelectLeaf, returnToOverview]);

  useEffect(() => {
    returnToOverview();
  }, [catalog.scope, returnToOverview]);

  useEffect(() => {
    if (!instanceRef.current) return;
    const frame = window.requestAnimationFrame(() => focusTarget(pendingFocusRef.current));
    return () => window.cancelAnimationFrame(frame);
  }, [nodes, focusTarget]);

  const expandAll = () => {
    queueFocus(currentFocusRef.current);
    setBrowseMode('all');
    setExpandedLevelOneIds(new Set(allLevelOneIds));
    setExpandedLevelTwoIds(new Set(allLevelTwoIds));
  };

  const allExpanded = expandedLevelOneIds.size === allLevelOneIds.length
    && expandedLevelTwoIds.size === allLevelTwoIds.length;
  const allCollapsed = expandedLevelOneIds.size === 0 && expandedLevelTwoIds.size === 0;

  return (
    <div ref={canvasRef} className="relative h-full min-h-0 overflow-hidden bg-[var(--tm-indicator-canvas-bg)]">
      <ReactFlow<IndicatorCanvasNode, Edge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={() => undefined}
        onInit={instance => {
          instanceRef.current = instance;
          window.requestAnimationFrame(() => focusTarget({ kind: 'overview' }, 0));
        }}
        minZoom={teacherIndicatorCanvasMetrics.minZoom}
        maxZoom={teacherIndicatorCanvasMetrics.maxZoom}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        zoomOnDoubleClick={false}
        zoomOnScroll={false}
        panOnScroll={false}
        preventScrolling
        proOptions={{ hideAttribution: true }}
        className="[&_.react-flow__pane]:cursor-grab [&_.react-flow__pane:active]:cursor-grabbing"
        aria-label={`${catalog.title}三级结构画布`}
      />

      <div className="absolute bottom-[calc(var(--tm-space-3)+env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 items-center overflow-hidden rounded-[var(--tm-radius-control)] bg-[var(--tm-indicator-canvas-toolbar-bg)] shadow-[var(--tm-shadow-control)] backdrop-blur-sm" aria-label="指标画布操作">
        <CanvasTextButton label="总览" onClick={returnToOverview} />
        <CanvasTextButton label="展开全部" onClick={expandAll} disabled={allExpanded} />
        <CanvasTextButton label="收起全部" onClick={returnToOverview} disabled={allCollapsed} />
      </div>
    </div>
  );
};

const CanvasTextButton = ({
  label,
  onClick,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="h-[var(--tm-size-touch)] whitespace-nowrap px-[var(--tm-space-3)] text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-brand-primary)] active:bg-[var(--tm-bg-surface-soft)] disabled:text-[var(--tm-text-disabled)]"
  >
    {label}
  </button>
);

export default TeacherIndicatorMindMap;
