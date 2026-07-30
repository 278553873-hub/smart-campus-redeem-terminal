import React from 'react';
import { Check, MessageCircle, Sparkles, Target, UserRoundCheck } from 'lucide-react';
import type { SemesterGoalPlan } from '../../../shared/studentGrowthStore';
import { PageHeader, sectionSurface } from '../archive-design/archivePagePrimitives';

interface SemesterGoalPlanViewProps {
  plan?: SemesterGoalPlan;
  onBack: () => void;
}

const goalStatusLabel: Record<SemesterGoalPlan['status'], string> = {
  draft: '草稿',
  'pending-confirmation': '待确认',
  active: '已生效',
  adjusted: '已调整',
  reviewed: '已完成回顾',
};

const SemesterGoalPlanView: React.FC<SemesterGoalPlanViewProps> = ({ plan, onBack }) => (
  <div className="relative flex h-full min-h-0 flex-col bg-transparent">
    <PageHeader title="本学期目标" onBack={onBack} />
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-24 pt-3 no-scrollbar">
      {!plan ? (
        <section className={`${sectionSurface} px-5 py-10 text-center`}>
          <Target className="mx-auto h-8 w-8 text-[var(--tm-text-tertiary)]" />
          <h2 className="mt-3 text-[16px] font-bold text-[var(--tm-text-primary)]">暂无学期目标</h2>
        </section>
      ) : (
        <>
          <section className={`${sectionSurface} overflow-hidden`}>
            <div className="flex items-start justify-between px-4 pb-3 pt-4">
              <div>
                <h2 className="text-[17px] font-bold text-[var(--tm-text-primary)]">新学期目标计划</h2>
                <p className="mt-1 text-xs font-medium text-[var(--tm-text-secondary)]">{plan.term}</p>
              </div>
              <span className="rounded-full bg-[var(--tm-status-positive-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--tm-status-positive-strong)]">{goalStatusLabel[plan.status]}</span>
            </div>
            <div className="border-t border-[var(--tm-border-subtle)] px-4 py-3">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--tm-text-secondary)]"><Sparkles className="h-4 w-4 text-[var(--tm-brand-reward)]" />上学期回顾</div>
              <p className="mt-2 text-sm font-medium leading-6 text-[var(--tm-text-primary)]">{plan.previousReflection}</p>
            </div>
          </section>

          <div className="pt-2 text-[15px] font-bold text-[var(--tm-text-primary)]">我的目标</div>
          {plan.goals.map((goal, index) => (
            <article key={goal.id} className={`${sectionSurface} p-4`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--tm-brand-primary-soft)] text-xs font-bold text-[var(--tm-brand-primary-strong)]">{index + 1}</span><h3 className="truncate text-[15px] font-bold text-[var(--tm-text-primary)]">{goal.type}</h3></div>
                <span className="shrink-0 rounded-full bg-[var(--tm-bg-surface-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--tm-text-secondary)]">{goal.dimension}</span>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-6">
                <div><span className="font-semibold text-[var(--tm-text-secondary)]">因为</span><p className="mt-0.5 font-medium text-[var(--tm-text-primary)]">{goal.reason}</p></div>
                <div><span className="font-semibold text-[var(--tm-text-secondary)]">我想做到</span><p className="mt-0.5 font-medium text-[var(--tm-text-primary)]">{goal.action}</p></div>
              </div>
              <div className="mt-4 border-t border-[var(--tm-border-subtle)] pt-3 text-xs font-semibold text-[var(--tm-brand-primary-strong)]">自评：{goal.selfAssessment}</div>
            </article>
          ))}

          <section className={`${sectionSurface} divide-y divide-[var(--tm-border-subtle)] px-4`}>
            {[
              ['我想对老师说', plan.studentMessage],
              ['老师想对你说', plan.teacherMessage],
              ['爸爸妈妈想对你说', plan.parentMessage],
            ].map(([label, value]) => (
              <div key={label} className="py-4">
                <h3 className="flex items-center gap-2 text-[13px] font-semibold text-[var(--tm-text-secondary)]"><MessageCircle className="h-4 w-4" />{label}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-[var(--tm-text-primary)]">{value || '暂未填写'}</p>
              </div>
            ))}
          </section>

          <section className={`${sectionSurface} p-4`}>
            <h3 className="text-[15px] font-bold text-[var(--tm-text-primary)]">我们的约定</h3>
            <p className="mt-2 text-sm font-medium leading-6 text-[var(--tm-text-secondary)]">{plan.agreement}</p>
          </section>

          <section className={`${sectionSurface} overflow-hidden`}>
            <div className="flex items-center gap-2 px-4 pb-3 pt-4"><UserRoundCheck className="h-4.5 w-4.5 text-[var(--tm-status-positive)]" /><h3 className="text-[15px] font-bold text-[var(--tm-text-primary)]">共同确认</h3></div>
            <div className="divide-y divide-[var(--tm-border-subtle)] border-t border-[var(--tm-border-subtle)] px-4">
              {(['学生', '教师', '家长'] as const).map(role => {
                const confirmation = plan.confirmations.find(item => item.role === role);
                return (
                  <div key={role} className="flex min-h-[64px] items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${confirmation ? 'bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]' : 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-tertiary)]'}`}><Check className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-[var(--tm-text-primary)]">{role}</span><span className="mt-0.5 block truncate text-xs text-[var(--tm-text-secondary)]">{confirmation ? `${confirmation.name} · ${confirmation.method}` : '待确认'}</span></span>
                    {confirmation && <span className="shrink-0 text-[11px] tabular-nums text-[var(--tm-text-tertiary)]">{confirmation.confirmedAt.split(' ')[0]}</span>}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  </div>
);

export default SemesterGoalPlanView;
