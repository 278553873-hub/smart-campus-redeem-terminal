import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface PasswordRevealButtonProps {
  /** 当前密码是否已明文显示。 */
  visible: boolean;
  onToggle: () => void;
  /** 按钮内层样式，各端沿用自己原有的触控热区、颜色与按压反馈。 */
  className?: string;
  /** 眼睛图标尺寸，不传则沿用图标库默认的 24。 */
  size?: number;
  /** 眼睛图标线宽，不传则沿用图标库默认值。 */
  strokeWidth?: number;
  /** 明文显示时点击会隐藏，这是该状态下的无障碍标签。 */
  hideLabel?: string;
  /** 密码被掩码时点击会显示，这是该状态下的无障碍标签。 */
  revealLabel?: string;
}

/**
 * 通用密码显隐按钮，PC 后台、教师手机端、家长手机端共用。
 *
 * 图标语义固定为「图标代表当前状态」：密码隐藏时显示闭眼图标（EyeOff），
 * 明文显示时显示睁眼图标（Eye），不再按「点击后会变成什么」来画图标。
 * aria-label 语义固定为「点击后发生的动作」，与图标语义分开，方便读屏用户理解。
 */
export const PasswordRevealButton: React.FC<PasswordRevealButtonProps> = ({
  visible,
  onToggle,
  className,
  size = 24,
  strokeWidth,
  hideLabel = '隐藏密码',
  revealLabel = '查看密码',
}) => (
  <button type="button" onClick={onToggle} className={className} aria-label={visible ? hideLabel : revealLabel}>
    {visible
      ? <Eye size={size} strokeWidth={strokeWidth} aria-hidden="true" />
      : <EyeOff size={size} strokeWidth={strokeWidth} aria-hidden="true" />}
  </button>
);

export default PasswordRevealButton;
