import React from 'react';

interface MobileFloatingImageButtonProps {
  label: string;
  visibleLabel?: string;
  imageSrc: string;
  imageMode?: 'contained' | 'full-bleed';
  onClick: () => void;
  placement?: 'middle-right' | 'above-tab-bar' | 'safe-bottom';
}

const MobileFloatingImageButton: React.FC<MobileFloatingImageButtonProps> = ({
  label,
  visibleLabel,
  imageSrc,
  imageMode = 'contained',
  onClick,
  placement = 'safe-bottom',
}) => {
  const hasVisibleLabel = Boolean(visibleLabel);
  const isMiddleRight = placement === 'middle-right';
  const isFullBleedImage = imageMode === 'full-bleed';

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`absolute z-40 flex items-center justify-center transition-transform [transition-duration:var(--tm-duration-fast)] active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)] focus-visible:ring-offset-2 ${isMiddleRight ? 'top-1/2 -translate-y-1/2' : ''} ${hasVisibleLabel
        ? 'h-[var(--tm-floating-image-button-height)] w-[var(--tm-floating-image-button-width)] overflow-visible rounded-full bg-transparent'
        : 'h-[var(--tm-size-floating-action)] w-[var(--tm-size-floating-action)] rounded-[var(--tm-radius-control)] p-1 [box-shadow:var(--tm-shadow-floating-raised)]'
      }`}
      style={{
        right: 'var(--tm-space-4)',
        bottom: isMiddleRight
          ? undefined
          : placement === 'above-tab-bar'
            ? 'calc(var(--teacher-tabbar-height, 66px) + var(--teacher-tabbar-bottom, 16px) + var(--tm-space-2))'
            : 'calc(var(--tm-space-5) + env(safe-area-inset-bottom))',
      }}
    >
      {hasVisibleLabel ? (
        <span
          aria-hidden="true"
          className={`absolute left-0 top-0 flex h-[var(--tm-floating-image-button-circle-size)] w-[var(--tm-floating-image-button-circle-size)] items-center justify-center overflow-hidden rounded-full [box-shadow:var(--tm-floating-image-button-shadow)] ${isFullBleedImage
            ? 'bg-transparent'
            : 'border-[length:var(--tm-floating-image-button-border-width)] border-solid border-[var(--tm-floating-image-button-border)] bg-[var(--tm-floating-image-button-bg)]'
          }`}
        >
          <img
            src={imageSrc}
            alt=""
            className={isFullBleedImage
              ? 'h-full w-full object-cover'
              : 'h-[var(--tm-floating-image-button-image-size)] w-[var(--tm-floating-image-button-image-size)] object-contain'}
          />
        </span>
      ) : (
        <img src={imageSrc} alt="" aria-hidden="true" className="h-full w-full object-contain" />
      )}
      {visibleLabel && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 flex h-[var(--tm-floating-image-button-label-height)] w-[var(--tm-floating-image-button-label-width)] -translate-x-1/2 items-center justify-center whitespace-nowrap rounded-full border border-[var(--tm-floating-image-button-label-border)] bg-[var(--tm-floating-image-button-label-bg)] text-[var(--tm-font-size-badge)] font-medium text-[var(--tm-floating-image-button-label-text)] [box-shadow:var(--tm-shadow-control)]"
        >
          {visibleLabel}
        </span>
      )}
    </button>
  );
};

export default MobileFloatingImageButton;
