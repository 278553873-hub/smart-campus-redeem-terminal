import React, { useId, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import type {
  ClassReportClass,
  ClassReportDirection,
  ClassReportIndicator,
} from "../../domain/classEvaluationReport";

interface ClassEvaluationIndicatorDetailsProps {
  indicators: ClassReportIndicator[];
  dimensions: string[];
  classes: ClassReportClass[];
  direction: ClassReportDirection;
  directionLabel: string;
  onOpenRecords: (path: string) => void;
}

type SortKey = "amount" | "recordCount" | "classCount";
type SortOrder = "descending" | "ascending";

interface ClassGradeGroup {
  gradeKey: string;
  gradeOrder: number;
  classNames: string[];
}

interface IndicatorTableRow {
  id: string;
  dimensionName: string;
  categoryName: string;
  leafName: string;
  amount: number;
  recordCount: number;
  classCount: number;
  gradeGroups: ClassGradeGroup[];
  allClassNames: string[];
}

const stripStagePrefix = (name: string) =>
  name.replace(/^(?:小学|初中|高中|幼小|九年一贯制?)\s*[·・\-/／\s]*/, "").trim();

const SortArrows: React.FC = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 8 12"
    className="class-report-v2-sort-arrows h-2.5 w-2 shrink-0"
  >
    <path className="sort-arrow-up" d="M4 1L7 4.5H1L4 1Z" />
    <path className="sort-arrow-down" d="M4 11L1 7.5H7L4 11Z" />
  </svg>
);

const ClassEvaluationIndicatorDetails: React.FC<
  ClassEvaluationIndicatorDetailsProps
