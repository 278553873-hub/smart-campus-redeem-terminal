import type React from 'react';
import MobileInputComposer, { type MobileInputComposerProps, type VoiceController, type VoicePressState } from './ui/MobileInputComposer';
import './TeacherRecordInputBar.css';

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
    attachments?: MobileInputComposerProps['attachments'];
    onRemoveAttachment?: MobileInputComposerProps['onRemoveAttachment'];
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
    attachments, onRemoveAttachment,
    onInputChange = () => {}, onSubmit = () => {}, onCloseKeyboard, onCameraClick,
    onVoicePointerDown, onKeyboardClick, onVoiceKeyboardActivate,
}: TeacherRecordInputBarProps) {
    const voiceLabel = !hasSelectionTarget ? emptySelectionPrompt
        : isMultiSelectMode ? `按住说话 · ${selectedTargetCount}${selectedTargetUnit}` : '按住说话';
    const hasAttachments = Boolean(attachments?.length);
    const placementClass = hasAttachments
        ? `relative shrink-0 ${showTabBar ? 'mb-[82px]' : 'mb-4'}`
        : `absolute inset-x-0 ${showTabBar ? 'bottom-[82px]' : 'bottom-4'}`;
    return <div data-placement={hasAttachments ? 'docked' : 'floating'} className={`pointer-events-none z-[60] mx-auto w-full max-w-md px-3 ${placementClass}`}>
        <div className="pointer-events-auto">
            <MobileInputComposer
                shadow="floating"
                attachmentLayout="panel"
                mode={showKeyboard ? 'text' : 'voice'} value={inputText} placeholder="请输入"
                disabled={!hasSelectionTarget} voice={voice} voiceState={voicePressState} voiceLabel={voiceLabel}
                attachments={attachments} onRemoveAttachment={onRemoveAttachment}
                sendLabel="发送记录" onCameraClick={onCameraClick}
                onModeChange={mode => mode === 'text' ? onKeyboardClick() : onCloseKeyboard()}
                onChange={onInputChange} onSubmit={onSubmit}
                onVoicePointerDown={onVoicePointerDown} onVoiceKeyboardActivate={onVoiceKeyboardActivate}
            />
        </div>
    </div>;
}
