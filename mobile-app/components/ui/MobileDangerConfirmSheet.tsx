import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import MobileBottomSheet from './MobileBottomSheet';

interface MobileDangerConfirmSheetProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  acknowledgeLabel: string;
  countdownSeconds?: number;
  onConfirm: () => void;
  onClose: () => void;
  /** 可选插槽：承载危险操作的口径选择与后果预览，插在说明与勾选之间。 */
  children?: React.ReactNode;
}

/**
 * 通用危险操作二次确认底部弹层。
 * 用于清空校园币、重新计数等不可逆操作：说明文案 + 勾选知晓 + 倒计时 + 危险色确认按钮。
 */
const MobileDangerConfirmSheet: React.FC<MobileDangerConfirmSheetProps> = ({
  open,
  title,
  description,
  confirmLabel,
  acknowledgeLabel,
  countdownSeconds = 5,
  onConfirm,
  onClose,
  children,
}) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (open) {
      setAcknowledged(false);
      setCountdown(countdownSeconds);
      setNotice('');
    }
  }, [open, countdownSeconds]);

  useEffect(() => {
    if (!open || countdown <= 0) return undefined;
    const timer = window.setTimeout(() => setCountdown(current => Math.max(0, current - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [open, countdown]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 1800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleConfirm = () => {
    if (countdown > 0) return;
    if (!acknowledged) {
      setNotice('请先勾选我已知晓');
      return;
    }
    onConfirm();
  };

  return (
    <MobileBottomSheet
      open={open}
      title={title}
      onClose={onClose}
      footerDivider={false}
      footer={(
        <div className="relative">
          {notice && (
            <div
              role="alert"
              className="pointer-events-none absolute bottom-[64px] left-1/2 z-30 w-max max-w-[calc(100%-16px)] -translate-x-1/2 rounded-full bg-[var(--tm-text-primary)] px-3.5 py-2 text-center text-[length:var(--tm-font-size-compact)] font-semibold leading-5 text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-card-raised)]"
            >
              {notice}
            </div>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={countdown > 0}
            className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-status-negative)] px-4 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] disabled:cursor-not-allowed disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]"
          >
            {countdown > 0 ? `${countdown}秒后可确认` : confirmLabel}
          </button>
        </div>
      )}
    >
      <div className="space-y-4 pb-2">
        <p className="text-pretty text-[length:var(--tm-font-size-body)] font-medium leading-6 text-[var(--tm-text-secondary)]">
          {description}
        </p>
        {children}
        <label className="flex min-h-11 select-none items-center gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-3 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-primary)]">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={event => {
              setAcknowledged(event.target.checked);
              if (event.target.checked) setNotice('');
            }}
            className="sr-only"
          />
          <span
            aria-hidden="true"
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] transition-colors [transition-duration:var(--tm-duration-fast)] ${acknowledged ? 'bg-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface)]'}`}
          >
            {acknowledged && <Check className="h-3.5 w-3.5 text-[var(--tm-text-inverse)] [stroke-width:3]" />}
          </span>
          <span>{acknowledgeLabel}</span>
        </label>
      </div>
    </MobileBottomSheet>
  );
};

export default MobileDangerConfirmSheet;
