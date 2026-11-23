import React, { useId, useRef, useState } from 'react';
import { AutoComplete } from '@arco-design/web-react';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileFormActionBar from '../components/ui/MobileFormActionBar';
import MobilePageHeader from '../components/ui/MobilePageHeader';
import { mobileSheetActionClass } from '../components/ui/mobileSheetActionStyles';
import { B_END_SCHOOL_OPTIONS, findBEndSchools, normalizeSchoolName, type BEndSchoolOption } from '../domain/teacherSchoolDirectory';
import { phoneText } from '../styles/teacherMobileTokens';
import './TeacherProfileSetupView.css';

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
  const [selectedSchool, setSelectedSchool] = useState<BEndSchoolOption | null>(null);
  const [blockedSchool, setBlockedSchool] = useState<BEndSchoolOption | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const nameId = useId();
  const schoolId = useId();
  const schoolHintId = useId();
  const trimmedName = name.trim();
  const trimmedSchoolName = schoolName.trim();
  const canSubmit = Boolean(trimmedName && trimmedSchoolName);
  const schoolOptions = findBEndSchools(schoolName).map(school => school.name);

  const handleSchoolChange = (value: string) => {
    setSchoolName(value);
    setSelectedSchool(null);
  };

  const handleSchoolSelect = (value: string) => {
    setSelectedSchool(B_END_SCHOOL_OPTIONS.find(school => school.name === value) ?? null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    // 选择列表里的学校、或直接输入完整校名，都视为重复开通 B 端学校。
    const matchedSchool = selectedSchool
      ?? B_END_SCHOOL_OPTIONS.find(school => normalizeSchoolName(school.name) === normalizeSchoolName(trimmedSchoolName))
      ?? null;
    if (matchedSchool) {
      setBlockedSchool(matchedSchool);
      return;
    }
    onSubmit({ name: trimmedName, schoolName: trimmedSchoolName });
  };

  return (
    <div ref={rootRef} className="relative flex h-full min-h-0 flex-col text-[var(--tm-text-primary)] antialiased">
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
              <AutoComplete
                value={schoolName}
                data={schoolOptions}
                onChange={handleSchoolChange}
                onSelect={handleSchoolSelect}
                placeholder="请输入学校名称"
                className="teacher-school-autocomplete mt-2"
                inputProps={{
                  id: schoolId,
                  maxLength: SCHOOL_MAX_LENGTH,
                  autoComplete: 'organization',
                  enterKeyHint: 'done',
                  'aria-describedby': schoolHintId,
                }}
                filterOption={(inputValue, option) => normalizeSchoolName(String(option.props.value)).includes(normalizeSchoolName(inputValue))}
                getPopupContainer={() => rootRef.current ?? document.body}
                triggerProps={{ className: 'teacher-school-autocomplete-popup' }}
              />
              <p id={schoolHintId} className={`${phoneText.helper} mt-2 text-[var(--tm-text-tertiary)]`}>
                填写学校后，可更快找到同校老师创建的班级
              </p>
            </div>
          </div>
        </div>

        <MobileFormActionBar type="submit" label="进入体验" disabled={!canSubmit} />
      </form>

      <MobileBottomSheet
        open={Boolean(blockedSchool)}
        title="该学校已启用试用"
        onClose={() => setBlockedSchool(null)}
        footer={(
          <button type="button" onClick={() => setBlockedSchool(null)} className={`${mobileSheetActionClass} flex w-full items-center justify-center bg-[var(--tm-brand-primary)] px-[var(--tm-space-4)] font-semibold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] focus-visible:ring-offset-2`}>
            我知道了
          </button>
        )}
      >
        <p className="text-pretty text-[length:var(--tm-font-size-body)] font-medium leading-6 text-[var(--tm-text-secondary)]">
          学校已完成学生信息导入，无需自行创建账号。请联系学校负责人，将您的账号添加到后台。
        </p>
      </MobileBottomSheet>
    </div>
  );
};

export default TeacherProfileSetupView;
