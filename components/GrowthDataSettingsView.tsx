import React, { useMemo, useState } from 'react';
import { Button, Select, Switch, Table, Tag } from '@arco-design/web-react';
import { Database } from 'lucide-react';
import {
  PLATFORM_GROWTH_FIELD_CATALOG,
  getEnabledGrowthFieldKeys,
  setEnabledGrowthFieldKeys,
  type GrowthFieldDefinition,
  type GrowthInputFieldKey,
} from '../shared/studentGrowthFieldCatalog';

interface GrowthDataSettingsViewProps {
  spaceId: string;
}

const getFormatLabel = (field: GrowthFieldDefinition) => {
  if (field.valueType === 'single-select') return '单选';
  if (field.valueType === 'text') return '文字';
  const decimalLabel = field.decimalPlaces ? `${field.decimalPlaces}位小数` : '整数';
  return field.unit ? `${decimalLabel} · ${field.unit}` : decimalLabel;
};

const GrowthDataSettingsView: React.FC<GrowthDataSettingsViewProps> = ({ spaceId }) => {
  const [enabledKeys, setEnabledKeys] = useState<GrowthInputFieldKey[]>(() => getEnabledGrowthFieldKeys(spaceId));
  const [groupFilter, setGroupFilter] = useState('all');

  const updateEnabledKeys = (next: GrowthInputFieldKey[]) => {
    setEnabledKeys(setEnabledGrowthFieldKeys(spaceId, next));
  };

  const visibleFields = useMemo(() => (
    groupFilter === 'all'
      ? PLATFORM_GROWTH_FIELD_CATALOG
      : PLATFORM_GROWTH_FIELD_CATALOG.filter(item => item.groupKey === groupFilter)
  ), [groupFilter]);

  const groupOptions = Array.from(new Map(PLATFORM_GROWTH_FIELD_CATALOG.map(item => [item.groupKey, item.groupLabel])))
    .map(([value, label]) => ({ value, label }));

  const columns = [
    {
      title: '字段名称',
      dataIndex: 'label',
      width: 240,
      render: (value: string, record: GrowthFieldDefinition) => (
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#F2F3F5] text-[#4E5969]"><Database size={15} /></span>
          <span className="font-medium text-[#1D2129]">{value}</span>
          {record.unit && <span className="text-[12px] text-[#86909C]">{record.unit}</span>}
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'groupLabel',
      width: 160,
      render: (value: string) => <Tag color="arcoblue">{value}</Tag>,
    },
    {
      title: '数据格式',
      width: 220,
      render: (_: unknown, record: GrowthFieldDefinition) => <span className="text-[#4E5969]">{getFormatLabel(record)}</span>,
    },
    {
      title: '学校启用',
      width: 120,
      align: 'center' as const,
      render: (_: unknown, record: GrowthFieldDefinition) => {
        const checked = enabledKeys.includes(record.key);
        return (
          <Switch
            size="small"
            checked={checked}
            aria-label={`${checked ? '停用' : '启用'}${record.label}`}
            onChange={() => updateEnabledKeys(checked
              ? enabledKeys.filter(key => key !== record.key)
              : [...enabledKeys, record.key])}
          />
        );
      },
    },
  ];

  return (
    <div className="w-full px-6 py-5 text-sm text-[#4E5969]">
      <div className="mb-4">
        <div className="mb-1 flex items-center gap-2 text-[13px] text-[#86909C]"><span>数据中心</span><span>/</span><span className="text-[#4E5969]">成长数据设置</span></div>
        <h1 className="m-0 text-[20px] font-semibold leading-7 text-[#1D2129]">成长数据设置</h1>
      </div>
      <section className="overflow-hidden rounded border border-[#E5E6EB] bg-white">
        <div className="flex min-h-[64px] items-center justify-between gap-4 border-b border-[#E5E6EB] px-5">
          <div className="flex items-center gap-3">
            <Select
              value={groupFilter}
              onChange={setGroupFilter}
              style={{ width: 180 }}
              options={[{ value: 'all', label: '全部分类' }, ...groupOptions]}
            />
            <span className="text-[13px] tabular-nums text-[#86909C]">已启用 {enabledKeys.length}/{PLATFORM_GROWTH_FIELD_CATALOG.length}</span>
          </div>
          <Button disabled={enabledKeys.length === PLATFORM_GROWTH_FIELD_CATALOG.length} onClick={() => updateEnabledKeys(PLATFORM_GROWTH_FIELD_CATALOG.map(item => item.key))}>全部启用</Button>
        </div>
        <Table columns={columns} data={visibleFields} rowKey="key" pagination={false} borderCell={false} />
      </section>
    </div>
  );
};

export default GrowthDataSettingsView;
