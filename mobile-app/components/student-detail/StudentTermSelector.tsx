import React from 'react';
import StudentTimeRangeSelector from './StudentTimeRangeSelector';

export interface StudentTermOption {
  value: string;
  label: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

interface StudentTermSelectorProps {
  value: string;
  options: StudentTermOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
}

const StudentTermSelector: React.FC<StudentTermSelectorProps> = ({
  value,
  options,
  onChange,
  ariaLabel = '选择学期',
}) => (
  <StudentTimeRangeSelector
    value={value}
    options={options.map(option => ({
      value: option.value,
      label: `${option.label}${option.isCurrent ? '（本学期）' : ''}`,
    }))}
    onChange={onChange}
    ariaLabel={ariaLabel}
  />
);

export default StudentTermSelector;
