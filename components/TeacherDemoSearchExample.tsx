import { Search } from 'lucide-react';

interface TeacherDemoSearchExampleProps {
  label: string;
  title: string;
  instruction: string;
  example: string;
}

export default function TeacherDemoSearchExample({ label, title, instruction, example }: TeacherDemoSearchExampleProps) {
  return (
    <aside aria-label={label} className="w-full rounded-2xl border border-slate-200/80 bg-white/95 p-4 text-slate-700 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.45)] backdrop-blur-xl">
      <div className="flex items-center gap-2 text-slate-900">
        <Search className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
        <h2 className="text-[13px] font-black">{title}</h2>
      </div>
      <p className="mt-2 text-[11px] font-semibold leading-4 text-slate-500">{instruction}</p>
      <div className="mt-3 rounded-xl bg-slate-100 px-3 py-2.5 text-center text-[15px] font-black text-slate-900">{example}</div>
    </aside>
  );
}
