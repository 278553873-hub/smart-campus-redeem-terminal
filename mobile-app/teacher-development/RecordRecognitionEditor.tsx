import React, { useState } from 'react';
import { Check } from 'lucide-react';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileDateCalendar from '../components/ui/MobileDateCalendar';
import MobileSearchInput from '../components/ui/MobileSearchInput';
import { ALL_PERIODS, TEACHERS, type DevelopmentIndicator, type DevelopmentRecord } from './data';
import { recordDistinguishesLevels, recordLevel, RECORD_LEVELS } from './recordLevels';
import RecordLevelBadge from './RecordLevelBadge';
import { recordMatter } from './recordMatter';
import { canUseRecordIndicator, recognitionFieldNames, type RecognitionField, type RecordCorrection } from './recordCorrections';
import { bodyClass, fieldClass, metaClass, primaryAction } from './ui';

interface Props {
  record: DevelopmentRecord;
  indicator: DevelopmentIndicator;
  indicators?: DevelopmentIndicator[];
  actorId: string;
  field: RecognitionField;
  periods?: ReadonlyArray<{ start: string; end: string }>;
  onSave: (correction: RecordCorrection) => string;
  onClose: () => void;
}

/** 识别结果逐项编辑，共用公共弹层、日历、输入框和搜索组件。 */
export default function RecordRecognitionEditor({ record, indicator, indicators = [indicator], actorId, field, periods = ALL_PERIODS, onSave, onClose }: Props) {
  const [value, setValue] = useState(() => field === 'date' ? record.date : field === 'teacher' ? record.teacherId : field === 'indicator' ? record.indicatorId : field === 'level' ? recordLevel(record, indicator) ?? (recordDistinguishesLevels(record, indicator) ? '' : '个人') : field === 'matter' ? recordMatter(record) : String(record.delta));
  const [reason, setReason] = useState(record.scoreAdjustment?.reason ?? '');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const update = (value: string) => { setValue(value); setError(''); };
  const save = () => {
    if (!value.trim()) { setError(`请填写或选择${recognitionFieldNames[field]}。`); return; }
    const correction: RecordCorrection = field === 'score' ? { field, value: Number(value), reason } : { field, value };
    const error = onSave(correction);
    if (error) setError(error);
  };
  const teachers = TEACHERS.filter(teacher => `${teacher.name}${teacher.subject}${teacher.grade}`.includes(search.trim()));
  const choices = indicators.filter(item => canUseRecordIndicator(item, actorId, record.teacherId) && `${item.dimension}${item.name}`.includes(search.trim()));
  const selectedIndicator = field === 'indicator' ? indicators.find(item => item.id === value) ?? indicator : indicator;
  const originalTeacher = TEACHERS.find(teacher => teacher.id === (record.inputContext?.teacherId ?? record.teacherId));
  const choiceClass = 'flex min-h-[var(--tm-size-touch)] w-full items-center gap-3 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tm-brand-primary)]';
  return <MobileBottomSheet open title={field === 'score' ? '修改分数' : `修改${recognitionFieldNames[field]}`} onClose={onClose} size={field === 'teacher' || field === 'indicator' ? 'tall' : 'content'} footer={<button type="button" onClick={save} className={primaryAction}>{selectedIndicator.requiresReview ? '保存并重新送审' : '保存'}</button>}>
    <div className="space-y-4">
      {field === 'date' && <>
        {record.date.length === 7 && <p className={metaClass}>原记录仅到月份，请核实后选择具体日期。</p>}
        <MobileDateCalendar value={{ start: value, end: value }} initialDate={`${record.date.slice(0, 7)}-01`} min={periods.map(period => period.start).sort()[0]} max={periods.map(period => period.end).sort().at(-1)} onSelect={update} />
      </>}
      {field === 'teacher' && <>
        <MobileSearchInput aria-label="搜索教师" placeholder="姓名、学科、年级" value={search} onChange={event => setSearch(event.target.value)} />
        <div role="group" aria-label="评价对象">{teachers.map(teacher => <button key={teacher.id} type="button" aria-pressed={value === teacher.id} onClick={() => update(teacher.id)} className={choiceClass}><span className="min-w-0 flex-1"><span className={bodyClass}>{teacher.name}</span><span className={`ml-3 ${metaClass}`}>{teacher.subject} · {teacher.grade}</span></span>{value === teacher.id && <Check size={18} className="text-[var(--tm-brand-primary)]" aria-hidden="true" />}</button>)}{!teachers.length && <p className={metaClass}>未找到匹配的教师。</p>}</div>
        {record.inputType === 'image' && value !== originalTeacher?.id && <p className={metaClass}>原图片中的教师为{originalTeacher?.name}，请核对本次记录归属。</p>}
      </>}
      {field === 'indicator' && <>
        <MobileSearchInput aria-label="搜索指标" placeholder="指标名称、维度" value={search} onChange={event => setSearch(event.target.value)} />
        <p className={metaClass}>更换指标后，按新指标重新计分和审核，原分数调整不再沿用。</p>
        <div role="group" aria-label="选择指标">{choices.map(item => <button key={item.id} type="button" aria-pressed={value === item.id} onClick={() => update(item.id)} className={choiceClass}><span className="min-w-0 flex-1"><span className={`block ${bodyClass}`}>{item.name}</span><span className={`block ${metaClass}`}>{item.dimension}</span></span>{value === item.id && <Check size={18} className="text-[var(--tm-brand-primary)]" aria-hidden="true" />}</button>)}{!choices.length && <p className={metaClass}>未找到可选指标。</p>}</div>
      </>}
      {field === 'level' && <div role="group" aria-label="选择级别">{RECORD_LEVELS.map(level => <button key={level.name} type="button" aria-pressed={value === level.name} onClick={() => update(level.name)} className={choiceClass}><RecordLevelBadge record={{ ...record, level: level.name, distinguishLevels: true, fieldSnapshot: undefined }} /><span className={`flex-1 ${bodyClass}`}>{level.name}</span>{value === level.name && <Check size={18} className="text-[var(--tm-brand-primary)]" aria-hidden="true" />}</button>)}</div>}
      {field === 'matter' && <label className="block"><span className={`mb-2 block ${bodyClass}`}>事项内容</span><textarea rows={6} className={`${fieldClass} resize-y`} value={value} onChange={event => update(event.target.value)} /></label>}
      {field === 'score' && <>
        <label className="block"><span className={`mb-2 block ${bodyClass}`}>本次记录分数</span><input type="number" inputMode="decimal" step="0.01" className={fieldClass} value={value} onChange={event => update(event.target.value)} /></label>
        <section aria-label="打分依据" className="space-y-2"><h3 className="text-[length:var(--tm-font-size-card-title)] font-semibold">打分依据</h3><p className={bodyClass}>{indicator.rule}</p>{record.rule !== indicator.rule && <p className={metaClass}>本次识别结果：{record.rule}</p>}<p className={metaClass}>指标基础{indicator.base}分 · 上限{indicator.upper}分 · 下限{indicator.lower}分</p></section>
        <label className="block"><span className={`mb-2 block ${bodyClass}`}>调整说明（选填）</span><textarea rows={2} className={fieldClass} placeholder="填写本次分数调整的依据" value={reason} onChange={event => setReason(event.target.value)} /></label>
      </>}
      {error && <p role="alert" className={`${bodyClass} text-[var(--tm-status-negative-strong)]`}>{error}</p>}
    </div>
  </MobileBottomSheet>;
}
