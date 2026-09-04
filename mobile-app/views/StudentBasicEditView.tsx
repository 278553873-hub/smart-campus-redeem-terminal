import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Check, ChevronDown, ChevronLeft, ChevronRight, Image, Plus, Trash2 } from 'lucide-react';
import { ClassInfo, GuardianContact, GuardianRelation, Student } from '../types';
import { ASSETS } from '../assets/images';
import { MobileCard } from '../components/ui/MobileCard';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileConfirmSheet from '../components/ui/MobileConfirmSheet';
import { MobileEditableRow } from '../components/ui/MobileEditableRow';
import MobileToast from '../components/ui/MobileToast';
import { phoneText } from '../styles/teacherMobileTokens';
import { getTeacherClassDisplayName, type TeacherSpaceOption } from '../domain/teacherSpaceAccess';

interface StudentBasicEditViewProps {
  student: Student;
  classes: ClassInfo[];
  currentSpace: TeacherSpaceOption;
  onBack: () => void;
  onChange: (student: Student) => void | Promise<void>;
}

const fieldInputClass = 'mt-2 h-12 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-4 text-sm font-medium text-[var(--tm-input-text)] outline-none transition-all placeholder:text-[var(--tm-input-placeholder)] focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)] disabled:cursor-not-allowed disabled:border-[var(--tm-input-disabled-border)] disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)] disabled:opacity-100 read-only:border-[var(--tm-input-readonly-border)] read-only:bg-[var(--tm-input-readonly-bg)] read-only:text-[var(--tm-input-readonly-text)]';
const relationSelectClass = 'h-12 w-full appearance-none rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-bg-surface)] px-4 pr-10 text-sm font-semibold text-[var(--tm-text-primary)] [-webkit-text-fill-color:var(--tm-text-primary)] opacity-100 outline-none transition-all focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]';
const labelClass = `${phoneText.label} text-[var(--tm-text-tertiary)]`;
const compactLabelClass = 'text-sm font-medium text-[var(--tm-text-tertiary)]';
const editableRowLayoutClass = 'grid min-h-14 w-full grid-cols-[72px_minmax(0,1fr)] items-center gap-3 py-1.5 text-left';

const guardianRelationOptions: GuardianRelation[] = ['家长', '爸爸', '妈妈', '爷爷', '奶奶', '外公', '外婆', '其他'];

const normalizeContacts = (contacts: GuardianContact[]) => contacts
  .map(contact => ({
    ...contact,
    phone: contact.phone.trim(),
    relationOther: contact.relationOther?.trim(),
  }))
  .filter(contact => contact.phone);

const normalizePhones = (contacts: GuardianContact[]) => normalizeContacts(contacts).map(contact => contact.phone);

const normalizeStudent = (draft: Student, fallback: Student, guardianContacts: GuardianContact[]): Student => {
  return {
    ...draft,
    name: draft.name.trim() || fallback.name,
    studentNo: draft.studentNo?.trim() || fallback.studentNo,
    birthDate: draft.birthDate || undefined,
    guardianContacts,
    reservedPhones: normalizePhones(guardianContacts),
  };
};

const createBlankContact = (): GuardianContact => ({ phone: '', relation: '家长', relationOther: '' });

type ContactFormErrors = Partial<Record<'phone' | 'relationOther', string>>;

const getContactValidationErrors = (
  contact: GuardianContact,
  existingContacts: GuardianContact[],
  editingIndex: number | null,
): ContactFormErrors => {
  const errors: ContactFormErrors = {};
  const phone = contact.phone.trim();
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    errors.phone = '请输入正确的11位手机号';
  } else if (existingContacts.some((item, index) => index !== editingIndex && item.phone.trim() === phone)) {
    errors.phone = '该手机号已添加';
  }
  if (contact.relation === '其他' && !contact.relationOther?.trim()) {
    errors.relationOther = '请输入具体关系';
  }
  return errors;
};

const formatGuardianPhone = (phone: string) => /^\d{11}$/.test(phone) ? `${phone.slice(0, 3)}****${phone.slice(7)}` : phone;

