import { DEMO_TEACHER_PREVIEW_SECURITY_CODE } from '../shared/demoTeacherSupportAccess';
import PreviewSegmentTrack from './PreviewSegmentTrack';

const options = [
  { enabled: true, label: '是' },
  { enabled: false, label: '否' },
] as const;

interface Props {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  multipleAccounts: boolean;
  onMultipleAccountsChange: (multiple: boolean) => void;
}

const optionClass = (selected: boolean) => `min-h-9 rounded-md px-1 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1 ${selected ? 'text-rose-700' : 'text-slate-600 hover:text-slate-800'}`;

function PreviewOptions({ label, value, onChange }: { label: string; value: boolean | undefined; onChange: (selected: boolean) => void }) {
  return (
    <PreviewSegmentTrack index={value === undefined ? -1 : value ? 0 : 1} count={options.length} className="mt-2 grid grid-cols-2 rounded-lg bg-slate-100 p-1" role="group" aria-label={label}>
      {options.map(option => (
        <button key={option.label} type="button" aria-pressed={value === option.enabled} className={optionClass(value === option.enabled)} onClick={() => onChange(option.enabled)}>
          {option.label}
        </button>
      ))}
    </PreviewSegmentTrack>
  );
}

interface RegistrationProps {
  registered: boolean;
  onChange: (registered: boolean) => void;
  codeEntered: boolean | undefined;
  onCodeEnteredChange: (entered: boolean) => void;
}

export function TeacherSupportRegistrationPreviewControls({ registered, onChange, codeEntered, onCodeEnteredChange }: RegistrationProps) {
  return (
    <section className="rounded-lg border border-slate-200/80 bg-white/95 p-3">
      <h2 className="text-[13px] font-semibold text-slate-800">输入的手机号是否注册</h2>
      <PreviewOptions label="输入的手机号是否注册" value={registered} onChange={onChange} />
      {registered && (
        <div className="mt-3">
          <h3 className="text-[13px] font-semibold text-slate-800">是否输入过安全码</h3>
          <PreviewOptions label="是否输入过安全码" value={codeEntered} onChange={onCodeEnteredChange} />
          {codeEntered === false && <p className="mt-2 text-[11px] text-slate-600">{`预览安全码：${DEMO_TEACHER_PREVIEW_SECURITY_CODE}`}</p>}
        </div>
      )}
    </section>
  );
}

export default function TeacherAccountSwitchPreviewControls({ enabled, onChange, multipleAccounts, onMultipleAccountsChange }: Props) {
  return (
    <div className="w-full space-y-3">
      <section className="rounded-lg border border-slate-200/80 bg-white/95 p-3" aria-label="排查身份预览">
        <h2 className="text-[13px] font-semibold text-slate-800">当前账号是排查人员</h2>
        <PreviewOptions label="当前账号是排查人员" value={enabled} onChange={onChange} />
      </section>
      <section className="rounded-lg border border-slate-200/80 bg-white/95 p-3">
        <h2 className="text-[13px] font-semibold text-slate-800">当前设备已登录多个账号</h2>
        <PreviewOptions label="当前设备已登录多个账号" value={multipleAccounts} onChange={onMultipleAccountsChange} />
      </section>
    </div>
  );
}
