import React from 'react';
import { Table } from '@arco-design/web-react';

const classColumns = [{ title: '班级名称', dataIndex: 'name' }];

export default function SchoolPcTeachingDashboard({ classNames }: { classNames: readonly string[] }) {
  return (
    <div className="h-full overflow-y-auto bg-[#f5f7fa] px-6 py-4">
      <section className="rounded border border-[var(--color-border-2)] bg-white p-6" aria-labelledby="school-pc-teaching-classes">
        <h1 id="school-pc-teaching-classes" className="mb-4 text-base font-semibold text-slate-800">班级管理</h1>
        <Table
          columns={classColumns}
          data={classNames.map(name => ({ name }))}
          rowKey="name"
          pagination={false}
          noDataElement="暂无任教班级"
        />
      </section>
    </div>
  );
}
