import React from 'react';
import { Image, Mic, Type } from 'lucide-react';
import { MobileCard } from '../components/ui/MobileCard';
import type { DevelopmentIndicator, DevelopmentRecord } from './data';
import { EmptyState, ScoreChange, StatusLabel } from './ui';
import { recordFieldRows } from './indicatorFields';
import RecordLevelBadge from './RecordLevelBadge';

interface Props {
  records: DevelopmentRecord[];
  indicators: DevelopmentIndicator[];
  filtered: boolean;
  onOpen: (record: DevelopmentRecord) => void;
}

/** 档案查询使用紧凑时光轴；录入和审核仍由记录页负责。 */
export default function ArchiveTimeline({ records, indicators, filtered, onOpen }: Props) {
  if (!records.length) return <MobileCard><EmptyState title={filtered ? '没有符合条件的记录' : '本期暂无成长记录'} description={filtered ? '调整指标、级别或成果类别后再试。' : '在“记录”中说一件事、输入文字或上传图片。'} /></MobileCard>;
  const months = new Map<string, DevelopmentRecord[]>();
  [...records].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).forEach(record => {
    const month = record.date.slice(0, 7);
    months.set(month, [...(months.get(month) ?? []), record]);
  });
  const indicatorNames = Object.fromEntries(indicators.map(item => [item.id, item.name]));
  return <div className="td-timeline">
    {[...months].map(([month, entries]) => <section key={month} aria-label={`${month.replace('-', '年')}月成长记录`}>
      <h3 className="td-timeline-month"><strong>{Number(month.slice(5))}月</strong><span>{month.slice(0, 4)}</span><span>{entries.length}条记录</span></h3>
        <ol className="td-timeline-list">{entries.map(record => <li key={record.id} className="td-timeline-event">
            <time id={`archive-date-${record.id}`} dateTime={record.date} aria-label={record.date} className="td-timeline-date"><strong>{record.date.length === 7 ? Number(record.date.slice(5)) : record.date.slice(8)}</strong><span>{record.date.length === 7 ? '月' : '日'}</span></time>
          <button type="button" onClick={() => onOpen(record)} className="td-event-card" aria-labelledby={`archive-date-${record.id} archive-heading-${record.id} archive-text-${record.id} archive-meta-${record.id}`}>
              <div id={`archive-heading-${record.id}`} className="td-event-heading"><div className="flex min-w-0 items-center gap-2"><RecordLevelBadge record={record} indicator={indicators.find(i => i.id === record.indicatorId)} reserveSpace /><h4>{indicatorNames[record.indicatorId] ?? '成长记录'}</h4></div><span className="td-event-result" data-status={record.status} data-negative={record.status === 'approved' && record.delta < 0} data-neutral={record.delta === 0}>{record.status === 'approved' ? <ScoreChange delta={record.delta} /> : <StatusLabel record={record} />}</span></div>
              <p id={`archive-text-${record.id}`} className="td-event-text">{record.inputType === 'image' ? record.title : record.text}</p>
              <div id={`archive-meta-${record.id}`} className="td-event-meta">
                {record.status === 'approved' && <StatusLabel record={record} />}
                {recordFieldRows(record, indicators.find(i => i.id === record.indicatorId)).filter(field => field.key === 'contribution').map(field => <span key={field.key}>{field.display}</span>)}
                <span className="td-event-source">{record.inputType === 'voice' ? <Mic size={12} aria-hidden="true" /> : record.inputType === 'image' ? <Image size={12} aria-hidden="true" /> : <Type size={12} aria-hidden="true" />}{record.inputType === 'voice' ? '语音' : record.inputType === 'image' ? '图片' : '文本'}</span>
              </div>
          </button>
        </li>)}</ol>
    </section>)}
  </div>;
}