> = ({
  indicators,
  dimensions,
  classes,
  direction,
  directionLabel,
  onOpenRecords,
}) => {
  const captionId = useId();
  const positive = direction === "positive";
  const scoreLabel = positive ? "加分" : "扣分";
  const scoreColor = positive
    ? "text-[var(--tm-chart-positive-text)]"
    : "text-[var(--tm-chart-negative-text)]";

  const { classMap, gradeOrderMap } = useMemo(() => {
    const map = new Map<string, ClassReportClass>();
    const order = new Map<string, number>();
    classes.forEach((item) => {
      map.set(item.id, item);
      if (!order.has(item.gradeId)) order.set(item.gradeId, order.size);
    });
    return { classMap: map, gradeOrderMap: order };
  }, [classes]);

  // 严格只保留当前方向下有记录的一级指标，无记录的一级指标不展示。
  const populatedDimensions = useMemo(() => {
    const byName = new Map(indicators.map((item) => [item.name, item]));
    const ordered: ClassReportIndicator[] = [];
    for (const name of dimensions) {
      const node = byName.get(name);
      if (node && node.recordCount > 0) ordered.push(node);
    }
    for (const node of indicators) {
      if (node.recordCount > 0 && !ordered.some((item) => item.id === node.id)) {
        ordered.push(node);
      }
    }
    return ordered;
  }, [dimensions, indicators]);

  const [selectedDimension, setSelectedDimension] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("amount");
  const [sortOrder, setSortOrder] = useState<SortOrder>("descending");
  const [scrolledX, setScrolledX] = useState(false);

  const hasMultipleDimensions = populatedDimensions.length > 1;
  const effectiveSelected = !hasMultipleDimensions
    ? (populatedDimensions[0]?.name ?? "all")
    : selectedDimension === "all" ||
        populatedDimensions.some((item) => item.name === selectedDimension)
      ? selectedDimension
      : "all";

  const visibleDimensions =
    effectiveSelected === "all"
      ? populatedDimensions
      : populatedDimensions.filter((item) => item.name === effectiveSelected);

  const rows = useMemo<IndicatorTableRow[]>(() => {
    const collator = new Intl.Collator("zh-CN", {
      numeric: true,
      sensitivity: "base",
    });
    const list: IndicatorTableRow[] = [];
    for (const dimension of visibleDimensions) {
      for (const category of dimension.children) {
        for (const leaf of category.children) {
          if (leaf.recordCount <= 0) continue;
          const grouped = new Map<string, ClassGradeGroup>();
          for (const id of leaf.classIds) {
            const info = classMap.get(id);
            const displayName = stripStagePrefix(info?.name ?? id);
            const gradeKey = info?.gradeId ?? displayName;
            const gradeOrder = info
              ? (gradeOrderMap.get(info.gradeId) ?? 999)
              : 999;
            let group = grouped.get(gradeKey);
            if (!group) {
              group = { gradeKey, gradeOrder, classNames: [] };
              grouped.set(gradeKey, group);
            }
            if (!group.classNames.includes(displayName)) {
              group.classNames.push(displayName);
            }
          }
          const gradeGroups = Array.from(grouped.values())
            .sort(
              (a, b) =>
                a.gradeOrder - b.gradeOrder ||
                collator.compare(a.gradeKey, b.gradeKey),
            )
            .map((group) => ({
              ...group,
              classNames: [...group.classNames].sort((a, b) =>
                collator.compare(a, b),
              ),
            }));
          const allClassNames = gradeGroups.flatMap((group) => group.classNames);
          list.push({
            id: leaf.id,
            dimensionName: dimension.name,
            categoryName: category.name,
            leafName: leaf.name,
            amount: leaf.amount,
            recordCount: leaf.recordCount,
            classCount: allClassNames.length,
            gradeGroups,
            allClassNames,
          });
        }
      }
    }
    const factor = sortOrder === "ascending" ? 1 : -1;
    return list.sort(
      (a, b) =>
        factor * (a[sortKey] - b[sortKey]) ||
        b.amount - a.amount ||
        b.recordCount - a.recordCount ||
        collator.compare(a.leafName, b.leafName),
    );
  }, [classMap, gradeOrderMap, sortKey, sortOrder, visibleDimensions]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((current) =>
        current === "descending" ? "ascending" : "descending",
      );
      return;
    }
    setSortKey(key);
    setSortOrder("descending");
  };

  if (!populatedDimensions.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-secondary)]">
          当前范围本周期暂无{directionLabel}记录
        </p>
      </div>
    );
  }

  const sortLabels: Record<SortKey, string> = {
    amount: scoreLabel,
    recordCount: "条数",
    classCount: "班数",
  };

  return (
    <div className="class-report-v2-details-content">
      <div
        className="class-report-v2-dim-filter mb-1.5 flex gap-2 overflow-x-auto px-[var(--tm-report-page-inline)] no-scrollbar"
        role="tablist"
        aria-label="一级指标快速筛选"
      >
        {hasMultipleDimensions && (
          <button
            type="button"
            role="tab"
            aria-selected={effectiveSelected === "all"}
            onClick={() => setSelectedDimension("all")}
            className="class-report-v2-dim-pill"
          >
            <span>全部指标</span>
          </button>
        )}
        {populatedDimensions.map((dimension) => (
          <button
            key={dimension.id}
            type="button"
            role="tab"
            aria-selected={effectiveSelected === dimension.name}
            onClick={() => setSelectedDimension(dimension.name)}
            className="class-report-v2-dim-pill"
          >
            <span>
              {dimension.name}
              <em className="class-report-v2-dim-pill-count tabular-nums">
                {dimension.recordCount}
              </em>
            </span>
          </button>
        ))}
      </div>

      <p role="status" className="sr-only">
        当前按{sortLabels[sortKey]}
        {sortOrder === "descending" ? "降序" : "升序"}排列，共 {rows.length}{" "}
        项指标
      </p>

      <div
        tabIndex={0}
        role="region"
        aria-labelledby={captionId}
        data-scrolled-x={scrolledX || undefined}
        onScroll={(event) => {
          const next = event.currentTarget.scrollLeft > 2;
          if (next !== scrolledX) setScrolledX(next);
        }}
        className="class-report-v2-table-scroll no-scrollbar"
      >
        <table className="class-report-v2-compare-table">
          <caption id={captionId} className="sr-only">
            一级指标{directionLabel}对比明细表，可左右滑动查看涉及班级
          </caption>
          <thead>
            <tr>
              <th scope="col" className="class-report-v2-col-indicator">
                具体指标
              </th>
              <th
                scope="col"
                aria-sort={sortKey === "amount" ? sortOrder : undefined}
                className="class-report-v2-col-metric"
              >
                <button
                  type="button"
                  onClick={() => toggleSort("amount")}
                  className="class-report-v2-sort-btn"
                >
                  <span>{scoreLabel}</span>
                  <SortArrows />
                </button>
              </th>
              <th
                scope="col"
                aria-sort={sortKey === "recordCount" ? sortOrder : undefined}
                className="class-report-v2-col-count"
              >
                <button
                  type="button"
                  onClick={() => toggleSort("recordCount")}
                  className="class-report-v2-sort-btn"
                >
                  <span>条数</span>
                  <SortArrows />
                </button>
              </th>
              <th
                scope="col"
                aria-sort={sortKey === "classCount" ? sortOrder : undefined}
                className="class-report-v2-col-class-count"
              >
                <button
                  type="button"
                  onClick={() => toggleSort("classCount")}
                  className="class-report-v2-sort-btn"
                >
                  <span>班数</span>
                  <SortArrows />
                </button>
              </th>
              <th scope="col" className="class-report-v2-col-classes">
                涉及班级
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="class-report-v2-table-row">
                <th scope="row" className="class-report-v2-cell-indicator">
                  <button
                    type="button"
                    onClick={() => onOpenRecords(row.id)}
                    aria-label={`${row.dimensionName}，${row.categoryName}，${row.leafName}，${scoreLabel}${row.amount}分，${row.recordCount}条，涉及${row.classCount}个班：${row.allClassNames.join("、")}，查看明细`}
                    className="class-report-v2-indicator-trigger"
                  >
                    <span className="class-report-v2-indicator-leaf">
                      {row.leafName}
                    </span>
                    <span className="class-report-v2-indicator-path">
                      {row.dimensionName} · {row.categoryName}
                    </span>
                  </button>
                </th>
                <td className="class-report-v2-cell-num tabular-nums">
                  <strong className={`text-[14px] font-bold ${scoreColor}`}>
                    {positive ? "+" : "−"}
                    {row.amount}
                  </strong>
                </td>
                <td className="class-report-v2-cell-num tabular-nums text-[14px] font-semibold text-[var(--tm-text-primary)]">
                  {row.recordCount}
                </td>
                <td className="class-report-v2-cell-num tabular-nums text-[14px] font-semibold text-[var(--tm-text-primary)]">
                  {row.classCount}
                </td>
                <td className="class-report-v2-cell-classes">
                  <button
                    type="button"
                    onClick={() => onOpenRecords(row.id)}
                    aria-label={`查看${row.leafName}的评价明细`}
                    className="class-report-v2-classes-trigger"
                  >
                    <span className="class-report-v2-grade-rows">
                      {row.gradeGroups.map((group) => (
                        <span
                          key={group.gradeKey}
                          className="class-report-v2-grade-row"
                        >
                          {group.classNames.map((className) => (
                            <span
                              key={className}
                              className={`class-report-v2-class-tag ${positive ? "class-report-v2-class-tag--positive" : "class-report-v2-class-tag--negative"}`}
                            >
                              {className}
                            </span>
                          ))}
                        </span>
                      ))}
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 shrink-0 text-[var(--tm-text-tertiary)]"
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassEvaluationIndicatorDetails;
