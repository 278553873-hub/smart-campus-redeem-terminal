import React, { useEffect, useState } from 'react';
import { Building2, CalendarRange, ChevronLeft, ChevronRight, ScanSearch } from 'lucide-react';
import { ASSETS } from '../assets/images';
import MobileNoticeSheet from '../components/ui/MobileNoticeSheet';
import {
    getPrincipalTermReportAvailability,
    type SchoolTermConfig,
} from '../domain/principalTermReport';

interface AiPrincipalAssistantViewProps {
    onBack: () => void;
    termConfig: SchoolTermConfig;
    hasGeneratedTermReport: boolean;
    onOpenWeeklyReport: () => void;
    onOpenMonthlyReport: () => void;
    onOpenTermReport: () => void;
}

type AssistantAction = 'weeklyAdvice' | 'monthlyReview' | 'termReport';

interface AssistantOption {
    title: string;
    body: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    action: AssistantAction;
    emphasis: 'primary' | 'secondary';
    tone: 'brand' | 'secondary' | 'reward';
}

const assistantOptions: AssistantOption[] = [
    {
        title: '本周管理建议',
        body: '根据上周学校数据，整理本周管理重点。',
        icon: Building2,
        action: 'weeklyAdvice',
        emphasis: 'primary',
        tone: 'brand',
    },
    {
        title: '上月学校复盘',
        body: '复盘上月运行情况，发现持续问题与改进方向。',
        icon: ScanSearch,
        action: 'monthlyReview',
        emphasis: 'secondary',
        tone: 'secondary',
    },
    {
        title: '学期学校报告',
        body: '汇总本学期数据，生成学校学期运营报告。',
        icon: CalendarRange,
        action: 'termReport',
        emphasis: 'secondary',
        tone: 'reward',
    },
];

const assistantMessage = '你好，我是校长助理\n我会按周提供管理建议，按月复盘学校运行，并在期末生成学期报告。';

const getTypeDelay = (char: string) => {
    if (char === '\n') return 280;
    if (char === '，') return 150;
    if (char === '。') return 220;
    return 56;
};

const optionToneClass: Record<AssistantOption['tone'], string> = {
    brand: 'border-[var(--tm-role-principal-soft-strong)] bg-[var(--tm-role-principal-soft)] text-[var(--tm-role-principal-strong)]',
    secondary: 'border-[var(--tm-role-principal-soft-strong)] bg-[var(--tm-role-principal-soft)] text-[var(--tm-role-principal-strong)]',
    reward: 'border-[var(--tm-role-principal-accent-border)] bg-[var(--tm-role-principal-accent-soft)] text-[var(--tm-role-principal-accent-strong)]',
};

interface AssistantNotice {
    title: string;
    message: string;
}

