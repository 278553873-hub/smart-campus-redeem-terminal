import React, { useMemo, useState } from 'react';
import { Check, CircleAlert, Eye, Minus } from 'lucide-react';

type VersionFilter = 'all' | 'personal' | 'school';
type PermissionState = 'allow' | 'conditional' | 'readonly' | 'deny';

type PermissionCell = {
  state: PermissionState;
  label: string;
};

type PermissionRow = {
  capability: string;
  different: boolean;
  cells: PermissionCell[];
};

type PermissionGroup = {
  index: string;
  label: string;
  rows: PermissionRow[];
};

const columns = [
  { version: 'personal' as const, role: '班主任', source: '本人创建' },
  { version: 'personal' as const, role: '副班主任', source: '受邀协作' },
  { version: 'personal' as const, role: '普通老师', source: '受邀协作' },
  { version: 'school' as const, role: '班主任', source: '学校班级' },
  { version: 'school' as const, role: '副班主任', source: '学校班级' },
  { version: 'school' as const, role: '普通老师', source: '学校班级' },
];

const allow = (label = '可以'): PermissionCell => ({ state: 'allow', label });
const conditional = (label: string): PermissionCell => ({ state: 'conditional', label });
const readonly = (label = '只读'): PermissionCell => ({ state: 'readonly', label });
const deny = (label = '不可以'): PermissionCell => ({ state: 'deny', label });

const permissionGroups: PermissionGroup[] = [
  {
    index: '01',
    label: '班级来源与归属',
    rows: [
      {
        capability: '可见班级范围',
        different: true,
        cells: [
          allow('本人创建班级'),
          conditional('受邀协作班级'),
          conditional('受邀协作班级'),
          allow('当前学校班级'),
          allow('当前学校班级'),
          allow('当前学校班级'),
        ],
      },
      {
        capability: '创建班级',
        different: true,
        cells: [
          conditional('仅本人来源'),
          deny('当前来源不可'),
          deny('当前来源不可'),
          deny(),
          deny(),
          deny(),
        ],
      },
      {
        capability: '加入班级',
        different: true,
        cells: [
          conditional('仅本人来源'),
          deny('当前来源不可'),
          deny('当前来源不可'),
          deny(),
          deny(),
          deny(),
        ],
      },
      {
        capability: '查看班级详情',
        different: true,
        cells: [allow(), allow(), readonly(), allow(), allow(), readonly()],
      },
      {
        capability: '退出班级',
        different: true,
        cells: [deny(), allow(), allow(), allow(), allow(), allow()],
      },
      {
        capability: '解散班级',
        different: true,
        cells: [allow(), deny(), deny(), deny('学校统一管理'), deny(), deny()],
      },
    ],
  },
  {
    index: '02',
    label: '日常操作',
    rows: [
      {
        capability: '查看学生列表',
        different: false,
        cells: [allow(), allow(), allow(), allow(), allow(), allow()],
      },
      {
        capability: '查看班级报告',
        different: false,
        cells: [allow(), allow(), allow(), allow(), allow(), allow()],
      },
      {
        capability: '作业录入',
        different: false,
        cells: [allow(), allow(), allow(), allow(), allow(), allow()],
      },
      {
        capability: '兑换奖励',
        different: false,
        cells: [allow(), allow(), allow(), allow(), allow(), allow()],
      },
      {
        capability: '查看班级排行榜',
        different: true,
        cells: [
          deny('不提供'),
          deny('不提供'),
          deny('不提供'),
          conditional('学校开启后可用'),
          conditional('学校开启后可用'),
          conditional('学校开启后可用'),
        ],
      },
    ],
  },
  {
    index: '03',
    label: '学生与班级管理',
    rows: [
      {
        capability: '编辑班级基本信息',
        different: true,
        cells: [allow(), allow(), deny(), allow(), allow(), deny()],
      },
      {
        capability: '批量修改学生',
        different: true,
        cells: [allow(), allow(), deny(), allow(), allow(), deny()],
      },
      {
        capability: '更新人脸数据',
        different: true,
        cells: [allow(), allow(), deny(), allow(), allow(), deny()],
      },
      {
        capability: '设置兑换密码',
        different: true,
        cells: [allow(), allow(), deny(), allow(), allow(), deny()],
      },
      {
        capability: '离校学生管理',
        different: true,
        cells: [allow(), allow(), deny(), allow(), allow(), deny()],
      },
    ],
  },
  {
    index: '04',
    label: '老师与家长协同',
    rows: [
      {
        capability: '查看老师列表',
        different: true,
        cells: [allow(), allow(), readonly(), allow(), allow(), readonly()],
      },
      {
        capability: '邀请老师',
        different: true,
        cells: [allow(), allow(), deny(), allow(), allow(), deny()],
      },
      {
        capability: '查看家长绑定情况',
        different: true,
        cells: [allow(), allow(), readonly(), allow(), allow(), readonly()],
      },
      {
        capability: '邀请家长',
        different: true,
        cells: [allow(), allow(), deny(), allow(), allow(), deny()],
      },
      {
        capability: '维护家长绑定关系',
        different: true,
        cells: [allow(), allow(), deny(), allow(), allow(), deny()],
      },
    ],
  },
  {
    index: '05',
    label: '班主任专属管理',
    rows: [
      {
        capability: '设置或取消副班主任',
        different: true,
        cells: [allow(), deny(), deny(), allow(), deny(), deny()],
      },
      {
        capability: '移除老师',
        different: true,
        cells: [allow(), deny(), deny(), allow(), deny(), deny()],
      },
      {
        capability: '转移班主任',
        different: true,
        cells: [allow(), deny(), deny(), allow(), deny(), deny()],
      },
    ],
  },
];

