import React from 'react';
import { Descriptions } from '@arco-design/web-react';
import type { PersonalCustomer } from './operationsCustomers';

export const personalStatisticsFields: { key: keyof PersonalCustomer['statistics']; label: string }[] = [
  { key: 'createdClassCount', label: '创建班级数' },
  { key: 'createdStudentCount', label: '创建学生数' },
  { key: 'evaluationRecordCount', label: '评价条数' },
];

export default function OperationsPersonalStatistics({ statistics }: { statistics: PersonalCustomer['statistics'] }) {
  return <Descriptions layout="vertical" tableLayout="fixed" size="small" column={{ xs: 2, md: personalStatisticsFields.length }}
    data={personalStatisticsFields.map(field => ({
      key: field.key, label: field.label, value: statistics[field.key].toLocaleString('zh-CN'),
    }))} />;
}