const AiPrincipalAssistantView: React.FC<AiPrincipalAssistantViewProps> = ({
    onBack,
    termConfig,
    hasGeneratedTermReport,
    onOpenWeeklyReport,
    onOpenMonthlyReport,
    onOpenTermReport,
}) => {
    const [typedMessage, setTypedMessage] = useState('');
    const [notice, setNotice] = useState<AssistantNotice | null>(null);

    useEffect(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) {
            setTypedMessage(assistantMessage);
            return;
        }

        let index = 0;
        let timer: number | undefined;
        const typeNext = () => {
            index += 1;
            setTypedMessage(assistantMessage.slice(0, index));
            if (index >= assistantMessage.length) {
                return;
            }
            timer = window.setTimeout(typeNext, getTypeDelay(assistantMessage[index - 1]));
        };

        timer = window.setTimeout(typeNext, 240);

        return () => {
            if (timer) window.clearTimeout(timer);
        };
    }, []);

    const handleOption = (item: AssistantOption) => {
        if (item.action === 'weeklyAdvice') {
            onOpenWeeklyReport();
            return;
        }

        if (item.action === 'monthlyReview') {
            onOpenMonthlyReport();
            return;
        }

        const availability = getPrincipalTermReportAvailability(termConfig);
        if (hasGeneratedTermReport || availability.status === 'available') {
            onOpenTermReport();
            return;
        }

        setNotice(availability);
    };

    return (
        <div className="ai-assistant-theme-principal teacher-assistant-page relative min-h-full overflow-hidden font-sans text-[var(--tm-text-primary)]">

            <button
                type="button"
                onClick={onBack}
                className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--tm-bg-surface-glass)] text-[var(--tm-text-secondary)] [box-shadow:var(--tm-shadow-control)] backdrop-blur-md transition active:scale-95 active:bg-[var(--tm-bg-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-role-principal-primary)]"
                aria-label="返回"
            >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
            </button>

            <main className="relative z-10 px-5 pb-8 pt-4">
                <section className="relative min-h-[365px] overflow-visible pt-10 text-center">
                    <div className="relative mx-auto flex h-[250px] w-[250px] items-center justify-center">
                        <img
                            src={ASSETS.MANAGEMENT.AI_PRINCIPAL_ASSISTANT_CHARACTER}
                            alt="AI校长助理形象"
                            className="relative h-[250px] w-[250px] scale-[1.04] object-contain drop-shadow-[0_22px_28px_var(--tm-role-principal-shadow)]"
                        />
                    </div>

                    <div className="ai-assistant-dialog-card relative mx-auto -mt-1 min-h-[96px] w-full rounded-[var(--tm-radius-card)] px-4 py-3 text-left backdrop-blur-md" aria-live="polite">
                        <span className="ai-assistant-dialog-tail absolute -top-1.5 left-7 h-3 w-3 rotate-45 border-l border-t" aria-hidden="true" />
                        <p className="ai-assistant-typewriter-shine whitespace-pre-line text-[15px] font-semibold leading-7">
                            {typedMessage}
                            {typedMessage.length < assistantMessage.length && (
                                <span className="ml-0.5 inline-block h-5 w-[1.5px] translate-y-1 animate-pulse rounded-full bg-[var(--tm-assistant-role-primary)]" aria-hidden="true" />
                            )}
                        </p>
                    </div>
                </section>

                <section className="mt-3 space-y-3" aria-label="校长助理分析能力">
                    {assistantOptions.map((item) => {
                        const Icon = item.icon;
                        const primary = item.emphasis === 'primary';
                        return (
                            <button
                                key={item.title}
                                type="button"
                                onClick={() => handleOption(item)}
                                className={`flex w-full items-center gap-3 border bg-[var(--tm-bg-surface-glass)] px-4 text-left [box-shadow:var(--tm-shadow-card)] transition active:scale-[0.98] active:bg-[var(--tm-role-principal-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-role-principal-primary)] ${primary
                                    ? 'min-h-[92px] rounded-[var(--tm-radius-card)] border-[var(--tm-role-principal-soft-strong)]'
                                    : 'min-h-[76px] rounded-[var(--tm-radius-inner)] border-[var(--tm-border-subtle)]'
                                }`}
                            >
                                <span className={`flex shrink-0 items-center justify-center border ${primary ? 'h-12 w-12 rounded-[var(--tm-radius-inner)]' : 'h-10 w-10 rounded-[var(--tm-radius-control)]'} ${optionToneClass[item.tone]}`}>
                                    <Icon className={primary ? 'h-6 w-6' : 'h-5 w-5'} strokeWidth={2.1} />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[15px] font-semibold leading-5 text-[var(--tm-text-primary)]">{item.title}</span>
                                    <span className="mt-1 block text-[12px] leading-5 text-[var(--tm-text-secondary)]">{item.body}</span>
                                </span>
                                <ChevronRight className="h-4.5 w-4.5 shrink-0 text-[var(--tm-text-tertiary)]" strokeWidth={2.1} />
                            </button>
                        );
                    })}
                </section>
            </main>

            <MobileNoticeSheet
                open={Boolean(notice)}
                title={notice?.title ?? ''}
                message={notice?.message ?? ''}
                onDismiss={() => setNotice(null)}
            />
        </div>
    );
};

export default AiPrincipalAssistantView;
