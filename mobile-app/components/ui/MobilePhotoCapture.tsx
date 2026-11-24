import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Image, RefreshCw, X, Zap, ZapOff } from 'lucide-react';
import { ImagePreview } from '../../../components/media/ImageGallery';
import CompactSegmentedControl from './CompactSegmentedControl';
import MobilePhotoThumbnail from './MobilePhotoThumbnail';
import { DEFAULT_MOBILE_PHOTO_LIMIT } from './mobileInputLimits';
import './MobilePhotoCapture.css';

type Facing = 'environment' | 'user';
type CameraRequest = { facing: Facing; previous?: Facing };
type CameraFailure = 'unsupported' | 'unavailable';
type PhotoSource = 'camera' | 'album';
type PendingPhoto = { file: File; previewUrl: string };

const photoModes = [
  { value: 'single', label: '拍单张' },
  { value: 'multiple', label: '拍多张' },
] as const;

interface MobilePhotoCaptureProps {
  onClose: () => void;
  onSelect: (files: File[]) => void;
  remaining?: number;
  thumbnail?: string;
}

/** 公共照片采集层只向调用方返回照片。 */
export default function MobilePhotoCapture({ onClose, onSelect, remaining = DEFAULT_MOBILE_PHOTO_LIMIT, thumbnail }: MobilePhotoCaptureProps) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const albumPicker = useRef<HTMLInputElement>(null);
  const cameraPicker = useRef<HTMLInputElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const photoStrip = useRef<HTMLDivElement>(null);
  const photoToggle = useRef<HTMLButtonElement>(null);
  const photoPanelId = useId();
  const pendingPreviewUrls = useRef(new Set<string>());
  const revealLatestPhoto = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [request, setRequest] = useState<CameraRequest>({ facing: 'environment' });
  const [activeFacing, setActiveFacing] = useState<Facing>('environment');
  const [ready, setReady] = useState(false);
  const [failure, setFailure] = useState<CameraFailure | null>(null);
  const [notice, setNotice] = useState('');
  const [zoom, setZoom] = useState(1);
  const [torch, setTorch] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchPending, setTorchPending] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [mode, setMode] = useState<(typeof photoModes)[number]['value']>('single');
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [photosExpanded, setPhotosExpanded] = useState(true);
  const isMultiCapture = mode === 'multiple';
  const singlePhoto = isMultiCapture ? undefined : pendingPhotos[0];
  const reviewingSinglePhoto = Boolean(singlePhoto);
  const hasPhotos = pendingPhotos.length > 0;
  const photoLimit = Math.max(0, Math.min(remaining, DEFAULT_MOBILE_PHOTO_LIMIT));
  const pendingLimit = isMultiCapture ? photoLimit : Math.min(photoLimit, 1);
  const available = Math.max(0, pendingLimit - pendingPhotos.length);

  useEffect(() => {
    const urls = pendingPreviewUrls.current;
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  useEffect(() => {
    const strip = photoStrip.current;
    if (photosExpanded && revealLatestPhoto.current && strip) {
      strip.scrollLeft = strip.scrollWidth;
      revealLatestPhoto.current = false;
    }
  }, [pendingPhotos, photosExpanded]);

  useEffect(() => {
    const trigger = document.activeElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      const panel = dialog.current;
      if (!panel || event.defaultPrevented) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const buttons = Array.from(panel.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
        .filter(button => !button.closest('[hidden]'));
      const first = buttons[0];
      const last = buttons.at(-1);
      const active = document.activeElement;
      if (!panel.contains(active) || active?.matches(':disabled') || active === (event.shiftKey ? first : last)) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus({ preventScroll: true });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (!reviewingSinglePhoto) closeButton.current?.focus({ preventScroll: true });
  }, [reviewingSinglePhoto]);

  useEffect(() => {
    if (reviewingSinglePhoto) return;

    let disposed = false;
    let currentStream: MediaStream | null = null;
    let track: MediaStreamTrack | undefined;
    const preview = video.current;
    setReady(false);
    setFailure(null);
    setNotice('');
    setZoom(1);
    setTorch(false);
    setTorchAvailable(false);
    setTorchPending(false);
    setCapturing(false);

    const stop = () => {
      track?.removeEventListener('ended', handleEnded);
      currentStream?.getTracks().forEach(item => item.stop());
      if (stream.current === currentStream) stream.current = null;
      if (preview && preview.srcObject === currentStream) preview.srcObject = null;
    };

    function handleEnded() {
      stop();
      setReady(false);
      setCapturing(false);
      setNotice('');
      setFailure('unavailable');
    }

    const start = async () => {
      const media = navigator.mediaDevices;
      if (!media?.getUserMedia) {
        setFailure('unsupported');
        return;
      }
      if (!preview) return;

      let facing = request.facing;
      try {
        const facingMode = request.previous ? { exact: facing } : { ideal: facing };
        try {
          currentStream = await media.getUserMedia({ video: { facingMode }, audio: false });
        } catch (error) {
          if (disposed || !request.previous) throw error;
          facing = request.previous;
          currentStream = await media.getUserMedia({ video: { facingMode: { ideal: facing } }, audio: false });
          if (!disposed) setNotice('无法切换摄像头，已返回原摄像头');
        }
        if (disposed) {
          stop();
          return;
        }

        stream.current = currentStream;
        track = currentStream.getVideoTracks()[0];
        if (!track) throw new Error('Missing video track');
        track.addEventListener('ended', handleEnded);
        const settings = track.getSettings();
        const capabilities = track.getCapabilities?.() as (MediaTrackCapabilities & { torch?: boolean | boolean[] }) | undefined;
        const torchCapability = capabilities?.torch;
        setTorchAvailable(torchCapability === true || (
          Array.isArray(torchCapability) && torchCapability.includes(true) && torchCapability.includes(false)
        ));
        setActiveFacing(settings.facingMode === 'user' || settings.facingMode === 'environment' ? settings.facingMode : facing);
        preview.srcObject = currentStream;
        await preview.play();
        if (!disposed && stream.current === currentStream) setReady(true);
      } catch {
        stop();
        if (!disposed) {
          setNotice('');
          setFailure('unavailable');
        }
      }
    };

    void start();
    return () => {
      disposed = true;
      stop();
    };
  }, [request, reviewingSinglePhoto]);

  const collectPhotos = (files: File[], source: PhotoSource = 'camera') => {
    if (!files.length) return;
    const returnToComposer = source === 'album' && !isMultiCapture;
    const selectionLimit = returnToComposer && !hasPhotos ? photoLimit : available;
    if (files.length > selectionLimit) {
      setNotice(`最多还能选择 ${selectionLimit} 张照片`);
      return;
    }

    setNotice('');
    if (returnToComposer) {
      onSelect(files);
      return;
    }
    const additions = files.map(file => {
      const previewUrl = URL.createObjectURL(file);
      pendingPreviewUrls.current.add(previewUrl);
      return { file, previewUrl };
    });
    if (!hasPhotos) setPhotosExpanded(true);
    revealLatestPhoto.current = isMultiCapture;
    setPendingPhotos(photos => [...photos, ...additions]);
  };

  const removePendingPhoto = (previewUrl: string) => {
    URL.revokeObjectURL(previewUrl);
    pendingPreviewUrls.current.delete(previewUrl);
    setPendingPhotos(photos => photos.filter(photo => photo.previewUrl !== previewUrl));
    setNotice('');
  };

  const capture = () => {
    if (capturing || available < 1) return;
    setNotice('');
    if (failure) {
      cameraPicker.current?.click();
      return;
    }

    const source = video.current;
    const activeStream = stream.current;
    if (!ready || !source || !activeStream) return;

    try {
      // 复用取景画面的居中裁切和缩放，避免照片出现屏幕外的内容。
      const { videoWidth, videoHeight, clientWidth, clientHeight } = source;
      const frameRatio = clientWidth / clientHeight;
      const width = Math.min(videoWidth, videoHeight * frameRatio) / zoom;
      const height = Math.min(videoHeight, videoWidth / frameRatio) / zoom;
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(width);
      canvas.height = Math.floor(height);
      const context = canvas.getContext('2d');
      if (!context || !canvas.width || !canvas.height) throw new Error('Missing video frame');

      setCapturing(true);
      context.drawImage(source, (videoWidth - width) / 2, (videoHeight - height) / 2, width, height, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        if (stream.current !== activeStream || video.current !== source) return;
        setCapturing(false);
        if (blob) collectPhotos([new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })]);
        else setNotice('拍照失败，请重试');
      }, 'image/jpeg', 0.92);
    } catch {
      setCapturing(false);
      setNotice('拍照失败，请重试');
    }
  };

  const toggleTorch = async () => {
    const track = stream.current?.getVideoTracks()[0];
    if (!track || !torchAvailable || torchPending) return;
    const next = !torch;
    setTorchPending(true);
    setNotice('');
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] });
      const applied = (track.getSettings() as MediaTrackSettings & { torch?: boolean }).torch;
      if (applied !== undefined && applied !== next) throw new Error('Torch setting rejected');
      if (stream.current?.getVideoTracks()[0] === track) setTorch(next);
    } catch {
      if (stream.current?.getVideoTracks()[0] === track) setNotice('闪光灯暂不可用');
    } finally {
      if (stream.current?.getVideoTracks()[0] === track) setTorchPending(false);
    }
  };

  const selectFiles = (event: React.ChangeEvent<HTMLInputElement>, source: PhotoSource) => {
    const files = Array.from(event.currentTarget.files ?? []).filter(file => file.type.startsWith('image/'));
    event.currentTarget.value = '';
    collectPhotos(files, source);
  };

  const failureMessage = failure === 'unsupported'
    ? '当前环境无法实时取景，可点快门尝试系统拍照，或从相册选图。'
    : '无法实时取景。请检查相机权限后重试，也可使用快门或相册。';

  if (singlePhoto) {
    return (
      <ImagePreview
        images={[singlePhoto.previewUrl]}
        initialIndex={0}
        label="拍摄照片预览"
        topInset="max(var(--mini-program-status-bar-height, 0px), env(safe-area-inset-top, 0px))"
        confirmation={{ cancelLabel: '重拍', onConfirm: () => onSelect([singlePhoto.file]) }}
        onClose={() => {
          removePendingPhoto(singlePhoto.previewUrl);
          setRequest({ facing: activeFacing });
        }}
      />
    );
  }

  return (
    <div ref={dialog} className="mobile-photo-capture" role="dialog" aria-modal="true" aria-label="拍照录入">
      <div className="mobile-photo-capture__toolbar">
        <button type="button" ref={closeButton} onClick={onClose} aria-label="关闭相机"><X aria-hidden="true" /></button>
        <button
          type="button"
          onClick={toggleTorch}
          disabled={!ready || !torchAvailable || torchPending || capturing}
          aria-label={ready && !torchAvailable ? '闪光灯不可用' : '闪光灯'}
          aria-pressed={torch}
        >
          {torch ? <Zap aria-hidden="true" /> : <ZapOff aria-hidden="true" />}
        </button>
      </div>
      <div className="mobile-photo-capture__preview">
        <video ref={video} muted playsInline autoPlay aria-hidden={!ready} style={{ opacity: ready ? 1 : 0, transform: `scale(${zoom})` }} aria-label="相机实时画面" />
        {ready && (
          <div className="mobile-photo-capture__frame" aria-hidden="true"><span /><span /><span /><span /></div>
        )}
        <div className="mobile-photo-capture__preview-overlay">
          {!ready && (
            <div className="mobile-photo-capture__status">
              <p role="status">{failure ? failureMessage : request.previous ? '正在切换摄像头…' : '正在打开相机…'}</p>
              {failure === 'unavailable' && (
                <button type="button" onClick={() => setRequest({ facing: request.previous ?? request.facing })}>重试</button>
              )}
            </div>
          )}
          <div className="mobile-photo-capture__preview-controls">
            {ready && (
              <div className="mobile-photo-capture__zoom" role="group" aria-label="取景缩放">
                {[1, 2, 3].map(value => (
                  <button key={value} type="button" disabled={capturing} aria-label={`${value}倍取景`} aria-pressed={zoom === value} onClick={() => setZoom(value)}>
                    <span>{value}×</span>
                  </button>
                ))}
              </div>
            )}
            {!hasPhotos && (
              <CompactSegmentedControl
                className="mobile-photo-capture__mode"
                items={photoModes}
                value={mode}
                onChange={setMode}
                ariaLabel="拍照模式"
                semantics="group"
                density="compact"
                motion="sliding"
                disabled={capturing}
              />
            )}
          </div>
          {hasPhotos && (
            <div id={photoPanelId} className="mobile-photo-capture__photo-panel" hidden={!photosExpanded} role="group" aria-label="本次已添加的照片">
              <div className="mobile-photo-capture__photo-heading">
                <span>从相册上传 或 相机拍摄</span>
                <button
                  type="button"
                  aria-label="收起已有图片"
                  aria-expanded={photosExpanded}
                  aria-controls={photoPanelId}
                  onClick={() => {
                    setPhotosExpanded(false);
                    photoToggle.current?.focus({ preventScroll: true });
                  }}
                >
                  <ChevronDown size={16} aria-hidden="true" />
                </button>
              </div>
              <div ref={photoStrip} className="mobile-photo-thumbnail-strip mobile-photo-capture__photos">
                {pendingPhotos.map(({ previewUrl }, index) => (
                  <MobilePhotoThumbnail
                    key={previewUrl}
                    src={previewUrl}
                    label={`第 ${index + 1} 张照片`}
                    disabled={capturing}
                    onRemove={() => removePendingPhoto(previewUrl)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        {notice && <p className="mobile-photo-capture__notice" role="status">{notice}</p>}
      </div>
      <span className="sr-only" role="status">{hasPhotos && `已添加 ${pendingPhotos.length} 张照片`}</span>
      {hasPhotos && (
        <button
          ref={photoToggle}
          type="button"
          className="mobile-photo-capture__photo-toggle"
          aria-expanded={photosExpanded}
          aria-controls={photoPanelId}
          onClick={() => setPhotosExpanded(expanded => !expanded)}
        >
          {photosExpanded ? '收起已有图片' : '展开已有图片'}
          <span className="mobile-photo-capture__photo-count">{pendingPhotos.length}</span>
        </button>
      )}
      <div className="mobile-photo-capture__controls">
        <button
          type="button"
          className="mobile-photo-capture__album"
          disabled={capturing || available < 1}
          onClick={() => { setNotice(''); albumPicker.current?.click(); }}
          aria-label={isMultiCapture ? '从相册多选图片' : '从相册选图'}
        >
          {thumbnail ? <img src={thumbnail} alt="" /> : <Image aria-hidden="true" />}
        </button>
        <button type="button" className="mobile-photo-capture__shutter" onClick={capture} disabled={(!ready && !failure) || capturing || available < 1} aria-label="拍照">
          <span aria-hidden="true" />
        </button>
        {hasPhotos && (
          <button
            type="button"
            className="mobile-photo-capture__submit"
            disabled={capturing}
            onClick={() => onSelect(pendingPhotos.map(photo => photo.file))}
          >
            确定
          </button>
        )}
        {!isMultiCapture && !hasPhotos && (
          <button
            type="button"
            className="mobile-photo-capture__switch"
            onClick={() => setRequest({ facing: activeFacing === 'environment' ? 'user' : 'environment', previous: activeFacing })}
            disabled={!ready || capturing}
            aria-label="切换前后摄像头"
          >
            <RefreshCw aria-hidden="true" />
          </button>
        )}
      </div>
      <input ref={albumPicker} type="file" accept="image/*" multiple hidden onChange={event => selectFiles(event, 'album')} />
      <input ref={cameraPicker} type="file" accept="image/*" capture={activeFacing} hidden onChange={event => selectFiles(event, 'camera')} />
    </div>
  );
}
