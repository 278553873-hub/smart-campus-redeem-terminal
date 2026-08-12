import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { MoralEducationScoreNode } from '../../services/moralEducationCockpitService';
import MobileBottomSheet from '../ui/MobileBottomSheet';
import { TeacherReportBarChart } from './TeacherReportChart';

interface MoralEducationScoreDrilldownProps {
    open: boolean;
    roots: MoralEducationScoreNode[];
    initialRootId?: string;
    onClose: () => void;
    onRootChange?: (rootId: string) => void;
}

const MoralEducationScoreDrilldown: React.FC<MoralEducationScoreDrilldownProps> = ({
    open,
    roots,
    initialRootId,
    onClose,
    onRootChange,
}) => {
    const fallbackRootId = roots[0]?.id ?? '';
    const [rootId, setRootId] = useState(initialRootId ?? fallbackRootId);
    const [categoryId, setCategoryId] = useState('');

    useEffect(() => {
        if (!open) return;
        const nextRootId = roots.some(root => root.id === initialRootId) ? initialRootId! : fallbackRootId;
        setRootId(nextRootId);
        setCategoryId('');
    }, [fallbackRootId, initialRootId, open, roots]);

    const selectedRoot = roots.find(root => root.id === rootId) ?? roots[0];
    const selectedCategory = selectedRoot?.children.find(category => category.id === categoryId);
    const visibleNodes = selectedCategory?.children ?? selectedRoot?.children ?? [];
    const canDrillDown = selectedCategory == null && visibleNodes.some(node => node.children.length > 0);

    const selectRoot = (nextRootId: string) => {
        setRootId(nextRootId);
        setCategoryId('');
        onRootChange?.(nextRootId);
    };

    const selectCategory = (name: string) => {
        if (!canDrillDown) return;
        const category = visibleNodes.find(node => node.name === name);
        if (category?.children.length) setCategoryId(category.id);
    };

    const ariaLabel = useMemo(() => visibleNodes.map(node => (
        `${node.name}${node.averageScore}分，满分${node.maxScore}分`
    )).join('；'), [visibleNodes]);

    return (
        <MobileBottomSheet open={open} title="指标得分明细" onClose={onClose}>
            <nav
                aria-label="指标得分一级指标切换"
                className="-mt-1 flex min-h-[var(--tm-size-touch)] gap-5 overflow-x-auto whitespace-nowrap no-scrollbar"
                role="tablist"
            >
                {roots.map(root => {
                    const selected = root.id === selectedRoot?.id;
                    return (
                        <button
                            key={root.id}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            onClick={() => selectRoot(root.id)}
                            className={`relative flex min-h-[var(--tm-size-touch)] shrink-0 items-center text-[length:var(--tm-font-size-compact)] font-semibold transition-[color,scale] [transition-duration:var(--tm-duration-fast)] active:scale-[0.96] ${selected
                                ? 'text-[var(--tm-text-primary)]'
                                : 'text-[var(--tm-text-secondary)]'}`}
                        >
                            {root.name}
                            {selected && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[var(--tm-brand-primary)]" />}
                        </button>
                    );
                })}
            </nav>

            {selectedCategory && selectedRoot && (
                <nav aria-label="指标得分层级" className="flex min-h-9 items-center whitespace-nowrap text-[length:var(--tm-font-size-meta)]">
                    <button
                        type="button"
                        onClick={() => setCategoryId('')}
                        className="relative min-h-10 pr-1 font-medium text-[var(--tm-text-secondary)] transition-[color,scale] [transition-duration:var(--tm-duration-fast)] active:scale-[0.96]"
                    >
                        {selectedRoot.name}
                    </button>
                    <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--tm-text-disabled)]" />
                    <span className="font-semibold text-[var(--tm-text-primary)]">{selectedCategory.name}</span>
                </nav>
            )}

            <div className="-mx-[var(--tm-space-4)] overflow-x-auto no-scrollbar" aria-label={`当前${selectedCategory?.name ?? selectedRoot?.name ?? '未选择指标'}`}>
                <div
                    className="px-[var(--tm-space-4)]"
                    style={{ width: `${Math.max(360, visibleNodes.length * 92)}px` }}
                >
                    <TeacherReportBarChart
                        ariaLabel={ariaLabel}
                        categories={visibleNodes.map(node => node.name)}
                        series={[{
                            name: '平均得分',
                            values: visibleNodes.map(node => node.averageScore),
                            color: selectedRoot?.color ?? 'data',
                        }]}
                        optionKey={`moral-score-${selectedRoot?.id ?? 'none'}-${selectedCategory?.id ?? 'level-two'}`}
                        showLegend={false}
                        valueLabelSuffix="分"
                        chartTop={24}
                        className="h-64"
                        onCategorySelect={canDrillDown ? selectCategory : undefined}
                    />
                </div>
            </div>
        </MobileBottomSheet>
    );
};

export default MoralEducationScoreDrilldown;
