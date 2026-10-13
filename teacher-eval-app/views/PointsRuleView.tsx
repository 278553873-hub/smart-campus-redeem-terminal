import React from 'react';
import { GROWTH_RECORD_LEVELS, GROWTH_RECORD_RANKS } from '../domain/growthRecord.ts';
import { GROWTH_SCORE_TABLE, GROWTH_SCORE_YEARLY_CAP, GROWTH_SCORING_GLOBAL_RULES } from '../domain/scoringTable.ts';
import { formatPoints } from '../domain/scoring.ts';
import MobilePageHeader from '../../mobile-app/components/ui/MobilePageHeader.tsx';

interface PointsRuleViewProps {
  onBack: () => void;
}

const PointsRuleView: React.FC<PointsRuleViewProps> = ({ onBack }) => (
  <div className="flex flex-1 flex-col overflow-hidden bg-[var(--tm-bg-page)]">
    <MobilePageHeader title="积分规则" onBack={onBack} />
    <div className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-5)] pb-[var(--tm-space-5)]">
      <section
        aria-label="计分说明"
        className="mt-[var(--tm-space-2)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-4)]"
        style={{ boxShadow: 'var(--tm-shadow-card)' }}
      >
        <h2 className="text-[15px] font-bold text-[var(--tm-text-primary)]">计分说明</h2>
        <p className="mt-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] px-[var(--tm-space-3)] py-[var(--tm-space-2)] text-[13px] font-semibold text-[var(--tm-brand-primary)]">
          每学年成长积分合计封顶 {formatPoints(GROWTH_SCORE_YEARLY_CAP)} 分
        </p>
        <ol className="mt-2 flex flex-col gap-1.5">
          {GROWTH_SCORING_GLOBAL_RULES.map((rule, index) => (
            <li key={rule} className="flex items-start gap-2 text-[13px] font-medium leading-relaxed text-[var(--tm-text-secondary)]">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--tm-bg-surface-muted)] text-[12px] font-semibold text-[var(--tm-text-secondary)]">
                {index + 1}
              </span>
              {rule}
            </li>
          ))}
        </ol>
      </section>

      {Object.values(GROWTH_SCORE_TABLE).map(rule => (
        <section
          key={rule.category}
          aria-label={rule.category}
          className="mt-[var(--tm-space-3)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-4)]"
          style={{ boxShadow: 'var(--tm-shadow-card)' }}
        >
          <h3 className="text-[15px] font-bold text-[var(--tm-text-primary)]">{rule.category}</h3>
          <p className="mt-1 text-[12px] font-medium text-[var(--tm-text-tertiary)]">{rule.dimension}</p>
          <table className="mt-[var(--tm-space-3)] w-full border-separate border-spacing-0">
            <caption className="sr-only">{rule.category}赋分标准</caption>
            <thead>
              <tr>
                <th scope="col" className="pb-1.5 text-left text-[12px] font-semibold text-[var(--tm-text-tertiary)]">
                  级别
                </th>
                {GROWTH_RECORD_RANKS.map(rank => (
                  <th key={rank} scope="col" className="pb-1.5 text-center text-[12px] font-semibold text-[var(--tm-text-tertiary)]">
                    {rank}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GROWTH_RECORD_LEVELS.map(level => (
                <tr key={level}>
                  <th scope="row" className="border-t border-[var(--tm-border-subtle)] py-2 text-left text-[13px] font-medium text-[var(--tm-text-secondary)]">
                    {level}
                  </th>
                  {GROWTH_RECORD_RANKS.map((rank, index) => (
                    <td
                      key={rank}
                      className="border-t border-[var(--tm-border-subtle)] py-2 text-center text-[13px] font-semibold tabular-nums text-[var(--tm-text-primary)]"
                    >
                      {rule.tierScores[level][index]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[12px] font-medium leading-relaxed text-[var(--tm-text-tertiary)]">{rule.rule}</p>
        </section>
      ))}
    </div>
  </div>
);

export default PointsRuleView;
