import React from 'react';
import { Trophy } from 'lucide-react';
import type { LeaderReportTeacherUsage } from '../../services/leaderReportService';
import MobileBottomSheet from '../ui/MobileBottomSheet';
import CompactSegmentedControl from '../ui/CompactSegmentedControl';

type RankingType = 'active' | 'low';

// 列宽包含单元格内边距；表头与数据由同一张原生表格统一分配宽度。
const columns = [
    { key: 'name', label: '老师', width: 112 },
    { key: 'individualEvaluationRate', label: '个评率', width: 64 },
    { key: 'records', label: '评价次数', width: 72 },
    { key: 'evaluationCount', label: '评价条数', width: 72 },
    { key: 'coveredStudents', label: '覆盖学生', width: 72 },
    { key: 'lastUsedAt', label: '最近评价', width: 104 },
] as const;

const awardTones = [
    'text-[var(--tm-brand-reward-strong)]',
    'text-[var(--tm-text-secondary)]',
    'text-[var(--tm-brand-secondary-strong)]',
];

export default function TeacherUsageRankingSheet({
    rankingType, teachers, onRankingTypeChange, onClose,
}: {
    rankingType: RankingType;
    teachers: LeaderReportTeacherUsage[];
    onRankingTypeChange: (value: RankingType) => void;
    onClose: () => void;
}) {
    return (
        <MobileBottomSheet open title="教师使用完整榜单" onClose={onClose} size="tall" contentInset="none">
            <div className="sticky left-0 top-0 z-30 flex h-[60px] w-full items-center bg-[var(--tm-bg-surface)] px-4">
                <CompactSegmentedControl
                    value={rankingType}
                    items={[{ value: 'active', label: '积极使用' }, { value: 'low', label: '使用较少' }]}
                    onChange={onRankingTypeChange}
                    ariaLabel="教师使用榜单排序"
                    fullWidth
                />
            </div>
            <table
                aria-label="教师使用完整榜单，可左右滑动查看全部指标"
                tabIndex={0}
                className="mx-4 table-fixed border-separate border-spacing-x-0 border-spacing-y-2 text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)] tabular-nums focus-visible:outline-[var(--tm-focus-ring)]"
                style={{ width: 'calc(100% - 32px)', minWidth: columns.reduce((sum, column) => sum + column.width, 0) }}
            >
                <colgroup>{columns.map(column => <col key={column.key} style={{ width: column.width }} />)}</colgroup>
                <thead>
                    <tr>{columns.map((column, index) => (
                        <th key={column.key} scope="col" className={`sticky top-[60px] whitespace-nowrap bg-[var(--tm-bg-surface)] px-3 py-3 font-medium ${index === 0 ? 'left-0 z-20 text-left' : 'z-10 text-right'}`}>
                            {column.label}
                        </th>
                    ))}</tr>
                </thead>
                <tbody>
                    {teachers.map((teacher, index) => (
                        <tr key={teacher.id}>
                            {columns.map((column, columnIndex) => {
                                if (column.key === 'name') return (
                                    <th key={column.key} scope="row" className="sticky left-0 z-[1] rounded-l-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] px-3 py-4 text-left font-medium text-[var(--tm-text-primary)]">
                                        <span className="flex items-center gap-1.5">
                                            <span className="min-w-0 break-words text-[length:var(--tm-font-size-body)]">{teacher.name}</span>
                                            {rankingType === 'active' && index < 3 && <Trophy aria-label={`第${index + 1}名`} className={`h-3 w-3 shrink-0 ${awardTones[index]}`} />}
                                        </span>
                                    </th>
                                );
                                const value = teacher[column.key];
                                return (
                                    <td key={column.key} className={`whitespace-nowrap bg-[var(--tm-bg-surface-soft)] px-3 py-4 text-right font-semibold ${columnIndex === columns.length - 1 ? 'rounded-r-[var(--tm-radius-control)]' : ''}`}>
                                        {value == null ? '—' : column.key === 'individualEvaluationRate' ? `${value}%` : value}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </MobileBottomSheet>
    );
}
