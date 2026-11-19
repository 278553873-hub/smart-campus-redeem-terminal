import React, { useEffect, useRef, type ReactNode } from 'react';
import { Button, Modal } from '@arco-design/web-react';
import { overlaySemantic } from '../../shared/overlayTokens';
import './screenPanoramaDialog.css';

/** 大屏浮层集中处理焦点与返回，业务只提供内容。 */
export function ScreenPanoramaDialog({ visible, title, onClose, children, returnLabel = '返回榜单' }: {
  visible: boolean; title: string; onClose: () => void; children: ReactNode; returnLabel?: string;
}) {
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!visible) return;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return () => {
      const target = opener.current;
      if (target?.isConnected && !target.closest('[inert]')) target.focus({ preventScroll: true });
    };
  }, [visible]);
  return <Modal visible={visible} title={title} className="screen-panorama-dialog" wrapClassName="screen-panorama-dialog-wrap"
    style={{ width: 'min(880px, calc(100vw - 32px))' }} maskStyle={{ background: overlaySemantic.maskStrong }}
    onCancel={onClose} unmountOnExit focusLock autoFocus escToExit closable={false}
    footer={<Button className="screen-panorama-dialog-return" onClick={onClose}>{returnLabel}</Button>}>
    {children}
  </Modal>;
}
