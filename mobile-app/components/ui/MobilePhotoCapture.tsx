import React, { useEffect, useRef, useState } from 'react';
import { ChevronUp, Image, SwitchCamera, X, Zap, ZapOff } from 'lucide-react';
import './MobilePhotoCapture.css';

/** 公共照片采集层，只返回照片，不承担识别或记录业务。 */
export default function MobilePhotoCapture({ onClose, onSelect, remaining = 9, thumbnail }: {
  onClose: () => void;
  onSelect: (files: File[]) => void;
  remaining?: number;
  thumbnail?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [facing, setFacing] = useState<'environment' | 'user'>('environment');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [torch, setTorch] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [capturing, setCapturing] = useState(false);
  useEffect(() => {
    closeButton.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    let disposed = false;
    setReady(false); setError(''); setTorch(false); setTorchAvailable(false); setZoom(1);
    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
        const next = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facing } }, audio: false });
        if (disposed) { next.getTracks().forEach(track => track.stop()); return; }
        stream.current = next;
        const track = next.getVideoTracks()[0];
        setTorchAvailable(Boolean((track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean })?.torch));
        if (video.current) { video.current.srcObject = next; await video.current.play(); }
        if (!disposed) setReady(true);
      } catch {
        if (!disposed) { stream.current?.getTracks().forEach(track => track.stop()); setError('无法打开相机，请允许相机权限后重试，或从相册选择照片'); }
      }
    };
    void start();
    return () => { disposed = true; stream.current?.getTracks().forEach(track => track.stop()); stream.current = null; };
  }, [facing, attempt]);
  const capture = () => {
    const source = video.current;
    if (!source || !ready || capturing || !source.videoWidth) return;
    setCapturing(true);
    const canvas = document.createElement('canvas');
    canvas.width = source.videoWidth; canvas.height = source.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) { setCapturing(false); return; }
    const width = canvas.width / zoom, height = canvas.height / zoom;
    context.drawImage(source, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      setCapturing(false);
      if (blob) onSelect([new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })]);
      else setError('拍照失败，请重试');
    }, 'image/jpeg', 0.92);
  };
  const toggleTorch = async () => {
    try {
      await stream.current?.getVideoTracks()[0]?.applyConstraints({ advanced: [{ torch: !torch } as MediaTrackConstraintSet] });
      setTorch(!torch);
    } catch { setError('闪光灯暂不可用'); }
  };
  return <div className="mobile-photo-capture" role="dialog" aria-modal="true" aria-label="拍照录入"
    onKeyDown={event => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }}>
    <header><button ref={closeButton} onClick={onClose} aria-label="关闭相机"><X /></button><h2>拍照录入</h2><button onClick={toggleTorch} disabled={!torchAvailable || !ready} aria-label={torch ? '关闭闪光灯' : '开启闪光灯'} aria-pressed={torch}>{torch ? <Zap /> : <ZapOff />}</button></header>
    <div className="mobile-photo-capture__preview">
      <video ref={video} muted playsInline autoPlay style={{ transform: `scale(${zoom})` }} aria-label="相机实时画面" />
      {ready && <div className="mobile-photo-capture__frame" aria-hidden="true"><i /><i /><i /><i /></div>}
      {!ready && <div className="mobile-photo-capture__status" role="status">{error || '正在打开相机…'}{error && <button onClick={() => setAttempt(value => value + 1)}>重新尝试</button>}</div>}
      {ready && error && <p className="mobile-photo-capture__notice" role="status">{error}</p>}
      <div className="mobile-photo-capture__zoom" role="group" aria-label="取景缩放">{[0.5, 1, 2, 3].map(value => <button key={value} disabled={!ready || value < 1} aria-pressed={zoom === value} onClick={() => setZoom(value)}>{value === 1 ? '1x' : value}</button>)}</div>
    </div>
    <footer><div className="mobile-photo-capture__controls"><button className="mobile-photo-capture__album" onClick={() => picker.current?.click()} aria-label="选择相册"><>{thumbnail ? <img src={thumbnail} alt="" /> : <Image />}</></button><button className="mobile-photo-capture__shutter" onClick={capture} disabled={!ready || capturing} aria-label="拍照"><span /></button><button className="mobile-photo-capture__switch" onClick={() => setFacing(value => value === 'environment' ? 'user' : 'environment')} disabled={!ready || capturing} aria-label="切换前后摄像头"><SwitchCamera strokeWidth={2} aria-hidden="true" /></button></div><ChevronUp className="mobile-photo-capture__chevron" aria-hidden="true" /></footer>
    <input ref={picker} type="file" accept="image/*" multiple hidden aria-label="选择照片" onChange={event => { const files = Array.from(event.target.files ?? []).filter(file => file.type.startsWith('image/')); event.target.value = ''; if (files.length > remaining) { setError(`最多还能选择 ${remaining} 张照片`); return; } if (files.length) onSelect(files); }} />
  </div>;
}
