import React from "react";
import type { ClassReportDirection } from "../../domain/classEvaluationReport";

export interface ClassEvaluationDirectionTabItem {
  value: ClassReportDirection;
  label: string;
  count: number;
}

interface ClassEvaluationDirectionTabsProps {
  value: ClassReportDirection;
  items: ReadonlyArray<ClassEvaluationDirectionTabItem>;
  onChange: (value: ClassReportDirection) => void;
  panelId: string;
  ariaLabel?: string;
}

const TabCurveCorner: React.FC<{ side: "left" | "right"; gradientId: string }> = ({
  side,
  gradientId,
}) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 36 48"
    preserveAspectRatio="none"
    className={`class-report-v2-tab-curve class-report-v2-tab-curve--${side}`}
  >
    <defs>
      <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--tm-gold-tab-seam-shadow)" stopOpacity="0.9" />
        <stop offset="68%" stopColor="var(--tm-gold-tab-seam-shadow)" stopOpacity="0.45" />
        <stop offset="100%" stopColor="var(--tm-gold-tab-seam-shadow)" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M0,0 L4,0 C12,0 15.5,6 18.5,16 L24.5,36 C27.5,44 30.5,48 36,48 L0,48 Z"
      fill="var(--tm-bg-surface)"
    />
    <path
      d="M5,0.6 C12.5,0.6 15.8,6.2 18.8,16 L24.8,36 C27.6,43.8 30.6,47.4 35.5,47.4"
      fill="none"
      stroke={`url(#${gradientId})`}
      strokeWidth="1.5"
    />
  </svg>
);

const ClassEvaluationDirectionTabs: React.FC<
  ClassEvaluationDirectionTabsProps
> = ({ value, items, onChange, panelId, ariaLabel = "评价明细" }) => {
  const curveBaseId = React.useId();

  return (
  <div
    className="class-report-v2-direction-tabs"
    role="tablist"
    aria-label={ariaLabel}
  >
    {items.map((item, index) => {
      const selected = item.value === value;
      const isFirst = index === 0;
      const isLast = index === items.length - 1;
      return (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={selected}
          aria-controls={panelId}
          tabIndex={selected ? 0 : -1}
          onClick={() => onChange(item.value)}
          onKeyDown={(event) => {
            const next =
              event.key === "ArrowRight"
                ? (index + 1) % items.length
                : event.key === "ArrowLeft"
                  ? (index - 1 + items.length) % items.length
                  : event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? items.length - 1
                      : undefined;
            if (next === undefined) return;
            event.preventDefault();
            onChange(items[next].value);
            event.currentTarget.parentElement
              ?.querySelectorAll<HTMLButtonElement>('button[role="tab"]')
              [next]?.focus();
          }}
          className={`class-report-v2-direction-tab ${selected ? "is-selected" : ""}`}
        >
          {selected && !isFirst && (
            <TabCurveCorner side="left" gradientId={`${curveBaseId}-l-${index}`} />
          )}
          {selected && !isLast && (
            <TabCurveCorner side="right" gradientId={`${curveBaseId}-r-${index}`} />
          )}
          <span className="class-report-v2-direction-tab-inner">
            {selected && (
              <span
                aria-hidden="true"
                className="class-report-v2-direction-tab-glow"
              />
            )}
            <span className="class-report-v2-direction-tab-label">
              {item.label}
            </span>
            <span className="class-report-v2-direction-tab-count tabular-nums">
              {item.count}
            </span>
          </span>
        </button>
      );
    })}
  </div>
  );
};

export default ClassEvaluationDirectionTabs;
