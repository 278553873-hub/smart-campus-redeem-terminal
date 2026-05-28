import React, { useMemo, useRef, useState } from 'react';
import { Camera, ChevronLeft, Image, Plus, Trash2, UsersRound } from 'lucide-react';
import { ClassInfo, Student } from '../types';
import { ASSETS } from '../assets/images';
import { MobileCard } from '../components/ui/MobileCard';
import { IconBadge } from '../components/ui/IconBadge';
import { phoneText } from '../styles/phoneTokens';

interface StudentBasicEditViewProps {
  student: Student;
  classes: ClassInfo[];
  onBack: () => void;
  onSave: (student: Student) => void;
}

const fieldInputClass = 'mt-2 h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50';
const labelClass = `${phoneText.label} text-slate-500`;

const normalizePhones = (phones: string[]) => phones.map(phone => phone.trim()).filter(Boolean);


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

  const updatePhone = (index: number, value: string) => {
    setDraft(prev => ({
      ...prev,
      reservedPhones: (prev.reservedPhones ?? []).map((phone, phoneIndex) => phoneIndex === index ? value : phone),
    }));
  };

  const addPhone = () => {
    setDraft(prev => ({ ...prev, reservedPhones: [...(prev.reservedPhones ?? []), ''] }));
  };

  const removePhone = (index: number) => {
    setDraft(prev => {
      const nextPhones = (prev.reservedPhones ?? []).filter((_, phoneIndex) => phoneIndex !== index);
      return { ...prev, reservedPhones: nextPhones.length ? nextPhones : [''] };
    });
  };

  const saveBasicInfo = () => {
    onSave({
      ...draft,
      name: draft.name.trim() || student.name,
      studentNo: draft.studentNo?.trim() || student.studentNo,
      reservedPhones: normalizePhones(draft.reservedPhones ?? []),
    });
  };

  return (
    <div className="h-full min-h-0 overflow-hidden bg-[#F8FAFC]">
      <div className="flex h-full min-h-0 flex-col">
        <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={readAvatarFile} />
        <input ref={albumInputRef} type="file" accept="image/*" className="hidden" onChange={readAvatarFile} />
        <header className="flex h-11 shrink-0 items-center justify-between border-b border-slate-100/80 bg-white/90 px-4 backdrop-blur-md">
          <button onClick={onBack} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 active:bg-slate-100" aria-label="返回学生详情">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className={`${phoneText.navTitle} text-slate-900`}>基础信息编辑</h1>
          <div className="h-10 w-10" aria-hidden="true" />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 pb-28 no-scrollbar">
          <MobileCard variant="card" padding="md" className="space-y-4">
            <div>
              <span className={labelClass}>头像</span>
              <div className="mt-2 flex items-center justify-between rounded-3xl border border-slate-100 bg-slate-50 p-3">
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
                  className="flex h-10 items-center gap-1 rounded-full bg-blue-50 px-3 text-xs font-semibold text-blue-600 active:scale-95"
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
                    className={`h-12 rounded-2xl border text-sm font-semibold transition-all active:scale-[0.98] ${draft.gender === option.value ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-500'}`}
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

            <div>
              <span className={labelClass}>学生状态</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { value: 'active', label: '在校' },
                  { value: 'left', label: '离校' },
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDraft(prev => ({ ...prev, status: option.value as Student['status'] }))}
                    className={`h-12 rounded-2xl border text-sm font-semibold transition-all active:scale-[0.98] ${draft.status === option.value ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-500'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className={labelClass}>所在班级</span>
              <button
                type="button"
                onClick={toggleClassPicker}
                className="mt-2 flex h-12 w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 text-left text-sm font-medium text-slate-900 active:bg-slate-100"
              >
                <span>{formatCompactClassName(draft.class)}</span>
                <span className="text-xs font-semibold text-blue-500">更换</span>
              </button>
              {showClassPicker && (
                <div className="mt-2 grid h-56 grid-cols-[92px_1fr] overflow-hidden rounded-2xl border border-slate-100 bg-white" aria-label="班级级联选择">
                  <div className="overflow-y-auto border-r border-slate-100 bg-slate-50/80 p-2 no-scrollbar" aria-label="左侧先选入学年级">
                    {yearOptions.map(year => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => setClassPickerYear(year)}
                        className={`mb-1 flex h-10 w-full items-center justify-center rounded-xl text-xs font-bold transition-all ${classPickerYear === year ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 active:bg-white'}`}
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
                        className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-sm active:bg-slate-50 ${selectedClass?.id === item.id ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600'}`}
                      >
                        <span>{formatCompactClassName(item.name)}</span>
                        <span className="text-xs text-slate-400">{item.gradeLevel}</span>
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
                <IconBadge icon={UsersRound} tone="teal" size="sm" />
                <h2 className={`${phoneText.sectionTitle} text-slate-900`}>预留手机</h2>
              </div>
              <button type="button" onClick={addPhone} className="flex h-10 items-center gap-1 rounded-full bg-teal-50 px-3 text-xs font-semibold text-teal-700 active:scale-95">
                <Plus className="h-4 w-4" /> 添加预留手机
              </button>
            </div>

            <div className="space-y-3">
              {(draft.reservedPhones ?? ['']).map((phone, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    className="h-12 min-w-0 flex-1 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none focus:border-teal-300 focus:bg-white focus:ring-4 focus:ring-teal-50"
                    value={phone}
                    onChange={event => updatePhone(index, event.target.value)}
                    placeholder="请输入预留手机号"
                  />
                  <button type="button" onClick={() => removePhone(index)} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 active:scale-95" aria-label="删除预留手机">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </MobileCard>
        </div>


        {showAvatarSheet && (
          <div className="absolute inset-0 z-[130] flex items-end bg-slate-950/30 px-4 pb-5" onClick={() => setShowAvatarSheet(false)}>
            <div className="w-full rounded-[32px] bg-white p-4 shadow-2xl" onClick={event => event.stopPropagation()}>
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200" />
              <h3 className="px-2 text-center text-lg font-extrabold text-slate-900">更换头像</h3>
              <div className="mt-5 space-y-2">
                <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex h-14 w-full items-center gap-3 rounded-2xl bg-blue-50 px-4 text-left font-bold text-blue-600 active:bg-blue-100">
                  <Camera className="h-5 w-5" />
                  拍照
                </button>
                <button type="button" onClick={() => albumInputRef.current?.click()} className="flex h-14 w-full items-center gap-3 rounded-2xl bg-slate-50 px-4 text-left font-bold text-slate-700 active:bg-slate-100">
                  <Image className="h-5 w-5" />
                  从相册选择
                </button>
                <button type="button" onClick={() => setShowAvatarSheet(false)} className="flex h-12 w-full items-center justify-center rounded-2xl text-sm font-bold text-slate-400 active:bg-slate-50">
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 border-t border-slate-100 bg-white/95 px-5 pb-5 pt-3 shadow-[0_-10px_40px_rgba(15,23,42,0.08)] backdrop-blur-md">
          <button onClick={saveBasicInfo} className="h-12 w-full rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-200 active:scale-[0.98]">
            保存基础信息
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentBasicEditView;
