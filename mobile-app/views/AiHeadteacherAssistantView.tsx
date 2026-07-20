import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ScanSearch, UserRoundCheck } from 'lucide-react';
import { ASSETS } from '../assets/images';
import HomeroomClassPickerSheet from '../components/HomeroomClassPickerSheet';
import type { ClassInfo } from '../types';

interface AiHeadteacherAssistantViewProps {
    onBack: () => void;
    homeroomClasses: ClassInfo[];
    activeClassId?: string;
    onOpenWeeklyActionAdvice: (classId: string) => void;
    onOpenEvaluationReview: (classId: string) => void;
}

type IconType = React.ComponentType<{ className?: string; strokeWidth?: number }>;

interface AssistantOption {
    title: string;
    body: string;
    icon: IconType;
    action: 'weeklyAdvice' | 'evaluationReview';
    emphasis: 'primary' | 'secondary';
}

const assistantOptions: AssistantOption[] = [
    {
        title: '本周行动建议',
        body: '根据上周记录，整理本周班级重点。',
        icon: UserRoundCheck,
        action: 'weeklyAdvice',
        emphasis: 'primary',
    },
    {
        title: '上月评价复盘',
        body: '根据上月记录，发现评价视角盲区。',
        icon: ScanSearch,
        action: 'evaluationReview',
        emphasis: 'secondary',
    },
];

const assistantMessage = '你好，我是班主任助理\n我会按周提供行动建议，按月复盘你的评价记录。';

const getTypeDelay = (char: string) => {
    if (char === '\n') return 280;
    if (char === '，') return 150;
    if (char === '。') return 220;
    return 56;
};

const AiHeadteacherAssistantView: React.FC<AiHeadteacherAssistantViewProps> = ({
    onBack,
    homeroomClasses,
    activeClassId,
    onOpenWeeklyActionAdvice,
    onOpenEvaluationReview,
}) => {
    const [typedMessage, setTypedMessage] = useState('');
    const [showClassPicker, setShowClassPicker] = useState(false);
    const [pendingAction, setPendingAction] = useState<AssistantOption['action']>('weeklyAdvice');

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

    const openAction = (action: AssistantOption['action'], classId: string) => {
        if (action === 'weeklyAdvice') onOpenWeeklyActionAdvice(classId);
        else onOpenEvaluationReview(classId);
    };

    const handleOption = (option: AssistantOption) => {
        if (homeroomClasses.length > 1) {
            setPendingAction(option.action);
            setShowClassPicker(true);
            return;
        }
        if (homeroomClasses[0]) openAction(option.action, homeroomClasses[0].id);
    };

    return (
        <div className="ai-assistant-theme-headteacher teacher-assistant-page relative min-h-full overflow-hidden font-sans text-[var(--tm-text-primary)]">
            <button
                type="button"
                onClick={onBack}
                className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--tm-bg-surface-glass)] text-[var(--tm-text-secondary)] [box-shadow:var(--tm-shadow-control)] backdrop-blur-md transition active:scale-95 active:bg-[var(--tm-bg-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-role-headteacher-primary)]"
                aria-label="返回"
            >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
            </button>

            <main className="relative z-10 px-5 pb-8 pt-4">
                <section className="relative min-h-[410px] overflow-visible pt-10 text-center">
                    <div className="relative mx-auto flex h-[286px] w-[286px] items-center justify-center">
                        <img
                            src={ASSETS.MANAGEMENT.AI_HEADTEACHER_ASSISTANT_CHARACTER}
                            alt="AI班主任助理形象"
                            className="relative h-[286px] w-[286px] scale-[1.04] object-contain drop-shadow-[0_24px_30px_var(--tm-role-headteacher-shadow)]"
                        />
                    </div>

                    <div className="ai-assistant-dialog-card relative mx-auto -mt-1 min-h-[92px] w-full rounded-[var(--tm-radius-card)] px-4 py-3 text-left backdrop-blur-md" aria-live="polite">
                        <span className="ai-assistant-dialog-tail absolute -top-1.5 left-7 h-3 w-3 rotate-45 border-l border-t" aria-hidden="true" />
                        <p className="ai-assistant-typewriter-shine whitespace-pre-line text-[16px] font-semibold leading-7">
                            {typedMessage}
                            {typedMessage.length < assistantMessage.length && (
                                <span className="ml-0.5 inline-block h-5 w-[1.5px] translate-y-1 animate-pulse rounded-full bg-[var(--tm-assistant-role-primary)]" aria-hidden="true" />
                            )}
                        </p>
                    </div>
                </section>

                <section className="mt-4 space-y-3">
                    {assistantOptions.map((item) => {
                        const Icon = item.icon;
                        const primary = item.emphasis === 'primary';
                        return (
                            <button
                                key={item.title}
                                type="button"
                                onClick={() => handleOption(item)}
                                className={`flex w-full items-center gap-3 border bg-[var(--tm-bg-surface-glass)] px-4 text-left [box-shadow:var(--tm-shadow-card)] transition active:scale-[0.98] active:bg-[var(--tm-role-headteacher-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-role-headteacher-primary)] ${primary
                                    ? 'min-h-[92px] rounded-[var(--tm-radius-card)] border-[var(--tm-role-headteacher-soft-strong)]'
                                    : 'min-h-[76px] rounded-[var(--tm-radius-inner)] border-[var(--tm-border-subtle)]'
                                }`}
                            >
                                <span className={`flex shrink-0 items-center justify-center ${primary
                                    ? 'h-12 w-12 rounded-[var(--tm-radius-inner)] bg-[var(--tm-role-headteacher-primary)] text-[var(--tm-text-inverse)] [box-shadow:0_12px_24px_-16px_var(--tm-role-headteacher-shadow)]'
                                    : 'h-10 w-10 rounded-[var(--tm-radius-control)] border border-[var(--tm-role-headteacher-border)] bg-[var(--tm-role-headteacher-soft)] text-[var(--tm-role-headteacher-strong)]'
                                }`}>
                                    <Icon className={primary ? 'h-6 w-6' : 'h-5 w-5'} strokeWidth={2.2} />
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

            {showClassPicker && (
                <HomeroomClassPickerSheet
                    classes={homeroomClasses}
                    selectedClassId={activeClassId}
                    onClose={() => setShowClassPicker(false)}
                    onSelect={(classId) => {
                        setShowClassPicker(false);
                        openAction(pendingAction, classId);
                    }}
                />
            )}
        </div>
    );
};

export default AiHeadteacherAssistantView;
