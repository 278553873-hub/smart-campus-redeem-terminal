import React from 'react';
import { BarChart3, ChevronRight, Sparkles, UserRoundCheck } from 'lucide-react';
import { ASSETS } from '../assets/images';

interface AiHeadteacherAssistantViewProps {
    onBack: () => void;
}

const assistantOptions = [
    {
        title: '生成班级本周行动建议',
        body: '基于学生素养表现，提示下周重点关注对象和跟进动作。',
        icon: UserRoundCheck,
    },
    {
        title: '诊断我的评价关注点',
        body: '分析本周评价记录的五育覆盖，提示后续使用建议。',
        icon: BarChart3,
    },
];

const AiHeadteacherAssistantView: React.FC<AiHeadteacherAssistantViewProps> = () => {
    const showPendingFeedback = (title: string) => {
        window.alert(`${title}能力建设中`);
    };

    return (
        <div className="relative min-h-full overflow-hidden bg-[linear-gradient(180deg,#F7FCFF_0%,#EEF8FF_42%,#FFFFFF_100%)] font-sans text-slate-950">
            <div className="pointer-events-none absolute -left-24 top-5 h-72 w-72 rounded-full bg-cyan-200/45 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-28 top-20 h-72 w-72 rounded-full bg-violet-200/48 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute left-10 top-72 h-56 w-56 rounded-full bg-pink-100/64 blur-3xl" aria-hidden="true" />

            <main className="relative z-10 px-5 pb-8 pt-5">
                <section className="relative min-h-[310px] overflow-hidden rounded-[32px] border border-white/80 bg-white/54 px-5 pb-6 pt-5 shadow-[0_24px_70px_-42px_rgba(37,99,235,0.36)] backdrop-blur-xl">
                    <div className="absolute inset-x-5 top-12 h-36 rounded-full bg-[radial-gradient(circle,rgba(88,195,207,0.22),rgba(127,158,237,0.10)_52%,rgba(255,255,255,0)_72%)]" aria-hidden="true" />
                    <div className="relative mx-auto flex h-[190px] w-[190px] items-center justify-center">
                        <div className="absolute inset-x-5 bottom-0 h-8 rounded-full bg-cyan-300/18 blur-xl" aria-hidden="true" />
                        <img
                            src={ASSETS.MANAGEMENT.AI_HEADTEACHER_ASSISTANT_CHARACTER}
                            alt="AI班主任助理形象"
                            className="relative h-[178px] w-[178px] rounded-[34px] object-cover shadow-[0_18px_34px_-26px_rgba(37,99,235,0.54)] ring-1 ring-white/78"
                        />
                    </div>

                    <div className="relative mx-auto max-w-[260px] rounded-[24px] border border-white/88 bg-white/82 px-4 py-3 text-center shadow-[0_14px_34px_-28px_rgba(15,23,42,0.42)]">
                        <div className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-[#1E9AAA]">
                            <Sparkles className="h-4 w-4" strokeWidth={2.2} />
                            本周班级与评价助手
                        </div>
                        <p className="mt-2 text-[14px] font-semibold leading-6 text-slate-700">选择一个分析方向，我来帮你整理下一步重点。</p>
                    </div>
                </section>

                <section className="mt-4 space-y-3">
                    {assistantOptions.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.title}
                                type="button"
                                onClick={() => showPendingFeedback(item.title)}
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
        </div>
    );
};

export default AiHeadteacherAssistantView;
