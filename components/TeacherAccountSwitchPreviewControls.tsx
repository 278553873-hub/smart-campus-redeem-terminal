import { useState } from 'react';
import { DEMO_UNREGISTERED_TEACHER_PHONE, type DemoTeacherAccount } from '../shared/demoTeacherAccounts';
import PreviewSegmentTrack from './PreviewSegmentTrack';
import TeacherDemoSearchExample from './TeacherDemoSearchExample';

const registrationOptions = [
  { registered: true, label: '已注册' },
  { registered: false, label: '未注册' },
] as const;

export default function TeacherAccountSwitchPreviewControls({ account }: { account: DemoTeacherAccount }) {
  const [registered, setRegistered] = useState(true);

  return (
    <TeacherDemoSearchExample
      label="问题排查演示手机号"
      title="问题排查预览"
      instruction={registered ? `输入下方手机号，确认后切换到${account.name}。` : '输入下方手机号，确认后查看未注册提示。'}
      example={registered ? account.phone : DEMO_UNREGISTERED_TEACHER_PHONE}
      controls={(
        <PreviewSegmentTrack index={registered ? 0 : 1} count={registrationOptions.length} className="grid grid-cols-2 rounded-lg bg-slate-100 p-1" role="group" aria-label="演示手机号注册状态">
          {registrationOptions.map(option => (
            <button
              key={option.label}
              type="button"
              aria-pressed={registered === option.registered}
              onClick={() => setRegistered(option.registered)}
              className={`min-h-9 rounded-md px-1 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1 ${registered === option.registered ? 'text-rose-700' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {option.label}
            </button>
          ))}
        </PreviewSegmentTrack>
      )}
    />
  );
}
