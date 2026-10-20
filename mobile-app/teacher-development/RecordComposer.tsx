import React from 'react';
import { CalendarDays, Camera } from 'lucide-react';
import { bodyClass, fieldClass, metaClass, RowButton } from './ui';
import { demoInputImage } from './demoImages';
import { SELF_COMMUNICATION_EXAMPLE } from './data';

interface Props {
  canSelectTeacher: boolean;
  teacherName?: string;
  text: string;
  date: string;
  imageSampleId?: string;
  error: string;
  onText: (text: string) => void;
  onTarget: () => void;
  onDate: () => void;
  onImage: () => void;
}

export default function RecordComposer({ canSelectTeacher, teacherName, text, date, imageSampleId, error, onText, onTarget, onDate, onImage }: Props) {
  return <div className="space-y-3">
    {canSelectTeacher && <RowButton onClick={onTarget} description={teacherName ? undefined : '未指定教师时记录本人，也可在描述中写明其他教师姓名'}>{teacherName ? `评价 ${teacherName}` : '本人或其他教师'}</RowButton>}
    {imageSampleId ? <img src={demoInputImage(imageSampleId, teacherName ?? '', date)} alt="本次录入的图片" className="max-h-[220px] max-w-full rounded-[var(--tm-radius-inner)] object-contain object-left" /> : <label className="block">
      <span className={`mb-2 block ${bodyClass}`}>记录一件事</span>
      <textarea rows={4} value={text} onChange={event => onText(event.target.value)} placeholder={`例如：${SELF_COMMUNICATION_EXAMPLE}`} className={`${fieldClass} resize-none`} />
    </label>}
    <p className={metaClass}>AI自动匹配指标和计分规则。</p>
    <div className="flex items-center justify-between gap-2">
      <button type="button" onClick={onImage} className="flex min-h-[var(--tm-size-touch)] min-w-0 items-center gap-1.5 text-[length:var(--tm-font-size-compact)]"><Camera size={18} aria-hidden="true" /><span className="truncate">{imageSampleId ? '更换图片' : '添加图片'}</span></button>
      <button type="button" onClick={onDate} aria-label="调整发生日期" className="flex min-h-[var(--tm-size-touch)] items-center gap-1.5 text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]"><CalendarDays size={16} aria-hidden="true" />{date}</button>
    </div>
    {error && <p role="alert" className={`${bodyClass} text-[var(--tm-status-negative-strong)]`}>{error}</p>}
  </div>;
}
