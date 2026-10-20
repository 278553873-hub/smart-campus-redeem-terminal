import type React from 'react';
import MobileInputComposer, { type VoiceController, type VoicePressState } from './ui/MobileInputComposer';

export type TeacherVoicePressState = VoicePressState;
interface TeacherRecordInputBarProps {
    showKeyboard: boolean;
    showTabBar: boolean;
    inputText: string;
    hasSelectionTarget: boolean;
    emptySelectionPrompt: string;
    isMultiSelectMode: boolean;
    selectedTargetCount: number;
    selectedTargetUnit: string;
    voicePressState: VoicePressState;
    voice?: VoiceController;
    onInputChange?: (value: string) => void;
    onSubmit?: () => void;
    onCloseKeyboard: () => void;
    onCameraClick: () => void;
    onVoicePointerDown?: React.PointerEventHandler<HTMLButtonElement>;
    onKeyboardClick: () => void;
    onVoiceKeyboardActivate?: () => void;
}

/** 记录页只管理悬浮位置及评价对象提示；面板与助理使用同一个输入组件。 */
export default function TeacherRecordInputBar({
    showKeyboard, showTabBar, inputText, hasSelectionTarget, emptySelectionPrompt,
    isMultiSelectMode, selectedTargetCount, selectedTargetUnit, voicePressState, voice,
    onInputChange = () => {}, onSubmit = () => {}, onCloseKeyboard, onCameraClick,
    onVoicePointerDown, onKeyboardClick, onVoiceKeyboardActivate,
}: TeacherRecordInputBarProps) {
    const voiceLabel = !hasSelectionTarget ? emptySelectionPrompt
        : isMultiSelectMode ? `按住说话 · ${selectedTargetCount}${selectedTargetUnit}` : '按住说话';
    return <div className={`pointer-events-none absolute ${showTabBar ? 'bottom-[82px]' : 'bottom-4'} inset-x-0 z-[60] mx-auto w-full max-w-md px-3`}>
        <div className="pointer-events-auto">
            <MobileInputComposer
                shadow="floating"
                mode={showKeyboard ? 'text' : 'voice'} value={inputText} placeholder="请输入"
                disabled={!hasSelectionTarget} voice={voice} voiceState={voicePressState} voiceLabel={voiceLabel}
                sendLabel="发送记录" onCameraClick={onCameraClick}
                onModeChange={mode => mode === 'text' ? onKeyboardClick() : onCloseKeyboard()}
                onChange={onInputChange} onSubmit={onSubmit}
                onVoicePointerDown={onVoicePointerDown} onVoiceKeyboardActivate={onVoiceKeyboardActivate}
            />
        </div>
    </div>;
}
