import { Volume2 } from 'lucide-react';
import { TEACHERS, type DevelopmentRecord } from './data';
import { demoInputImage } from './demoImages';

const recordedTimeFormat = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

export default function RecordInputContent({ record }: { record: DevelopmentRecord }) {
  const recordedAt = record.recordedAt && Number.isFinite(Date.parse(record.recordedAt)) ? record.recordedAt : undefined;
  return <div className="mb-3.5">
    <time dateTime={recordedAt ?? record.date} aria-label="录入时间" className="mb-4 block text-[12px] font-medium tabular-nums text-[var(--tm-text-tertiary)]">
      {recordedAt ? recordedTimeFormat.format(new Date(recordedAt)) : record.date}
    </time>
    {record.inputType === 'voice' && <span className="mb-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--tm-record-class-soft)] px-3.5 text-[13px] font-semibold text-[var(--tm-record-class-text)]">
      <Volume2 size={16} aria-hidden="true" />
      <span>原始语音</span>
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[8, 14, 10, 16, 7].map((height, index) => <i key={index} className="w-0.5 rounded-full bg-current opacity-70" style={{ height }} />)}
      </span>
    </span>}
    {record.inputType === 'image' && record.imageSampleId ? <img
      src={demoInputImage(record.imageSampleId, TEACHERS.find(t => t.id === record.teacherId)?.name ?? '', record.date)}
      alt="录入的图片" className="max-h-[180px] max-w-full rounded-[var(--tm-radius-inner)] object-contain object-left" />
      : <p aria-label={record.inputType === 'voice' ? '语音转文字内容' : '原始文本'} className="whitespace-pre-wrap break-words text-[14px] font-medium leading-[1.55] text-[var(--tm-text-primary)]">{record.text}</p>}
  </div>;
}
