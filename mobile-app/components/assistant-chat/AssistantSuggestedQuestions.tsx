/**
 * 助理对话的建议问题条
 *
 * 位于对话输入控件上方，按内容自然定宽并支持左右滑动。
 * 班主任助理与校长助理共用本组件，颜色由所在助理主题（--tm-assistant-role-*）决定。
 */
import React from 'react';

interface AssistantSuggestedQuestionsProps {
    questions: readonly string[];
    disabled: boolean;
    onSelect: (question: string) => void;
}

const AssistantSuggestedQuestions: React.FC<AssistantSuggestedQuestionsProps> = ({
    questions,
    disabled,
    onSelect,
}) => (
    <div
        className="-mx-3 mb-1 flex touch-pan-x gap-2 overflow-x-auto overscroll-x-contain px-3 pb-1 pr-12 no-scrollbar"
        aria-label={`共${questions.length}个快捷问题`}
    >
        {questions.map((question, index) => (
            <button
                key={question}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(question)}
                className="min-h-[var(--tm-size-touch)] shrink-0 whitespace-nowrap rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-glass)] px-3 text-[12px] font-semibold text-[var(--tm-assistant-role-text)] [box-shadow:var(--tm-shadow-control)] disabled:text-[var(--tm-text-disabled)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                aria-label={`快捷问题 ${index + 1}/${questions.length}：${question}`}
            >
                {question}
            </button>
        ))}
    </div>
);

export default AssistantSuggestedQuestions;
