import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import MobileDatePickerSheet from "../components/ui/MobileDatePickerSheet";
import { localToday } from "../components/ui/mobileDatePickerModel";
import MobileBottomSheet from "../components/ui/MobileBottomSheet";
import MobileFilterDropdown, {
  MobileDropdownOptionList,
} from "../components/ui/MobileFilterDropdown";
import ClassRankingList from "../components/ui/ClassRankingList";
import PillSelectionControl from "../components/ui/PillSelectionControl";
import CompactSegmentedControl from "../components/ui/CompactSegmentedControl";
import { TeacherReportLineChart, type TeacherReportLineSeries } from "../components/report/TeacherReportChart";
import {
  ImageGallery,
  ImagePreview,
} from "../../components/media/ImageGallery";
import { teacherMobileGoldHeaderVariables } from "../styles/teacherMobileYellowTheme";
import "../styles/teacherMobileGoldHeader.css";
import { teacherBrandCssVariables } from "../styles/teacherMobileTokens";
import type { TeacherSpaceOption } from "../domain/teacherSpaceAccess";
import {
  getClassEvaluationScoreChange,
  type ClassEvaluationRecord,
} from "../domain/classEvaluationAssistantV2";
import {
  filterClassReportRecords,
  getClassReportIndicators,
  getClassReportOverview,
  getClassReportPeriod,
  getClassReportPeriods,
  getClassReportRanking,
  getClassReportSummary,
  type ClassReportDirection,
  type ClassReportPeriodType,
} from "../domain/classEvaluationReport";
import ClassEvaluationIndicatorTable from "../components/report/ClassEvaluationIndicatorTable";
import ClassEvaluationOverviewCard from "../components/report/ClassEvaluationOverviewCard";
import ClassEvaluationRankingCard, {
  ClassEvaluationRankingRows,
} from "../components/report/ClassEvaluationRankingCard";
import ClassEvaluationDirectionTabs from "../components/report/ClassEvaluationDirectionTabs";
import ClassEvaluationIndicatorDetails from "../components/report/ClassEvaluationIndicatorDetails";
import { createClassEvaluationReportDemo } from "../data/classEvaluationReportDemo";
import "./MoralEducationCockpitView.css";

interface MoralEducationCockpitViewProps {
  onBack: () => void;
  currentSpace: TeacherSpaceOption;
  variant?: "classic" | "v2";
}
const periodNames = { day: "日", week: "周", month: "月" };
const datePickerTitles = { day: "选择日期", week: "选择周", month: "选择月份" };
const periodOptions: { value: ClassReportPeriodType; label: string }[] = [
  { value: "day", label: "按日" },
  { value: "week", label: "按周" },
  { value: "month", label: "按月" },
];
const directionOptions: { value: ClassReportDirection; label: string }[] = [
  { value: "negative", label: "待改进" },
  { value: "positive", label: "表现亮点" },
];
const directionTabs: { value: ClassReportDirection; label: string }[] = [
  { value: "positive", label: "表扬" },
  { value: "negative", label: "待改进" },
];
const cardClass =
  "rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface)] p-[var(--tm-report-card-padding)] [box-shadow:var(--tm-shadow-card)]";
const touchClass =
  "flex min-h-11 min-w-11 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]";
