import { useId, useRef, useState, type FormEvent } from 'react';
import { IMAGE_UPLOAD_ACCEPT, IMAGE_UPLOAD_MAX_SIZE_TEXT, readImageUpload } from '../../shared/imageUpload';
import { resolveMedalIcon } from '../assets/medals';
import MedalIconView from '../components/medal/MedalIcon';
import CompactSegmentedControl from '../components/ui/CompactSegmentedControl';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import { MobileImagePreviewTile, MobileImageSelectionTile, MobileImageUploadTile } from '../components/ui/MobileImageTile';
import { mobileSheetActionClass } from '../components/ui/mobileSheetActionStyles';
import { PLATFORM_MEDALS, type MedalDefinition, type MedalIcon } from '../domain/medal';
import { SCHOOL_MEDAL_NAME_MAX_LENGTH, type SchoolCustomMedalInput } from '../domain/schoolMedals';
import { phoneText } from '../styles/teacherMobileTokens';
import { SwitchControl } from './MeFeatureViews';

interface SchoolMedalEditorSheetProps {
  open: boolean;
  medal?: MedalDefinition;
  initialAvailability?: boolean;
  onClose: () => void;
  onSave: (input: SchoolCustomMedalInput) => Promise<void>;
  onRequestDelete?: () => void;
}

const labelClass = 'block text-[length:var(--tm-font-size-form-group-label)] font-semibold text-[var(--tm-text-primary)]';
const focusClass = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]';
const imageSourceTabs = [
  { value: 'custom', label: '自定义' },
  { value: 'system', label: '默认' },
] as const;
type ImageSource = typeof imageSourceTabs[number]['value'];
const systemImages = PLATFORM_MEDALS.map(medal => ({
  id: medal.id,
  name: medal.name,
  icon: resolveMedalIcon(medal.id, medal.icon),
}));

