import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { MobileCard } from '../components/ui/MobileCard';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import TextSelectionControl from '../components/ui/TextSelectionControl';
import { personnelGroups, type DevelopmentReport, type PersonnelGrouping, type ReportDrill } from './reporting';
import { EmptyState, fieldClass, metaClass, RowButton, Section } from './ui';

export type SchoolReportKind = 'records' | 'people' | 'profiles';
export interface ReportViewState { page: 'overview' | 'statistics'; kind: SchoolReportKind; grouping: PersonnelGrouping; }
export const initialReportView: ReportViewState = { page: 'overview', kind: 'records', grouping: 'subject' };
interface Props {
  report: DevelopmentReport;
  schoolScope: boolean;
  state: ReportViewState;
  onState: (state: ReportViewState) => void;
  onDrill: (drill: ReportDrill) => void;
  onTeacher: (teacherId: string) => void;
}
const tableClass = 'w-full table-fixed text-left text-[length:var(--tm-font-size-compact)]';
const cellClass = 'py-3 align-middle';

export default function ReportStatistics({ report, schoolScope, state, onState, onDrill, onTeacher }: Props) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const groups = personnelGroups(report.teacherRows, state.grouping);
  const group = groups.find(item => item.name === selectedGroup);
  if (!schoolScope) return <Section title="指标得分"><p className={metaClass}>按学校基础分与上下限计算，点击记录条数查看依据。</p>
    {report.dimensionRows.map(dimension => <MobileCard key={dimension.name}>
      <h3 className="mb-3 text-[length:var(--tm-font-size-card-title)] font-semibold">{dimension.name}</h3>
      <table className={tableClass}><thead className={metaClass}><tr><th className="w-[58%] pb-2 font-normal">指标</th><th className="pb-2 text-center font-normal">记录</th><th className="pb-2 text-right font-normal">当前分</th></tr></thead><tbody>
        {report.indicatorRows.filter(row => row.indicator.dimension === dimension.name).map(({ indicator, count, score }) => <tr key={indicator.id} className="border-t border-[var(--tm-border-subtle)]">
          <th scope="row" className={`${cellClass} pr-2 font-medium`}>{indicator.name}<span className={`mt-1 block font-normal ${metaClass}`}>基础{indicator.base} · 范围{indicator.lower}–{indicator.upper}</span></th>
          <td className="text-center"><button type="button" aria-label={`${indicator.name}：${count}条已通过记录`} onClick={() => onDrill({ title: indicator.name, indicatorId: indicator.id })} className="min-h-[var(--tm-size-touch)] min-w-[var(--tm-size-touch)] text-[var(--tm-brand-primary)] tabular-nums">{count}条</button></td>
          <td className="text-right font-semibold tabular-nums">{score}</td>
        </tr>)}
      </tbody></table>
    </MobileCard>)}
  </Section>;

  return <div className="space-y-4">
    <label className="block"><span className="sr-only">选择统计报表</span><select className={fieldClass} value={state.kind} onChange={e => { onState({ ...state, kind: e.target.value as SchoolReportKind }); setSelectedGroup(null); }}><option value="records">记录统计</option><option value="people">人员结构</option><option value="profiles">资料登记</option></select></label>
    {!report.teacherRows.length ? <MobileCard><EmptyState title="没有找到教师" description="请调整姓名、学科或年级筛选。" /></MobileCard> : <>
      {state.kind === 'records' && <MobileCard>
        <p className={`mb-3 ${metaClass}`}>共{report.teacherRows.length}位教师 · {report.recordedTeachers}位有记录 · {report.teacherRows.length - report.recordedTeachers}位暂无记录</p>
        <table className={tableClass}><thead className={metaClass}><tr><th className="w-[43%] pb-2 font-normal">教师 / 本期积分</th><th className="pb-2 text-center font-normal">已通过</th><th className="pb-2 text-center font-normal">待审核</th><th className="pb-2 text-center font-normal">未通过</th></tr></thead><tbody>
          {report.teacherRows.map(row => <tr key={row.teacher.id} className="border-t border-[var(--tm-border-subtle)]">
            <th scope="row" className="py-2 pr-1 font-normal"><button type="button" className="min-h-[var(--tm-size-touch)] w-full text-left" onClick={() => onTeacher(row.teacher.id)} aria-label={`查看${row.teacher.name}的档案`}><span className="font-semibold">{row.teacher.name}<span className={`ml-2 font-normal ${metaClass}`}>{row.score}分</span></span><span className={`block ${metaClass}`}>{row.teacher.grade} · {row.teacher.subject}</span></button></th>
            {(['approved', 'pending', 'returned'] as const).map(status => <td key={status} className="text-center"><button type="button" className="min-h-[var(--tm-size-touch)] min-w-[var(--tm-size-touch)] text-[var(--tm-brand-primary)] tabular-nums" aria-label={`${row.teacher.name}：${{ approved: '已通过', pending: '待审核', returned: '未通过' }[status]}${row[status]}条`} onClick={() => onDrill({ title: `${row.teacher.name} · ${{ approved: '已通过', pending: '待审核', returned: '未通过' }[status]}`, teacherId: row.teacher.id, status })}>{row[status]}</button></td>)}
          </tr>)}
        </tbody></table>
      </MobileCard>}
      {state.kind === 'people' && <>
        <TextSelectionControl value={state.grouping} onChange={grouping => { onState({ ...state, grouping }); setSelectedGroup(null); }} items={[{ value: 'subject', label: '学科' }, { value: 'grade', label: '年级' }, { value: 'title', label: '职称' }, { value: 'education', label: '学历' }]} ariaLabel="人员结构分组" fullWidth semantics="group" />
        <MobileCard><p className={`mb-3 ${metaClass}`}>当前档案资料 · {report.teacherRows.length}人</p>
          {groups.map(item => <button key={item.name} type="button" className="block min-h-[var(--tm-size-touch)] w-full py-3 text-left" onClick={() => setSelectedGroup(item.name)}><span className="flex items-center justify-between gap-3 text-[length:var(--tm-font-size-body)]"><span>{item.name}</span><span className="flex items-center gap-1 tabular-nums">{item.count}人<span className={metaClass}> · {Math.round(item.count / report.teacherRows.length * 100)}%</span><ChevronRight size={16} aria-hidden="true" /></span></span><span aria-hidden="true" className="mt-2 block h-2 overflow-hidden rounded-full bg-[var(--tm-bg-surface-soft)]"><span className="block h-full rounded-full bg-[var(--tm-chart-data-default)]" style={{ width: `${item.count / report.teacherRows.length * 100}%` }} /></span></button>)}
        </MobileCard>
      </>}
      {state.kind === 'profiles' && <MobileCard>
        <p className={`mb-3 ${metaClass}`}>基础、任职、资格、经历，共4类。登记情况以当前档案为准。</p>
        <table className={tableClass}><thead className={metaClass}><tr><th className="w-[32%] pb-2 font-normal">教师</th><th className="w-[23%] pb-2 text-center font-normal">已登记</th><th className="pb-2 pl-3 font-normal">未登记</th></tr></thead><tbody>
          {report.teacherRows.map(row => <tr key={row.teacher.id} className="border-t border-[var(--tm-border-subtle)]"><th scope="row" className="py-2 font-normal"><button type="button" className="min-h-[var(--tm-size-touch)] w-full text-left font-semibold" onClick={() => onTeacher(row.teacher.id)}>{row.teacher.name}</button></th><td className="text-center tabular-nums">{row.profile.filter(part => part.present).length}/4</td><td className={`py-3 pl-3 ${metaClass}`}>{row.profile.filter(part => !part.present).map(part => part.name).join('、') || '—'}</td></tr>)}
        </tbody></table>
      </MobileCard>}
    </>}
    <MobileBottomSheet open={!!group} title={group ? `${group.name} · ${group.count}人` : '教师明细'} onClose={() => setSelectedGroup(null)} size="tall">
      {group?.members.map(row => <RowButton key={row.teacher.id} description={`${row.teacher.grade} · ${row.teacher.subject} · ${row.teacher.title} · 已通过${row.approved}条`} onClick={() => { setSelectedGroup(null); onTeacher(row.teacher.id); }}>{row.teacher.name}</RowButton>)}
    </MobileBottomSheet>
  </div>;
}
