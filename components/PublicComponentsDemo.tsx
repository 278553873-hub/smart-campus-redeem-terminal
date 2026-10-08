import React, { useState } from 'react';
import MobileClassPickerSheet, {
  type MobileClassPickerSingleValue,
  type MobileClassSubjectOption,
} from '../mobile-app/components/ui/MobileClassPickerSheet';
import type { MobileClassCascadeGroup } from '../mobile-app/components/ui/MobileClassCascadePicker';
import MobileGradePickerSheet, { type MobileGradePickerOption } from '../mobile-app/components/ui/MobileGradePickerSheet';
import StudentCard, { type StudentCardVariant } from '../mobile-app/components/student/StudentCard';
import { ASSETS } from '../mobile-app/assets/images';
import { createDemoStudentPerformanceSummary } from '../mobile-app/domain/studentPerformance';
import { getStudentCardDisplaySettings } from '../mobile-app/domain/studentCardDisplay';
import { teacherBrandCssVariables } from '../mobile-app/styles/teacherMobileTokens';
import type { ClassInfo, Student } from '../mobile-app/types';
import PhoneMockup from './PhoneMockup';

type PublicComponentId = 'grade-picker' | 'class-picker' | 'student-card';
type ClassPreviewMode = 'single' | 'multiple';

const gradeOptions: ReadonlyArray<MobileGradePickerOption> = [
  { value: '一年级', label: '一年级', stage: '小学' },
  { value: '二年级', label: '二年级', stage: '小学' },
  { value: '三年级', label: '三年级', stage: '小学' },
  { value: '四年级', label: '四年级', stage: '小学' },
  { value: '五年级', label: '五年级', stage: '小学' },
  { value: '六年级', label: '六年级', stage: '小学' },
  { value: '七年级', label: '七年级', stage: '初中' },
  { value: '八年级', label: '八年级', stage: '初中' },
  { value: '九年级', label: '九年级', stage: '初中' },
  { value: '高一', label: '高一', stage: '高中' },
  { value: '高二', label: '高二', stage: '高中' },
  { value: '高三', label: '高三', stage: '高中' },
];

const gradeLabels = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];
const classGroups: MobileClassCascadeGroup[] = gradeLabels.map((gradeLabel, gradeIndex) => ({
  gradeLabel,
  classes: Array.from({ length: 8 }, (_, classIndex): ClassInfo => ({
    id: `grade-${gradeIndex + 1}-class-${classIndex + 1}`,
    name: `${2025 - gradeIndex}级${classIndex + 1}班`,
    classCode: `G${gradeIndex + 1}C${classIndex + 1}`,
    gradeLevel: gradeLabel,
    studentCount: 42 + ((gradeIndex + classIndex) % 7),
    tags: [],
    classNumber: classIndex + 1,
  })),
}));

const subjectOptions: ReadonlyArray<MobileClassSubjectOption> = [
  { value: '语文', label: '语文' },
  { value: '数学', label: '数学' },
  { value: '英语', label: '英语' },
  { value: '体育', label: '体育' },
  { value: '音乐', label: '音乐' },
  { value: '美术', label: '美术' },
  { value: '科学', label: '科学' },
  { value: '信息', label: '信息' },
];

const studentCardDemoStudents: Student[] = [
  { id: 'student-01', name: '王小明', gender: 'male', grade: '三年级', class: '3班', studentNo: '20250301', avatar: ASSETS.AVATAR.SYSTEM_BOYS[0] },
  { id: 'student-02', name: '李思思', gender: 'female', grade: '三年级', class: '3班', studentNo: '20250302', avatar: ASSETS.AVATAR.SYSTEM_GIRLS[0] },
  { id: 'student-03', name: '陈一诺', gender: 'male', grade: '三年级', class: '3班', studentNo: '20250303', avatar: ASSETS.AVATAR.SYSTEM_BOYS[1] },
  { id: 'student-04', name: '赵雨桐', gender: 'female', grade: '三年级', class: '3班', studentNo: '20250304', avatar: ASSETS.AVATAR.SYSTEM_GIRLS[1] },
];

