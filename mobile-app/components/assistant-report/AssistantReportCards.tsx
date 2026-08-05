import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  BookOpenText,
  Building2,
  CircleAlert,
  Eye,
  FileSearch,
  ListChecks,
  MessageSquareText,
  ScanSearch,
  School,
  Sparkles,
  Tags,
  TrendingUp,
  UserRoundSearch,
} from 'lucide-react';
import MobileBottomSheet from '../ui/MobileBottomSheet';
import {
  getAssistantReportCardTitle,
  getAssistantReportRole,
  type AssistantReportCard,
  type AssistantReportDocument,
  type AssistantReportInsight,
} from '../../domain/assistantReport';

type IconType = React.ComponentType<{ className?: string; strokeWidth?: number }>;

const CARD_ICONS: Record<string, IconType> = {
  actions: ListChecks,
  student_insights: UserRoundSearch,
  class_insights: School,
  evaluation_insights: MessageSquareText,
  review_summary: ScanSearch,
  attention_insights: Eye,
  perspective_insights: FileSearch,
  indicator_insights: Tags,
  judgement: Sparkles,
  conclusion: Sparkles,
  metrics: BarChart3,
  progress: TrendingUp,
  findings: CircleAlert,
  usage: Building2,
  highlights: TrendingUp,
  practices: BookOpenText,
  concerns: CircleAlert,
};

interface EvidenceState {
  title: string;
  rows: Array<{ label: string; value: string }>;
}

const getEvidenceRows = (item: AssistantReportInsight) => [
  { label: '依据', value: item.evidence },
  { label: '解读', value: item.interpretation },
  { label: '核实重点', value: item.verification },
  { label: '发生情境', value: item.context },
  { label: '参考价值', value: item.value },
].filter((row): row is { label: string; value: string } => Boolean(row.value));

const CardShell: React.FC<{
  cardKey: string;
  title: string;
  children: React.ReactNode;
  emphasized?: boolean;
}> = ({ cardKey, title, children, emphasized = false }) => {
  const Icon = CARD_ICONS[cardKey] ?? Sparkles;

  return (
    <section
      className={`waa-card-enter rounded-[var(--tm-radius-card)] border bg-[var(--tm-bg-surface-glass)] p-[var(--tm-report-card-padding)] [box-shadow:var(--tm-shadow-card)] ${
        emphasized
          ? 'border-[var(--tm-assistant-role-border)]'
          : 'border-transparent'
      }`}
    >
      <header className="flex items-center gap-[var(--tm-space-3)]">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-assistant-role-soft)] text-[var(--tm-assistant-role-text)]">
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.1} aria-hidden="true" />
        </span>
        <h2 className="min-w-0 text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">
          {title}
        </h2>
      </header>
      <div className="mt-[var(--tm-report-card-content-gap)]">{children}</div>
    </section>
  );
};

const SummaryCard: React.FC<{ card: Extract<AssistantReportCard, { kind: 'summary' }>; title: string }> = ({ card, title }) => (
  <CardShell cardKey={card.key} title={title} emphasized>
    <p className="whitespace-pre-line text-[length:var(--tm-font-size-body)] leading-7 text-[var(--tm-text-secondary)]">
      {card.body}
    </p>
  </CardShell>
);

const MetricsCard: React.FC<{ card: Extract<AssistantReportCard, { kind: 'metrics' }>; title: string }> = ({ card, title }) => (
  <CardShell cardKey={card.key} title={title}>
    <div className="grid grid-cols-2 gap-[var(--tm-space-2)]">
      {card.items.map(item => (
        <div key={item.label} className="min-h-[112px] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] p-[var(--tm-space-3)]">
          <p className="text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">{item.label}</p>
          <p className="mt-[var(--tm-space-2)] text-[length:var(--tm-font-size-metric)] font-bold tabular-nums text-[var(--tm-text-primary)]">
            {item.value}
          </p>
          {item.change && (
            <p className="mt-1 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-assistant-role-text)]">{item.change}</p>
          )}
          {item.detail && (
            <p className="mt-1 text-[length:var(--tm-font-size-compact)] leading-4 text-[var(--tm-text-secondary)]">{item.detail}</p>
          )}
        </div>
      ))}
    </div>
  </CardShell>
);