const SectionHeader = ({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) => (
  <div className="mb-[var(--tm-report-card-content-gap)] flex min-h-11 items-center justify-between gap-3">
    <h2 className="text-[17px] font-semibold">{title}</h2>
    {action}
  </div>
);

const MoralEducationCockpitView: React.FC<MoralEducationCockpitViewProps> = ({
  onBack,
  currentSpace,
  variant = "classic",
}) => {
  const isV2 = variant === "v2";
  const reportPanelId = useId();
  const today = localToday();
  const assessmentCycle =
    currentSpace.classLeaderboardSettlementCycle ?? "week";
  const [periodType, setPeriodType] =
    useState<ClassReportPeriodType>(assessmentCycle);
  const [anchorDate, setAnchorDate] = useState(today);
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const periodTrigger = useRef<HTMLButtonElement>(null);
  const [gradeId, setGradeId] = useState("all");
  const [direction, setDirection] = useState<ClassReportDirection>("negative");
  const [rankingOpen, setRankingOpen] = useState(false);
  const [recordsOpen, setRecordsOpen] = useState(false);
  const [recordPath, setRecordPath] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] =
    useState<ClassEvaluationRecord | null>(null);
  const [preview, setPreview] = useState<{
    images: string[];
    index: number;
  } | null>(null);
  const [detailsPinned, setDetailsPinned] = useState(false);
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const detailsShellRef = useRef<HTMLElement>(null);
  const data = useMemo(
    () => createClassEvaluationReportDemo(currentSpace, today),
    [currentSpace, today],
  );
  const periods = useMemo(
    () => getClassReportPeriods(periodType, data.firstDate, today),
    [periodType, data.firstDate, today],
  );
  const period = getClassReportPeriod(periodType, anchorDate);
  const datePickerTitle = datePickerTitles[periodType];
  const periodLabel = isV2 && period.startDate.slice(0, 4) !== period.endDate.slice(0, 4)
    ? `${period.startDate.replaceAll("-", ".")}–${period.endDate.replaceAll("-", ".")}`
    : period.label;
  const compactDateLabel = {
    day: period.startDate.replaceAll("-", "."),
    week: `${period.startDate.slice(5).replace("-", ".")}–${period.endDate.slice(5).replace("-", ".")}`,
    month: period.label,
  }[periodType];
  const periodIndex = periods.findIndex((item) => item.id === period.id);
  const grades = Array.from(
    new Map(
      data.classes.map((item) => [
        item.gradeId,
        { value: item.gradeId, label: item.gradeName },
      ]),
    ).values(),
  );
  const gradeClasses = data.classes.filter(
    (item) => gradeId === "all" || item.gradeId === gradeId,
  );
  const classMap = new Map(data.classes.map((item) => [item.id, item]));
  const records = filterClassReportRecords(
    data.records,
    period,
    gradeClasses.map((item) => item.id),
  );
  const summary = getClassReportSummary(records);
  const overview = getClassReportOverview(records, gradeClasses.length, null);
  const summaryLabels = isV2 ? directionTabs : directionOptions;
  const counts = { positive: summary.positiveCount, negative: summary.negativeCount };
  const v2PeriodItems = useMemo(
    () =>
      periodOptions.map((item) => ({
        value: item.value,
        label:
          item.value === assessmentCycle ? (
            <span className="class-report-v2-period-item-label">
              <span>{item.label}</span>
              <span className="class-report-v2-cycle-badge">考核周期</span>
            </span>
          ) : (
            item.label
          ),
      })),
    [assessmentCycle],
  );
  const directionTabItems = directionTabs.map((item) => ({
    ...item,
    count: counts[item.value],
  }));
  const indicators = getClassReportIndicators(records, direction);
  const directionRecords = records.filter((record) =>
    direction === "positive"
      ? getClassEvaluationScoreChange(record) > 0
      : getClassEvaluationScoreChange(record) < 0,
  );
  const detailRecords = directionRecords.filter(
    (record) =>
      !recordPath || JSON.stringify(record.indicatorPath) === recordPath,
  );
  const ranking = getClassReportRanking(
    data.records,
    gradeClasses,
    data.rules,
    period,
    assessmentCycle,
  );
  const showRanking = periodType === assessmentCycle;
  const rankingTitle = `班级${periodNames[assessmentCycle]}排行榜`;
  const trend = periods
    .slice(Math.max(0, periodIndex - 4), periodIndex + 1)
    .map((item) => ({
      label:
        periodType === "month"
          ? item.label
          : item.startDate.slice(5).replace("-", "."),
      ...getClassReportSummary(
        filterClassReportRecords(
          data.records,
          item,
          gradeClasses.map((classInfo) => classInfo.id),
        ),
      ),
    }));
  const directionLabel = direction === "positive" ? (isV2 ? "表扬" : "表现亮点") : "待改进";
  const trendSeries: TeacherReportLineSeries[] = [
    { name: "加分合计", values: trend.map((item) => item.addition), color: "positive" },
    { name: "扣分合计", values: trend.map((item) => item.deduction), color: "negative" },
  ];
  const visibleTrendSeries = isV2 ? trendSeries : trendSeries.filter((item) => item.color === direction);
  const scopeLabel =
    gradeId === "all"
      ? "全校"
      : grades.find((item) => item.value === gradeId)?.label;

  useEffect(() => {
    setPeriodType(assessmentCycle);
    setGradeId("all");
    setRecordsOpen(false);
    setRankingOpen(false);
    setSelectedRecord(null);
    setPreview(null);
  }, [currentSpace.id, assessmentCycle]);

  const changePeriodType = (value: string) => {
    setPeriodType(value as ClassReportPeriodType);
    setPeriodMenuOpen(false);
  };
  const selectDate = (date: string) => {
    setAnchorDate(
      date < data.firstDate ? data.firstDate : date > today ? today : date,
    );
  };
  const movePeriod = (offset: number) => {
    const next = periods[periodIndex + offset];
    if (next) selectDate(next.startDate);
  };
  const openRecords = (path: string | null = null) => {
    setRecordPath(path);
    setSelectedRecord(null);
    setRecordsOpen(true);
  };
  const renderRecord = (record: ClassEvaluationRecord) => {
    const score = getClassEvaluationScoreChange(record);
    const classInfo = classMap.get(record.classId);
    return (
      <button
        key={record.id}
        type="button"
        onClick={() => {
          if (!recordsOpen) setRecordPath(null);
          setSelectedRecord(record);
          setRecordsOpen(true);
        }}
        className="block w-full border-b border-[var(--tm-border-subtle)] py-4 text-left last:border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
      >
        <div className="flex items-center justify-between gap-3">
          <strong className="text-[14px] font-semibold">
            {classInfo?.name}
          </strong>
          <span
            className={`shrink-0 text-[14px] font-bold tabular-nums ${score > 0 ? "text-[var(--tm-chart-positive-text)]" : "text-[var(--tm-chart-negative-text)]"}`}
          >
            {score > 0 ? "+" : ""}
            {score}分
          </span>
        </div>
        <p className="mt-1 text-[12px] text-[var(--tm-text-secondary)]">
          {classInfo?.gradeName} · {record.date} · {record.indicator}
        </p>
        <p className="mt-2 line-clamp-2 text-[14px] leading-6">
          {record.finding}
        </p>
        <div className="mt-2 flex items-center justify-between text-[12px] text-[var(--tm-text-secondary)]">
          <span>
            {record.images?.length
              ? `${record.images.length}张现场照片`
              : "查看记录"}
          </span>
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </div>
      </button>
    );
  };

  return (
    <div
      className={`relative flex h-full min-h-0 flex-col overflow-hidden text-[var(--tm-text-primary)] ${isV2 ? "tm-gold-header-screen class-report-v2-screen" : "bg-[var(--tm-page-plain-content-bg)]"}`}
      style={(isV2 ? { ...teacherBrandCssVariables, ...teacherMobileGoldHeaderVariables } : teacherBrandCssVariables) as React.CSSProperties}
    >
      {isV2 && <div className="class-report-v2-gradient tm-gold-header-surface" aria-hidden="true" />}
      <div className={isV2 ? "class-report-v2-hero z-40 shrink-0" : "z-40 shrink-0 bg-[var(--tm-page-plain-header-bg)]"}>
        <header
          className="relative flex h-11 items-center pl-4"
          style={{ paddingRight: "var(--mini-program-capsule-right-inset, 0px)" }}
        >
          <button
            type="button"
            onClick={onBack}
            aria-label="返回"
            className={`${touchClass} -ml-2 text-[var(--tm-text-secondary)]`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="pointer-events-none absolute inset-0 flex items-center justify-center text-[17px] font-semibold">
            班级评价报表
          </h1>
        </header>
        <div className={isV2 ? "class-report-v2-filters" : "px-[var(--tm-report-page-inline)] pb-3 pt-1"}>
          {isV2 && (
            <CompactSegmentedControl
              className="teacher-mobile-gold-period class-report-v2-glass class-report-v2-period"
              value={periodType}
              items={v2PeriodItems}
              onChange={setPeriodType}
              ariaLabel="统计周期"
              semantics="group"
              fullWidth
              density="compact"
              shape="pill"
              motion="sliding"
            />
          )}
          <div className={isV2 ? "class-report-v2-date class-report-v2-glass" : "grid h-11 grid-cols-[auto_44px_minmax(0,1fr)_44px] items-center"}>
            {!isV2 && (
              <button
                ref={periodTrigger}
                type="button"
                onClick={() => setPeriodMenuOpen((value) => !value)}
                aria-haspopup="dialog"
                aria-expanded={periodMenuOpen}
                aria-controls="class-report-period-menu"
                className={`${touchClass} gap-1 pr-1 text-[14px] font-semibold`}
              >
                按{periodNames[periodType]}
                <ChevronDown aria-hidden="true" className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => movePeriod(-1)}
              disabled={periodIndex <= 0}
              aria-label={`上一${periodNames[periodType]}`}
              className={`${touchClass} ${isV2 ? "class-report-v2-date-step" : ""} text-[var(--tm-text-secondary)] disabled:opacity-30`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriodMenuOpen(false);
                setCalendarOpen(true);
              }}
              aria-label={`${isV2 ? datePickerTitle : "选择日期"}，当前${periodLabel}`}
              aria-haspopup={isV2 ? "dialog" : undefined}
              className={`${touchClass} min-w-0 gap-1 font-semibold tabular-nums ${isV2 ? "class-report-v2-date-label" : "text-[12px]"}`}
            >
              {isV2 ? (
                <>
                  <span>{compactDateLabel}</span>
                  <ChevronDown aria-hidden="true" className="class-report-v2-date-caret h-3 w-3 shrink-0" />
                </>
              ) : (
                <>
                  <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--tm-brand-primary)]" />
                  <span className="truncate">{periodLabel}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => movePeriod(1)}
              disabled={periodIndex === periods.length - 1}
              aria-label={`下一${periodNames[periodType]}`}
              className={`${touchClass} ${isV2 ? "class-report-v2-date-step" : ""} text-[var(--tm-text-secondary)] disabled:opacity-30`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        {isV2 && (
          <PillSelectionControl
            className="class-report-v2-grades"
            value={gradeId}
            items={[{ value: "all", label: "全校" }, ...grades]}
            onChange={setGradeId}
            ariaLabel="统计年级"
            semantics="tabs"
          />
        )}
      </div>
      <div className="relative z-10 min-h-0 flex-1">
        {!isV2 && (
          <MobileFilterDropdown
            open={periodMenuOpen}
            id="class-report-period-menu"
            label="统计粒度"
            triggerRef={periodTrigger}
            onClose={() => setPeriodMenuOpen(false)}
          >
            <MobileDropdownOptionList
              options={periodOptions}
              value={periodType}
              onChange={changePeriodType}
            />
          </MobileFilterDropdown>
        )}
        <div
          ref={isV2 ? scrollRootRef : undefined}
          data-view-scroll-root={isV2 || undefined}
          onScroll={
            isV2
              ? () => {
                  const root = scrollRootRef.current;
                  const shell = detailsShellRef.current;
                  if (!root || !shell) return;
                  const pinned =
                    shell.getBoundingClientRect().top <=
                    root.getBoundingClientRect().top + 2;
                  setDetailsPinned((current) =>
                    current === pinned ? current : pinned,
                  );
                }
              : undefined
          }
          className={`h-full overflow-y-auto px-[var(--tm-report-page-inline)] no-scrollbar ${isV2 ? "pb-0 pt-3.5" : "pb-8 pt-3"}`}
        >
          {!isV2 && (
            <div className="mb-3">
              <PillSelectionControl
                value={gradeId}
                items={[{ value: "all", label: "全校" }, ...grades]}
                onChange={setGradeId}
                ariaLabel="统计年级"
                semantics="tabs"
              />
            </div>
          )}
          <div className={isV2 ? "space-y-4" : "space-y-[var(--tm-space-3)]"}>
            {isV2 ? (
              <ClassEvaluationOverviewCard overview={overview} />
            ) : (
              <section className={cardClass} aria-label="评价概况">
                <div className="grid grid-cols-2 gap-6">
                  {summaryLabels.map(({ value, label }) => (
                    <div key={value}>
                      <p className="text-[13px] text-[var(--tm-text-secondary)]">{label}</p>
                      <p className="mt-2">
                        <strong className="text-[length:var(--tm-report-summary-primary-value-size)] font-bold tabular-nums">
                          {counts[value]}
                        </strong>
                        <span className="ml-1 text-[12px]">条</span>
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {!isV2 && (
              <section className="min-w-0" aria-label="指标分布">
                <SectionHeader
                  title="指标分布"
                  action={
                    <CompactSegmentedControl<ClassReportDirection>
                      value={direction}
                      items={directionOptions}
                      onChange={setDirection}
                      shape="subtle"
                      density="compact"
                      sizing="content"
                      motion="sliding"
                      ariaLabel="评价方向"
                      semantics="tabs"
                    />
                  }
                />
                <ClassEvaluationIndicatorTable
                  key={`${currentSpace.id}-${periodType}-${period.id}-${gradeId}-${direction}`}
                  indicators={indicators}
                  dimensions={data.rules.map((rule) => rule.dimension)}
                  classes={data.classes}
                  direction={direction}
                  directionLabel={directionLabel}
                  onOpenRecords={openRecords}
                />
              </section>
            )}
            {!isV2 && (
              <section className={cardClass}>
                <SectionHeader
                  title="评价明细"
                  action={
                    <button
                      type="button"
                      onClick={() => openRecords()}
                      className={`${touchClass} gap-1 text-[14px] text-[var(--tm-brand-primary)]`}
                    >
                      查看全部
                      <ChevronRight aria-hidden="true" className="h-4 w-4" />
                    </button>
                  }
                />
                <p className="text-[12px] text-[var(--tm-text-secondary)]">
                  {scopeLabel} · {directionLabel} · {directionRecords.length}条
                </p>
                {directionRecords.length ? (
                  directionRecords.slice(0, 5).map(renderRecord)
                ) : (
                  <p className="py-6 text-center text-[14px] text-[var(--tm-text-secondary)]">
                    所选范围暂无{directionLabel}记录
                  </p>
                )}
              </section>
            )}
            {showRanking && (
              isV2 ? (
                <ClassEvaluationRankingCard
                  items={ranking.slice(0, 10)}
                  cycleLabel={periodNames[assessmentCycle]}
                  onOpenDetail={() => setRankingOpen(true)}
                />
              ) : (
                <section className={cardClass}>
                  <SectionHeader title={`${rankingTitle} TOP5`} />
                  <p className="mb-2 text-[12px] leading-5 text-[var(--tm-text-secondary)]">
                    本校按{periodNames[assessmentCycle]}
                    考核，各指标得分受基础分、上限和下限约束。达到边界后的评价仍计入分布和明细。
                  </p>
                  <ClassRankingList
                    items={ranking.slice(0, 5)}
                    ariaLabel={rankingTitle}
                    onViewAll={() => setRankingOpen(true)}
                  />
                </section>
              )
            )}
            {!isV2 && (
              <section className={cardClass}>
                <SectionHeader title={`${periodNames[periodType]}度趋势`} />
                <TeacherReportLineChart
                  ariaLabel={`${scopeLabel}${directionLabel}趋势`}
                  categories={trend.map((item) => item.label)}
                  series={visibleTrendSeries}
                  optionKey={`${periodType}-${period.id}-${gradeId}-${direction}-trend`}
                  valueLabelSuffix="分"
                  minValue={0}
                />
              </section>
            )}
            {isV2 && (
              <section
                ref={detailsShellRef}
                className="class-report-v2-details-shell min-w-0"
              >
                <div
                  className={`class-report-v2-details-sticky ${detailsPinned ? "is-pinned" : ""}`}
                >
                  <ClassEvaluationDirectionTabs
                    value={direction}
                    items={directionTabItems}
                    onChange={setDirection}
                    panelId={reportPanelId}
                  />
                </div>
                <div
                  id={reportPanelId}
                  role="tabpanel"
                  aria-label={`${directionLabel}明细`}
                  className="class-report-v2-direction-panel"
                >
                  <ClassEvaluationIndicatorDetails
                    key={`${currentSpace.id}-${periodType}-${period.id}-${gradeId}-${direction}`}
                    indicators={indicators}
                    dimensions={data.rules.map((rule) => rule.dimension)}
                    classes={data.classes}
                    direction={direction}
                    directionLabel={directionLabel}
                    onOpenRecords={openRecords}
                  />
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
      {periodType === "day" ? (
        <MobileDatePickerSheet
          shape="subtle"
          open={calendarOpen}
          mode="single"
          title={datePickerTitle}
          value={anchorDate}
          min={data.firstDate}
          max={today}
          onConfirm={selectDate}
          onClose={() => setCalendarOpen(false)}
        />
      ) : (
        <MobileDatePickerSheet
          shape="subtle"
          open={calendarOpen}
          mode={periodType}
          title={datePickerTitle}
          value={period.id}
          periods={periods.map((item) => ({ ...item, type: periodType }))}
          currentPeriodId={periods[periods.length - 1]?.id}
          onConfirm={selectDate}
          onClose={() => setCalendarOpen(false)}
        />
      )}
      <MobileBottomSheet
        open={rankingOpen}
        title={isV2 ? "班级排行榜" : rankingTitle}
        onClose={() => setRankingOpen(false)}
        size="tall"
      >
        {isV2 ? (
          <div className="pb-4 pt-1">
            <ClassEvaluationRankingRows items={ranking} ariaLabel="完整班级排名" />
          </div>
        ) : (
          <ClassRankingList items={ranking} ariaLabel="完整班级排名" />
        )}
      </MobileBottomSheet>
      {recordsOpen && !preview && (
        <MobileBottomSheet
          open={recordsOpen}
          title={selectedRecord ? "评价记录详情" : "评价明细"}
          onClose={() => {
            setRecordsOpen(false);
            setSelectedRecord(null);
          }}
          size="tall"
        >
          {selectedRecord ? (
            <div className="pb-4">
              <button
                type="button"
                className={`${touchClass} gap-1 text-[14px] ${isV2 ? "text-[var(--tm-gold-period-contrast-text)]" : "text-[var(--tm-brand-primary)]"}`}
                onClick={() => setSelectedRecord(null)}
              >
                <ChevronLeft className="h-4 w-4" />
                返回明细
              </button>
              <h3 className="mt-3 text-[17px] font-semibold">
                {classMap.get(selectedRecord.classId)?.name}
              </h3>
              <p className="mt-2 text-[12px] text-[var(--tm-text-secondary)]">
                {classMap.get(selectedRecord.classId)?.gradeName} ·{" "}
                {selectedRecord.date}
              </p>
              <p className="mt-3 text-[13px] text-[var(--tm-text-secondary)]">
                {selectedRecord.indicatorPath.join(" / ")}
              </p>
              <strong
                className={`mt-3 block text-[20px] tabular-nums ${getClassEvaluationScoreChange(selectedRecord) > 0 ? "text-[var(--tm-chart-positive-text)]" : "text-[var(--tm-chart-negative-text)]"}`}
              >
                {getClassEvaluationScoreChange(selectedRecord) > 0 ? "+" : ""}
                {getClassEvaluationScoreChange(selectedRecord)}分
              </strong>
              <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7">
                {selectedRecord.finding}
              </p>
              <p className="mt-4 text-[13px] leading-6 text-[var(--tm-text-secondary)]">
                {selectedRecord.rule}
              </p>
              {!!selectedRecord.images?.length && (
                <ImageGallery
                  images={selectedRecord.images}
                  label="现场照片"
                  className="mt-4"
                  onSelect={(index) =>
                    setPreview({ images: selectedRecord.images!, index })
                  }
                />
              )}
            </div>
          ) : (
            <>
              <p className="py-3 text-[12px] leading-5 text-[var(--tm-text-secondary)]">
                {period.label} · {scopeLabel} · {directionLabel}
                {recordPath
                  ? ` · ${JSON.parse(recordPath).join(" / ")}`
                  : ""} · {detailRecords.length}条
              </p>
              {detailRecords.length ? (
                detailRecords.map(renderRecord)
              ) : (
                <p className="py-8 text-center text-[14px] text-[var(--tm-text-secondary)]">
                  暂无评价记录
                </p>
              )}
            </>
          )}
        </MobileBottomSheet>
      )}
      {preview && (
        <ImagePreview
          portalRootId="teacher-mobile-overlay-root"
          images={preview.images}
          initialIndex={preview.index}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
};

export default MoralEducationCockpitView;
