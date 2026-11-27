import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import type {
  ClassReportClass,
  ClassReportDirection,
  ClassReportIndicator,
} from "../../domain/classEvaluationReport";

import { useDiscreteWheelPaging } from "../../hooks/useDiscreteWheelPaging";

interface Props {
  indicators: ClassReportIndicator[];
  dimensions: string[];
  classes: ClassReportClass[];
  direction: ClassReportDirection;
  directionLabel: string;
  onOpenRecords: (path: string) => void;
}

export default function ClassEvaluationIndicatorTable({
  indicators,
  dimensions,
  classes,
  direction,
  directionLabel,
  onOpenRecords,
}: Props) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const currentPageButtonRef = useRef<HTMLButtonElement>(null);
  const swipe = useRef<{
    id: number;
    x: number;
    y: number;
    index: number;
  } | null>(null);
  const suppressSwipeClick = useRef(false);
  const focusCardAfterChange = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const selectCard = useCallback(
    (index: number) => {
      const nextIndex = Math.max(0, Math.min(dimensions.length - 1, index));
      if (!dimensions.length) return;
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    },
    [dimensions.length],
  );
  const stepCard = useCallback(
    (direction: -1 | 1) => {
      selectCard(activeIndexRef.current + direction);
    },
    [selectCard],
  );
  useDiscreteWheelPaging(carouselRef, stepCard, {
    allowInertiaInterrupt: true,
  });

  useEffect(() => {
    if (focusCardAfterChange.current) {
      focusCardAfterChange.current = false;
      carouselRef.current
        ?.querySelectorAll<HTMLElement>("[data-indicator-card]")
        [activeIndex]?.focus({ preventScroll: true });
    }
    const button = currentPageButtonRef.current;
    const pagination = button?.closest("nav");
    if (
      button &&
      pagination &&
      pagination.scrollWidth > pagination.clientWidth
    ) {
      button.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [activeIndex, dimensions.length]);

  // 与学生奖章学期卡一致：按渲染宽度判断手势，松手翻页并拦截拖动产生的点击。
  const startSwipe = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    suppressSwipeClick.current = false;
    swipe.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      index: activeIndexRef.current,
    };
  };
  const getSwipeDirection = (
    event: React.PointerEvent<HTMLDivElement>,
    start: { x: number; y: number },
  ) => {
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const threshold = Math.min(
      24,
      event.currentTarget.getBoundingClientRect().width * 0.08,
    );
    if (Math.abs(dx) < threshold || Math.abs(dx) <= Math.abs(dy)) return 0;
    return dx < 0 ? 1 : -1;
  };
  const captureSwipe = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = swipe.current;
    if (
      start?.id !== event.pointerId ||
      suppressSwipeClick.current ||
      !getSwipeDirection(event, start)
    )
      return;
    suppressSwipeClick.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const cancelSwipe = (event: React.PointerEvent<HTMLDivElement>) => {
    if (swipe.current?.id === event.pointerId) swipe.current = null;
  };
  const finishSwipe = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = swipe.current;
    if (!start || start.id !== event.pointerId) return;
    swipe.current = null;
    const direction = getSwipeDirection(event, start);
    if (!direction) return;
    suppressSwipeClick.current = true;
    selectCard(start.index + direction);
  };
  const classNames = new Map(classes.map((item) => [item.id, item.name]));
  const positive = direction === "positive";
  const scoreLabel = positive ? "加分" : "扣分";
  const scoreColor = positive
    ? "text-[var(--tm-chart-positive-text)]"
    : "text-[var(--tm-chart-negative-text)]";

  return (
    <div>
      <p aria-live="polite" className="sr-only">
        {dimensions[activeIndex]}
      </p>
      <div
        ref={carouselRef}
        role="region"
        aria-label="一级指标明细卡片，可左右切换"
        aria-roledescription="轮播"
        onPointerDown={startSwipe}
        onPointerMove={captureSwipe}
        onPointerUp={finishSwipe}
        onPointerCancel={cancelSwipe}
        onLostPointerCapture={cancelSwipe}
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => {
          if (!suppressSwipeClick.current || event.detail === 0) return;
          event.preventDefault();
          event.stopPropagation();
        }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          const previousIndex = activeIndexRef.current;
          stepCard(event.key === "ArrowLeft" ? -1 : 1);
          focusCardAfterChange.current =
            activeIndexRef.current !== previousIndex;
        }}
        className="-mx-[var(--tm-report-page-inline)] h-[var(--tm-report-indicator-card-height)] min-w-0 select-none overflow-clip [touch-action:pan-y_pinch-zoom]"
        style={
          {
            "--indicator-card-gap": "var(--tm-space-2)",
            "--indicator-card-gutter":
              dimensions.length > 1 ? "var(--tm-space-6)" : "var(--tm-space-4)",
          } as React.CSSProperties
        }
      >
        <div
          className="flex h-full w-full gap-[var(--indicator-card-gap)] px-[var(--indicator-card-gutter)] transition-transform [transition-duration:var(--tm-duration-standard)] ease-out motion-reduce:transition-none"
          style={{
            transform:
              activeIndex > 0
                ? `translateX(calc(-${activeIndex} * (100% - 2 * var(--indicator-card-gutter) + var(--indicator-card-gap))))`
                : "none",
          }}
        >
          {dimensions.map((name, index) => {
            const dimension = indicators.find((item) => item.name === name);
            const rows =
              dimension?.children.flatMap((category) =>
                category.children.map((item) => ({
                  ...item,
                  categoryName: category.name,
                })),
              ) ?? [];
            return (
              <section
                key={name}
                aria-label={`${name}${directionLabel}`}
                aria-roledescription="卡片"
                data-indicator-card
                inert={index !== activeIndex}
                tabIndex={index === activeIndex ? 0 : undefined}
                className="flex h-full w-full min-w-0 shrink-0 flex-col overflow-hidden rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)] py-[var(--tm-space-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]"
              >
                <h3 className="mb-[var(--tm-space-2)] flex min-h-[var(--tm-size-touch)] shrink-0 items-center justify-center text-center text-[length:var(--tm-font-size-body)] font-semibold">
                  {name}
                </h3>
                {rows.length ? (
                  <>
                    <ul
                      tabIndex={0}
                      aria-label={`${name}明细列表，可上下滚动`}
                      className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]"
                    >
                      {rows.map((item) => {
                        const names = item.classIds
                          .map((id) => classNames.get(id) ?? id)
                          .sort((a, b) =>
                            a.localeCompare(b, "zh-CN", { numeric: true }),
                          );
                        const sameName = rows.some(
                          (other) =>
                            other.id !== item.id && other.name === item.name,
                        );
                        return (
                          <li
                            key={item.id}
                            className="border-b border-[var(--tm-border-subtle)] last:border-b-0"
                          >
                            <button
                              type="button"
                              onClick={() => onOpenRecords(item.id)}
                              aria-label={`${item.categoryName}，${item.name}，${scoreLabel}${item.amount}分，${item.recordCount}条，${scoreLabel}班级${names.join("、")}，查看明细`}
                              className="block min-h-[var(--tm-size-touch)] w-full py-[var(--tm-space-3)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)] active:bg-[var(--tm-bg-surface-soft)]"
                            >
                              <span className="flex items-start gap-[var(--tm-space-3)]">
                                <span className="min-w-0 flex-1 break-words text-[length:var(--tm-font-size-compact)] font-semibold leading-5">
                                  {item.name}
                                  {sameName && (
                                    <span className="mt-1 block text-[length:var(--tm-font-size-meta)] font-normal text-[var(--tm-text-secondary)]">
                                      {item.categoryName}
                                    </span>
                                  )}
                                </span>
                                <strong
                                  className={`shrink-0 text-[length:var(--tm-font-size-compact)] leading-5 tabular-nums ${scoreColor}`}
                                >
                                  {positive ? "+" : "−"}
                                  {item.amount}分
                                </strong>
                                <span className="shrink-0 text-[length:var(--tm-font-size-meta)] leading-5 tabular-nums text-[var(--tm-text-secondary)]">
                                  {item.recordCount}条
                                </span>
                                <ChevronRight
                                  aria-hidden="true"
                                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tm-text-secondary)]"
                                />
                              </span>
                              <span className="mt-[var(--tm-space-2)] block break-words text-[length:var(--tm-font-size-meta)] leading-5 text-[var(--tm-text-secondary)]">
                                <span className="sr-only">
                                  {scoreLabel}班级：
                                </span>
                                {names.join("、")}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                ) : (
                  <p className="flex flex-1 items-center justify-center text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">
                    暂无{directionLabel}记录
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </div>
      {dimensions.length > 1 && (
        <nav
          aria-label="切换一级指标"
          className="min-w-0 overflow-x-auto no-scrollbar"
        >
          <div className="mx-auto flex w-max px-[var(--tm-space-2)]">
            {dimensions.map((name, index) => (
              <button
                key={name}
                ref={index === activeIndex ? currentPageButtonRef : undefined}
                type="button"
                aria-label={name}
                aria-current={index === activeIndex ? "page" : undefined}
                onClick={() => selectCard(index)}
                className="group grid h-[var(--tm-size-touch)] w-[58px] shrink-0 items-end justify-items-center rounded-[var(--tm-radius-card-compact)] px-[3px] pb-[var(--tm-space-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]"
              >
                <span
                  aria-hidden="true"
                  className={`h-0.5 w-full rounded-full group-hover:bg-[var(--tm-text-secondary)] ${index === activeIndex ? "bg-[var(--tm-text-secondary)]" : "bg-[var(--tm-border-subtle)]"}`}
                />
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
