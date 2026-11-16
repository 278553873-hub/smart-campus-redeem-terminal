import React from 'react';
import ReportDateRangeTabs from '../../mobile-app/components/report/ReportDateRangeTabs';

type RecordSource = 'school' | 'family';
const SOURCE_OPTIONS = [{ value: 'school', label: '学校记录' }, { value: 'family', label: '家长记录' }] as const;

/** 与货柜管理共用标签组件，家长端只适配记录来源。 */
export default function ParentRecordSourceTabs({ value, onChange }: {
  value: RecordSource;
  onChange: (value: RecordSource) => void;
}) {
  return <ReportDateRangeTabs<RecordSource> value={value} items={SOURCE_OPTIONS} onChange={onChange}
    ariaLabel="记录来源" semantics="tabs" className="parent-record-source-tabs shrink-0" />;
}