const getGuardianRelationLabel = (contact: GuardianContact) => contact.relation === '其他'
  ? contact.relationOther?.trim() || '其他'
  : contact.relation;

type AvatarSheetMode = 'system' | 'upload';
type EditableField = 'name' | 'studentNo' | 'birthDate';

const editableFieldConfig: Record<EditableField, { label: string; placeholder: string; type: 'text' | 'date'; maxLength?: number }> = {
  name: { label: '姓名', placeholder: '请输入学生姓名', type: 'text', maxLength: 20 },
  studentNo: { label: '学号', placeholder: '请输入学号', type: 'text', maxLength: 30 },
  birthDate: { label: '出生日期', placeholder: '请选择出生日期', type: 'date' },
};

const getSystemAvatarGroups = (gender: Student['gender']) => gender === 'female'
  ? ASSETS.AVATAR.SYSTEM_GIRL_GROUPS
  : ASSETS.AVATAR.SYSTEM_BOY_GROUPS;

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
  return [];
};


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

const getTodayDateValue = () => {
  const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localNow.toISOString().slice(0, 10);
};

const formatBirthDate = (birthDate?: string) => {
  if (!birthDate) return '未设置';
  const [year, month, day] = birthDate.split('-');
  if (!year || !month || !day) return birthDate;
  return `${year}年${Number(month)}月${Number(day)}日`;
};

