import React, { useState } from 'react';
import { Check, ChevronLeft, Edit3, Eye, EyeOff, Search } from 'lucide-react';
import type { ClassInfo, Student } from '../../types';

interface BankPasswordViewProps {
  classInfo: ClassInfo;
  students: Student[];
  onBack: () => void;
}

interface PasswordStudent extends Student {
  password: string;
  showPassword: boolean;
}

const generateStablePassword = (studentId: string) => {
  const hash = Array.from(studentId).reduce((value, character) => ((value * 31) + character.charCodeAt(0)) % 900000, 173);
  return String(100000 + hash).slice(-6);
};

const BankPasswordView: React.FC<BankPasswordViewProps> = ({ classInfo, students: classStudents, onBack }) => {
  const [students, setStudents] = useState<PasswordStudent[]>(() => classStudents.map(student => ({
    ...student,
    password: generateStablePassword(student.id),
    showPassword: false,
  })));
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  const filteredStudents = students.filter(student => {
    const keyword = searchTerm.trim().toLocaleLowerCase();
    return student.name.toLocaleLowerCase().includes(keyword)
      || (student.studentNo ?? student.id).toLocaleLowerCase().includes(keyword);
  });

  const startEditing = (student: PasswordStudent) => {
    setEditingId(student.id);
    setTempPassword(student.password);
    setValidationMessage('');
  };

  const savePassword = () => {
    if (!editingId) return;
    if (!/^\d{6}$/.test(tempPassword)) {
      setValidationMessage('请输入6位数字密码');
      return;
    }
    setStudents(current => current.map(student => student.id === editingId ? { ...student, password: tempPassword } : student));
    setEditingId(null);
    setValidationMessage('');
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <header className="relative flex h-[var(--tm-size-touch)] shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
        <button type="button" onClick={onBack} className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回班级列表"><ChevronLeft className="h-5 w-5" /></button>
        <h1 className="pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">设置兑换密码</h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
        <div className="px-[var(--tm-space-4)] pt-[var(--tm-space-3)]">
          <div className="flex items-center justify-between rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-4)] [box-shadow:var(--tm-shadow-card)]">
            <div className="min-w-0"><h2 className="truncate text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">{classInfo.name}</h2><p className="mt-[var(--tm-space-1)] text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">共 {students.length} 名学生</p></div>
            <span className="rounded-full bg-[var(--tm-brand-primary-soft)] px-[var(--tm-space-3)] py-[var(--tm-space-1)] text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-brand-primary)]">6位数字</span>
          </div>
        </div>

        <div className="sticky top-0 z-20 bg-[var(--tm-page-plain-content-bg)] px-[var(--tm-space-4)] py-[var(--tm-space-3)]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-[var(--tm-space-3)] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--tm-text-tertiary)]" />
            <input type="search" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="搜索姓名或学号" className="h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] pl-10 pr-[var(--tm-space-3)] text-[length:var(--tm-font-size-body)] text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)] focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]" />
          </label>
        </div>

        <div className="space-y-[var(--tm-space-2)] px-[var(--tm-space-4)] pb-[calc(var(--tm-space-6)+env(safe-area-inset-bottom))]">
          {filteredStudents.map(student => (
            <article key={student.id} className="rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-3)] py-[var(--tm-space-2)] [box-shadow:var(--tm-shadow-control)]">
              <div className="flex min-h-[var(--tm-size-touch)] items-center gap-[var(--tm-space-3)]">
                {student.avatar ? <img src={student.avatar} alt="" className="h-10 w-10 shrink-0 rounded-full bg-[var(--tm-bg-surface-muted)] object-cover" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--tm-brand-primary-soft)] font-semibold text-[var(--tm-brand-primary)]">{student.name.slice(0, 1)}</span>}
                <div className="min-w-0 flex-1"><strong className="block truncate text-[length:var(--tm-font-size-body)] text-[var(--tm-text-primary)]">{student.name}</strong><small className="text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">{student.studentNo ?? student.id}</small></div>

                {editingId === student.id ? (
                  <div className="flex items-center gap-[var(--tm-space-1)]">
                    <input autoFocus inputMode="numeric" maxLength={6} value={tempPassword} onChange={event => { setTempPassword(event.target.value.replace(/\D/g, '')); setValidationMessage(''); }} className="h-[var(--tm-size-touch)] w-[86px] rounded-[var(--tm-radius-control)] border border-[var(--tm-input-focus-border)] bg-[var(--tm-input-bg)] px-[var(--tm-space-2)] text-center text-[length:var(--tm-font-size-body)] font-semibold tabular-nums text-[var(--tm-input-text)] outline-none ring-2 ring-[var(--tm-input-focus-ring)]" aria-label={`修改${student.name}兑换密码`} />
                    <button type="button" onClick={savePassword} className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]" aria-label="保存密码"><Check className="h-[18px] w-[18px]" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-[var(--tm-space-1)]">
                    <span className="min-w-[58px] text-center text-[length:var(--tm-font-size-body)] font-semibold tabular-nums text-[var(--tm-text-primary)]">{student.showPassword ? student.password : '••••••'}</span>
                    <button type="button" onClick={() => setStudents(current => current.map(item => item.id === student.id ? { ...item, showPassword: !item.showPassword } : item))} className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-[var(--tm-radius-control)] text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label={`${student.showPassword ? '隐藏' : '查看'}${student.name}兑换密码`}>{student.showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}</button>
                    <button type="button" onClick={() => startEditing(student)} className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft-strong)]" aria-label={`修改${student.name}兑换密码`}><Edit3 className="h-[18px] w-[18px]" /></button>
                  </div>
                )}
              </div>
              {editingId === student.id && validationMessage && <p role="alert" className="pb-[var(--tm-space-1)] pt-[var(--tm-space-2)] text-right text-[length:var(--tm-font-size-meta)] text-[var(--tm-status-negative)]">{validationMessage}</p>}
            </article>
          ))}
          {filteredStudents.length === 0 && <div className="py-20 text-center text-[length:var(--tm-font-size-body)] text-[var(--tm-text-tertiary)]">未找到相关学生</div>}
        </div>
      </div>
    </div>
  );
};

export { BankPasswordView };
export default BankPasswordView;
