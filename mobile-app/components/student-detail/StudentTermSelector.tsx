import React from 'react';
import StudentTimeRangeSelector from './StudentTimeRangeSelector';
import type { StudentTermOption } from '../../domain/studentTerms';
export type { StudentTermOption } from '../../domain/studentTerms';

interface StudentTermSelectorProps {
  value: string;
  options: StudentTermOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  variant?: 'default' | 'glass';
}

const StudentTermSelector: React.FC<StudentTermSelectorProps> = ({
  value,
  options,
  onChange,
  ariaLabel = '选择学期',
  variant = 'default',
}) => (
  <StudentTimeRangeSelector
    shape={variant === 'glass' ? 'glass' : 'subtle'}
    value={value}
    options={options.map(option => ({
      value: option.value,
      label: variant === 'glass' ? option.label.replace(/\s+/g, '') : `${option.label}${option.isCurrent ? '（本学期）' : ''}`,
    }))}
    onChange={onChange}
    ariaLabel={ariaLabel}
  />
);

export default StudentTermSelector;