const StudentBasicEditView: React.FC<StudentBasicEditViewProps> = ({ student, classes, currentSpace, onBack, onChange }) => {
  const [draft, setDraft] = useState<Student>({
    ...student,
    status: student.status ?? 'active',
    guardianContacts: getInitialContacts(student),
    reservedPhones: student.reservedPhones?.length ? student.reservedPhones : [''],
  });
  const draftRef = useRef(draft);
  const persistedContactsRef = useRef(normalizeContacts(draft.guardianContacts ?? []));
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [classPickerGrade, setClassPickerGrade] = useState(
    classes.find(item => item.name === student.class || getTeacherClassDisplayName(item, currentSpace) === student.class)?.gradeLevel ?? classes[0]?.gradeLevel ?? '',
  );
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [avatarSheetMode, setAvatarSheetMode] = useState<AvatarSheetMode>('system');
  const [pendingAvatar, setPendingAvatar] = useState('');
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [fieldDraft, setFieldDraft] = useState('');
  const [contactSheetMode, setContactSheetMode] = useState<'add' | 'edit' | null>(null);
  const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState<GuardianContact>(createBlankContact());
  const [contactFormErrors, setContactFormErrors] = useState<ContactFormErrors>({});
  const [deleteContactIndex, setDeleteContactIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);
  const persistVersionRef = useRef(0);
  const lastPersistedVersionRef = useRef(0);
  const lastPersistedRef = useRef({
    draft,
    contacts: persistedContactsRef.current,
  });

  const selectedClass = useMemo(
    () => classes.find(item => item.name === draft.class || getTeacherClassDisplayName(item, currentSpace) === draft.class),
    [classes, currentSpace, draft.class],
  );
  const displayStudentClassName = selectedClass
    ? getTeacherClassDisplayName(selectedClass, currentSpace)
    : formatCompactClassName(draft.class);
  const gradeOptions = useMemo(() => getTeacherSchoolGradeOptions(currentSpace)
    ?? Array.from(new Set(classes.map(item => item.gradeLevel))), [classes, currentSpace]);
  const classOptions = useMemo(() => classes.filter(item => item.gradeLevel === classPickerGrade), [classes, classPickerGrade]);
  const systemAvatarGroups = useMemo(() => getSystemAvatarGroups(draft.gender), [draft.gender]);
  const currentContactValidationErrors = useMemo(
    () => getContactValidationErrors(contactForm, draft.guardianContacts ?? [], editingContactIndex),
    [contactForm, draft.guardianContacts, editingContactIndex],
  );
  const canSaveContact = Object.keys(currentContactValidationErrors).length === 0;
  const contactSheetOpen = contactSheetMode !== null && deleteContactIndex === null;
  const deletingContact = deleteContactIndex === null ? null : draft.guardianContacts?.[deleteContactIndex] ?? null;
  const maxBirthDate = useMemo(getTodayDateValue, []);
  const currentEditingFieldConfig = editingField ? editableFieldConfig[editingField] : null;
  const currentFieldValue = editingField ? String(draft[editingField] ?? '').trim() : '';
  const normalizedFieldDraft = editingField === 'birthDate' ? fieldDraft : fieldDraft.trim();
  const fieldDraftIsValid = editingField === 'birthDate'
    ? (!normalizedFieldDraft || normalizedFieldDraft <= maxBirthDate)
    : Boolean(normalizedFieldDraft);
  const canSaveField = fieldDraftIsValid && normalizedFieldDraft !== currentFieldValue;

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = window.setTimeout(() => setToastMessage(''), 1800);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const setDraftValue = (updater: (previous: Student) => Student) => {
    const nextDraft = updater(draftRef.current);
    draftRef.current = nextDraft;
    setDraft(nextDraft);
    return nextDraft;
  };

  const restoreLastPersistedDraft = () => {
    const snapshot = lastPersistedRef.current;
    draftRef.current = snapshot.draft;
    persistedContactsRef.current = snapshot.contacts;
    setDraft(snapshot.draft);
    setToastMessage('保存失败，请重试');
  };

  const persistDraft = (nextDraft: Student, contacts = persistedContactsRef.current) => {
    const version = ++persistVersionRef.current;
    const normalizedStudent = normalizeStudent(nextDraft, student, contacts);
    const markPersisted = () => {
      if (version < lastPersistedVersionRef.current) return;
      lastPersistedVersionRef.current = version;
      lastPersistedRef.current = { draft: nextDraft, contacts };
    };
    const handleFailure = () => {
      if (version === persistVersionRef.current) restoreLastPersistedDraft();
    };

    try {
      const result = onChange(normalizedStudent);
      if (result && typeof result.then === 'function') {
        void result.then(markPersisted).catch(handleFailure);
        return;
      }
      markPersisted();
    } catch {
      handleFailure();
    }
  };

  const updateDraft = (updater: (previous: Student) => Student) => {
    const nextDraft = setDraftValue(updater);
    persistDraft(nextDraft);
  };

  const openClassPicker = () => {
    setClassPickerGrade(selectedClass?.gradeLevel ?? draft.grade ?? gradeOptions[0] ?? '');
    setShowClassPicker(true);
  };

  const selectClass = (item: ClassInfo) => {
    updateDraft(prev => ({ ...prev, grade: item.gradeLevel, class: item.name }));
    setClassPickerGrade(item.gradeLevel);
    setShowClassPicker(false);
    setToastMessage(`已调整至${getTeacherClassDisplayName(item, currentSpace)}`);
  };

  const openAvatarSheet = () => {
    const systemAvatars = systemAvatarGroups.flatMap(group => group.avatars);
    const currentSystemAvatar = systemAvatars.find(avatar => avatar.src === draft.avatar);
    setPendingAvatar(currentSystemAvatar?.src ?? systemAvatars[0]?.src ?? '');
    setAvatarSheetMode('system');
    setShowAvatarSheet(true);
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
        updateDraft(prev => ({ ...prev, avatar: reader.result as string }));
      }
      setShowAvatarSheet(false);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const confirmSystemAvatar = () => {
    if (!pendingAvatar) return;
    updateDraft(prev => ({ ...prev, avatar: pendingAvatar }));
    setShowAvatarSheet(false);
  };

  const openAddContact = () => {
    setContactForm(createBlankContact());
    setContactFormErrors({});
    setEditingContactIndex(null);
    setContactSheetMode('add');
  };

  const openEditContact = (index: number) => {
    const contact = draftRef.current.guardianContacts?.[index];
    if (!contact) return;
    setContactForm({ ...contact });
    setContactFormErrors({});
    setEditingContactIndex(index);
    setContactSheetMode('edit');
  };

  const closeContactSheet = () => {
    setContactSheetMode(null);
    setEditingContactIndex(null);
    setContactFormErrors({});
  };

  const saveContact = () => {
    const validationErrors = getContactValidationErrors(contactForm, draftRef.current.guardianContacts ?? [], editingContactIndex);
    if (Object.keys(validationErrors).length > 0) {
      setContactFormErrors(validationErrors);
      return;
    }
    const normalizedContact = normalizeContacts([contactForm])[0];
    const isEditing = contactSheetMode === 'edit' && editingContactIndex !== null;
    const nextDraft = setDraftValue(prev => ({
      ...prev,
      guardianContacts: isEditing
        ? (prev.guardianContacts ?? []).map((contact, index) => index === editingContactIndex ? normalizedContact : contact)
        : [...(prev.guardianContacts ?? []), normalizedContact],
    }));
    const nextContacts = isEditing
      ? persistedContactsRef.current.map((contact, index) => index === editingContactIndex ? normalizedContact : contact)
      : [...persistedContactsRef.current, normalizedContact];
    persistedContactsRef.current = nextContacts;
    persistDraft(nextDraft, nextContacts);
    closeContactSheet();
    setToastMessage(isEditing ? '已更新联系方式' : '已添加联系方式');
  };

  const requestDeleteContact = () => {
    if (editingContactIndex === null) return;
    setDeleteContactIndex(editingContactIndex);
  };

  const removeContact = () => {
    if (deleteContactIndex === null) return;
    const nextDraft = setDraftValue(prev => ({
      ...prev,
      guardianContacts: (prev.guardianContacts ?? []).filter((_, contactIndex) => contactIndex !== deleteContactIndex),
    }));
    const nextContacts = persistedContactsRef.current.filter((_, contactIndex) => contactIndex !== deleteContactIndex);
    persistedContactsRef.current = nextContacts;
    persistDraft(nextDraft, nextContacts);
    setDeleteContactIndex(null);
    closeContactSheet();
    setToastMessage('已删除联系方式');
  };

  const openFieldEditor = (field: EditableField) => {
    setEditingField(field);
    setFieldDraft(String(draftRef.current[field] ?? ''));
  };

  const closeFieldEditor = () => {
    setEditingField(null);
    setFieldDraft('');
  };

  const saveField = () => {
    if (!editingField || !canSaveField) return;
    const field = editingField;
    const nextDraft = setDraftValue(previous => ({ ...previous, [field]: normalizedFieldDraft || undefined }));
    persistDraft(nextDraft);
    closeFieldEditor();
  };

  return (
    <div className="h-full min-h-0 overflow-hidden bg-[var(--tm-bg-page)] font-sans">
      <div className="flex h-full min-h-0 flex-col">
        <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={readAvatarFile} />
        <input ref={albumInputRef} type="file" accept="image/*" className="hidden" onChange={readAvatarFile} />
        <header className="flex h-11 shrink-0 items-center justify-between bg-[var(--tm-page-plain-header-bg)] px-4">
          <button onClick={onBack} className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回学生详情">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className={`${phoneText.navTitle} text-[var(--tm-text-primary)]`}>基础信息编辑</h1>
          <div className="h-11 w-11" aria-hidden="true" />
        </header>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4 no-scrollbar">
          <MobileCard variant="hero" padding="lg" className="student-avatar-card text-center">
            <button type="button" onClick={openAvatarSheet} className="group mx-auto block" aria-label="更换头像">
              <div className="relative mx-auto h-24 w-24 rounded-full bg-[linear-gradient(145deg,var(--tm-bg-surface),var(--tm-brand-primary-soft-strong),var(--tm-brand-secondary-soft))] p-[3px] [box-shadow:var(--tm-shadow-avatar)] ring-1 ring-white/90">
                <span className="block h-full w-full overflow-hidden rounded-full bg-[var(--tm-bg-surface)]">
                  <img
                    src={draft.avatar || (draft.gender === 'male' ? ASSETS.AVATAR.GENERIC_BOY : ASSETS.AVATAR.STUDENT_GIRL_DEFAULT)}
                    alt="学生头像"
                    className="h-full w-full object-cover object-center"
                  />
                </span>
                <span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-[var(--tm-brand-primary)] text-white [box-shadow:var(--tm-shadow-icon)] transition-transform group-active:scale-95" aria-hidden="true">
                  <Camera className="h-4 w-4" />
                </span>
              </div>
            </button>
          </MobileCard>

          <MobileCard variant="card" padding="md" className="student-profile-fields-card">
            <div className="mb-2 flex h-8 items-center">
              <h2 className={`${phoneText.sectionTitle} text-[var(--tm-text-primary)]`}>基础资料</h2>
            </div>

            <div className="divide-y divide-[var(--tm-border-subtle)]">
              <MobileEditableRow
                onClick={() => openFieldEditor('name')}
                className={editableRowLayoutClass}
                aria-label={`修改姓名，当前${draft.name}`}
              >
                <span className={compactLabelClass}>姓名</span>
                <span className="flex min-w-0 items-center justify-end gap-2 text-sm font-semibold text-[var(--tm-text-primary)]">
                  <span className="truncate">{draft.name}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" aria-hidden="true" />
                </span>
              </MobileEditableRow>

              <div className="grid min-h-14 grid-cols-[72px_minmax(0,1fr)] items-center gap-3 py-1.5">
                <span id="student-gender-label" className={compactLabelClass}>性别</span>
                <div className="ml-auto grid h-11 w-36 grid-cols-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] p-1" role="group" aria-labelledby="student-gender-label">
                  {[
                    { value: 'male', label: '男' },
                    { value: 'female', label: '女' },
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={draft.gender === option.value}
                      onClick={() => updateDraft(prev => ({ ...prev, gender: option.value as Student['gender'] }))}
                      className={`min-h-9 rounded-[calc(var(--tm-radius-control)-4px)] text-sm font-semibold transition-[background-color,color,box-shadow,transform] active:scale-[0.98] ${draft.gender === option.value ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <MobileEditableRow
                onClick={() => openFieldEditor('studentNo')}
                className={editableRowLayoutClass}
                aria-label={`修改学号，当前${draft.studentNo || '未设置'}`}
              >
                <span className={compactLabelClass}>学号</span>
                <span className="flex min-w-0 items-center justify-end gap-2 text-sm font-semibold tabular-nums text-[var(--tm-text-primary)]">
                  <span className="truncate">{draft.studentNo || '未设置'}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" aria-hidden="true" />
                </span>
              </MobileEditableRow>

              <MobileEditableRow
                onClick={() => openFieldEditor('birthDate')}
                className={editableRowLayoutClass}
                aria-label={`修改出生日期，当前${formatBirthDate(draft.birthDate)}`}
              >
                <span className={compactLabelClass}>出生日期</span>
                <span className={`flex min-w-0 items-center justify-end gap-2 text-sm font-semibold tabular-nums ${draft.birthDate ? 'text-[var(--tm-text-primary)]' : 'text-[var(--tm-text-tertiary)]'}`}>
                  <span className="truncate">{formatBirthDate(draft.birthDate)}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" aria-hidden="true" />
                </span>
              </MobileEditableRow>

              <MobileEditableRow
                onClick={openClassPicker}
                className={editableRowLayoutClass}
                aria-label={`选择所在班级，当前${displayStudentClassName}`}
              >
                <span className={compactLabelClass}>所在班级</span>
                <span className="flex min-w-0 items-center justify-end gap-2 text-sm font-semibold text-[var(--tm-text-primary)]">
                  <span className="truncate">{displayStudentClassName}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" aria-hidden="true" />
                </span>
              </MobileEditableRow>
            </div>
          </MobileCard>

          <MobileCard variant="card" padding="md" className="student-guardian-card">
            <div className="mb-2 flex h-11 items-center justify-between">
              <h2 className={`${phoneText.sectionTitle} text-[var(--tm-text-primary)]`}>家长联系方式</h2>
              <button type="button" onClick={openAddContact} className="group flex h-11 items-center justify-center" aria-label="添加家长联系方式">
                <span className="flex h-7 items-center gap-1 rounded-lg border border-[var(--tm-brand-primary)] bg-[var(--tm-bg-surface)] px-2.5 text-xs font-semibold text-[var(--tm-brand-primary)] transition-[background-color,transform] group-active:scale-95 group-active:bg-[var(--tm-brand-primary-soft)]">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  添加
                </span>
              </button>
            </div>

            {(draft.guardianContacts?.length ?? 0) > 0 ? (
              <div className="divide-y divide-[var(--tm-border-subtle)]">
                {(draft.guardianContacts ?? []).map((contact, index) => (
                  <MobileEditableRow
                    key={`${contact.phone}-${index}`}
                    onClick={() => openEditContact(index)}
                    className="grid min-h-14 w-full grid-cols-[72px_minmax(0,1fr)] items-center gap-3 py-2 text-left"
                    aria-label={`编辑${getGuardianRelationLabel(contact)}联系方式 ${contact.phone}`}
                  >
                    <span className={compactLabelClass}>{getGuardianRelationLabel(contact)}</span>
                    <span className="flex min-w-0 items-center justify-end gap-2 text-sm font-semibold tabular-nums text-[var(--tm-text-primary)]">
                      <span className="truncate">{formatGuardianPhone(contact.phone)}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" aria-hidden="true" />
                    </span>
                  </MobileEditableRow>
                ))}
              </div>
            ) : (
              <div className="flex min-h-20 items-center justify-center text-sm font-medium text-[var(--tm-text-tertiary)]">暂无联系方式</div>
            )}
          </MobileCard>
        </div>

        <MobileBottomSheet
          open={editingField !== null}
          title={currentEditingFieldConfig ? `修改${currentEditingFieldConfig.label}` : '修改资料'}
          onClose={closeFieldEditor}
          footerDivider={false}
          footer={(
            <button
              type="button"
              disabled={!canSaveField}
              onClick={saveField}
              className="h-12 w-full rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-sm font-bold text-[var(--tm-text-inverse)] active:scale-[0.98] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]"
            >
              完成
            </button>
          )}
        >
          {currentEditingFieldConfig && (
            <label className="block py-2">
              <span className={labelClass}>{currentEditingFieldConfig.label}</span>
              <input
                autoFocus
                type={currentEditingFieldConfig.type}
                value={fieldDraft}
                max={editingField === 'birthDate' ? maxBirthDate : undefined}
                maxLength={currentEditingFieldConfig.maxLength}
                onChange={event => setFieldDraft(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && canSaveField) saveField();
                }}
                placeholder={currentEditingFieldConfig.placeholder}
                aria-label={currentEditingFieldConfig.label}
                className={fieldInputClass}
              />
            </label>
          )}
        </MobileBottomSheet>

        <MobileBottomSheet
          open={showClassPicker}
          title="选择班级"
          onClose={() => setShowClassPicker(false)}
        >
          <div className="grid h-72 grid-cols-[92px_1fr] overflow-hidden rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]" aria-label="班级级联选择">
            <div className="overflow-y-auto border-r border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] p-2 no-scrollbar" aria-label="左侧先选年级">
              {gradeOptions.map(grade => (
                <button
                  key={grade}
                  type="button"
                  aria-pressed={classPickerGrade === grade}
                  onClick={() => setClassPickerGrade(grade)}
                  className={`mb-1 flex h-11 w-full items-center justify-center rounded-[var(--tm-radius-control)] text-xs font-bold transition-all ${classPickerGrade === grade ? 'bg-[var(--tm-brand-primary)] text-white' : 'text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface)]'}`}
                >
                  {grade}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto p-2 no-scrollbar" aria-label="右侧再选该年级下的班级">
              {classOptions.map(item => {
                const isSelected = selectedClass?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectClass(item)}
                    aria-pressed={isSelected}
                    className={`flex min-h-11 w-full items-center justify-between rounded-[var(--tm-radius-control)] px-3 text-left text-sm active:bg-[var(--tm-bg-surface-soft)] ${isSelected ? 'font-semibold text-[var(--tm-brand-primary)]' : 'text-[var(--tm-text-secondary)]'}`}
                  >
                    <span>{getTeacherClassDisplayName(item, currentSpace)}</span>
                    {isSelected && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>
        </MobileBottomSheet>

        <MobileBottomSheet
          open={contactSheetOpen}
          title={contactSheetMode === 'edit' ? '编辑联系方式' : '添加联系方式'}
          onClose={closeContactSheet}
          footerDivider={false}
          footer={(
            <div className="space-y-2">
              <button
                type="button"
                disabled={!canSaveContact}
                onClick={saveContact}
                className="h-12 w-full rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-sm font-bold text-[var(--tm-text-inverse)] active:scale-[0.98] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]"
              >
                {contactSheetMode === 'edit' ? '完成' : '添加'}
              </button>
              {contactSheetMode === 'edit' && (
                <button
                  type="button"
                  onClick={requestDeleteContact}
                  className="flex h-11 w-full items-center justify-center gap-2 text-sm font-semibold text-[var(--tm-status-negative)] active:bg-[var(--tm-status-negative-soft)]"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  删除联系方式
                </button>
              )}
            </div>
          )}
        >
          <div className="space-y-4 py-2">
            <label className="block">
              <span className={labelClass}>手机号</span>
              <input
                value={contactForm.phone}
                onChange={event => {
                  setContactForm(previous => ({ ...previous, phone: event.target.value.replace(/\D/g, '').slice(0, 11) }));
                  setContactFormErrors(previous => ({ ...previous, phone: undefined }));
                }}
                onBlur={() => setContactFormErrors(previous => ({ ...previous, phone: currentContactValidationErrors.phone }))}
                inputMode="tel"
                placeholder="请输入手机号"
                aria-invalid={Boolean(contactFormErrors.phone)}
                aria-describedby={contactFormErrors.phone ? 'guardian-phone-error' : undefined}
                className={`${fieldInputClass} ${contactFormErrors.phone ? 'border-[var(--tm-status-negative-strong)]' : ''}`}
              />
              {contactFormErrors.phone && <span id="guardian-phone-error" className="mt-1.5 block text-xs font-medium text-[var(--tm-status-negative-strong)]">{contactFormErrors.phone}</span>}
            </label>
            <label className="block">
              <span className={labelClass}>关系</span>
              <div className="relative mt-2">
                <select
                  value={contactForm.relation}
                  onChange={event => {
                    const relation = event.target.value as GuardianRelation;
                    setContactForm(previous => ({
                      ...previous,
                      relation,
                      relationOther: relation === '其他' ? previous.relationOther : '',
                    }));
                    setContactFormErrors(previous => ({ ...previous, relationOther: undefined }));
                  }}
                  className={relationSelectClass}
                  aria-label="家长关系"
                >
                  {guardianRelationOptions.map(relation => <option key={relation} value={relation}>{relation}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tm-text-secondary)]" aria-hidden="true" />
              </div>
            </label>
            {contactForm.relation === '其他' && (
              <label className="block">
                <span className={labelClass}>具体关系</span>
                <input
                  value={contactForm.relationOther ?? ''}
                  onChange={event => {
                    setContactForm(previous => ({ ...previous, relationOther: event.target.value }));
                    setContactFormErrors(previous => ({ ...previous, relationOther: undefined }));
                  }}
                  onBlur={() => setContactFormErrors(previous => ({ ...previous, relationOther: currentContactValidationErrors.relationOther }))}
                  placeholder="请输入具体关系"
                  aria-invalid={Boolean(contactFormErrors.relationOther)}
                  aria-describedby={contactFormErrors.relationOther ? 'guardian-relation-other-error' : undefined}
                  className={`${fieldInputClass} ${contactFormErrors.relationOther ? 'border-[var(--tm-status-negative-strong)]' : ''}`}
                />
                {contactFormErrors.relationOther && <span id="guardian-relation-other-error" className="mt-1.5 block text-xs font-medium text-[var(--tm-status-negative-strong)]">{contactFormErrors.relationOther}</span>}
              </label>
            )}
          </div>
        </MobileBottomSheet>

        <MobileConfirmSheet
          open={deleteContactIndex !== null}
          title={deletingContact ? `删除${getGuardianRelationLabel(deletingContact)} ${formatGuardianPhone(deletingContact.phone)}？` : '删除这条联系方式？'}
          description="删除后，该手机将无法查看学生报告"
          confirmLabel="确认删除"
          tone="danger"
          onClose={() => setDeleteContactIndex(null)}
          onConfirm={removeContact}
        />

        <MobileBottomSheet
          open={showAvatarSheet}
          title="更换头像"
          onClose={() => setShowAvatarSheet(false)}
          footer={avatarSheetMode === 'system' ? (
            <button
              type="button"
              disabled={!pendingAvatar}
              onClick={confirmSystemAvatar}
              className="mb-4 h-12 w-full rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-sm font-bold text-[var(--tm-text-inverse)] active:scale-[0.98] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]"
            >
              使用此头像
            </button>
          ) : undefined}
        >
          <div className="sticky top-0 z-10 bg-[var(--tm-bg-surface)] pb-3">
            <div className="grid h-11 grid-cols-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] p-1" role="tablist" aria-label="头像来源">
              {[
                { value: 'system', label: '系统头像' },
                { value: 'upload', label: '上传头像' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={avatarSheetMode === option.value}
                  onClick={() => setAvatarSheetMode(option.value as AvatarSheetMode)}
                  className={`rounded-[calc(var(--tm-radius-control)-4px)] text-sm font-semibold transition-all ${avatarSheetMode === option.value ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {avatarSheetMode === 'system' ? (
            <div className="space-y-5 pb-1">
              {systemAvatarGroups.map(group => (
                <section key={group.id} aria-labelledby={`avatar-group-${group.id}`}>
                  <h3 id={`avatar-group-${group.id}`} className="mb-2 text-sm font-semibold text-[var(--tm-text-secondary)]">{group.label}</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {group.avatars.map(avatar => {
                      const isSelected = pendingAvatar === avatar.src;
                      return (
                        <button
                          key={avatar.id}
                          type="button"
                          aria-label={`选择${avatar.label}`}
                          aria-pressed={isSelected}
                          onClick={() => setPendingAvatar(avatar.src)}
                          className={`relative aspect-square min-w-0 overflow-hidden rounded-[var(--tm-radius-inner)] border-2 bg-[var(--tm-bg-surface-soft)] transition-transform active:scale-95 ${isSelected ? 'border-[var(--tm-brand-primary)] ring-2 ring-[var(--tm-brand-primary-soft-strong)]' : 'border-transparent'}`}
                        >
                          <img src={avatar.src} alt="" className="h-full w-full object-cover" />
                          {isSelected && (
                            <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[var(--tm-brand-primary)] text-white [box-shadow:var(--tm-shadow-icon)]" aria-hidden="true">
                              <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="space-y-3 pb-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex h-14 w-full items-center gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-brand-primary-soft)] px-4 text-left font-semibold text-[var(--tm-brand-primary-pressed)] active:bg-[var(--tm-brand-primary-soft-strong)]"
              >
                <Camera className="h-5 w-5" />
                拍照
              </button>
              <button
                type="button"
                onClick={() => albumInputRef.current?.click()}
                className="flex h-14 w-full items-center gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-4 text-left font-semibold text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-muted)]"
              >
                <Image className="h-5 w-5" />
                从相册选择
              </button>
            </div>
          )}
        </MobileBottomSheet>
        <MobileToast message={toastMessage} />
      </div>
    </div>
  );
};

export default StudentBasicEditView;
