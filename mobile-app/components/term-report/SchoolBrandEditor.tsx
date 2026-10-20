import React, { useState } from 'react';
import MobileBottomSheet from '../ui/MobileBottomSheet';
import type { ReportAppearance } from '../../domain/termReportAppearance';
import { readCoverUpload } from '../../services/termReportAppearanceStore';

export default function SchoolBrandEditor({ config, onSave, onClose }: { config: ReportAppearance; onSave: (config: ReportAppearance) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(config);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const logo = draft.logoId ? draft.assets[draft.logoId] : undefined;
  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    setUploading(true); setError('');
    try {
      const asset = await readCoverUpload(file); const id = crypto.randomUUID();
      setDraft(value => ({ ...value, logoId: id, assets: { ...value.assets, [id]: asset } }));
    } catch (cause) { setError((cause as Error).message); }
    finally { setUploading(false); }
  };
  return <MobileBottomSheet open title="学校标识" onClose={onClose} footer={<div className="flex gap-3"><button onClick={onClose} className="report-management__button flex-1">取消</button><button disabled={uploading} onClick={() => { try { onSave(draft); } catch (cause) { setError((cause as Error).message); } }} className="report-management__button report-management__button--primary flex-1">保存</button></div>}>
    <div className="space-y-4">
      <p className="font-semibold">{config.schoolName}</p>
      {logo && <img src={logo.src} className="h-16 max-w-[180px] object-contain" alt="校徽预览" />}
      <div className="flex gap-3">
        <label className="report-management__button relative flex-1">{uploading ? '正在读取…' : logo ? '更换校徽' : '上传校徽'}<input type="file" accept="image/png,image/jpeg,image/webp" aria-label="上传学校标识" disabled={uploading} onChange={upload} className="absolute inset-0 w-full cursor-pointer opacity-0" /></label>
        {logo && <button className="report-management__button" onClick={() => setDraft(value => ({ ...value, logoId: undefined }))}>移除</button>}
      </div>
      <p className="report-management__secondary">PNG、JPG、WebP，最大 10 MB。</p>
      {error && <p role="alert" className="report-management__error">{error}</p>}
    </div>
  </MobileBottomSheet>;
}
