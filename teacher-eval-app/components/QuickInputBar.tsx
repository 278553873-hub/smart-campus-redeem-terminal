import React from 'react';
import { Camera, Keyboard, Mic } from 'lucide-react';

export type VoicePressState = 'idle' | 'listening';

interface QuickInputBarProps {
  voiceState: VoicePressState;
  disabled?: boolean;
  onPhoto: () => void;
  onManual: () => void;
  onVoiceStart: () => void;
  onVoiceEnd: () => void;
  onVoiceCancel: () => void;
}

/** 悬浮录入条：中间按住说话，左右为拍照和键盘入口。 */
const QuickInputBar: React.FC<QuickInputBarProps> = ({
  voiceState,
  disabled = false,
  onPhoto,
  onManual,
  onVoiceStart,
  onVoiceEnd,
  onVoiceCancel,
}) => {
  const listening = voiceState === 'listening';

  return (
    <div className="relative z-20 shrink-0 px-[var(--tm-space-4)] pb-[var(--tm-space-2)]">
      <div
        className="flex items-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-2)]"
        style={{ boxShadow: 'var(--tm-shadow-floating)' }}
      >
        <button
          type="button"
          onClick={onPhoto}
          disabled={disabled || listening}
          aria-label="拍照录入"
          className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] disabled:opacity-40"
        >
          <Camera className="h-[22px] w-[22px]" color="var(--tm-text-secondary)" strokeWidth={2.2} aria-hidden="true" />
        </button>

        <button
          type="button"
          disabled={disabled}
          onPointerDown={onVoiceStart}
          onPointerUp={onVoiceEnd}
          onPointerLeave={onVoiceCancel}
          onPointerCancel={onVoiceCancel}
          className="flex h-[var(--tm-choice-pill-touch-height)] min-w-0 flex-1 items-center justify-center gap-2 rounded-[var(--tm-radius-control)] text-[16px] font-semibold transition-colors duration-150"
          style={{
            background: listening ? 'var(--tm-brand-primary)' : 'var(--tm-brand-primary-soft)',
            color: listening ? 'var(--tm-text-inverse)' : 'var(--tm-brand-primary)',
          }}
        >
          <Mic className="h-[20px] w-[20px]" strokeWidth={2.2} aria-hidden="true" />
          {listening ? '松开发送' : '按住 说话'}
        </button>

        <button
          type="button"
          onClick={onManual}
          disabled={disabled || listening}
          aria-label="手动填报"
          className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] disabled:opacity-40"
        >
          <Keyboard className="h-[22px] w-[22px]" color="var(--tm-text-secondary)" strokeWidth={2.2} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default QuickInputBar;
