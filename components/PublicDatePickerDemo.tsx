import React, { useMemo, useState } from 'react';
import MobileDatePickerSheet, { type MobileDateRange } from '../mobile-app/components/ui/MobileDatePickerSheet';
import { dateRangePresets, type MobileDateRangePreset } from '../mobile-app/components/ui/mobileDatePickerModel';
import { teacherBrandCssVariables } from '../mobile-app/styles/teacherMobileTokens';
import PhoneMockup from './PhoneMockup';

// 演示快照；真实页面使用当天日期与学校配置的学期边界。
const demoToday = '2026-10-14';
const schoolTerm = { start: '2026-09-01', end: '2027-01-31' };
const quickRangeOptions: ReadonlyArray<MobileDateRangePreset & { id: string }> = [
  ...dateRangePresets(demoToday, schoolTerm).slice(0, 4).map((preset, index) => ({ ...preset, id: ['this-week', 'this-month', 'last-week', 'last-month'][index] })),
  { id: 'this-term', label: '本学期', value: schoolTerm },
];

const parameterRows = [
  ['mode', "'range'", '日期范围选择模式。'],
  ['value', 'MobileDateRange', '当前起止日期，格式为 YYYY-MM-DD。'],
  ['showPresets', 'boolean', '是否显示快捷选项，默认显示。'],
  ['presets', 'MobileDateRangePreset[]', '需要显示的快捷项列表；传空数组可隐藏全部快捷项。'],
  ['currentTerm', 'MobileDateRange', '当前学期起止日期，供本学期快捷项使用。'],
  ['min / max', 'string', '可选日期上下限。'],
  ['onConfirm / onClose', 'function', '确认日期范围与关闭弹窗的回调。'],
  ['validate', '(range) => string', '可选业务校验；返回提示文字表示范围不可提交。'],
] as const;

const usageExample = `<MobileDatePickerSheet
  mode="range"
  open={open}
  value={dateRange}
  showPresets={showQuickRanges}
  presets={selectedQuickRanges}
  currentTerm={schoolTerm}
  onConfirm={setDateRange}
  onClose={() => setOpen(false)}
/>`;

const PreviewToggle: React.FC<{ checked: boolean; label: string; onChange: (checked: boolean) => void }> = ({ checked, label, onChange }) => (
  <label className="flex min-h-9 cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
    <input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="h-4 w-4 accent-[var(--tm-brand-primary)]" />
    {label}
  </label>
);

export default function PublicDatePickerDemo() {
  const [open, setOpen] = useState(true);
  const [range, setRange] = useState<MobileDateRange>({ start: '2026-10-01', end: demoToday });
  const [showQuickRanges, setShowQuickRanges] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>(quickRangeOptions.map(option => option.id));
  const selectedQuickRanges = useMemo(() => quickRangeOptions.filter(option => selectedIds.includes(option.id)).map(({ label, value }) => ({ label, value })), [selectedIds]);
  const valueLabel = `${range.start} 至 ${range.end}`;
  const toggleQuickRange = (id: string, checked: boolean) => setSelectedIds(current => checked ? [...current, id] : current.filter(item => item !== id));

  return (
    <section className="grid min-h-0 grid-cols-[440px_minmax(0,1fr)] overflow-hidden max-[1120px]:grid-cols-1 max-[1120px]:overflow-y-auto" aria-label="日期选择器组件说明" style={teacherBrandCssVariables as React.CSSProperties}>
      <div className="relative min-h-0 overflow-hidden max-[1120px]:h-[740px]">
        <div className="absolute inset-y-4 left-[46%] w-[900px] -translate-x-1/2">
          <PhoneMockup showDeviceFrame contentTopInsetMode="status-bar" screenOverlayRootId="teacher-mobile-overlay-root">
            <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[var(--tm-bg-page)] p-6">
              <p className="text-[length:var(--tm-font-size-body)] text-[var(--tm-text-primary)]">{valueLabel}</p>
              <button type="button" onClick={() => setOpen(true)} className="min-h-11 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-5 text-[var(--tm-text-inverse)]">选择时间段</button>
            </div>
          </PhoneMockup>
        </div>
      </div>
      <article className="min-h-0 overflow-y-auto border-l border-slate-200 bg-white px-8 py-7 max-[1120px]:overflow-visible max-[1120px]:border-l-0 max-[1120px]:border-t max-[720px]:px-5">
        <header className="pb-6">
          <p className="text-xs font-semibold text-[var(--tm-brand-primary-strong)]">通用组件层 · 教师手机端</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">MobileDatePickerSheet</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">用于手机端日期范围选择，支持滚轮编辑、快捷日期和确认后提交。</p>
        </header>

        <section className="border-t border-slate-200 py-5" aria-labelledby="date-picker-preview-config">
          <h3 id="date-picker-preview-config" className="text-sm font-semibold text-slate-950">预览配置</h3>
          <div className="mt-3 flex flex-col gap-1">
            <PreviewToggle checked={showQuickRanges} label="显示快捷选项" onChange={setShowQuickRanges} />
          </div>
          {showQuickRanges && <fieldset className="mt-2">
            <legend className="sr-only">快捷范围</legend>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {quickRangeOptions.map(option => <PreviewToggle key={option.id} checked={selectedIds.includes(option.id)} label={option.label} onChange={checked => toggleQuickRange(option.id, checked)} />)}
            </div>
          </fieldset>}
        </section>

        <section className="border-t border-slate-200 py-5" aria-labelledby="date-picker-scenarios">
          <h3 id="date-picker-scenarios" className="text-sm font-semibold text-slate-950">使用场景</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">班级记录筛选、教师评价报表、学校报表和排行榜等需要限定起止日期的查询。可按业务显示本周、本月、上周、上月和本学期快捷范围。</p>
        </section>

        <section className="border-t border-slate-200 py-5" aria-labelledby="date-picker-parameters">
          <h3 id="date-picker-parameters" className="text-sm font-semibold text-slate-950">核心入参</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full table-fixed border-collapse text-left text-xs leading-5">
              <thead><tr className="border-b border-slate-200 text-slate-500"><th className="w-[27%] py-2 pr-3 font-medium">参数</th><th className="w-[34%] py-2 pr-3 font-medium">类型</th><th className="py-2 font-medium">用途</th></tr></thead>
              <tbody>{parameterRows.map(([name, type, description]) => <tr key={name} className="border-b border-slate-100 align-top last:border-0"><td className="[overflow-wrap:anywhere] py-2.5 pr-3 font-mono font-semibold text-slate-800">{name}</td><td className="[overflow-wrap:anywhere] py-2.5 pr-3 font-mono text-slate-500">{type}</td><td className="py-2.5 text-slate-600">{description}</td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="border-t border-slate-200 py-5" aria-labelledby="date-picker-usage">
          <h3 id="date-picker-usage" className="text-sm font-semibold text-slate-950">使用示例</h3>
          <pre className="mt-3 overflow-x-auto rounded-[var(--tm-radius-control)] bg-slate-950 p-4 text-xs leading-5 text-slate-100"><code>{usageExample}</code></pre>
          <p className="mt-3 text-xs leading-5 text-slate-500">`presets` 控制具体显示哪些快捷范围，学期日期由调用方提供。</p>
        </section>
        <p className="mb-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-700" role="status">当前已提交：{valueLabel}</p>
      </article>
      <MobileDatePickerSheet open={open} mode="range" value={range} showPresets={showQuickRanges} presets={selectedQuickRanges} onConfirm={setRange} onClose={() => setOpen(false)} />
    </section>
  );
}
