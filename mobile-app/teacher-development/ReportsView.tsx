import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { MobileCard } from '../components/ui/MobileCard';
import TextSelectionControl from '../components/ui/TextSelectionControl';
import { TeacherReportBarChart } from '../components/report/TeacherReportChart';
import type { DevelopmentIndicator, DevelopmentRecord, TeacherDossier } from './data';
import { buildDevelopmentReport, type ReportDrill } from './reporting';
import ReportStatistics, { type ReportViewState } from './ReportStatistics';
import { EmptyState, metaClass, Metric, RowButton, Section } from './ui';

export type { ReportDrill } from './reporting';
interface Props {
  teachers: TeacherDossier[]; records: DevelopmentRecord[]; indicators: DevelopmentIndicator[];
  periodId: string; schoolScope: boolean; state: ReportViewState;
  onState: (state: ReportViewState) => void;
  onDrill: (drill: ReportDrill) => void; onTeacher: (teacherId: string) => void;
}
export default function ReportsView({ teachers, records, indicators, periodId, schoolScope, state, onState, onDrill, onTeacher }: Props) {
  const [breakdown, setBreakdown] = useState<'category' | 'level'>('category');
  const report = buildDevelopmentReport(teachers, records, indicators, periodId);
  const { approved, pending, returned, dimensionRows, months } = report;
  const score = report.teacherRows[0]?.score ?? 0;
  const autoPassed = approved.filter(record => !record.requiresReview).length;
  const distribution = breakdown === 'category' ? report.categoryRows : report.levelRows;
  const drillMonth = (name: string) => {
    const month = months.find(item => item.label === name);
    if (month) onDrill({ title: `${month.key.replace('-', '年')}月 · 已通过记录`, month: month.key });
  };
  const monthSummary = months.map(month => `${month.label}${month.count}条`).join('，');
  return <div className="space-y-[var(--tm-report-card-gap)]">
    <TextSelectionControl<'overview' | 'statistics'> variant="underline" size="section" value={state.page} items={[{ value: 'overview', label: '成长看板' }, { value: 'statistics', label: '统计报表' }]} onChange={page => onState({ ...state, page })} ariaLabel="报表视图" />
    {state.page === 'statistics' ? <ReportStatistics report={report} schoolScope={schoolScope} state={state} onState={onState} onDrill={onDrill} onTeacher={onTeacher} /> : <>
      <MobileCard>
        <div className="grid grid-cols-2 gap-[var(--tm-report-card-content-gap)]">
          <Metric label={schoolScope ? '教师人数' : '本期积分'} value={schoolScope ? teachers.length : score} unit={schoolScope ? '人' : '分'} />
          <button type="button" className="min-h-[var(--tm-size-touch)] text-left" onClick={() => onDrill({ title: '已通过记录' })}><Metric label="已通过记录" value={approved.length} unit="条" /></button>
          <Metric label={schoolScope ? '有已通过记录' : '较基础分'} value={schoolScope ? report.activeTeachers : `${score - report.base > 0 ? '+' : ''}${score - report.base}`} unit={schoolScope ? '人' : '分'} />
          <button type="button" className="min-h-[var(--tm-size-touch)] text-left" onClick={() => onDrill({ title: schoolScope ? '学校待审核' : '待审核记录', status: 'pending' })}><Metric label={schoolScope ? '学校待审核' : '待审核记录'} value={pending.length} unit="条" /></button>
        </div>
        <div className={`mt-4 flex flex-wrap items-center justify-between gap-x-3 ${metaClass}`}><span>免审通过{autoPassed}条 · 审核通过{approved.length - autoPassed}条</span><button type="button" className="flex min-h-[var(--tm-size-touch)] items-center gap-1" onClick={() => onDrill({ title: '未通过记录', status: 'returned' })}>未通过{returned.length}条<ChevronRight size={14} aria-hidden="true" /></button></div>
      </MobileCard>
      <Section title="记录趋势" action={<span className={metaClass}>已通过 · 按月</span>}><MobileCard>
        {months.length && approved.length ? <>
          <TeacherReportBarChart ariaLabel={`本期已通过记录趋势：${monthSummary}`} categories={months.map(month => month.label)} series={[{ name: '已通过记录', values: months.map(month => month.count), color: 'data' }]} optionKey={`${periodId}-${monthSummary}`} className="h-44" showValueAxis={false} showLegend={false} chartTop={28} valueLabelSuffix="条" onCategorySelect={drillMonth} />
          <details className={`mt-2 ${metaClass}`}><summary className="min-h-[var(--tm-size-touch)] cursor-pointer py-3">月度明细</summary><div>{months.map(month => <RowButton key={month.key} description={`${month.count}条`} onClick={() => drillMonth(month.label)}>{month.key.replace('-', '年')}月</RowButton>)}</div></details>
        </> : <EmptyState description="本期还没有已通过的记录。" />}
      </MobileCard></Section>
      <Section title="指标分布" action={!schoolScope ? <button type="button" className="flex min-h-[var(--tm-size-touch)] items-center gap-1 text-[length:var(--tm-font-size-compact)] text-[var(--tm-brand-primary)]" onClick={() => onState({ ...state, page: 'statistics' })}>指标得分<ChevronRight size={16} aria-hidden="true" /></button> : undefined}>
        <MobileCard><div className="space-y-2">{dimensionRows.map(dimension => <button type="button" key={dimension.name} onClick={() => onDrill({ title: dimension.name, dimension: dimension.name })} className="block min-h-[var(--tm-size-touch)] w-full py-2 text-left"><span className="mb-2 flex items-center justify-between text-[length:var(--tm-font-size-body)]"><span>{dimension.name}</span><span className="flex items-center gap-1 text-[var(--tm-text-secondary)] tabular-nums">{dimension.count}条<ChevronRight size={16} aria-hidden="true" /></span></span><span aria-hidden="true" className="block h-2 overflow-hidden rounded-full bg-[var(--tm-bg-surface-soft)]"><span className="block h-full rounded-full bg-[var(--tm-chart-data-default)]" style={{ width: `${approved.length ? dimension.count / approved.length * 100 : 0}%` }} /></span></button>)}</div></MobileCard>
      </Section>
      <Section title="成果分布"><TextSelectionControl<'category' | 'level'> value={breakdown} items={[{ value: 'category', label: '按类别' }, { value: 'level', label: '按等级' }]} onChange={setBreakdown} ariaLabel="成果统计方式" fullWidth /><MobileCard>
        {approved.length ? distribution.map(item => <RowButton key={item.name} description={`${item.count}条`} onClick={() => onDrill({ title: item.name === '不区分等级' ? '个人记录' : item.name, ...(breakdown === 'category' ? { category: item.name } : { level: item.name }) })}>{item.name === '不区分等级' ? '个人记录' : item.name}</RowButton>) : <EmptyState description="本期还没有已通过的成果记录。" />}
      </MobileCard></Section>
    </>}
  </div>;
}
