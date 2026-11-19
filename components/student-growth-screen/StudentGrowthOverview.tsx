import React, { useMemo, type CSSProperties } from 'react';
import { selectGrowthScope, type GrowthSnapshot } from './studentGrowthModel';
import { selectGrowthRanking } from './studentGrowthRankingModel';
import { selectGrowthClassRanking, selectGrowthDimensionStars, selectGrowthGradePraise, selectGrowthPublicPraise } from './studentGrowthOverviewModel';
import { GrowthPanel } from './StudentGrowthCharts';
import { GrowthRankingList, GrowthRankingTable, growthStudentClassName } from './StudentGrowthRanking';
import { GrowthMetricTabs } from './StudentGrowthControls';
import { StudentGrowthActivityFeed } from './StudentGrowthActivityFeed';

export interface GrowthBoardSelection {
  gradeId?: string; studentMetric: string; classMetric: string; praiseMetric: string;
  gradeMetric: string; averageClassMetric: string;
}
export const defaultGrowthBoardSelection = (): GrowthBoardSelection => ({ studentMetric: 'total', classMetric: 'total', praiseMetric: 'total', gradeMetric: 'total', averageClassMetric: 'total' });
const average = (value: number) => value.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const Empty = ({ children = '暂无表扬记录' }: { children?: React.ReactNode }) => <div className="student-growth-empty">{children}</div>;

