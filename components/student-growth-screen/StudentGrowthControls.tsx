import React from 'react';
import { Select } from '@arco-design/web-react';
import type { GrowthSnapshot } from './studentGrowthModel';

export function GrowthGradeSelect({ snapshot, value, onChange, label, all = true }: {
  snapshot: GrowthSnapshot; value?: string; onChange: (value?: string) => void; label: string; all?: boolean;
}) {
  return <Select className="student-growth-select" dropdownMenuClassName="student-growth-select-popup" dropdownMenuStyle={{ maxHeight: 420 }} triggerProps={{ className: 'student-growth-select-layer' }} aria-label={label}
    value={value || (all ? 'all' : snapshot.grades[0]?.id)} onChange={next => onChange(next === 'all' ? undefined : next)}
    options={[...(all ? [{ value: 'all', label: '全部年级' }] : []), ...snapshot.grades.map(grade => ({ value: grade.id, label: grade.name }))]} />;
}

export function GrowthMetricTabs({ snapshot, value, onChange, label }: {
  snapshot: GrowthSnapshot; value: string; onChange: (value: string) => void; label: string;
}) {
  return <div className="student-growth-metric-tabs" role="group" aria-label={label}>
    {['total', ...snapshot.dimensions.map(item => item.name)].map(metric => <button type="button" key={metric}
      aria-pressed={value === metric} onClick={() => onChange(metric)}>{metric === 'total' ? '综合' : metric}</button>)}
  </div>;
}
