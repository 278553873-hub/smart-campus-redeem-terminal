import React, { useMemo, useRef, useState } from 'react';
import { Camera, ChevronLeft, Image, Plus, UsersRound, X } from 'lucide-react';
import { ClassInfo, GuardianContact, GuardianRelation, Student } from '../types';
import { ASSETS } from '../assets/images';
import { MobileCard } from '../components/ui/MobileCard';
import { IconBadge } from '../components/ui/IconBadge';
import { phoneText } from '../styles/teacherMobileTokens';

interface StudentBasicEditViewProps {
  student: Student;
  classes: ClassInfo[];
  onBack: () => void;
  onSave: (student: Student) => void;
}

const fieldInputClass = 'mt-2 h-12 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] px-4 text-sm font-medium text-[var(--tm-text-primary)] outline-none transition-all focus:border-[var(--tm-brand-primary)] focus:bg-[var(--tm-bg-surface)] focus:ring-2 focus:ring-[var(--tm-focus-ring)]';
const labelClass = `${phoneText.label} text-[var(--tm-text-tertiary)]`;

const guardianRelationOptions: GuardianRelation[] = ['家长', '爸爸', '妈妈', '爷爷', '奶奶', '外公', '外婆', '其他'];

const normalizeContacts = (contacts: GuardianContact[]) => contacts
  .map(contact => ({
    ...contact,
    phone: contact.phone.trim(),
    relationOther: contact.relationOther?.trim(),
  }))
  .filter(contact => contact.phone);

const normalizePhones = (contacts: GuardianContact[]) => normalizeContacts(contacts).map(contact => contact.phone);

const createBlankContact = (): GuardianContact => ({ phone: '', relation: '家长', relationOther: '' });

const getInitialContacts = (student: Student): GuardianContact[] => {
  if (student.guardianContacts?.length) {
    return student.guardianContacts.map(contact => ({
      phone: contact.phone,
      relation: contact.relation ?? '家长',
      relationOther: contact.relationOther ?? '',
    }));
  }
  if (student.reservedPhones?.length) {
    return student.reservedPhones.map(phone => ({ phone, relation: '家长', relationOther: '' }));
  }
  return [createBlankContact()];
};


const getClassYear = (className: string) => className.match(/^(\d{4}级)/)?.[1] || className;

const formatCompactClassName = (className: string) => {
  const match = className.match(/^(\d{4}级)(.+)$/);
  const classNumberMap: Record<string, string> = {
    一: '1',
    二: '2',
    三: '3',
    四: '4',
    五: '5',
    六: '6',
    七: '7',
    八: '8',
    九: '9',
    十: '10',
  };
  if (!match) return className;
  const classText = match[2].replace('班', '');
  return `${match[1]}${classNumberMap[classText] ?? classText}班`;
};

