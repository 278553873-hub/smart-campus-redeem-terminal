import React, { useCallback, useMemo, useState } from 'react';
import { CircleMinus, CirclePlus, FileText, SlidersHorizontal, UsersRound } from 'lucide-react';
import TeacherIndicatorMindMap, { type IndicatorMindMapCatalog } from '../components/indicator/TeacherIndicatorMindMap';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobilePageHeader from '../components/ui/MobilePageHeader';
import type { TeacherIndicatorLeaf } from '../data/teacherIndicatorCatalog';
import type { DevelopmentIndicator } from './data';

interface Props { indicators: DevelopmentIndicator[]; onBack: () => void; }

export default function IndicatorView({ indicators, onBack }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const catalog = useMemo<IndicatorMindMapCatalog>(() => ({
    scope: 'teacher-development',
    title: '教师评价指标',
    levels: [...new Set(indicators.map(item => item.dimension))].map(dimension => ({
      id: `development:${dimension}`, name: dimension, children: [],
      leaves: indicators.filter(item => item.dimension === dimension).map(item => ({
        id: item.id, name: item.name,
        positiveReason: item.delta > 0 ? item.rule : '',
        negativeReason: item.delta < 0 ? item.rule : '',
        examples: [],
      })),
    })),
  }), [indicators]);
  const onSelectLeaf = useCallback((leaf: TeacherIndicatorLeaf) => setSelectedId(leaf.id), []);
  const selected = indicators.find(item => item.id === selectedId);

  return <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
    <MobilePageHeader title={catalog.title} onBack={onBack} />
    <main className="min-h-0 flex-1">
      <TeacherIndicatorMindMap catalog={catalog} onSelectLeaf={onSelectLeaf} />
    </main>
    <MobileBottomSheet open={!!selected} title={selected?.name ?? '指标详情'} onClose={() => setSelectedId(null)} size="tall" contentInset="none">
      {selected && <div>
        <p className="px-[var(--tm-space-4)] pb-[var(--tm-space-4)] text-[length:var(--tm-font-size-compact)] font-medium leading-5 text-[var(--tm-text-tertiary)]">{selected.dimension}</p>
        <div className="border-t border-[var(--tm-border-subtle)]">
          <DetailSection title="指标定义" icon={<FileText size={18} />}><p>{selected.definition}</p></DetailSection>
          <DetailSection
            title={selected.delta > 0 ? '加分理由' : selected.delta < 0 ? '减分理由' : '记录规则'}
            icon={selected.delta > 0 ? <CirclePlus size={18} /> : selected.delta < 0 ? <CircleMinus size={18} /> : <FileText size={18} />}
            tone={selected.delta > 0 ? 'positive' : selected.delta < 0 ? 'negative' : 'neutral'}
          ><p>{selected.rule}</p></DetailSection>
          <DetailSection title="计分范围" icon={<SlidersHorizontal size={18} />}>
            <dl className="grid grid-cols-3 gap-[var(--tm-space-3)]">
              {[['基础分', selected.base], ['上限分', selected.upper], ['下限分', selected.lower]].map(([label, value]) => <div key={label}>
                <dt className="text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">{label}</dt>
                <dd className="font-semibold tabular-nums">{value}分</dd>
              </div>)}
            </dl>
          </DetailSection>
          <DetailSection title="评价设置" icon={<UsersRound size={18} />} last>
            <dl className="space-y-[var(--tm-space-2)]">
              <div className="flex justify-between gap-3"><dt className="text-[var(--tm-text-secondary)]">评价角色</dt><dd>{selected.roles.map(role => role === 'teacher' ? '教师' : '管理者').join('、')}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[var(--tm-text-secondary)]">审核要求</dt><dd>{selected.requiresReview ? '需审核' : '免审'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[var(--tm-text-secondary)]">区分等级</dt><dd>{selected.distinguishLevels ? '是' : '否'}</dd></div>
            </dl>
          </DetailSection>
        </div>
      </div>}
    </MobileBottomSheet>
  </div>;
}

function DetailSection({ title, icon, tone = 'neutral', last = false, children }: {
  title: string; icon: React.ReactNode; tone?: 'positive' | 'negative' | 'neutral'; last?: boolean; children: React.ReactNode;
}) {
  const toneClass = tone === 'positive' ? 'text-[var(--tm-status-positive-strong)]' : tone === 'negative' ? 'text-[var(--tm-score-negative)]' : 'text-[var(--tm-text-secondary)]';
  return <section className={`p-[var(--tm-space-4)] ${last ? '' : 'border-b border-[var(--tm-border-subtle)]'}`}>
    <h3 className={`flex items-center gap-[var(--tm-space-2)] text-[length:var(--tm-font-size-card-title)] font-bold ${toneClass}`}>{icon}<span>{title}</span></h3>
    <div className="mt-[var(--tm-space-3)] text-[length:var(--tm-font-size-body)] font-medium leading-7 text-[var(--tm-text-primary)]">{children}</div>
  </section>;
}