const studentCardFullParameterRows = [
  ['variant', "'full'", '完全版，用于班级学生列表、小组详情等需要完整等级与评价数据的场景。'],
  ['student', 'Student', '学生数据，包含姓名、性别、头像、学号等。'],
  ['index', 'number', '用于头像色调轮换，保持相邻学生视觉区分。'],
  ['performance', 'StudentPerformanceSummary', '表扬与待改进的累计分值，驱动等级与评价展示。'],
  ['levelNetScore', 'number', '可选，覆盖等级计算的净分值；缺省使用 performance.netScore。'],
  ['displaySettings', 'StudentCardDisplaySettings', '控制等级、表扬、待改进的展示开关与等级形态。'],
  ['showSelection / selected', 'boolean', '是否显示右上角勾选角标及当前选中态。'],
  ['selectionStatus', 'string', '可选，补充读屏的选中状态说明。'],
  ['contextLabel', 'string', '可选，卡片顶部的归属说明，如“已加入小组”。'],
  ['onClick', 'function', '卡片点击回调。'],
] as const;

const studentCardCompactParameterRows = [
  ['variant', "'compact'", '简化版，用于分组、选人等底部弹窗中的轻量选择卡片。'],
  ['student', 'Student', '学生数据。'],
  ['selected', 'boolean', '当前是否选中，控制右上角勾选角标。'],
  ['selectionDescription', 'string', '可选，补充读屏名称，如“第1组”。'],
  ['secondaryLabel', 'string', '可选，姓名下方的辅助信息，如规范化班级名。'],
  ['showRosterNumber', 'boolean', '是否显示姓名前的两位班内号；跨班搜索时可关闭。'],
  ['onClick', 'function', '卡片点击回调。'],
] as const;

const studentCardFullUsageExample = `<StudentCard
  variant="full"
  student={student}
  index={index}
  performance={performance}
  displaySettings={displaySettings}
  showSelection={isSelectionMode}
  selected={selectedIds.has(student.id)}
  onClick={toggle}
/>`;

const studentCardCompactUsageExample = `<StudentCard
  variant="compact"
  student={student}
  selected={isSelected(student.id)}
  showRosterNumber
  secondaryLabel={student.classLabel}
  onClick={() => toggle(student.id)}
/>`;

const gradeParameterRows = [
  ['open', 'boolean', '是否打开弹窗。'],
  ['options', 'MobileGradePickerOption[]', '当前操作人可见的年级列表，由调用方按权限过滤后传入。'],
  ['selectionMode', 'single | multiple', '单选立即生效并关闭；多选通过底部“完成”提交。'],
  ['value / values', 'string / string[]', '单选或多选的当前值。'],
  ['showAllGradesOption', 'boolean', '是否由组件在首位展示“全部年级”；多选时表示选中全部具体年级。'],
  ['allGradesValue / allGradesLabel', 'string / ReactNode', '按需覆盖“全部年级”的提交值和展示文案。'],
  ['showStageName', 'boolean', '是否显示小学、初中、高中分组；开启时选项需要提供学段。'],
  ['showClearButton', 'boolean', '是否显示清空操作；没有已选年级时保持展示并进入禁用态。'],
  ['onChange / onConfirm', 'function', '单选变化或多选完成时的提交回调。'],
] as const;

const classParameterRows = [
  ['groups', 'MobileClassCascadeGroup[]', '当前操作人可见的年级及班级，由调用方完成权限过滤。'],
  ['selectionMode', 'single | multiple', '控制单选圆点或多选复选框。'],
  ['value / values', 'object / string[]', '单选同时保存年级与班级，多选保存班级编号集合。'],
  ['commitMode', 'immediate | confirm', '单选可点击即生效，也可通过底部“完成”统一提交。'],
  ['showEducationStagePrefix', 'boolean', '是否在班级名称前显示“小 / 初 / 高”学段前缀，例如“小2025级1班”。'],
  ['showGradeSelectAll', 'boolean', '多选场景是否提供“全选本年级”。'],
  ['getClassMeta', 'function', '按需在班级右侧展示学生人数等辅助信息。'],
  ['subjectOptions', 'MobileClassSubjectOption[]', '传入后展示任教学科；不传则整段隐藏。'],
  ['subjectSelectionMode', 'single | multiple', '任教学科使用单选或多选。'],
  ['subjectValue', 'string | string[]', '当前任教学科，随班级选择结果一起提交。'],
  ['showClearButton', 'boolean', '开启后始终占位，无内容可清空时进入禁用态。'],
  ['requireSelection', 'boolean', '是否必须至少选择一个班级后才能完成。'],
] as const;