export const StudentGrowthBoards = React.memo(function StudentGrowthBoards({ snapshot, selection = defaultGrowthBoardSelection(), onChange = () => {} }: {
  snapshot: GrowthSnapshot; selection?: GrowthBoardSelection; onChange?: (patch: Partial<GrowthBoardSelection>) => void;
}) {
  const scope = useMemo(() => selectGrowthScope(snapshot, selection.gradeId), [snapshot, selection.gradeId]);
  const studentRows = useMemo(() => selectGrowthRanking(scope, selection.studentMetric), [scope, selection.studentMetric]);
  const stars = useMemo(() => studentRows.slice(0, 3), [studentRows]);
  const dimensions = useMemo(() => selectGrowthDimensionStars(scope), [scope]);
  const classRows = useMemo(() => selectGrowthClassRanking(scope, undefined, selection.classMetric), [scope, selection.classMetric]);
  const praiseRows = useMemo(() => selectGrowthClassRanking(scope, undefined, selection.praiseMetric, 'praise'), [scope, selection.praiseMetric]);
  const grades = useMemo(() => selectGrowthGradePraise(scope, selection.gradeMetric), [scope, selection.gradeMetric]);
  const averageClassRows = useMemo(() => selectGrowthClassRanking(scope, undefined, selection.averageClassMetric), [scope, selection.averageClassMetric]);
  const activities = useMemo(() => selectGrowthPublicPraise(scope).sort((a, b) => b.record.timestamp - a.record.timestamp || a.record.id.localeCompare(b.record.id)).slice(0, 6), [scope]);
  const scopeName = snapshot.grades.find(grade => grade.id === selection.gradeId)?.name || '全部年级';
  const metricName = selection.studentMetric === 'total' ? '综合' : selection.studentMetric;
  return <main className="student-growth-card-grid" aria-label="学生全景">
    <div className="student-growth-filtered-boards" role="region" aria-label="榜单与年级表现">
      <GrowthPanel title="学生得分榜" badge="TOP 10" className="student-growth-student-board">
        <GrowthMetricTabs snapshot={snapshot} value={selection.studentMetric} label="学生得分榜指标" onChange={studentMetric => onChange({ studentMetric })} />
        <GrowthRankingList title="学生得分榜" rows={studentRows} limit={10} />
      </GrowthPanel>

      <GrowthPanel title="班级积分榜" badge="TOP 10" className="student-growth-class-board">
        <GrowthMetricTabs snapshot={snapshot} value={selection.classMetric} label="班级积分榜指标" onChange={classMetric => onChange({ classMetric })} />
        <GrowthRankingTable title="班级积分榜" rows={classRows} rowKey={row => row.id} className="student-growth-class-table" emptyText="暂无上榜班级" columns={[
          { key: 'class', label: '班级', render: row => <strong title={row.name}>{row.name}</strong> },
          { key: 'value', label: '人均积分', render: row => <b>{average(row.average)}</b> },
        ]} />
      </GrowthPanel>

      <GrowthPanel title="班级表扬榜" badge="TOP 10" className="student-growth-praise-board">
        <GrowthMetricTabs snapshot={snapshot} value={selection.praiseMetric} label="班级表扬榜指标" onChange={praiseMetric => onChange({ praiseMetric })} />
        <GrowthRankingTable title="班级表扬榜" rows={praiseRows} rowKey={row => row.id} className="student-growth-praise-table" emptyText="暂无上榜班级" columns={[
          { key: 'class', label: '班级', render: row => <strong title={row.name}>{row.name}</strong> },
          { key: 'value', label: '获表扬／全班', render: row => <span className="student-growth-praise-count"><b>{row.praised}</b><span>／{row.total}人</span></span> },
        ]} />
      </GrowthPanel>

      <GrowthPanel title="单项之星" className="student-growth-dimension-board">
        <div className={`student-growth-dimension-stars ${dimensions.length > 6 ? 'is-dense' : ''}`} style={{ '--growth-star-rows': Math.ceil(dimensions.length / 2) } as CSSProperties}>
          {dimensions.map(({ dimension, leader }) => <div key={dimension.name} className="student-growth-dimension-star" style={{ '--growth-dimension-accent': dimension.colors[1] } as CSSProperties}><span className="student-growth-dimension-label" title={dimension.name}>{dimension.name}</span>{leader ? <div><strong title={leader.student.displayName}>{leader.student.displayName}</strong><span title={growthStudentClassName(leader.student)}>{growthStudentClassName(leader.student)}</span></div> : <span className="student-growth-muted">暂无上榜学生</span>}</div>)}
        </div>
        {!dimensions.length && <Empty>暂无评价指标</Empty>}
      </GrowthPanel>

      <GrowthPanel title="年级风采" className="student-growth-grade-board" extra={<span className="student-growth-scope">获表扬学生</span>}>
        <GrowthMetricTabs snapshot={snapshot} value={selection.gradeMetric} label="年级风采指标" onChange={gradeMetric => onChange({ gradeMetric })} />
        <div className={`student-growth-grade-grid ${grades.length > 6 ? 'is-dense' : ''}`} style={{ '--growth-grade-columns': grades.length === 1 ? 1 : 2, '--growth-grade-rows': Math.max(1, Math.ceil(grades.length / 2)) } as CSSProperties}>{grades.map(grade => <div className="student-growth-grade-summary" key={grade.id}><span>{grade.name}</span><span><b>{grade.praised}</b>／{grade.total}人</span><i><em style={{ width: `${grade.percent}%` }} /></i></div>)}</div>
        {!grades.length && <Empty>暂无年级数据</Empty>}
      </GrowthPanel>

      <GrowthPanel title="班级人均积分榜" badge="TOP 10" className="student-growth-average-class-board">
        <GrowthMetricTabs snapshot={snapshot} value={selection.averageClassMetric} label="班级人均积分榜指标" onChange={averageClassMetric => onChange({ averageClassMetric })} />
        <GrowthRankingTable title="班级人均积分榜" rows={averageClassRows} rowKey={row => row.id} className="student-growth-average-class-table" emptyText="暂无上榜班级" columns={[
          { key: 'class', label: '班级', render: row => <strong title={row.name}>{row.name}</strong> },
          { key: 'value', label: '积分', render: row => <b>{average(row.average)}</b> },
        ]} />
      </GrowthPanel>
    </div>
    <aside className="student-growth-readonly-boards" aria-label="荣誉与动态">
      <GrowthPanel title="成长之星" badge="TOP 3" className="student-growth-star-board" extra={<span className="student-growth-scope student-growth-linked-scope" title={`${scopeName} · ${metricName}`}><span>随得分榜</span><span>{scopeName} · {metricName}</span></span>}>
        <ol className="student-growth-star-list" aria-label="成长之星前三名">
          {stars.map(row => <li key={row.student.id}><span className="student-growth-star-rank" aria-label={`${row.tied ? '并列' : ''}第${row.rank}名`}>{String(row.rank).padStart(2, '0')}</span><div className="student-growth-person"><strong title={row.student.displayName}>{row.student.displayName}</strong><span title={growthStudentClassName(row.student)}>{growthStudentClassName(row.student)}</span></div></li>)}
        </ol>
        {!stars.length && <Empty>暂无上榜学生</Empty>}
      </GrowthPanel>

      <GrowthPanel title="成长动态" className="student-growth-activity-board">
        {activities.length ? <StudentGrowthActivityFeed activities={activities} /> : <Empty />}
      </GrowthPanel>
    </aside>
  </main>;
});
