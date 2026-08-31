import type React from 'react';
import { CameraIcon, KeyboardIcon, VolumeIcon } from './Icons';

export type TeacherVoicePressState = 'idle' | 'listening' | 'canceling';

interface TeacherRecordInputBarProps {
    showKeyboard: boolean;
    showTabBar: boolean;
    inputText: string;
    hasSelectionTarget: boolean;
    emptySelectionPrompt: string;
    isMultiSelectMode: boolean;
    selectedTargetCount: number;
    selectedTargetUnit: string;
    voicePressState: TeacherVoicePressState;
    onCloseKeyboard: () => void;
    onCameraClick: () => void;
    onVoicePointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
    onVoiceContextMenu: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onKeyboardClick: () => void;
}

export default function TeacherRecordInputBar({
    showKeyboard,
    showTabBar,
    inputText,
    hasSelectionTarget,
    emptySelectionPrompt,
    isMultiSelectMode,
    selectedTargetCount,
    selectedTargetUnit,
    voicePressState,
    onCloseKeyboard,
    onCameraClick,
    onVoicePointerDown,
    onVoiceContextMenu,
    onKeyboardClick,
}: TeacherRecordInputBarProps) {
    if (showKeyboard) {
        return (
            <div className="pointer-events-none absolute bottom-[292px] left-0 right-0 z-[85] mx-auto max-w-md px-4">
                <div className="pointer-events-auto mx-auto grid h-16 max-w-[350px] grid-cols-[minmax(0,1fr)_48px] items-center gap-1 rounded-[var(--tm-radius-card)] bg-white px-2.5 [box-shadow:var(--tm-shadow-floating)]">
                    <div
                        role="textbox"
                        aria-label="记录内容"
                        aria-readonly="true"
                        className={`min-w-0 truncate px-3 text-[15px] font-medium ${inputText ? 'text-[var(--tm-text-primary)]' : 'text-[var(--tm-text-disabled)]'}`}
                    >
                        {inputText || '输入记录内容'}
                    </div>
                    <button
                        type="button"
                        onClick={onCloseKeyboard}
                        aria-label="切换到语音记录"
                        className="flex h-11 w-11 items-center justify-center rounded-[var(--tm-radius-inner)] text-[var(--tm-text-primary)] transition active:scale-95 active:bg-[var(--tm-bg-surface-soft)] active:text-[var(--tm-brand-primary)]"
                    >
                        <VolumeIcon className="h-[22px] w-[22px]" />
                    </button>
                </div>
            </div>
        );
    }

    const voiceLabel = !hasSelectionTarget
        ? emptySelectionPrompt
        : voicePressState === 'idle'
            ? isMultiSelectMode ? `按住说话 · ${selectedTargetCount}${selectedTargetUnit}` : '按住说话'
            : voicePressState === 'canceling' ? '松开取消' : '松开发送';
    const voiceAriaLabel = !hasSelectionTarget
        ? emptySelectionPrompt
        : voicePressState === 'idle'
            ? isMultiSelectMode ? `按住说话，已选${selectedTargetCount}${selectedTargetUnit}` : '按住说话'
            : voicePressState === 'canceling' ? '松开取消' : '正在录音，松开发送';

    return (
        <div className={`pointer-events-none absolute ${showTabBar ? 'bottom-[82px]' : 'bottom-4'} left-0 right-0 z-[60] mx-auto max-w-md px-4 transition-all duration-300`}>
            <div className="pointer-events-auto mx-auto grid h-16 max-w-[350px] grid-cols-[48px_minmax(0,1fr)_48px] items-center rounded-[var(--tm-radius-card)] bg-white px-2.5 [box-shadow:var(--tm-shadow-floating)]">
                <button
                    type="button"
                    onClick={onCameraClick}
                    disabled={!hasSelectionTarget}
                    aria-label={hasSelectionTarget ? '拍照记录' : emptySelectionPrompt}
                    className="flex h-11 w-11 items-center justify-center rounded-[var(--tm-radius-inner)] text-[var(--tm-text-primary)] transition active:scale-95 active:bg-[var(--tm-bg-surface-soft)] active:text-[var(--tm-brand-primary)] disabled:cursor-not-allowed disabled:opacity-35 disabled:active:scale-100"
                >
                    <CameraIcon className="h-[22px] w-[22px]" />
                </button>

                <button
                    type="button"
                    onPointerDown={onVoicePointerDown}
                    onContextMenu={onVoiceContextMenu}
                    disabled={!hasSelectionTarget}
                    aria-label={voiceAriaLabel}
                    className={`flex h-11 min-w-0 touch-none select-none items-center justify-center rounded-[var(--tm-radius-inner)] px-4 text-[15px] font-semibold transition ${voicePressState === 'idle'
                        ? 'text-[var(--tm-text-primary)] active:scale-[0.98] active:bg-[var(--tm-bg-surface-soft)] disabled:cursor-not-allowed disabled:text-[var(--tm-text-disabled)] disabled:active:scale-100'
                        : voicePressState === 'canceling'
                            ? 'bg-[var(--tm-status-negative-soft)] text-[var(--tm-status-negative-strong)]'
                            : 'bg-[var(--tm-brand-primary)] text-white'
                        }`}
                >
                    <span>{voiceLabel}</span>
                </button>

                <button
                    type="button"
                    onClick={onKeyboardClick}
                    disabled={!hasSelectionTarget}
                    aria-label={!hasSelectionTarget ? emptySelectionPrompt : isMultiSelectMode ? `已选${selectedTargetCount}${selectedTargetUnit}，文字记录` : '文字记录'}
                    className="relative flex h-11 w-11 items-center justify-center rounded-[var(--tm-radius-inner)] text-[var(--tm-text-primary)] transition active:scale-95 active:bg-[var(--tm-bg-surface-soft)] active:text-[var(--tm-brand-primary)] disabled:cursor-not-allowed disabled:opacity-35 disabled:active:scale-100"
                >
                    <KeyboardIcon className="h-[22px] w-[22px]" />
                </button>
            </div>
        </div>
    );
}
