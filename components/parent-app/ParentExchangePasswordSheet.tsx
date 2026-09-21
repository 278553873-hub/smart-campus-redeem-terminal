import React, { useState } from 'react';
import { PasswordRevealButton } from '../../mobile-app/components/ui/PasswordRevealButton';
import {
  isValidExchangePassword,
  maskExchangePassword,
  sanitizeExchangePassword,
} from '../../shared/exchangePassword';
import { ParentBottomSheet, ParentPrimaryButton, ParentSecondaryButton } from './ParentUI';

interface ParentExchangePasswordSheetProps {
  password: string;
  onSave: (nextPassword: string) => void;
  onClose: () => void;
}

/**
 * 家长端「兑换密码」抽屉。
 *
 * 1. 查看态与修改态共用同一行高：密码展示行与输入框都是 52px，错误提示放在标题行右侧，
 *    因此两态切换时抽屉高度不变，顶边不会跳动。
 * 2. 输入过程的状态（明文/编辑/草稿/报错）全部留在本组件内部，
 *    家长每输入一位数字只重渲染这个抽屉，不会带动整个家长端页面重渲染，避免输入卡顿。
 * 3. 提示文案用与输入框等高的独立居中层渲染，不挂在输入文字的基线上：输入文字是 22px、
 *    提示文案是 14px，共用基线时小字会明显偏低，看起来没有上下居中。
 */
export const ParentExchangePasswordSheet: React.FC<ParentExchangePasswordSheetProps> = ({ password, onSave, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  const startEditing = () => {
    setEditing(true);
    setDraft('');
    setError('');
  };

  const cancelEditing = () => {
    setEditing(false);
    setDraft('');
    setError('');
  };

  const save = () => {
    if (!isValidExchangePassword(draft)) {
      setError('请输入6位数字密码');
      return;
    }
    onSave(draft);
    cancelEditing();
  };

  const shownPassword = editing ? draft : password;

  return (
    <ParentBottomSheet title="兑换密码" onClose={onClose} className="pb-8">
      <div className="rounded-[var(--pm-radius-card)] bg-[var(--pm-bg-surface-soft)] p-4 [box-shadow:var(--pm-shadow-card)]">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-text-tertiary)]">6位数字密码</span>
          {error ? (
            <span className="text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-status-negative)]" role="alert">{error}</span>
          ) : null}
        </div>
        {editing ? (
          <>
            <div className="relative">
              <input
                value={draft}
                onChange={event => {
                  setDraft(sanitizeExchangePassword(event.target.value));
                  setError('');
                }}
                inputMode="numeric"
                aria-label="兑换密码"
                aria-invalid={Boolean(error)}
                className="h-[52px] w-full rounded-[var(--pm-radius-field)] border border-[var(--pm-border-control)] bg-[var(--pm-bg-surface)] px-4 text-[length:var(--pm-font-size-page-title)] font-bold tracking-[0.28em] text-[var(--pm-text-primary)] outline-none"
              />
              {draft ? null : (
                <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[length:var(--pm-font-size-body)] text-[var(--pm-text-disabled)]">
                  请输入密码
                </span>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <ParentSecondaryButton type="button" onClick={cancelEditing} className="h-[52px] text-[16px]">
                取消
              </ParentSecondaryButton>
              <ParentPrimaryButton type="button" onClick={save} className="h-[52px] text-[16px]">
                保存密码
              </ParentPrimaryButton>
            </div>
          </>
        ) : (
          <>
            <div className="flex min-h-[52px] items-center justify-between gap-3 rounded-[var(--pm-radius-field)] bg-white/85 px-4">
              <span className="tabular-nums text-[28px] font-bold leading-none tracking-[0.22em] text-[var(--pm-text-primary)]" aria-live="polite">
                {visible ? (shownPassword || '未设置') : maskExchangePassword(shownPassword)}
              </span>
              <PasswordRevealButton
                visible={visible}
                onToggle={() => setVisible(value => !value)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--pm-radius-field)] bg-[var(--pm-bg-surface-soft)] text-[var(--pm-text-tertiary)] transition-[transform,background-color] duration-150 ease-out active:scale-[0.96]"
                size={19}
                strokeWidth={2.5}
                hideLabel="隐藏兑换密码"
                revealLabel="查看兑换密码"
              />
            </div>
            <ParentPrimaryButton type="button" onClick={startEditing} fullWidth className="mt-3 h-[52px] text-[16px]">
              修改密码
            </ParentPrimaryButton>
          </>
        )}
      </div>
    </ParentBottomSheet>
  );
};

export default ParentExchangePasswordSheet;