const StudentBasicEditView: React.FC<StudentBasicEditViewProps> = ({ student, classes, onBack, onSave }) => {
  const [draft, setDraft] = useState<Student>({
    ...student,
    status: student.status ?? 'active',
    guardianContacts: getInitialContacts(student),
    reservedPhones: student.reservedPhones?.length ? student.reservedPhones : [''],
  });
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [classPickerYear, setClassPickerYear] = useState(getClassYear(student.class || classes[0]?.name || ''));
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  const selectedClass = useMemo(() => classes.find(item => item.name === draft.class), [classes, draft.class]);
  const yearOptions = useMemo(() => Array.from(new Set(classes.map(item => getClassYear(item.name)))), [classes]);
  const classOptions = useMemo(() => classes.filter(item => getClassYear(item.name) === classPickerYear), [classes, classPickerYear]);

  const toggleClassPicker = () => {
    setClassPickerYear(selectedClass ? getClassYear(selectedClass.name) : getClassYear(draft.class || yearOptions[0] || ''));
    setShowClassPicker(prev => !prev);
  };

  const cycleMockAvatar = () => {
    const avatarPool = draft.gender === 'male' ? ASSETS.AVATAR.BOYS : ASSETS.AVATAR.GIRLS;
    const currentIndex = avatarPool.findIndex(avatar => avatar === draft.avatar);
    const nextAvatar = avatarPool[(currentIndex + 1 + avatarPool.length) % avatarPool.length] || draft.avatar;
    setDraft(prev => ({ ...prev, avatar: nextAvatar }));
  };

  const readAvatarFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setShowAvatarSheet(false);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDraft(prev => ({ ...prev, avatar: reader.result as string }));
      }
      setShowAvatarSheet(false);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const chooseMockAvatar = () => {
    cycleMockAvatar();
    setShowAvatarSheet(false);
  };

  const saveAvatarFromAlbum = chooseMockAvatar;

  const updateContact = (index: number, patch: Partial<GuardianContact>) => {
    setDraft(prev => ({
      ...prev,
      guardianContacts: (prev.guardianContacts ?? []).map((contact, contactIndex) => contactIndex === index ? { ...contact, ...patch } : contact),
    }));
  };

  const addContact = () => {
    setDraft(prev => ({ ...prev, guardianContacts: [...(prev.guardianContacts ?? []), createBlankContact()] }));
  };

  const removeContact = (index: number) => {
    setDraft(prev => {
      const nextContacts = (prev.guardianContacts ?? []).filter((_, contactIndex) => contactIndex !== index);
      return { ...prev, guardianContacts: nextContacts.length ? nextContacts : [createBlankContact()] };
    });
  };

  const saveBasicInfo = () => {
    const guardianContacts = normalizeContacts(draft.guardianContacts ?? []);
    onSave({
      ...draft,
      name: draft.name.trim() || student.name,
      studentNo: draft.studentNo?.trim() || student.studentNo,
      birthDate: draft.birthDate || undefined,
      guardianContacts,
      reservedPhones: normalizePhones(guardianContacts),
    });
  };

  return (
    <div className="h-full min-h-0 overflow-hidden bg-transparent font-sans">
      <div className="flex h-full min-h-0 flex-col">
        <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={readAvatarFile} />
        <input ref={albumInputRef} type="file" accept="image/*" className="hidden" onChange={readAvatarFile} />
        <header className="flex h-11 shrink-0 items-center justify-between border-b border-white/40 bg-white/38 px-4 backdrop-blur-md">
          <button onClick={onBack} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回学生详情">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className={`${phoneText.navTitle} text-[var(--tm-text-primary)]`}>基础信息编辑</h1>
          <div className="h-10 w-10" aria-hidden="true" />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 pb-28 no-scrollbar">
          <MobileCard variant="card" padding="md" className="space-y-4">
            <div>
              <span className={labelClass}>头像</span>
              <div className="mt-2 flex items-center justify-between rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] p-3">
                <div className="flex items-center gap-3">
                  <img
                    src={draft.avatar || (draft.gender === 'male' ? ASSETS.AVATAR.GENERIC_BOY : ASSETS.AVATAR.GENERIC_GIRL)}
                    alt="学生头像"
                    className="h-16 w-16 rounded-full border border-white bg-white object-cover shadow-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowAvatarSheet(true)}
                  className="flex h-10 items-center gap-1 rounded-full bg-[var(--tm-brand-primary-soft)] px-3 text-xs font-semibold text-[var(--tm-brand-primary)] active:scale-95"
                >
                  <Camera className="h-4 w-4" /> 更换头像
                </button>
              </div>
            </div>

            <label className="block">
              <span className={labelClass}>姓名</span>
              <input className={fieldInputClass} value={draft.name} onChange={event => setDraft(prev => ({ ...prev, name: event.target.value }))} placeholder="请输入学生姓名" />
            </label>

            <div>
              <span className={labelClass}>性别</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { value: 'male', label: '男' },
                  { value: 'female', label: '女' },
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDraft(prev => ({ ...prev, gender: option.value as Student['gender'] }))}
                    className={`h-12 rounded-[var(--tm-radius-control)] border text-sm font-semibold transition-all active:scale-[0.98] ${draft.gender === option.value ? 'border-[var(--tm-brand-primary-soft-strong)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-pressed)]' : 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)]'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className={labelClass}>学号</span>
              <input className={fieldInputClass} value={draft.studentNo ?? ''} onChange={event => setDraft(prev => ({ ...prev, studentNo: event.target.value }))} placeholder="请输入学号" />
            </label>

            <label className="block">
              <span className={labelClass}>出生日期</span>
              <input type="date" className={fieldInputClass} value={draft.birthDate ?? ''} onInput={event => setDraft(prev => ({ ...prev, birthDate: event.currentTarget.value }))} />
            </label>

            <div>
              <span className={labelClass}>所在班级</span>
              <button
                type="button"
                onClick={toggleClassPicker}
                className="mt-2 flex h-12 w-full items-center justify-between rounded-[var(--tm-radius-control)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] px-4 text-left text-sm font-medium text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-muted)]"
              >
                <span>{formatCompactClassName(draft.class)}</span>
                <span className="text-xs font-semibold text-[var(--tm-brand-primary)]">更换</span>
              </button>
              {showClassPicker && (
                <div className="mt-2 grid h-56 grid-cols-[92px_1fr] overflow-hidden rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]" aria-label="班级级联选择">
                  <div className="overflow-y-auto border-r border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] p-2 no-scrollbar" aria-label="左侧先选入学年级">
                    {yearOptions.map(year => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => setClassPickerYear(year)}
                        className={`mb-1 flex h-10 w-full items-center justify-center rounded-[var(--tm-radius-control)] text-xs font-bold transition-all ${classPickerYear === year ? 'bg-[var(--tm-brand-primary)] text-white shadow-sm' : 'text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface)]'}`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                  <div className="overflow-y-auto p-2 no-scrollbar" aria-label="右侧再选该年级下的班级">
                    {classOptions.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setDraft(prev => ({ ...prev, grade: item.gradeLevel, class: item.name }));
                          setClassPickerYear(getClassYear(item.name));
                          setShowClassPicker(false);
                        }}
                        className={`flex min-h-11 w-full items-center justify-between rounded-[var(--tm-radius-control)] px-3 text-left text-sm active:bg-[var(--tm-bg-surface-soft)] ${selectedClass?.id === item.id ? 'bg-[var(--tm-brand-primary-soft)] font-semibold text-[var(--tm-brand-primary-pressed)]' : 'text-[var(--tm-text-secondary)]'}`}
                      >
                        <span>{formatCompactClassName(item.name)}</span>
                        <span className="text-xs text-[var(--tm-text-tertiary)]">{item.gradeLevel}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </MobileCard>

          <MobileCard variant="card" padding="md" className="mt-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconBadge icon={UsersRound} tone="brand" size="sm" />
                <h2 className={`${phoneText.sectionTitle} text-[var(--tm-text-primary)]`}>家长联系方式</h2>
              </div>
              <button type="button" onClick={addContact} className="flex h-10 items-center gap-1 rounded-full bg-[var(--tm-brand-primary-soft)] px-3 text-xs font-semibold text-[var(--tm-brand-primary-pressed)] active:scale-95">
                <Plus className="h-4 w-4" /> 添加联系方式
              </button>
            </div>

            <div className="space-y-3">
              {(draft.guardianContacts ?? [createBlankContact()]).map((contact, index) => (
                <div key={index} className="relative space-y-2 rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] p-2">
                  <button type="button" onClick={() => removeContact(index)} className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--tm-bg-surface)] text-[var(--tm-text-tertiary)] shadow-sm ring-1 ring-[var(--tm-border-subtle)] active:bg-[var(--tm-status-negative-soft)] active:text-[var(--tm-status-negative)]" aria-label="删除家长联系方式">
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="grid grid-cols-[minmax(0,1fr)_92px] gap-2 pr-5">
                    <input
                      className="h-12 min-w-0 rounded-[var(--tm-radius-control)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] px-4 text-sm font-medium text-[var(--tm-text-primary)] outline-none focus:border-[var(--tm-brand-primary)] focus:ring-2 focus:ring-[var(--tm-focus-ring)]"
                      value={contact.phone}
                      onChange={event => updateContact(index, { phone: event.target.value })}
                      placeholder="请输入手机号"
                      inputMode="tel"
                    />
                    <select
                      className="h-12 rounded-[var(--tm-radius-control)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] px-3 text-sm font-medium text-[var(--tm-text-primary)] outline-none focus:border-[var(--tm-brand-primary)] focus:ring-2 focus:ring-[var(--tm-focus-ring)]"
                      value={contact.relation}
                      onChange={event => updateContact(index, { relation: event.target.value as GuardianRelation })}
                      aria-label="家长关系"
                    >
                      {guardianRelationOptions.map(relation => (
                        <option key={relation} value={relation}>{relation}</option>
                      ))}
                    </select>
                  </div>
                  {contact.relation === '其他' && (
                    <input
                      className="h-11 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] px-3 text-sm font-medium text-[var(--tm-text-primary)] outline-none focus:border-[var(--tm-brand-primary)] focus:ring-2 focus:ring-[var(--tm-focus-ring)]"
                      value={contact.relationOther ?? ''}
                      onChange={event => updateContact(index, { relationOther: event.target.value })}
                      placeholder="请输入关系"
                      aria-label="其他关系"
                    />
                  )}
                </div>
              ))}
            </div>
          </MobileCard>
        </div>


        {showAvatarSheet && (
          <div className="absolute inset-0 z-[130] flex items-end bg-[var(--tm-mask)] px-4 pb-5" onClick={() => setShowAvatarSheet(false)}>
            <div className="w-full rounded-[var(--tm-radius-sheet)] bg-[var(--tm-bg-surface)] p-4 shadow-[var(--tm-shadow-sheet)]" onClick={event => event.stopPropagation()}>
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[var(--tm-brand-primary-soft-strong)]" />
              <h3 className="px-2 text-center text-lg font-extrabold text-[var(--tm-text-primary)]">更换头像</h3>
              <div className="mt-5 space-y-2">
                <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex h-14 w-full items-center gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-brand-primary-soft)] px-4 text-left font-bold text-[var(--tm-brand-primary-pressed)] active:bg-[var(--tm-brand-primary-soft-strong)]">
                  <Camera className="h-5 w-5" />
                  拍照
                </button>
                <button type="button" onClick={() => albumInputRef.current?.click()} className="flex h-14 w-full items-center gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-4 text-left font-bold text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-muted)]">
                  <Image className="h-5 w-5" />
                  从相册选择
                </button>
                <button type="button" onClick={() => setShowAvatarSheet(false)} className="flex h-12 w-full items-center justify-center rounded-[var(--tm-radius-control)] text-sm font-bold text-[var(--tm-text-tertiary)] active:bg-[var(--tm-bg-surface-soft)]">
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-5 pb-5 pt-3 shadow-[var(--tm-shadow-navigation)] backdrop-blur-md">
          <button onClick={saveBasicInfo} className="h-12 w-full rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-sm font-bold text-white shadow-[0_16px_30px_-24px_var(--tm-shadow-brand)] active:scale-[0.98] active:bg-[var(--tm-brand-primary-pressed)]">
            保存基础信息
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentBasicEditView;
