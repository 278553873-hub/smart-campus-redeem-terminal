import React, { useEffect, useState } from 'react';
import { Download, LoaderCircle } from 'lucide-react';
import QRCode from 'qrcode';
import MobileBottomSheet from './MobileBottomSheet';

interface MobileQrInviteSheetProps {
  open: boolean;
  title: string;
  itemTitle: string;
  value: string;
  downloadName: string;
  onClose: () => void;
}

const MobileQrInviteSheet: React.FC<MobileQrInviteSheetProps> = ({
  open,
  title,
  itemTitle,
  value,
  downloadName,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [generationFailed, setGenerationFailed] = useState(false);

  useEffect(() => {
    if (!open || !value) return undefined;
    let cancelled = false;
    setQrDataUrl('');
    setGenerationFailed(false);
    QRCode.toDataURL(value, {
      width: 640,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#111827', light: '#FFFFFF' },
    }).then(dataUrl => {
      if (!cancelled) setQrDataUrl(dataUrl);
    }).catch(() => {
      if (!cancelled) setGenerationFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [open, value]);

  return (
    <MobileBottomSheet open={open} title={title} onClose={onClose}>
      <div className="text-center">
        <h3 className="text-pretty text-[length:var(--tm-font-size-card-title)] font-bold leading-6 text-[var(--tm-text-primary)]">{itemTitle}</h3>
        <div className="mx-auto mt-4 flex aspect-square w-56 items-center justify-center rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-3 [box-shadow:var(--tm-shadow-card-on-white)]">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt={`${itemTitle}填写二维码`} className="h-full w-full object-contain" />
          ) : generationFailed ? (
            <span className="px-4 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-status-negative-strong)]">二维码生成失败，请稍后重试</span>
          ) : (
            <LoaderCircle className="h-7 w-7 animate-spin text-[var(--tm-text-tertiary)]" aria-label="正在生成二维码" />
          )}
        </div>
        <p className="mt-3 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">微信扫码填写问卷</p>
      </div>
      {qrDataUrl && (
        <a
          href={qrDataUrl}
          download={`${downloadName}.png`}
          className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-4 text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)] focus-visible:ring-offset-2"
        >
          <Download className="h-5 w-5" />保存二维码
        </a>
      )}
    </MobileBottomSheet>
  );
};

export default MobileQrInviteSheet;
