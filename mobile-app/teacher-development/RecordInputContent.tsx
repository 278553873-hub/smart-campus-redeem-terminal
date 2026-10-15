import { Volume2 } from 'lucide-react';
import { TEACHERS, type DevelopmentRecord } from './data';
import { demoInputImage } from './demoImages';

export default function RecordInputContent({ record }: { record: DevelopmentRecord }) {
  if (record.inputType === 'image' && record.imageSampleId) return <img
    src={demoInputImage(record.imageSampleId, TEACHERS.find(t => t.id === record.teacherId)?.name ?? '', record.date)}
    alt="录入的图片" className="mb-3.5 max-h-[180px] max-w-full rounded-[var(--tm-radius-inner)] object-contain object-left" />;
  return <div className="mb-3.5">
    {record.inputType === 'voice' && <span className="mb-2 inline-flex min-h-7 items-center gap-1.5 rounded-full bg-[var(--tm-record-student-soft)] px-2.5 text-[12px] font-medium text-[var(--tm-text-secondary)]"><Volume2 size={15} aria-hidden="true" />语音转文字</span>}
    <p className="whitespace-pre-wrap break-words text-[14px] font-medium leading-[1.55] text-[var(--tm-text-primary)]">{record.text}</p>
  </div>;
}
