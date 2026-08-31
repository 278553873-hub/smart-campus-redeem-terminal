import React, { useEffect, useState } from 'react';
import { CircleMinus, CirclePlus, MessageSquareText } from 'lucide-react';
import TeacherIndicatorMindMap from '../components/indicator/TeacherIndicatorMindMap';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobilePageHeader from '../components/ui/MobilePageHeader';
import {
  teacherIndicatorCatalogs,
  type TeacherIndicatorLeaf,
  type TeacherIndicatorScope,
} from '../data/teacherIndicatorCatalog';

interface TeacherIndicatorCatalogViewProps {
  scope: TeacherIndicatorScope;
  onBack: () => void;
}

interface SelectedIndicator {
  leaf: TeacherIndicatorLeaf;
  path: [string, string, string];
}

const TeacherIndicatorCatalogView: React.FC<TeacherIndicatorCatalogViewProps> = ({ scope, onBack }) => {
  const catalog = teacherIndicatorCatalogs[scope];
  const [selectedIndicator, setSelectedIndicator] = useState<SelectedIndicator | null>(null);

  useEffect(() => {
    setSelectedIndicator(null);
  }, [scope]);

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <MobilePageHeader title={catalog.title} onBack={onBack} />
      <main className="min-h-0 flex-1">
        <TeacherIndicatorMindMap
          catalog={catalog}
          onSelectLeaf={(leaf, path) => setSelectedIndicator({ leaf, path })}
        />
      </main>

      <IndicatorDetailSheet
        selection={selectedIndicator}
        onClose={() => setSelectedIndicator(null)}
      />
    </div>
  );
};

const IndicatorDetailSheet = ({
  selection,
  onClose,
}: {
  selection: SelectedIndicator | null;
  onClose: () => void;
}) => (
  <MobileBottomSheet
    open={Boolean(selection)}
    title={selection?.leaf.name ?? '指标详情'}
    onClose={onClose}
    size="tall"
    contentInset="none"
  >
    {selection && (
      <div>
        <p className="px-[var(--tm-space-4)] pb-[var(--tm-space-4)] text-[length:var(--tm-font-size-compact)] font-medium leading-5 text-[var(--tm-text-tertiary)]">
          {selection.path.slice(0, 2).join(' / ')}
        </p>
        <div className="border-t border-[var(--tm-border-subtle)]">
          <DetailSection icon={<CirclePlus className="h-[18px] w-[18px]" />} title="加分理由" tone="positive">
            <DetailText value={selection.leaf.positiveReason} />
          </DetailSection>
          <DetailSection icon={<CircleMinus className="h-[18px] w-[18px]" />} title="减分理由" tone="negative">
            <DetailText value={selection.leaf.negativeReason} />
          </DetailSection>
          <DetailSection icon={<MessageSquareText className="h-[18px] w-[18px]" />} title="评价示例" tone="neutral" last>
            {selection.leaf.examples.length > 0 ? (
              <ol className="space-y-[var(--tm-space-3)]">
                {selection.leaf.examples.map((example, index) => (
                  <li key={`${selection.leaf.id}-example-${index}`} className="flex items-start gap-[var(--tm-space-3)]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--tm-bg-surface-muted)] text-[length:var(--tm-font-size-badge)] font-bold tabular-nums text-[var(--tm-text-secondary)]">{index + 1}</span>
                    <span className="min-w-0 flex-1 text-[length:var(--tm-font-size-body)] font-medium leading-7 text-[var(--tm-text-primary)]">{example}</span>
                  </li>
                ))}
              </ol>
            ) : <DetailText value="" />}
          </DetailSection>
        </div>
      </div>
    )}
  </MobileBottomSheet>
);

const DetailSection = ({
  icon,
  title,
  tone,
  last = false,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  tone: 'positive' | 'negative' | 'neutral';
  last?: boolean;
  children: React.ReactNode;
}) => {
  const toneClass = tone === 'positive'
    ? 'text-[var(--tm-status-positive-strong)]'
    : tone === 'negative'
      ? 'text-[var(--tm-status-negative-strong)]'
      : 'text-[var(--tm-text-secondary)]';
  return (
    <section className={`p-[var(--tm-space-4)] ${last ? '' : 'border-b border-[var(--tm-border-subtle)]'}`}>
      <h3 className={`flex items-center gap-[var(--tm-space-2)] text-[length:var(--tm-font-size-card-title)] font-bold ${toneClass}`}>
        {icon}
        <span>{title}</span>
      </h3>
      <div className="mt-[var(--tm-space-3)]">{children}</div>
    </section>
  );
};

const DetailText = ({ value }: { value: string }) => (
  <p className={`text-[length:var(--tm-font-size-body)] font-medium leading-7 ${value ? 'text-[var(--tm-text-primary)]' : 'text-[var(--tm-text-tertiary)]'}`}>
    {value || '学校暂未配置'}
  </p>
);

export default TeacherIndicatorCatalogView;