const gradeUsageExample = `<MobileGradePickerSheet
  open={open}
  options={visibleGrades}
  selectionMode="single"
  value={selectedGrade}
  showAllGradesOption
  showStageName
  onChange={setSelectedGrade}
  onClose={close}
/>`;

const classUsageExample = `<MobileClassPickerSheet
  open={open}
  groups={visibleClassGroups}
  selectionMode="multiple"
  values={selectedClassIds}
  showEducationStagePrefix={showEducationStagePrefix}
  subjectSelectionMode="multiple"
  subjectOptions={canEditSubject ? subjects : undefined}
  subjectValue={selectedSubjects}
  showGradeSelectAll
  showClearButton
  requireSelection
  onConfirm={(classIds, subject) => save({ classIds, subject })}
  onClose={close}
/>`;

const PreviewToggle: React.FC<{
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}> = ({ checked, label, onChange }) => (
  <label className="flex min-h-9 cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
    <input
      type="checkbox"
      checked={checked}
      onChange={event => onChange(event.target.checked)}
      className="h-4 w-4 accent-[var(--tm-brand-primary)]"
    />
    {label}
  </label>
);

const ParameterTable: React.FC<{ rows: ReadonlyArray<readonly [string, string, string]> }> = ({ rows }) => (
  <table className="w-full table-fixed border-collapse text-left text-xs leading-5">
    <thead>
      <tr className="border-b border-slate-200 text-slate-500">
        <th className="w-[27%] py-2 pr-4 font-medium">参数</th>
        <th className="w-[31%] py-2 pr-4 font-medium">类型</th>
        <th className="py-2 font-medium">用途</th>
      </tr>
    </thead>
    <tbody>
      {rows.map(([name, type, description]) => (
        <tr key={name} className="border-b border-slate-100 align-top last:border-0">
          <td className="[overflow-wrap:anywhere] py-2.5 pr-4 font-mono font-semibold text-slate-800">{name}</td>
          <td className="[overflow-wrap:anywhere] py-2.5 pr-4 font-mono text-slate-500">{type}</td>
          <td className="py-2.5 text-slate-600">{description}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const PublicComponentsDemo: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<PublicComponentId>('class-picker');
  const [gradePreviewMode, updateGradePreviewMode] = useState<'single' | 'multiple'>('multiple');
  const [gradeSheetVisible, updateGradeSheetVisible] = useState(true);
  const [selectedGrades, setSelectedGrades] = useState<string[]>(['三年级']);
  const [selectedGrade, setSelectedGrade] = useState('三年级');
  const [showGradeStage, setShowGradeStage] = useState(true);
  const [showGradeClear, setShowGradeClear] = useState(true);
  const [showAllGradesOption, setShowAllGradesOption] = useState(true);
  const [classPreviewMode, setClassPreviewMode] = useState<ClassPreviewMode>('multiple');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([
    classGroups[0].classes[0].id,
    classGroups[0].classes[2].id,
  ]);
  const [singleClassValue, setSingleClassValue] = useState<MobileClassPickerSingleValue>({
    gradeValue: '一年级',
    classId: classGroups[0].classes[0].id,
  });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['语文']);
  const [showSubjectPicker, setShowSubjectPicker] = useState(true);
  const [subjectSelectionMode, setSubjectSelectionMode] = useState<'single' | 'multiple'>('single');
  const [classCommitMode, setClassCommitMode] = useState<'immediate' | 'confirm'>('confirm');
  const [requireClassSelection, setRequireClassSelection] = useState(true);
  const [showEducationStagePrefix, setShowEducationStagePrefix] = useState(false);
 const [showGradeSelectAll, setShowGradeSelectAll] = useState(true);
 const [showClassClear, setShowClassClear] = useState(true);
  const [showClassMeta, setShowClassMeta] = useState(false);
 const [studentCardVariant, setStudentCardVariant] = useState<StudentCardVariant>('full');
  const [studentCardSelected, setStudentCardSelected] = useState(false);
  const [studentCardShowClass, setStudentCardShowClass] = useState(false);
  const [studentCardShowLevel, setStudentCardShowLevel] = useState(true);
  const [studentCardLevelForm, setStudentCardLevelForm] = useState<'icon' | 'score'>('icon');
  const [studentCardShowPraise, setStudentCardShowPraise] = useState(true);
  const [studentCardShowCriticism, setStudentCardShowCriticism] = useState(true);
  const isClassPicker = activeComponent === 'class-picker';
  const isStudentCard = activeComponent === 'student-card';
  const isGradePicker = activeComponent === 'grade-picker';
  const selectedSubjectValue = subjectSelectionMode === 'multiple' ? selectedSubjects : selectedSubjects[0] ?? '';
  const handlePreviewSubjectChange = (value: string | string[]) => {
    setSelectedSubjects(Array.isArray(value) ? value : value ? [value] : []);
  };
  const previewGroups = classGroups;
  const studentCardDisplaySettings = getStudentCardDisplaySettings({
    showLevel: studentCardShowLevel,
    levelForm: studentCardLevelForm,
    showEvaluation: studentCardShowPraise || studentCardShowCriticism,
    showPraise: studentCardShowPraise,
    showCriticism: studentCardShowCriticism,
  });
  const activeRows = isStudentCard
    ? studentCardVariant === 'full'
      ? studentCardFullParameterRows
      : studentCardCompactParameterRows
    : isClassPicker
      ? classParameterRows
      : gradeParameterRows;
  const activeUsageExample = isStudentCard
    ? studentCardVariant === 'full'
      ? studentCardFullUsageExample
      : studentCardCompactUsageExample
    : isClassPicker
      ? classUsageExample
      : gradeUsageExample;

  return (
    <main
      className="relative grid h-full min-h-0 grid-cols-[200px_minmax(0,1fr)] bg-slate-100 max-[720px]:grid-cols-1 max-[720px]:grid-rows-[auto_minmax(0,1fr)]"
      style={teacherBrandCssVariables as React.CSSProperties}
    >
      <nav className="relative z-10 border-r border-slate-200 bg-white p-3 max-[720px]:border-r-0 max-[720px]:border-b" aria-label="公共组件目录">
        <h2 className="px-3 py-2 text-sm font-semibold text-[var(--tm-text-primary)]">公共组件</h2>
        <div className="space-y-1">
          {([
            ['grade-picker', '年级选择弹窗'],
            ['class-picker', '班级选择弹窗'],
            ['student-card', '学生卡片'],
          ] as const).map(([id, label]) => {
            const active = activeComponent === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActiveComponent(id);
                  if (id === 'grade-picker') updateGradeSheetVisible(true);
                }}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-11 w-full items-center rounded-[var(--tm-radius-control)] px-3 text-left text-sm font-semibold ${active
                  ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]'
                  : 'text-[var(--tm-text-secondary)] hover:bg-slate-50'}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      <section className="grid min-h-0 grid-cols-[440px_minmax(0,1fr)] overflow-hidden max-[1120px]:grid-cols-1 max-[1120px]:overflow-y-auto" aria-label={isStudentCard ? '学生卡片组件说明' : isClassPicker ? '班级选择弹窗组件说明' : '年级选择弹窗组件说明'}>
        <div className="relative min-h-0 overflow-hidden max-[1120px]:h-[700px]">
          <div className="absolute inset-y-4 left-[46%] w-[900px] -translate-x-1/2">
            <PhoneMockup showDeviceFrame contentTopInsetMode="status-bar" screenOverlayRootId="teacher-mobile-overlay-root">
              <div className="relative flex min-h-0 flex-1 flex-col bg-[var(--tm-bg-page)]">
                {isStudentCard ? (
                  <div className="flex min-h-0 flex-1 flex-col bg-[var(--tm-bg-page)]">
                    <div className="flex h-12 shrink-0 items-center border-b border-[var(--tm-border-subtle)] px-4 text-[15px] font-semibold text-[var(--tm-text-primary)]">
                      {studentCardVariant === 'full' ? '完全版 · 班级列表' : '简化版 · 分组弹窗'}
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
                      <div className="grid grid-cols-4 gap-x-2.5 gap-y-3">
                        {studentCardDemoStudents.map((student, index) => (
                          studentCardVariant === 'full' ? (
                            <StudentCard
                              key={student.id}
                              variant="full"
                              student={student}
                              index={index}
                              performance={createDemoStudentPerformanceSummary(student)}
                              displaySettings={studentCardDisplaySettings}
                              showSelection
                              selected={studentCardSelected}
                              contextLabel={studentCardShowClass ? student.grade + student.class : undefined}
                              onClick={() => undefined}
                            />
                          ) : (
                            <StudentCard
                              key={student.id}
                              variant="compact"
                              student={student}
                              selected={studentCardSelected}
                              showRosterNumber
                              secondaryLabel={studentCardShowClass ? student.grade + student.class : undefined}
                              onClick={() => undefined}
                            />
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  isGradePicker && !gradeSheetVisible && (
                    <div className="flex flex-1 items-center justify-center px-8">
                      <button
                        type="button"
                        onClick={() => updateGradeSheetVisible(true)}
                        className="flex h-11 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-5 text-sm font-semibold text-[var(--tm-text-inverse)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                      >
                        打开年级选择器
                      </button>
                    </div>
                  )
                )}
              </div>
            </PhoneMockup>
          </div>
        </div>

        <article className="min-h-0 overflow-y-auto border-l border-slate-200 bg-white px-8 py-7 max-[1120px]:overflow-visible max-[1120px]:border-l-0 max-[1120px]:border-t max-[720px]:px-5">
          <header className="pb-6">
            <p className="text-xs font-semibold text-[var(--tm-brand-primary-strong)]">通用组件层 · 教师手机端</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{isStudentCard ? 'StudentCard' : isClassPicker ? 'MobileClassPickerSheet' : 'MobileGradePickerSheet'}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {isStudentCard
                ? '教师手机端统一学生卡片，完全版承载班级列表与小组详情的完整信息，简化版承载分组与选人弹窗的轻量选择。'
                : isClassPicker
                  ? '用于按年级定位并选择一个或多个班级，统一单选、多选、整年级选择、任教学科和提交方式。'
                  : '用于在底部弹窗中选择一个或多个年级，统一学段分组、选中状态、提交方式和无障碍行为。'}
            </p>
          </header>

          <section className="border-t border-slate-200 py-5" aria-labelledby="picker-preview-config">
            <h3 id="picker-preview-config" className="text-sm font-semibold text-slate-950">预览配置</h3>
            {isStudentCard ? (
              <>
                <div className="mt-3 flex h-9 w-fit rounded-[var(--tm-radius-control)] bg-slate-100 p-1" role="group" aria-label="选择学生卡片版本">
                  {(['full', 'compact'] as const).map(variant => (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => setStudentCardVariant(variant)}
                      aria-pressed={studentCardVariant === variant}
                      className={`flex min-w-20 items-center justify-center rounded-[6px] px-3 text-xs font-semibold ${studentCardVariant === variant ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                    >
                      {variant === 'full' ? '完全版' : '简化版'}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  {studentCardVariant === 'full'
                    ? '完全版保留等级、评价与归属信息，适用于班级学生列表和小组详情。'
                    : '简化版只保留头像、姓名和选择态，适用于分组与选人弹窗。'}
                </p>
                <div className="mt-4">
                  <span className="text-xs font-medium text-slate-500">选择状态</span>
                  <div className="mt-2 flex h-9 w-fit rounded-[var(--tm-radius-control)] bg-slate-100 p-1" role="group" aria-label="选择学生卡片选择状态">
                    {([
                      ['idle', '待选态'],
                      ['selected', '已选态'],
                    ] as const).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setStudentCardSelected(value === 'selected')}
                        aria-pressed={studentCardSelected === (value === 'selected')}
                        className={'flex min-w-20 items-center justify-center rounded-[6px] px-3 text-xs font-semibold ' + (studentCardSelected === (value === 'selected') ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500')}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-5 max-[620px]:grid-cols-1">
                  <PreviewToggle checked={studentCardShowClass} label="显示班级" onChange={setStudentCardShowClass} />
                  {studentCardVariant === 'full' && (
                    <>
                      <PreviewToggle checked={studentCardShowLevel} label="显示等级" onChange={setStudentCardShowLevel} />
                      <PreviewToggle checked={studentCardShowPraise} label="显示表扬" onChange={setStudentCardShowPraise} />
                      <PreviewToggle checked={studentCardShowCriticism} label="显示待改进" onChange={setStudentCardShowCriticism} />
                    </>
                  )}
                </div>
                {studentCardVariant === 'full' && studentCardShowLevel && (
                  <div className="mt-3">
                    <span className="text-xs font-medium text-slate-500">等级显示形式</span>
                    <div className="mt-2 flex h-9 w-fit rounded-[var(--tm-radius-control)] bg-slate-100 p-1" role="group" aria-label="选择等级显示形式">
                      {(['icon', 'score'] as const).map(form => (
                        <button
                          key={form}
                          type="button"
                          onClick={() => setStudentCardLevelForm(form)}
                          aria-pressed={studentCardLevelForm === form}
                          className={'flex min-w-20 items-center justify-center rounded-[6px] px-3 text-xs font-semibold ' + (studentCardLevelForm === form ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500')}
                        >
                          {form === 'icon' ? '图标' : '分值'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : isClassPicker ? (
              <>
              <span className="text-xs font-medium text-slate-500">班级选择</span>
              <div className="mt-3 flex h-9 w-fit rounded-[var(--tm-radius-control)] bg-slate-100 p-1" role="group" aria-label="选择预览模式">
                {(['single', 'multiple'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                   onClick={() => setClassPreviewMode(mode)}
                   aria-pressed={classPreviewMode === mode}
                   className={`min-w-20 rounded-[6px] px-3 text-xs font-semibold ${classPreviewMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                 >
                    {mode === 'single' ? '班级单选' : '班级多选'}
                 </button>
                ))}
              </div>
             {classPreviewMode === 'single' && !showSubjectPicker && (
                <div className="mt-3">
                  <span className="text-xs font-medium text-slate-500">单选提交方式</span>
                  <div className="mt-2 flex h-9 w-fit rounded-[var(--tm-radius-control)] bg-slate-100 p-1" role="group" aria-label="选择单选提交方式">
                    {(['immediate', 'confirm'] as const).map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setClassCommitMode(mode)}
                        aria-pressed={classCommitMode === mode}
                        className={`min-w-24 rounded-[6px] px-3 text-xs font-semibold ${classCommitMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                      >
                        {mode === 'immediate' ? '点击即生效' : '点击完成提交'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-3 grid grid-cols-2 gap-x-5 max-[620px]:grid-cols-1">
               <PreviewToggle checked={showEducationStagePrefix} label="显示小初高学段前缀" onChange={setShowEducationStagePrefix} />
               <PreviewToggle checked={showClassClear} label="显示清空已选" onChange={setShowClassClear} />
                <PreviewToggle checked={showClassMeta} label="显示班级人数统计" onChange={setShowClassMeta} />
               <PreviewToggle checked={requireClassSelection} label="完成前必须选择班级" onChange={setRequireClassSelection} />
                {classPreviewMode === 'multiple' && (
                  <>
                    <PreviewToggle checked={showGradeSelectAll} label="显示全选本年级" onChange={setShowGradeSelectAll} />
                  </>
                )}
              </div>
              <span className="text-xs font-medium text-slate-500">班级任教信息选择</span>
              <div className="mt-2 grid grid-cols-2 gap-x-5 max-[620px]:grid-cols-1">
                <PreviewToggle checked={showSubjectPicker} label="显示任教学科" onChange={setShowSubjectPicker} />
                {showSubjectPicker && (
                  <PreviewToggle checked={subjectSelectionMode === 'multiple'} label="任教学科支持多选" onChange={checked => setSubjectSelectionMode(checked ? 'multiple' : 'single')} />
                )}
              </div>
              </>
            ) : (
              <>
                <div className="mt-3 flex h-9 w-fit rounded-[var(--tm-radius-control)] bg-slate-100 p-1" role="group" aria-label="选择预览模式">
                  {(['single', 'multiple'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => updateGradePreviewMode(mode)}
                      aria-pressed={gradePreviewMode === mode}
                      className={`min-w-20 rounded-[6px] px-3 text-xs font-semibold ${gradePreviewMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                    >
                      {mode === 'single' ? '单选' : '多选'}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex flex-col gap-1">
                  <PreviewToggle checked={showGradeStage} label="显示学段分组" onChange={setShowGradeStage} />
                  <PreviewToggle checked={showAllGradesOption} label="显示全部年级" onChange={setShowAllGradesOption} />
                  <PreviewToggle checked={showGradeClear} label="显示清空操作" onChange={setShowGradeClear} />
                </div>
              </>
            )}
          </section>

          <section className="border-t border-slate-200 py-5" aria-labelledby="picker-scenarios">
            <h3 id="picker-scenarios" className="text-sm font-semibold text-slate-950">适用场景</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {isStudentCard
                ? '完全版用于班级学生列表、小组详情；简化版用于新建分组、调整学生、选人等弹窗。'
                : isClassPicker
                  ? '评价记录筛选、切换带班班级、任教班级配置、问卷发送范围和学生所在班级。'
                  : '班级列表筛选、班级排行榜范围、报告生成年级和教师分管年级。'}
            </p>
          </section>

          <section className="border-t border-slate-200 py-5" aria-labelledby="picker-parameters">
            <h3 id="picker-parameters" className="text-sm font-semibold text-slate-950">核心入参</h3>
            <div className="mt-3"><ParameterTable rows={activeRows} /></div>
          </section>

          <section className="border-t border-slate-200 py-5" aria-labelledby="picker-permission">
            <h3 id="picker-permission" className="text-sm font-semibold text-slate-950">数据与权限边界</h3>
            <p className="mt-2 border-l-2 border-[var(--tm-brand-primary)] pl-3 text-sm leading-6 text-slate-600">
              组件不接收操作人身份，也不判断教师或管理员权限。调用方先按当前操作人的权限过滤数据，再将最终可见范围传入组件。
            </p>
          </section>

          <section className="border-t border-slate-200 py-5" aria-labelledby="picker-example">
            <h3 id="picker-example" className="text-sm font-semibold text-slate-950">使用示例</h3>
            <pre className="mt-3 overflow-x-auto rounded-[var(--tm-radius-control)] bg-slate-950 p-4 text-xs leading-5 text-slate-100"><code>{activeUsageExample}</code></pre>
          </section>

          <section className="border-t border-slate-200 pt-5" aria-labelledby="picker-rules">
            <h3 id="picker-rules" className="text-sm font-semibold text-slate-950">交互规则</h3>
            {isStudentCard ? (
              <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                <li>完全版与简化版共用白色表面、圆角和右上角勾选角标，勾选状态淡入显示。</li>
                <li>完全版按展示开关计算高度，等级、表扬、待改进全部关闭时保持最小高度，不出现空白行。</li>
                <li>完全版头像带等级进度环，等级形态可切换图标或分值；简化版只保留 48 像素真实头像。</li>
                <li>简化版姓名固定 12 像素、500 字重，辅助信息放在姓名下方，不抢占触控高度。</li>
                <li>班内号只展示末两位，完整学号通过读屏标签保留，两个版本统一使用 NumberFont。</li>
                <li>完全版用于信息密集的花名册，简化版用于弹窗内快速勾选，避免在同一场景混用两套卡片。</li>
              </ul>
            ) : isClassPicker ? (
              <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                <li>左侧年级只负责导航，使用浅表面和主题色侧边标识；右侧班级才是最终选择结果。</li>
                <li>单选只允许选择具体班级；多选可按需开启“全部班级”和“全选本年级”。</li>
                <li>班级行保持白色表面和浅分隔线，单选使用圆点，多选使用复选框，不增加整行红色背景。</li>
                <li>班级名称默认显示“2025级1班”，通过 <code className="font-mono text-xs">showEducationStagePrefix</code> 可显示为“小2025级1班”。</li>
                <li>只有一个可见年级时自动隐藏左栏；学生人数等辅助信息通过 <code className="font-mono text-xs">getClassMeta</code> 按需提供。</li>
                <li>任教学科由 <code className="font-mono text-xs">subjectOptions</code> 和 <code className="font-mono text-xs">subjectSelectionMode</code> 控制，不传入时不保留空白区域。</li>
                <li>完成和清空操作不提供按压变色或缩放；开启清空后始终占位，以保持弹窗高度稳定。</li>
              </ul>
            ) : (
              <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                <li>单选点击年级后立即回传并关闭；多选只修改临时值，点击“完成”后提交。</li>
                <li>选项固定每行三项；胶囊可见高度44像素、触控高度48像素，文案居中。</li>
                <li>短文本选择项复用通用 <code className="font-mono text-xs">--tm-choice-pill-*</code> 状态变量；选中态不显示勾选图标。</li>
                <li>开启清空能力后按钮始终占位；没有已选年级时进入禁用态，保持弹窗尺寸稳定。</li>
              </ul>
            )}
          </section>
        </article>
      </section>

      {isStudentCard ? null : isClassPicker ? classPreviewMode === 'multiple' ? (
        <MobileClassPickerSheet
          open
          groups={previewGroups}
          selectionMode="multiple"
          values={selectedClassIds}
          showEducationStagePrefix={showEducationStagePrefix}
          subjectOptions={showSubjectPicker ? subjectOptions : undefined}
          subjectSelectionMode={subjectSelectionMode}
          subjectValue={selectedSubjectValue}
         showGradeSelectAll={showGradeSelectAll}
         showClearButton={showClassClear}
         requireSelection={requireClassSelection}
          getClassMeta={showClassMeta ? (classInfo => `${classInfo.studentCount}人`) : undefined}
         onSelectionChange={setSelectedClassIds}
          onSubjectSelectionChange={handlePreviewSubjectChange}
          onConfirm={(classIds, subject) => {
            setSelectedClassIds(classIds);
            if (subject !== undefined) handlePreviewSubjectChange(subject);
          }}
          onClear={() => {
            setSelectedClassIds([]);
            setSelectedSubjects([]);
          }}
          onClose={() => undefined}
        />
      ) : (
        <MobileClassPickerSheet
          open
          groups={previewGroups}
          selectionMode="single"
          value={singleClassValue}
          commitMode={classCommitMode}
          showEducationStagePrefix={showEducationStagePrefix}
          subjectOptions={showSubjectPicker ? subjectOptions : undefined}
          subjectSelectionMode={subjectSelectionMode}
          subjectValue={selectedSubjectValue}
         showClearButton={showClassClear}
         requireSelection={requireClassSelection}
          getClassMeta={showClassMeta ? (classInfo => `${classInfo.studentCount}人`) : undefined}
         onSubjectSelectionChange={handlePreviewSubjectChange}
          onChange={(value, subject) => {
            setSingleClassValue(value);
            if (subject !== undefined) handlePreviewSubjectChange(subject);
          }}
          onClear={() => {
            setSingleClassValue({ gradeValue: '三年级', classId: '' });
            setSelectedSubjects([]);
          }}
          onClose={() => undefined}
        />
      ) : gradePreviewMode === 'multiple' ? (
        <MobileGradePickerSheet
          open={gradeSheetVisible}
          title="选择年级"
          options={gradeOptions}
          selectionMode="multiple"
          values={selectedGrades}
          showAllGradesOption={showAllGradesOption}
          showStageName={showGradeStage}
          showClearButton={showGradeClear}
          onSelectionChange={setSelectedGrades}
          onConfirm={setSelectedGrades}
          onClear={() => setSelectedGrades([])}
          onClose={() => updateGradeSheetVisible(false)}
          clearLabel="清空已选"
          ariaLabel="年级选项"
        />
      ) : (
        <MobileGradePickerSheet
          open={gradeSheetVisible}
          title="选择年级"
          options={gradeOptions}
          selectionMode="single"
          value={selectedGrade}
          showAllGradesOption={showAllGradesOption}
          showStageName={showGradeStage}
          showClearButton={showGradeClear}
          onChange={value => {
            setSelectedGrade(value);
            updateGradeSheetVisible(false);
          }}
          onClear={() => setSelectedGrade('')}
          onClose={() => updateGradeSheetVisible(false)}
          clearLabel="清空已选"
          ariaLabel="年级选项"
        />
      )}
    </main>
  );
};

export default PublicComponentsDemo;
