import React from 'react';
import { Code2 } from 'lucide-react';

interface TeacherMobileDeveloperNotesProps {
  open: boolean;
  onToggle: () => void;
}

const developerRules = [
  { label: '响应式', value: '< 480px：4列；≥ 480px：5列' },
  { label: '判断范围', value: '按选择内容区宽度，不按浏览器窗口' },
  { label: '卡片', value: '最小高76px；间距8px；无边框、无阴影' },
  { label: '选择角标', value: '18×18px；卡片右上外移4px' },
  { label: '常驻信息', value: '48px头像、两位班内号、姓名' },
  { label: '不展示', value: '等级、表扬/批评次数、性别' },
] as const;

const TeacherMobileDeveloperNotes: React.FC<TeacherMobileDeveloperNotesProps> = ({ open, onToggle }) => (
  <div className="flex w-full flex-col items-end gap-2">
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={open}
      aria-controls="teacher-mobile-developer-notes"
      className="flex min-h-11 w-full items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-slate-700 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-colors active:bg-slate-50"
    >
      <Code2 className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
      <span className="min-w-0 flex-1 text-left text-[12px] font-black">开发标注</span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors ${open ? 'bg-slate-900' : 'bg-slate-200'}`} aria-hidden="true">
        <span className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${open ? 'translate-x-5' : 'translate-x-0'}`} />
      </span>
    </button>

    {open && (
      <aside
        id="teacher-mobile-developer-notes"
        aria-label="教师手机端开发标注"
        className="w-[300px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200/80 bg-white/95 p-4 text-slate-700 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.45)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">页面规则</span>
          <h2 className="text-[14px] font-black text-slate-900">选择学生</h2>
        </div>
        <dl className="mt-3 space-y-2">
          {developerRules.map(rule => (
            <div key={rule.label} className="grid grid-cols-[64px_minmax(0,1fr)] gap-2 text-[11px] leading-4">
              <dt className="font-bold text-slate-500">{rule.label}</dt>
              <dd className="font-semibold text-slate-700">{rule.value}</dd>
            </div>
          ))}
        </dl>
      </aside>
    )}
  </div>
);

export default TeacherMobileDeveloperNotes;
