import React, { useEffect, useState } from 'react';
import { BarChart3, ChevronLeft, ChevronRight, UserRoundCheck } from 'lucide-react';
import { ASSETS } from '../assets/images';
import HomeroomClassPickerSheet from '../components/HomeroomClassPickerSheet';
import type { ClassInfo } from '../types';

interface AiHeadteacherAssistantViewProps {
    onBack: () => void;
    homeroomClasses: ClassInfo[];
    activeClassId?: string;
    onOpenWeeklyActionAdvice: (classId: string) => void;
}

type IconType = React.ComponentType<{ className?: string; strokeWidth?: number }>;

interface AssistantOption {
    title: string;
    body: string;
    icon: IconType;
    action?: 'weeklyAdvice';
}

const assistantOptions: AssistantOption[] = [
    {
        title: '生成班级本周行动建议',
        body: '根据近期评价，整理本周关注重点和跟进建议。',
        icon: UserRoundCheck,
        action: 'weeklyAdvice',
    },
    {
        title: '诊断我的评价关注点',
        body: '分析本周评价记录的五育覆盖，提示后续使用建议。',
        icon: BarChart3,
    },
];

const assistantMessage = '你好，我是班主任助理\n请选择一个分析方向，我将为你发现潜在问题，并提供管理建议。';

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
}) => {
    const [typedMessage, setTypedMessage] = useState('');
    const [showClassPicker, setShowClassPicker] = useState(false);

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

    const showPendingFeedback = (title: string) => {
        window.alert(`${title}能力建设中`);
    };

    const handleOption = (option: AssistantOption) => {
        if (option.action === 'weeklyAdvice') {
            if (homeroomClasses.length > 1) {
                setShowClassPicker(true);
                return;
            }
            if (homeroomClasses[0]) onOpenWeeklyActionAdvice(homeroomClasses[0].id);
            return;
        }
        showPendingFeedback(option.title);
    };

    return (
        <div className="relative min-h-full overflow-hidden bg-[linear-gradient(180deg,#F7FCFF_0%,#EEF8FF_42%,#FFFFFF_100%)] font-sans text-slate-950">
            <div className="pointer-events-none absolute -left-24 top-5 h-72 w-72 rounded-full bg-cyan-200/45 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-28 top-20 h-72 w-72 rounded-full bg-violet-200/48 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute left-10 top-72 h-56 w-56 rounded-full bg-pink-100/64 blur-3xl" aria-hidden="true" />

            <button
                type="button"
                onClick={onBack}
                className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/68 text-slate-600 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.35)] ring-1 ring-white/70 backdrop-blur-md transition active:scale-95 active:bg-white/86"
                aria-label="返回"
            >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
            </button>

            <main className="relative z-10 px-5 pb-8 pt-4">
                <section className="relative min-h-[410px] overflow-visible pt-10 text-center">
                    <div className="absolute inset-x-0 top-12 mx-auto h-60 w-72 rounded-full bg-[radial-gradient(circle,rgba(191,244,248,0.70)_0%,rgba(226,245,255,0.52)_46%,rgba(255,255,255,0)_76%)] blur-sm" aria-hidden="true" />
                    <div className="relative mx-auto flex h-[286px] w-[286px] items-center justify-center">
                        <div className="absolute inset-x-6 bottom-5 h-12 rounded-full bg-cyan-300/16 blur-2xl" aria-hidden="true" />
                        <img
                            src={ASSETS.MANAGEMENT.AI_HEADTEACHER_ASSISTANT_CHARACTER}
                            alt="AI班主任助理形象"
                            className="relative h-[286px] w-[286px] scale-[1.04] object-contain drop-shadow-[0_26px_32px_rgba(37,99,235,0.13)]"
                        />
                    </div>

                    <div className="ai-assistant-dialog-card relative mx-auto -mt-1 min-h-[92px] w-full rounded-[22px] px-4 py-3 text-left backdrop-blur-md" aria-live="polite">
                        <span className="ai-assistant-dialog-tail absolute -top-1.5 left-7 h-3 w-3 rotate-45 border-l border-t" aria-hidden="true" />
                        <p className="ai-assistant-typewriter-shine whitespace-pre-line text-[16px] font-semibold leading-7 text-slate-700">
                            {typedMessage}
                            {typedMessage.length < assistantMessage.length && (
                                <span className="ml-0.5 inline-block h-5 w-[1.5px] translate-y-1 animate-pulse rounded-full bg-[#1E9AAA]" aria-hidden="true" />
                            )}
                        </p>
                    </div>
                </section>

                <section className="mt-4 space-y-3">
                    {assistantOptions.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.title}
                                type="button"
                                onClick={() => handleOption(item)}
                                className="flex min-h-[92px] w-full items-center gap-3 rounded-[24px] border border-white/90 bg-white/92 px-4 text-left shadow-[0_18px_42px_-34px_rgba(35,96,145,0.34)] ring-1 ring-slate-100/70 transition active:scale-[0.98] active:bg-cyan-50/40"
                            >
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-[0_16px_30px_-22px_rgba(30,154,170,0.88)]">
                                    <Icon className="h-6 w-6" strokeWidth={2.2} />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[15px] font-bold leading-5 text-slate-950">{item.title}</span>
                                    <span className="mt-1.5 block text-[12px] font-medium leading-5 text-slate-500">{item.body}</span>
                                </span>
                                <ChevronRight className="h-4.5 w-4.5 shrink-0 text-slate-300" strokeWidth={2.1} />
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
                        onOpenWeeklyActionAdvice(classId);
                    }}
                />
            )}
        </div>
    );
};

export default AiHeadteacherAssistantView;
