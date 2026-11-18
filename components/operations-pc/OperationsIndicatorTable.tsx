import React from 'react';
import { Empty, Table } from '@arco-design/web-react';
import { getIndicatorScheme } from './operationsCustomers';

export default function OperationsIndicatorTable({ indicatorId }: { indicatorId: string }) {
  const scheme = getIndicatorScheme(indicatorId);
  if (!scheme) return <Empty description="尚未选择评价指标" />;
  return <div>
    <div className="ops-scheme-meta"><strong>{scheme.name}</strong><span>{scheme.version}</span><span>{scheme.items.length}项三级指标</span></div>
    <Table
      rowKey="id" border={false} size="small" pagination={false} data={scheme.items}
      columns={[
        { title: '一级指标', dataIndex: 'level1' },
        { title: '二级指标', dataIndex: 'level2' },
        { title: '三级指标', dataIndex: 'level3' },
      ]}
    />
  </div>;
}
