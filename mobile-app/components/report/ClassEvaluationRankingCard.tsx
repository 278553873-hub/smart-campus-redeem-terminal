import React from "react";
import { ChevronRight, Info } from "lucide-react";
import MobileRankingBadge from "../ui/MobileRankingBadge";

export interface ClassEvaluationRankingItem {
  id: string;
  name: string;
  rank: number;
  score: number;
}

interface ClassEvaluationRankingRowsProps {
  items: ReadonlyArray<ClassEvaluationRankingItem>;
  ariaLabel: string;
}

const formatRankNumber = (rank: number) =>
  rank < 10 ? `0${rank}` : String(rank);

const getRowTierClass = (rank: number) => {
  if (rank === 1) return "class-report-v2-rank-row--gold";
  if (rank === 2) return "class-report-v2-rank-row--silver";
  if (rank === 3) return "class-report-v2-rank-row--bronze";
  return "class-report-v2-rank-row--regular";
};

export const ClassEvaluationRankingRows: React.FC<
  ClassEvaluationRankingRowsProps
> = ({ items, ariaLabel }) => (
  <div role="list" aria-label={ariaLabel} className="class-report-v2-rank-list">
    {items.map((item) => {
      const isTopThree = item.rank <= 3;
      return (
        <div
          key={item.id}
          role="listitem"
          className={`class-report-v2-rank-row ${getRowTierClass(item.rank)}`}
        >
          <span className="class-report-v2-rank-slot">
            {isTopThree ? (
              <MobileRankingBadge rank={item.rank} size="standard" />
            ) : (
              <span
                aria-label={`第${item.rank}名`}
                className="text-[length:var(--tm-font-size-compact)] font-bold tabular-nums text-[var(--tm-text-secondary)]"
              >
                {formatRankNumber(item.rank)}
              </span>
            )}
          </span>
          <span
            className={`min-w-0 truncate text-[length:var(--tm-font-size-body)] ${isTopThree ? "font-semibold text-[var(--tm-text-primary)]" : "font-medium text-[var(--tm-text-primary)]"}`}
          >
            {item.name}
          </span>
          <span className="shrink-0 text-right tabular-nums">
            <strong
              className={`text-[15px] font-bold ${item.rank === 1 ? "class-report-v2-rank-score--first" : "text-[var(--tm-text-primary)]"}`}
            >
              {item.score}
            </strong>
            <span className="ml-0.5 text-[11px] font-medium text-[var(--tm-text-secondary)]">
              分
            </span>
          </span>
        </div>
      );
    })}
  </div>
);

interface ClassEvaluationRankingCardProps {
  items: ReadonlyArray<ClassEvaluationRankingItem>;
  cycleLabel: string;
  onOpenDetail: () => void;
}

const ClassEvaluationRankingCard: React.FC<ClassEvaluationRankingCardProps> = ({
  items,
  cycleLabel,
  onOpenDetail,
}) => (
  <section className="class-report-v2-ribbon-card class-report-v2-ranking-card">
    <div className="class-report-v2-ribbon-header">
      <h2 className="class-report-v2-ribbon-title">班级排行榜</h2>
      <button
        type="button"
        onClick={onOpenDetail}
        aria-label="查看班级排行榜完整榜单"
        className="class-report-v2-ranking-detail-btn inline-flex min-h-[var(--tm-size-touch)] shrink-0 items-center gap-0.5 text-[length:var(--tm-font-size-compact)] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-gold-period-focus-ring)]"
      >
        <span>详情</span>
        <ChevronRight aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
      </button>
    </div>
    <div className="class-report-v2-ribbon-body">
      <ClassEvaluationRankingRows items={items} ariaLabel="班级排行榜" />
      <div className="mt-2.5 border-t border-[var(--tm-border-subtle)] pt-2.5">
        <p className="class-report-v2-ranking-note flex items-start gap-1 text-[length:var(--tm-font-size-badge)] leading-4">
          <Info
            aria-hidden="true"
            className="mt-[2px] h-3 w-3 shrink-0"
            strokeWidth={2}
          />
          <span>
            当前学校设置按{cycleLabel}考核，各指标达到分数上下限后不再增减，超出后的评价仍会记入下方明细。
          </span>
        </p>
      </div>
    </div>
  </section>
);

export default ClassEvaluationRankingCard;