const ActionsCard: React.FC<{ card: Extract<AssistantReportCard, { kind: 'actions' }>; title: string }> = ({ card, title }) => (
  <CardShell cardKey={card.key} title={title} emphasized>
    <ol className="divide-y divide-[var(--tm-border-subtle)]">
      {card.items.map((item, index) => (
        <li key={item.id} className="grid grid-cols-[24px_minmax(0,1fr)] gap-[var(--tm-space-3)] py-[var(--tm-space-3)] first:pt-0 last:pb-0">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--tm-assistant-role-soft)] text-[length:var(--tm-font-size-compact)] font-bold text-[var(--tm-assistant-role-text)]">
            {index + 1}
          </span>
          <div className="min-w-0">
            {item.title && <h3 className="text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{item.title}</h3>}
            <p className={`${item.title ? 'mt-1' : ''} text-[length:var(--tm-font-size-body)] leading-6 text-[var(--tm-text-secondary)]`}>{item.body}</p>
            {(item.owner || item.checkpoint || item.successMetric) && (
              <dl className="mt-[var(--tm-space-2)] space-y-1 text-[length:var(--tm-font-size-compact)] leading-5 text-[var(--tm-text-tertiary)]">
                {item.owner && <div><dt className="inline">责任：</dt><dd className="inline">{item.owner}</dd></div>}
                {item.checkpoint && <div><dt className="inline">节点：</dt><dd className="inline">{item.checkpoint}</dd></div>}
                {item.successMetric && <div><dt className="inline">检查：</dt><dd className="inline">{item.successMetric}</dd></div>}
              </dl>
            )}
          </div>
        </li>
      ))}
    </ol>
  </CardShell>
);

const InsightsCard: React.FC<{
  card: Extract<AssistantReportCard, { kind: 'insights' | 'practices' }>;
  title: string;
  onOpenEvidence: (item: AssistantReportInsight) => void;
}> = ({ card, title, onOpenEvidence }) => (
  <CardShell cardKey={card.key} title={title}>
    <div className="divide-y divide-[var(--tm-border-subtle)]">
      {card.items.map((item, index) => {
        const evidenceRows = getEvidenceRows(item);
        return (
          <article key={item.id} className="py-[var(--tm-space-3)] first:pt-0 last:pb-0">
            {item.context && (
              <p className="mb-1 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-assistant-role-text)]">
                {card.kind === 'practices' ? `案例 ${index + 1} · ` : ''}{item.context}
              </p>
            )}
            {item.title && <h3 className="text-[length:var(--tm-font-size-body)] font-semibold leading-6 text-[var(--tm-text-primary)]">{item.title}</h3>}
            <p className={`${item.title ? 'mt-1' : ''} text-[length:var(--tm-font-size-body)] leading-6 text-[var(--tm-text-secondary)]`}>{item.body}</p>
            {evidenceRows.length > 0 && (
              <button
                type="button"
                onClick={() => onOpenEvidence(item)}
                className="mt-1 flex min-h-11 items-center text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-assistant-role-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                aria-label={`查看${item.title ?? title}的依据`}
              >
                查看依据
              </button>
            )}
          </article>
        );
      })}
    </div>
  </CardShell>
);

interface AssistantReportCardsProps {
  document: AssistantReportDocument;
  className?: string;
}

const AssistantReportCards: React.FC<AssistantReportCardsProps> = ({ document, className = '' }) => {
  const [evidence, setEvidence] = useState<EvidenceState | null>(null);
  const role = getAssistantReportRole(document.reportType);
  const titleByKey = useMemo(() => new Map(document.cards.map(card => [
    card.key,
    getAssistantReportCardTitle(document.reportType, card.key),
  ])), [document]);

  const openEvidence = (item: AssistantReportInsight) => {
    setEvidence({
      title: item.title ?? '分析依据',
      rows: getEvidenceRows(item),
    });
  };

  return (
    <>
      <div className={`space-y-[var(--tm-report-card-gap)] ${className}`}>
        {document.cards.map(card => {
          const title = titleByKey.get(card.key) ?? '';
          if (card.kind === 'summary') return <SummaryCard key={card.key} card={card} title={title} />;
          if (card.kind === 'metrics') return <MetricsCard key={card.key} card={card} title={title} />;
          if (card.kind === 'actions') return <ActionsCard key={card.key} card={card} title={title} />;
          return <InsightsCard key={card.key} card={card} title={title} onOpenEvidence={openEvidence} />;
        })}
      </div>

      <MobileBottomSheet
        open={Boolean(evidence)}
        title="分析依据"
        onClose={() => setEvidence(null)}
      >
        {evidence && (
          <div className={`ai-assistant-theme-${role} pb-[var(--tm-space-2)]`}>
            <h3 className="text-[length:var(--tm-font-size-card-title)] font-semibold leading-6 text-[var(--tm-text-primary)]">
              {evidence.title}
            </h3>
            <dl className="mt-[var(--tm-space-4)] divide-y divide-[var(--tm-border-subtle)]">
              {evidence.rows.map(row => (
                <div key={row.label} className="py-[var(--tm-space-3)] first:pt-0">
                  <dt className="text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-assistant-role-text)]">{row.label}</dt>
                  <dd className="mt-1 text-[length:var(--tm-font-size-body)] leading-6 text-[var(--tm-text-secondary)]">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </MobileBottomSheet>
    </>
  );
};

export default AssistantReportCards;
