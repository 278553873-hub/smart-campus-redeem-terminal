import React from 'react';
import { X } from 'lucide-react';
import './MobilePhotoThumbnail.css';

interface MobilePhotoThumbnailProps {
  src: string;
  label: string;
  disabled?: boolean;
  onPreview?: () => void;
  onRemove?: () => void;
}

export default function MobilePhotoThumbnail({ src, label, disabled, onPreview, onRemove }: MobilePhotoThumbnailProps) {
  const image = <img className="mobile-photo-thumbnail__image" src={src} alt={onPreview ? '' : label} decoding="async" />;

  return (
    <div className="mobile-photo-thumbnail">
      {onPreview ? (
        <button
          type="button"
          className="mobile-photo-thumbnail__preview"
          disabled={disabled}
          aria-label={`预览${label}`}
          aria-haspopup="dialog"
          onClick={onPreview}
        >
          {image}
        </button>
      ) : image}
      {onRemove && (
        <button
          type="button"
          className="mobile-photo-thumbnail__remove"
          disabled={disabled}
          aria-label={`删除${label}`}
          onClick={onRemove}
        >
          <X size={10} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
