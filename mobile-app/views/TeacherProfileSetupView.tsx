import React, { useId, useState } from 'react';
import MobileFormActionBar from '../components/ui/MobileFormActionBar';
import MobilePageHeader from '../components/ui/MobilePageHeader';
import { phoneText } from '../styles/teacherMobileTokens';

interface TeacherProfileSetupViewProps {
  onBack: () => void;
  onSubmit: (profile: { name: string; schoolName: string }) => void;
}

const NAME_MAX_LENGTH = 20;
const SCHOOL_MAX_LENGTH = 30;

const fieldClass = 'mt-2 h-12 w-full rounded-[var(--tm-radius-control-compact)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-4 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)]';
const fieldLabelClass = 'text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]';
const fieldCardClass = 'rounded-[var(--tm-form-card-radius)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-4)]';

const TeacherProfileSetupView: React.FC<TeacherProfileSetupViewProps> = ({ onBack, onSubmit }) => {
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const nameId = useId();
  const schoolId = useId();
  const schoolHintId = useId();
  const trimmedName = name.trim();
  const trimmedSchoolName = schoolName.trim();
  const canSubmit = Boolean(trimmedName && trimmedSchoolName);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({ name: trimmedName, schoolName: trimmedSchoolName });
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col text-[var(--tm-text-primary)] antialiased">
      <MobilePageHeader title="完善信息" onBack={onBack} />

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col bg-[var(--tm-page-plain-content-bg)]">
        <div className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-5)] pb-[var(--tm-space-4)] pt-[var(--tm-space-4)] no-scrollbar">
          <div className="space-y-[var(--tm-form-section-gap)]">
            <div className={fieldCardClass}>
              <label htmlFor={nameId} className={fieldLabelClass}>姓名</label>
              <input
                id={nameId}
                value={name}
                onChange={event => setName(event.target.value)}
                maxLength={NAME_MAX_LENGTH}
                autoComplete="name"
                enterKeyHint="next"
                className={fieldClass}
                placeholder="请输入姓名"
              />
            </div>

            <div className={fieldCardClass}>
              <label htmlFor={schoolId} className={fieldLabelClass}>学校</label>
              <input
                id={schoolId}
                value={schoolName}
                onChange={event => setSchoolName(event.target.value)}
                maxLength={SCHOOL_MAX_LENGTH}
                autoComplete="off"
                enterKeyHint="done"
                aria-describedby={schoolHintId}
                className={fieldClass}
                placeholder="请输入学校名称"
              />
              <p id={schoolHintId} className={`${phoneText.helper} mt-2 text-[var(--tm-text-tertiary)]`}>
                填写学校后，可更快找到同校老师创建的班级
              </p>
            </div>
          </div>
        </div>

        <MobileFormActionBar type="submit" label="进入体验" disabled={!canSubmit} />
      </form>
    </div>
  );
};

export default TeacherProfileSetupView;