export default function SchoolMedalEditorSheet({ open, medal, initialAvailability, onClose, onSave, onRequestDelete }: SchoolMedalEditorSheetProps) {
  const formId = useId();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const existingSystemImage = systemImages.find(image => (
    typeof image.icon === 'object' && typeof medal?.icon === 'object' && image.icon.src === medal.icon.src
  ));
  const [name, setName] = useState(medal?.name ?? '');
  const [imageSource, setImageSource] = useState<ImageSource>(existingSystemImage ? 'system' : 'custom');
  const [customIcon, setCustomIcon] = useState<MedalIcon | undefined>(existingSystemImage ? undefined : medal?.icon);
  const [systemImageId, setSystemImageId] = useState(existingSystemImage?.id);
  const [available, setAvailable] = useState(initialAvailability);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const icon = imageSource === 'system' ? systemImages.find(image => image.id === systemImageId)?.icon : customIcon;
  const canSave = icon !== undefined && name.trim() !== '' && !uploading && !saving;
  const openImagePicker = () => imageInputRef.current?.click();

  const uploadIcon = async (file: File) => {
    setError('');
    setUploading(true);
    try {
      setCustomIcon({ type: 'image', src: await readImageUpload(file, 256) });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : '图片处理失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError('');
    try {
      await onSave({
        id: medal?.id,
        name,
        icon,
        available: available !== initialAvailability ? available : undefined,
      });
      onClose();
    } catch (failure) {
      if (failure instanceof Error && failure.name === 'QuotaExceededError') {
        setError('本地存储空间不足，请更换体积较小的图案后重试');
      } else {
        setError(failure instanceof Error && failure.name === 'Error' ? failure.message : '奖章保存失败，请重试');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileBottomSheet open={open} title={medal ? '编辑奖章' : '新增奖章'}
      onClose={() => { if (!saving) onClose(); }} footerSafeArea="device"
      footer={(
        <div className="space-y-[var(--tm-space-2)]">
          <button type="submit" form={formId} disabled={!canSave}
            className={`${mobileSheetActionClass} ${focusClass} w-full bg-[var(--tm-brand-primary)] font-semibold text-[var(--tm-text-inverse)] enabled:active:bg-[var(--tm-brand-primary-pressed)] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]`}>
            {saving ? '保存中…' : '保存奖章'}
          </button>
          {medal && onRequestDelete && (
            <button type="button" onClick={onRequestDelete} disabled={saving || uploading}
              className={`${focusClass} min-h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control-compact)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-status-negative-strong)] disabled:text-[var(--tm-text-disabled)]`}>
              删除奖章
            </button>
          )}
        </div>
      )}>
      <form id={formId} onSubmit={save}>
        <fieldset disabled={saving} className="m-0 min-w-0 space-y-[var(--tm-space-4)] border-0 px-0 pb-0 pt-[var(--tm-space-2)]">
          <div className="space-y-[var(--tm-space-2)]">
            <label htmlFor={`${formId}-name`} className={labelClass}>奖章名称</label>
            <input id={`${formId}-name`} value={name} maxLength={SCHOOL_MEDAL_NAME_MAX_LENGTH} required placeholder="请输入奖章名称"
              onChange={event => { setName(event.target.value); setError(''); }}
              className="min-h-[var(--tm-size-touch)] w-full rounded-[var(--tm-form-control-radius)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-body)] text-[var(--tm-input-text)] caret-[var(--tm-brand-primary)] outline-none placeholder:text-[var(--tm-input-placeholder)] disabled:border-[var(--tm-input-disabled-border)] disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)]" />
          </div>
          <div role="group" aria-labelledby={`${formId}-image-label`} className="space-y-[var(--tm-space-2)]" aria-busy={uploading}>
            <div id={`${formId}-image-label`} className={labelClass}>奖章图片</div>
            <CompactSegmentedControl<ImageSource> value={imageSource} items={imageSourceTabs}
              onChange={source => { setImageSource(source); setError(''); }} ariaLabel="奖章图片来源"
              sizing="content" density="small" shape="subtle" motion="sliding" disabled={uploading || saving} />
            {imageSource === 'custom' ? (
              <div role="tabpanel" aria-label="自定义" aria-describedby={`${formId}-image-hint`} className="space-y-[var(--tm-space-2)]">
                <div className="grid grid-cols-3 gap-[var(--tm-space-2)]">
                  <input ref={imageInputRef} type="file" accept={IMAGE_UPLOAD_ACCEPT} disabled={uploading || saving} hidden onChange={event => {
                    const file = event.target.files?.[0];
                    event.target.value = '';
                    if (file) void uploadIcon(file);
                  }} />
                  {customIcon ? (
                    <MobileImagePreviewTile removeLabel="删除奖章图片" onRemove={() => { setCustomIcon(undefined); setError(''); }}>
                      <MedalIconView icon={customIcon} className="absolute inset-0 h-full w-full rounded-[var(--tm-form-control-radius)] text-[var(--tm-brand-reward-strong)]" />
                    </MobileImagePreviewTile>
                  ) : (
                    <MobileImageUploadTile ariaLabel="上传奖章图片" label={uploading ? '读取中…' : undefined}
                      disabled={uploading || saving} onClick={openImagePicker} />
                  )}
                </div>
                <p id={`${formId}-image-hint`} className={`${phoneText.helper} text-[var(--tm-text-secondary)]`}>
                  图片不超过 {IMAGE_UPLOAD_MAX_SIZE_TEXT}，建议使用透明背景 PNG，避免白底影响展示。
                </p>
              </div>
            ) : (
              <div role="tabpanel" aria-label="默认" className="grid grid-cols-4 gap-[var(--tm-space-3)]">
                {systemImages.map(image => (
                  <MobileImageSelectionTile key={image.id} ariaLabel={`选择${image.name}图片`} selected={systemImageId === image.id}
                    onClick={() => { setSystemImageId(image.id); setError(''); }}>
                    <MedalIconView icon={image.icon} className="h-[var(--tm-medal-settings-icon-size)] w-[var(--tm-medal-settings-icon-size)] max-w-full" />
                  </MobileImageSelectionTile>
                ))}
              </div>
            )}
          </div>
          {available !== undefined && (
            <div className="flex items-center justify-between">
              <span className={labelClass}>允许发放</span>
              <SwitchControl checked={available} label="允许发放" onChange={setAvailable} />
            </div>
          )}
          {error && <p role="alert" className="text-[length:var(--tm-font-size-compact)] text-[var(--tm-status-negative-strong)]">{error}</p>}
        </fieldset>
      </form>
    </MobileBottomSheet>
  );
}