const stateStyles: Record<PermissionState, string> = {
  allow: 'bg-emerald-50 text-emerald-700',
  conditional: 'bg-amber-50 text-amber-700',
  readonly: 'bg-blue-50 text-blue-700',
  deny: 'bg-gray-100 text-gray-400',
};

const StateIcon = ({ state }: { state: PermissionState }) => {
  const iconProps = { size: 12, strokeWidth: 2.5, 'aria-hidden': true };

  if (state === 'allow') return <Check {...iconProps} />;
  if (state === 'conditional') return <CircleAlert {...iconProps} />;
  if (state === 'readonly') return <Eye {...iconProps} />;
  return <Minus {...iconProps} />;
};

const TeacherPermissionMatrix = () => {
  const [versionFilter, setVersionFilter] = useState<VersionFilter>('all');
  const [differencesOnly, setDifferencesOnly] = useState(false);

  const visibleColumnIndexes = useMemo(
    () => columns
      .map((column, index) => ({ column, index }))
      .filter(({ column }) => versionFilter === 'all' || column.version === versionFilter)
      .map(({ index }) => index),
    [versionFilter],
  );

  const visibleGroups = useMemo(
    () => permissionGroups
      .map((group) => ({
        ...group,
        rows: differencesOnly ? group.rows.filter((row) => row.different) : group.rows,
      }))
      .filter((group) => group.rows.length > 0),
    [differencesOnly],
  );

  const visibleVersions = versionFilter === 'all'
    ? (['personal', 'school'] as const)
    : ([versionFilter] as const);

  return (
    <section className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200 px-5 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-black">教师端班级权限对比</h2>
          <p className="mt-0.5 truncate text-xs font-medium text-gray-500">个人版与学校版 · 班主任、副班主任、普通老师</p>
        </div>
        <span className="shrink-0 text-xs font-bold text-gray-400">24 项权限</span>
      </header>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="grid grid-cols-3 rounded-md border border-gray-200 bg-gray-50 p-0.5" aria-label="选择版本">
            {([
              ['all', '全部'],
              ['personal', '个人版'],
              ['school', '学校版'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={versionFilter === value}
                onClick={() => setVersionFilter(value)}
                className={`h-8 min-w-16 rounded px-3 text-xs font-bold transition-colors ${
                  versionFilter === value ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={differencesOnly}
            onClick={() => setDifferencesOnly((current) => !current)}
            className="flex h-9 items-center gap-2 rounded px-1 text-xs font-bold text-gray-700"
          >
            <span className={`relative h-5 w-9 rounded-full transition-colors ${differencesOnly ? 'bg-emerald-600' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${differencesOnly ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
            </span>
            仅看差异
          </button>
        </div>

        <div className="hidden items-center gap-3 text-[11px] font-bold text-gray-500 lg:flex" aria-label="权限状态图例">
          {([
            ['allow', '可以'],
            ['conditional', '有条件'],
            ['readonly', '只读'],
            ['deny', '不可以'],
          ] as const).map(([state, label]) => (
            <span key={state} className="flex items-center gap-1">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full ${stateStyles[state]}`}>
                <StateIcon state={state} />
              </span>
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto" role="region" aria-label="教师端班级权限对照表" tabIndex={0}>
        <table className={`w-full table-fixed border-separate border-spacing-0 ${versionFilter === 'all' ? 'min-w-[1080px]' : 'min-w-[620px]'}`}>
          <caption className="sr-only">个人版、学校版中班主任、副班主任与普通老师的班级权限对照</caption>
          <colgroup>
            <col className="w-[180px]" />
            {visibleColumnIndexes.map((columnIndex) => <col key={columnIndex} className="w-[150px]" />)}
          </colgroup>
          <thead>
            <tr>
              <th rowSpan={2} scope="col" className="sticky left-0 top-0 z-30 border-b border-r border-gray-300 bg-gray-900 px-4 text-left text-xs font-black text-white">
                能力
              </th>
              {visibleVersions.map((version) => (
                <th
                  key={version}
                  colSpan={3}
                  scope="colgroup"
                  className={`sticky top-0 z-20 h-10 border-b border-r border-gray-200 text-sm font-black ${
                    version === 'personal' ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-blue-800'
                  }`}
                >
                  {version === 'personal' ? '个人版' : '学校版'}
                </th>
              ))}
            </tr>
            <tr>
              {visibleColumnIndexes.map((columnIndex) => {
                const column = columns[columnIndex];
                return (
                  <th key={columnIndex} scope="col" className="sticky top-10 z-20 h-12 border-b border-r border-gray-200 bg-gray-50 px-2 text-xs font-black text-gray-800">
                    {column.role}
                    <span className="mt-0.5 block text-[10px] font-medium text-gray-400">{column.source}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          {visibleGroups.map((group) => (
            <tbody key={group.index}>
              <tr>
                <th colSpan={visibleColumnIndexes.length + 1} scope="rowgroup" className="border-b border-gray-200 bg-gray-100 px-4 py-2 text-left text-[11px] font-black text-gray-600">
                  <span className="mr-3 font-black text-emerald-700">{group.index}</span>
                  {group.label}
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.capability} className="group">
                  <th scope="row" className="sticky left-0 z-10 border-b border-r border-gray-200 bg-white px-4 py-2.5 text-left text-xs font-black text-gray-800 group-hover:bg-gray-50">
                    {row.capability}
                  </th>
                  {visibleColumnIndexes.map((columnIndex) => {
                    const cell = row.cells[columnIndex];
                    return (
                      <td key={columnIndex} className="border-b border-r border-gray-200 px-2 py-2.5 text-center group-hover:bg-gray-50">
                        <span className={`inline-flex max-w-full items-center justify-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-bold ${stateStyles[cell.state]}`}>
                          <StateIcon state={cell.state} />
                          <span>{cell.label}</span>
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </section>
  );
};

export default TeacherPermissionMatrix;
