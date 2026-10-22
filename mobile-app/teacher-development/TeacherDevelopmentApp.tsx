import React, { useEffect, useRef, useState } from 'react';
import { Check, Sparkles, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import PhoneMockup from '../../components/PhoneMockup';
import TeacherMobileScreenBackground from '../components/TeacherMobileScreenBackground';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobilePageHeader from '../components/ui/MobilePageHeader';
import MobileFullScreenPage from '../components/ui/MobileFullScreenPage';
import DevelopmentMeView, { ME_FEATURE_TITLES, requiresManagementAccess, type MeFeature } from './DevelopmentMeView';
import { PersonalSettingsPage, DevelopmentAssistantPage, DevelopmentFeedbackPage } from './MeFeaturePages';
import { IndicatorSettingsPage, PeriodSettingsPage } from './ManagementSettingsPages';
import { useMePreferences } from './useMePreferences';
import MobileToast from '../components/ui/MobileToast';
import { mobileSheetActionClass } from '../components/ui/mobileSheetActionStyles';
import MobileDateCalendar from '../components/ui/MobileDateCalendar';
import MobileSearchInput from '../components/ui/MobileSearchInput';
import CompactSegmentedControl from '../components/ui/CompactSegmentedControl';
import TeacherRecordInputBar from '../components/TeacherRecordInputBar';
import MobileBottomNavigation from '../components/ui/MobileBottomNavigation';
import useHoldToSpeak from '../components/useHoldToSpeak';
import { developmentNavigationItems } from './navigationAssets';
import RecordView, { type RecordMode, type RecordState } from './RecordView';
import RecordHeader from './RecordHeader';
import RecordComposer from './RecordComposer';
import RecordInputContent from './RecordInputContent';
import RecordRecognitionCards from './RecordRecognitionCards';
import RecordRecognitionEditor from './RecordRecognitionEditor';
import { canCorrectRecord, correctRecord, type RecognitionField, type RecordCorrection } from './recordCorrections';
import { RECORD_LEVELS } from './recordLevels';
import ImageSamplePicker from './ImageSamplePicker';
import { teacherBrandCssVariables } from '../styles/teacherMobileTokens';
import SchoolArchiveView from './SchoolArchiveView';
import DemoControls from './DemoControls';
import IndicatorView from './IndicatorView';
import { defaultTeacherGradientPreview } from '../styles/teacherGradientPreview';
import './demo.css';
import ArchiveView, { PROFILE_PARTS, ProfileDetails, type ProfilePart } from './ArchiveView';
import ReportsView, { type ReportDrill } from './ReportsView';
import { initialReportView } from './ReportStatistics';
import { reportRecords } from './reporting';
import { DEMO_TODAY, SELF_COMMUNICATION_EXAMPLE, PERIODS, SCHOOL, TEACHERS, periodsForMode, type DevelopmentIndicator, type DevelopmentRecord, type EvaluationPeriodMode, type RecordInputType } from './data';
import { canReview, inPeriod, recognizeRecord, recordInbox, reviewInbox, reviewRecord, saveRecord } from './domain';
import { canManageRecord, deleteOwnRecord, replaceAnalyzedRecord, type RecordRevision } from './recordActions';
import { recordMatter } from './recordMatter';
import { useDevelopmentStore } from './useDevelopmentStore';
import { bodyClass, fieldClass, metaClass, primaryAction, RecordList, RowButton, secondaryAction, SelectButton, StatusLabel } from './ui';

export type DevelopmentTab = 'record' | 'archive' | 'report' | 'me';
const TABS = developmentNavigationItems;
const TEACHER_NAMES = Object.fromEntries(TEACHERS.map(t => [t.id, t.name]));
const TODAY = DEMO_TODAY;
type Sheet = 'profile' | 'record' | 'record-actions' | 'delete-record' | 'entry' | 'target' | 'images' | 'period' | 'filter' | 'school-filter' | 'report-detail' | 'help' | 'date' | null;
interface Props { initialTab?: DevelopmentTab; initialActorId?: string; initialSelectedTeacherId?: string; initialRecordMode?: RecordMode; }
export function RecordDetails({ record, indicator, actorId, preview = false }: { record: DevelopmentRecord; indicator: DevelopmentIndicator; actorId?: string; preview?: boolean }) {
  return <div className="space-y-5">
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-[length:var(--tm-font-size-section-title)] font-bold">{TEACHER_NAMES[record.teacherId]}</h3>
      {preview ? <span className={metaClass}>{record.status === 'approved' ? '提交后免审生效' : record.status === 'pending' ? '提交后待审核' : '未通过'}</span> : <StatusLabel record={record} />}
    </div>
    <RecordInputContent record={record} fullImage />
    <RecordRecognitionCards record={record} indicator={indicator} teacherName={TEACHER_NAMES[record.teacherId]} actorId={actorId} />
    {record.note && <p role="status" className={`${bodyClass} text-[var(--tm-status-negative-strong)]`}>未通过原因：{record.note}</p>}
    <div>
      <h4 className="text-[length:var(--tm-font-size-card-title)] font-semibold">计分依据</h4>
      <p className={`mt-2 ${bodyClass}`}>{record.rule}</p>
      <p className={`mt-2 ${metaClass}`}>指标基础{indicator.base}分 · 上限{indicator.upper}分 · 下限{indicator.lower}分</p>
    </div>
    <div>
      <h4 className="text-[length:var(--tm-font-size-card-title)] font-semibold">{preview ? '提交信息' : '处理记录'}</h4>
      {!preview && <ol className={`mt-3 space-y-2 ${metaClass}`}>{record.history.map((item, index) => <li key={index}>{item}</li>)}</ol>}
      <p className={`mt-3 ${metaClass}`}>提交人：{TEACHER_NAMES[record.authorId]}{record.reviewerId ? ` · 审核人：${TEACHER_NAMES[record.reviewerId]}` : ''}</p>
    </div>
  </div>;
}
export default function TeacherDevelopmentApp({ initialTab = 'archive', initialActorId = 't1', initialSelectedTeacherId, initialRecordMode = 'record' }: Props) {
  const store = useDevelopmentStore();
  const { records, indicators } = store;
  const meStore = useMePreferences();
  const [meFeature, setMeFeature] = useState<MeFeature | null>(null);
  const [actorId, setActorId] = useState(initialActorId);
  const actor = TEACHERS.find(t => t.id === actorId) ?? TEACHERS[0];
  const isManager = !!actor.manager;
  const mePreferences = meStore.preferences[actor.id];
  const [tab, setTab] = useState<DevelopmentTab>(initialTab);
  const [scope, setScope] = useState<'school' | 'self'>(actor.manager ? 'school' : 'self');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(initialSelectedTeacherId ?? null);
  const [periodId, setPeriodId] = useState(store.defaultPeriodId);
  const periodOptions = periodsForMode(store.periodMode);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [recognitionEditing, setRecognitionEditing] = useState<{ recordId: string; field: RecognitionField; actorId: string } | null>(null);
  const [showIndicators, setShowIndicators] = useState(false);
  const openIndicators = () => { setShowIndicators(true); setSheet(null); setNotice(''); };
  const [profilePart, setProfilePart] = useState<ProfilePart>('basic');
  const [recordOrigin, setRecordOrigin] = useState<'page' | 'report'>('page');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [returning, setReturning] = useState(false);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [filterIndicator, setFilterIndicator] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [recordMode, setRecordMode] = useState<RecordMode>(isManager ? initialRecordMode : 'record');
  useEffect(() => setRecognitionEditing(null), [actorId, tab, recordMode]);
  const [recordState, setRecordState] = useState<RecordState>('all');
  const [reviewState, setReviewState] = useState<RecordState>('pending');
  const [entryCanSelectTarget, setEntryCanSelectTarget] = useState(isManager);
  const [text, setText] = useState('');
  const [date, setDate] = useState(TODAY);
  const [targetId, setTargetId] = useState('');
  const [imageSampleId, setImageSampleId] = useState<string | undefined>();
  const [inputType, setInputType] = useState<RecordInputType>('text');
  const [resubmitId, setResubmitId] = useState<string | null>(null);
  const [revisionKind, setRevisionKind] = useState<RecordRevision | null>(null);
  const [draft, setDraft] = useState<DevelopmentRecord | null>(null);
  const [entryError, setEntryError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 3500); return () => window.clearTimeout(timer); }, [notice]);
  const [drill, setDrill] = useState<ReportDrill | null>(null);
  const [reportState, setReportState] = useState(initialReportView);
  const [archiveFromReport, setArchiveFromReport] = useState(false);
  const [showPhoneShell, setShowPhoneShell] = useState(true);
  const [gradientPreview, setGradientPreview] = useState(defaultTeacherGradientPreview);
  const submitLocked = useRef(false);
  const mainRef = useRef<HTMLElement>(null);
  const schoolScope = isManager && scope === 'school';
  const dossier = TEACHERS.find(t => t.id === (schoolScope && selectedTeacherId ? selectedTeacherId : actor.id))!;
  const filteredTeachers = TEACHERS.filter(t => (!subject || t.subject === subject) && (!grade || t.grade === grade) && (!search.trim() || `${t.name}${t.subject}${t.grade}`.includes(search.trim())));
  const scopedTeachers = schoolScope ? filteredTeachers : [actor];
  const activeRecordState = recordMode === 'review' ? reviewState : recordState;
  const ownRecords = recordInbox(records, actorId);
  const pendingCount = reviewInbox(records, actorId).length;
  const shownRecords = recordMode === 'review'
    ? reviewInbox(records, actorId, reviewState === 'all' ? 'pending' : reviewState)
    : ownRecords.filter(r => recordState === 'all' || r.status === recordState);
  const record = records.find(r => r.id === selectedRecordId);
  const editingRecord = records.find(record => record.id === recognitionEditing?.recordId);
  const editingIndicator = indicators.find(indicator => indicator.id === editingRecord?.indicatorId);
  const saveRecognitionCorrection = (correction: RecordCorrection) => {
    if (!editingRecord || !editingIndicator || recognitionEditing?.actorId !== actorId) return '记录已更新，请关闭后重试。';
    const result = correctRecord(editingRecord, editingIndicator, actorId, correction, records, indicators);
    if (result.ok === false) return result.error;
    store.setRecords(previous => previous.map(record => record.id === editingRecord.id ? result.record : record));
    setRecognitionEditing(null);
    setNotice(result.record === editingRecord ? '内容未改变。' : result.record.status === 'pending' ? '已保存并重新送审，通过后更新积分。' : '已保存，积分和统计已更新。');
    return '';
  };
  const filterLabel = [indicators.find(i => i.id === filterIndicator)?.name, filterLevel, filterCategory].filter(Boolean).join(' · ') || '筛选';
  const indicatorNames = Object.fromEntries(indicators.map(i => [i.id, i.name]));
  const closeSheet = () => { setSheet(sheet === 'date' || sheet === 'target' ? 'entry' : sheet === 'images' ? 'entry' : sheet === 'record' && recordOrigin === 'report' ? 'report-detail' : null); setEntryError(''); };
  const changeTab = (value: DevelopmentTab) => { setMeFeature(null); setArchiveFromReport(false); setTab(value); setSelectedTeacherId(null); setSheet(null); setNotice(''); mainRef.current?.scrollTo({ top: 0 }); };
  const changeActor = (id: string) => { setMeFeature(null); setReportState(initialReportView); setArchiveFromReport(false); setActorId(id); setShowIndicators(false); setScope(TEACHERS.find(t => t.id === id)?.manager ? 'school' : 'self'); mainRef.current?.scrollTo({ top: 0 }); setSelectedTeacherId(null); setSheet(null); setSearch(''); setSubject(''); setGrade(''); setRecordState('all'); setRecordMode('record'); setReviewState('pending'); setNotice(''); setFilterIndicator(''); setFilterLevel(''); setFilterCategory(''); };
  const changeScope = (value: 'school' | 'self') => { setReportState(initialReportView); setArchiveFromReport(false); setScope(value); mainRef.current?.scrollTo({ top: 0 }); setSelectedTeacherId(null); setRecordState('all');  setSearch(''); setSubject(''); setGrade(''); };
  const openRecord = (item: DevelopmentRecord) => { setRecordOrigin(sheet === 'report-detail' ? 'report' : 'page'); setSelectedRecordId(item.id); setDraft(null); setSheet('record'); setReviewReason(''); setReturning(false); setEntryError(''); };
  const changeRecordMode = (value: RecordMode) => { setRecordMode(value); setSheet(null); setNotice(''); mainRef.current?.scrollTo({ top: 0 }); };
  const changeRecordState = (value: RecordState) => { if (recordMode === 'review') setReviewState(value); else setRecordState(value); mainRef.current?.scrollTo({ top: 0 }); };
  const openEntry = (mode: 'text' | 'photo' = 'text') => {
    const selectable = isManager && (tab === 'record' || schoolScope);
    setEntryCanSelectTarget(selectable); setTargetId(selectable ? selectedTeacherId ?? '' : actor.id); setDate(TODAY); setDraft(null); setEntryError(''); setImageSampleId(undefined); setInputType(mode === 'photo' ? 'image' : 'text'); setNotice(''); setResubmitId(null);
    setText(''); setRevisionKind(null);
    setSheet(mode === 'photo' ? 'images' : 'entry');
  };
  const appendRecord = (item: DevelopmentRecord, replacesId = resubmitId) => {
    store.setRecords(prev => revisionKind && replacesId ? replaceAnalyzedRecord(prev, item, replacesId, actorId, revisionKind) : saveRecord(prev, item, actorId, replacesId));
    const targetPeriod = PERIODS.find(p => inPeriod(item, p.id));
    if (targetPeriod) setPeriodId(targetPeriod.id);
    setResubmitId(null); setRevisionKind(null);
    setTab('record'); setRecordMode('record'); setSelectedTeacherId(null);  mainRef.current?.scrollTo({ top: 0 }); setRecordState('all'); setSubject(''); setGrade(''); setSearch(''); setSheet(null); setDraft(null);
    setNotice(item.status === 'approved' ? `已记录 · ${item.delta === 0 ? '仅归档' : `${item.delta > 0 ? '+' : ''}${item.delta}分`}，可在详情中撤回。` : item.status === 'pending' ? '已提交审核，通过后自动计分入档。' : '本次审核未通过，请查看原因。');
  };
  const sendVoiceRecord = () => {
    const result = recognizeRecord({
      text: SELF_COMMUNICATION_EXAMPLE, inputType: 'voice',
      actorId, role: isManager ? 'manager' : 'teacher', targetId: actorId, date: TODAY,
    }, indicators, records);
    if (result.ok === false) { setNotice(result.question); return; }
    appendRecord(result.record, null);
  };
  const { voicePressState, onVoicePointerDown } = useHoldToSpeak(sendVoiceRecord, tab === 'record' && recordMode === 'record' && !sheet && !recognitionEditing && !showIndicators, `${actorId}:${tab}:${recordMode}:${sheet ?? ''}:${showIndicators}:${recognitionEditing?.field ?? ''}`);
  const submit = () => {
    if (submitLocked.current) return;
    if (!text.trim()) { setEntryError('请输入本次事件或选择一张图片。'); return; }
    submitLocked.current = true;
    try {
      const result = recognizeRecord({ text, actorId, role: entryCanSelectTarget ? 'manager' : 'teacher', targetId: entryCanSelectTarget ? targetId || (TEACHERS.some(t => text.includes(t.name)) ? undefined : actorId) : actorId, date, inputType, imageSampleId }, indicators, records.filter(r => r.id !== resubmitId));
      if (result.ok === false) { setEntryError(result.question); return; }
      setEntryError('');
      if (revisionKind || (entryCanSelectTarget && result.record.teacherId !== actorId)) {
        const previous = records.find(item => item.id === resubmitId);
        setDraft(previous ? { ...result.record, id: previous.id, recordedAt: previous.recordedAt } : result.record);
      } else appendRecord(result.record);
    } finally { submitLocked.current = false; }
  };
  const approve = (approved: boolean) => {
    if (!record || !canReview(record, actorId)) return;
    if (!approved && !reviewReason.trim()) { setEntryError('请填写未通过原因，让提交人知道如何修改。'); return; }
    store.setRecords(prev => reviewRecord(prev, record.id, actorId, approved, reviewReason)); setSheet(null); setNotice(approved ? '审核通过，系统已更新积分和档案。' : '审核未通过，提交人可查看原因并修改重提。');
  };
  const withdraw = () => {
    if (!record || record.authorId !== actorId || record.status === 'withdrawn' || (record.status === 'approved' && record.requiresReview)) return;
    store.setRecords(prev => prev.map(r => r.id === record.id ? { ...r, status: 'withdrawn', history: [...r.history, '提交人撤回记录，系统撤销关联计分'] } : r)); setSheet(null); setNotice('已撤回，关联积分已更新。');
  };
  const editRecord = () => {
    if (!record || !canManageRecord(record, actorId)) return;
    setRevisionKind('编辑记录'); setEntryCanSelectTarget(isManager); setResubmitId(record.id); setText(record.text); setDate(record.date); setTargetId(record.teacherId); setImageSampleId(record.imageSampleId); setInputType(record.inputType); setDraft(null); setEntryError(''); setSheet('entry');
  };
  const resubmit = () => { if (record?.status === 'returned') editRecord(); };
  const reanalyzeRecord = () => {
    if (!record || !canManageRecord(record, actorId)) return;
    const result = recognizeRecord({ text: record.text, actorId, role: isManager ? 'manager' : 'teacher', targetId: record.inputContext?.teacherId ?? record.teacherId, date: record.inputContext?.date ?? record.date, inputType: record.inputType, imageSampleId: record.imageSampleId }, indicators, records.filter(item => item.id !== record.id));
    if (result.ok === false) { setNotice(result.question); setSheet(null); return; }
    setRevisionKind('重新分析'); setResubmitId(record.id); setEntryCanSelectTarget(isManager); setText(record.text); setDate(record.date); setTargetId(record.teacherId); setImageSampleId(record.imageSampleId); setInputType(record.inputType); setEntryError(''); setDraft({ ...result.record, id: record.id, recordedAt: record.recordedAt }); setSheet('entry');
  };
  const deleteRecord = () => {
    if (!record || !canManageRecord(record, actorId)) return;
    store.setRecords(previous => deleteOwnRecord(previous, record.id, actorId));
    setSelectedRecordId(null); setSheet(null); setNotice('记录已删除，积分和统计已更新。');
  };
  const pageTitle = selectedTeacherId && tab === 'archive' ? `${dossier.name}的档案` : TABS.find(t => t.id === tab)!.label;
  const sheetTitle = sheet === 'record-actions' ? '记录操作' : sheet === 'delete-record' ? '删除记录' : sheet === 'entry' && revisionKind ? draft ? '确认更新' : '编辑记录' : sheet === 'date' ? '发生日期' : sheet === 'profile' ? PROFILE_PARTS.find(p => p.id === profilePart)!.name : sheet === 'record' ? '记录详情' : sheet === 'entry' ? draft ? '确认评价' : '快速记录' : sheet === 'target' ? '选择教师' : sheet === 'images' ? '选择图片' : sheet === 'period' ? '考核周期' : sheet === 'filter' ? '筛选成长记录' : sheet === 'school-filter' ? '筛选教师' : sheet === 'report-detail' ? drill?.title ?? '记录明细' : '使用帮助';
  const drillRecords = reportRecords(records, scopedTeachers, indicators, periodId, drill ?? {});
  const canWithdraw = !!record && record.authorId === actorId && record.status !== 'withdrawn' && !(record.status === 'approved' && record.requiresReview);
  const entryTargetsOther = entryCanSelectTarget && (targetId ? targetId !== actorId : TEACHERS.some(t => t.id !== actorId && text.includes(t.name)));
  const sheetFooter = sheet === 'delete-record' ? <div className="flex gap-3"><button type="button" className={secondaryAction} onClick={() => setSheet('record-actions')}>取消</button><button type="button" className={`${mobileSheetActionClass} w-full bg-[var(--tm-status-negative-strong)] font-semibold text-[var(--tm-text-inverse)]`} onClick={deleteRecord}>删除</button></div> : sheet === 'entry' ? <button type="button" className={primaryAction} onClick={draft ? () => appendRecord(draft) : submit}><Sparkles size={18} aria-hidden="true" />{draft ? revisionKind ? '确认更新' : '确认提交' : revisionKind || entryTargetsOther ? 'AI识别' : 'AI识别并提交'}</button> : sheet === 'record' && record ? canReview(record, actorId) ? returning ? <div className="flex gap-3"><button type="button" className={secondaryAction} onClick={() => { setReturning(false); setEntryError(''); }}>取消</button><button type="button" className={primaryAction} onClick={() => approve(false)}>确认未通过</button></div> : <div className="flex gap-3"><button type="button" className={secondaryAction} onClick={() => setReturning(true)}>不通过</button><button type="button" className={primaryAction} onClick={() => approve(true)}>审核通过</button></div> : record.authorId === actorId && record.status === 'returned' ? <button type="button" className={primaryAction} onClick={resubmit}>修改后重新提交</button> : canWithdraw ? <button type="button" className={secondaryAction} onClick={withdraw}>撤回记录</button> : undefined : sheet === 'filter' || sheet === 'school-filter' ? <button type="button" className={primaryAction} onClick={() => setSheet(null)}>完成</button> : undefined;
  return <div className="teacher-mobile-app td-demo-stage bg-[var(--tm-bg-page)] text-[var(--tm-text-primary)]" style={teacherBrandCssVariables as React.CSSProperties}>
    <div className="td-demo-phone"><PhoneMockup showDeviceFrame={showPhoneShell} contentTopInsetMode="status-bar" screenOverlayRootId="teacher-mobile-overlay-root" screenBackground={<TeacherMobileScreenBackground variant={showIndicators ? 'plain' : 'preview'} preview={gradientPreview} />}>
      {showIndicators && <IndicatorView indicators={indicators} onBack={() => setShowIndicators(false)} />}
      <div className={`relative min-h-0 flex-1 flex-col overflow-hidden ${showIndicators ? 'hidden' : 'flex'} ${showPhoneShell ? '' : 'pt-3'}`}>

      {tab === 'record' ? <RecordHeader manager={isManager} mode={recordMode} pendingCount={pendingCount} stateCounts={recordMode === 'review' ? { pending: pendingCount, returned: reviewInbox(records, actorId, 'returned').length } : { pending: ownRecords.filter(r => r.status === 'pending').length, returned: ownRecords.filter(r => r.status === 'returned').length }} state={activeRecordState} onMode={changeRecordMode} onState={changeRecordState} onIndicators={openIndicators} /> : selectedTeacherId && tab === 'archive' ? <MobilePageHeader tone="transparent" title={pageTitle} onBack={() => { setSelectedTeacherId(null); if (archiveFromReport) { setTab('report'); setArchiveFromReport(false); } }} /> : !['report', 'me', 'archive'].includes(tab) && <header className={`flex h-11 shrink-0 items-center pl-[var(--tm-space-5)] [padding-right:max(var(--tm-space-5),var(--mini-program-capsule-right-inset,0px))]`}><h1 className="text-[length:var(--tm-font-size-page-title)] font-bold">{pageTitle}</h1></header>}
      {tab !== 'me' && tab !== 'record' && <div className={`shrink-0 px-[var(--tm-space-5)]`}><div className="flex min-h-[var(--tm-size-touch)] items-center justify-between gap-3">{isManager && !(tab === 'archive' && selectedTeacherId) ? <CompactSegmentedControl density="compact" semantics="group" value={scope} items={[{ value: 'school', label: '全校' }, { value: 'self', label: '我的' }]} onChange={changeScope} ariaLabel="数据范围" /> : tab === 'archive' ? <span className={metaClass}>考核周期</span> : null}<SelectButton onClick={() => setSheet('period')} label="切换考核周期">{periodOptions.find(p => p.id === periodId)?.label}</SelectButton></div></div>}
      <main ref={mainRef} className={`min-h-0 flex-1 overflow-y-auto ${tab === 'me' ? 'pb-[calc(66px+max(16px,env(safe-area-inset-bottom))+24px)]' : `px-[var(--tm-report-page-inline)] pb-20 ${tab === 'report' || (tab === 'archive' && !selectedTeacherId) ? 'pt-0' : 'pt-3'}`}`}>

        {schoolScope && tab === 'report' && <div className="mb-3 flex items-center gap-3"><MobileSearchInput aria-label="搜索教师" containerClassName="min-w-0 flex-1" value={search} onChange={e => setSearch(e.target.value)} placeholder="姓名、学科、年级" /><SelectButton onClick={() => setSheet('school-filter')} label="筛选教师">{[grade, subject].filter(Boolean).join(' · ') || '筛选'}</SelectButton></div>}
        {tab === 'archive' && (schoolScope && !selectedTeacherId ? <SchoolArchiveView toolbar={<div className="flex items-center gap-3"><MobileSearchInput aria-label="搜索教师" containerClassName="min-w-0 flex-1" value={search} onChange={e => setSearch(e.target.value)} placeholder="姓名、学科、年级" /><SelectButton onClick={() => setSheet('school-filter')} label="筛选教师">{[grade, subject].filter(Boolean).join(' · ') || '筛选'}</SelectButton></div>} teachers={filteredTeachers} indicators={indicators} records={records} periodId={periodId} onTeacher={id => { setSelectedTeacherId(id); setFilterIndicator(''); setFilterCategory(''); setFilterLevel(''); mainRef.current?.scrollTo({ top: 0 }); }} /> : <ArchiveView teacher={dossier} indicators={indicators} records={records} periodId={periodId} onProfile={part => { setProfilePart(part); setSheet('profile'); }} onRecord={openRecord} onFilter={() => setSheet('filter')} filterLabel={filterLabel} filterIndicator={filterIndicator} filterCategory={filterCategory} filterLevel={filterLevel} onIndicator={setFilterIndicator} onClearFilters={() => { setFilterIndicator(''); setFilterLevel(''); setFilterCategory(''); }} onEvaluate={schoolScope ? () => openEntry() : undefined} />)}
        {tab === 'record' && <RecordView records={shownRecords} indicators={indicators} teacherNames={TEACHER_NAMES} actorId={actorId} mode={recordMode} state={activeRecordState} onOpen={openRecord} onEdit={(item, field) => { if (!canCorrectRecord(item, actorId) || (field === 'teacher' && !isManager)) return; setSheet(null); setRecognitionEditing({ recordId: item.id, field, actorId }); }} onActions={item => { if (!canManageRecord(item, actorId)) return; setSelectedRecordId(item.id); setEntryError(''); setDraft(null); setSheet('record-actions'); }} />}
        {tab === 'report' && <ReportsView state={reportState} onState={setReportState} teachers={scopedTeachers} records={records} indicators={indicators} periodId={periodId} schoolScope={schoolScope} onDrill={item => { setDrill(item); setSheet('report-detail'); }} onTeacher={id => { setArchiveFromReport(true); setTab('archive'); setSelectedTeacherId(id); setFilterIndicator(''); setFilterCategory(''); setFilterLevel(''); mainRef.current?.scrollTo({ top: 0 }); }} />}
        {tab === 'me' && <DevelopmentMeView teacher={actor} avatar={mePreferences?.profile?.avatar} onOpen={feature => { if (!requiresManagementAccess(feature) || isManager) setMeFeature(feature); }} />}
      </main>
      {tab === 'record' && recordMode === 'record' && <TeacherRecordInputBar
        showKeyboard={false} showTabBar inputText="" hasSelectionTarget emptySelectionPrompt="" isMultiSelectMode={false} selectedTargetCount={0} selectedTargetUnit="人" voicePressState={voicePressState}
        onCloseKeyboard={() => {}} onCameraClick={() => openEntry('photo')} onVoicePointerDown={onVoicePointerDown} onKeyboardClick={() => openEntry()}
        onVoiceKeyboardActivate={sendVoiceRecord}
      />}
      <MobileBottomNavigation activeTab={tab} items={TABS} onTabChange={changeTab} ariaLabel="教师评价主要导航" />
      <MobileFullScreenPage open={!!meFeature && (!requiresManagementAccess(meFeature) || isManager)} title={meFeature ? ME_FEATURE_TITLES[meFeature] : ''} onBack={() => setMeFeature(null)} screenBackground={meFeature === 'principal' || meFeature === 'personal' ? <TeacherMobileScreenBackground variant={meFeature === 'principal' ? 'assistant-principal' : 'assistant-headteacher'} /> : undefined}>
        {meFeature !== 'principal' && meFeature !== 'personal' && <MobilePageHeader title={meFeature ? ME_FEATURE_TITLES[meFeature] : ''} onBack={() => setMeFeature(null)} />}
        {meFeature === 'profile' && <PersonalSettingsPage key={actor.id} teacher={actor} settings={mePreferences?.profile} onSave={profile => { if (!meStore.update(actor.id, { profile })) return false; setMeFeature(null); setNotice('个人信息已保存。'); return true; }} />}
        {(meFeature === 'personal' || (meFeature === 'principal' && isManager)) && <DevelopmentAssistantPage key={`${actor.id}:${meFeature}`} principal={meFeature === 'principal'} onBack={() => setMeFeature(null)} teacher={actor} teachers={TEACHERS} records={records} indicators={indicators} periodId={periodId} />}
        {meFeature === 'indicator-settings' && isManager && <IndicatorSettingsPage indicators={indicators} onSave={next => { if (isManager) store.setIndicators(next); }} />}
        {meFeature === 'period-settings' && isManager && <PeriodSettingsPage periodMode={store.periodMode} onSave={(mode: EvaluationPeriodMode) => { if (!isManager) return; store.setPeriodSettings(mode); const defaultPeriod = periodsForMode(mode)[0]; setPeriodId(defaultPeriod.id); setMeFeature(null); setNotice('考核周期方式已更新。'); }} />}
        {meFeature === 'feedback' && <DevelopmentFeedbackPage key={actor.id} onSave={(text, images) => meStore.update(actor.id, { feedback: [...(mePreferences?.feedback ?? []), { id: `feedback-${Date.now()}`, text, images, createdAt: new Date().toISOString() }] })} />}
      </MobileFullScreenPage>
      <MobileToast message={notice} />
      {recognitionEditing && recognitionEditing.actorId === actorId && tab === 'record' && editingRecord && editingIndicator && <RecordRecognitionEditor key={`${recognitionEditing.recordId}:${recognitionEditing.field}`} record={editingRecord} indicator={editingIndicator} indicators={indicators} actorId={actorId} periods={periodOptions} field={recognitionEditing.field} onClose={() => setRecognitionEditing(null)} onSave={saveRecognitionCorrection} />}
      <MobileBottomSheet open={!!sheet} title={sheetTitle} onClose={closeSheet} size={(sheet === 'entry' && !!draft) || sheet === 'record' || sheet === 'filter' || sheet === 'images' || sheet === 'report-detail' ? 'tall' : 'content'} contentTone={sheet === 'report-detail' ? 'plain' : 'surface'} footer={sheetFooter}>
        {sheet === 'record-actions' && record && canManageRecord(record, actorId) && <div><RowButton icon={<RefreshCw size={20} />} onClick={reanalyzeRecord}>重新分析</RowButton><RowButton icon={<Pencil size={20} />} onClick={editRecord}>编辑记录</RowButton><RowButton icon={<Trash2 size={20} />} onClick={() => setSheet('delete-record')}><span className="text-[var(--tm-status-negative-strong)]">删除</span></RowButton></div>}
        {sheet === 'delete-record' && record && <div className="space-y-3"><p className={bodyClass}>确定删除这条记录？删除后将移除关联积分和统计，无法恢复。</p><p className={metaClass}>{recordMatter(record)}</p></div>}
        {sheet === 'date' && <MobileDateCalendar value={{ start: date, end: date }} min={PERIODS[1].start} max={PERIODS[0].end} onSelect={value => { setDate(value); setSheet('entry'); }} />}
        {sheet === 'profile' && <ProfileDetails teacher={dossier} part={profilePart} />}
        {sheet === 'period' && <div>{periodOptions.map(period => <RowButton key={period.id} description={`${period.start} 至 ${period.end}`} onClick={() => { setPeriodId(period.id); setSheet(null); }}>{period.label}{period.id === periodId && <Check size={16} className="ml-2 inline text-[var(--tm-brand-primary)]" aria-label="当前周期" />}</RowButton>)}</div>}
        {sheet === 'school-filter' && <div className="space-y-4"><FilterChoices title="年级" value={grade} values={['高一', '高二']} onChange={setGrade} /><FilterChoices title="学科" value={subject} values={TEACHERS.map(t => t.subject)} onChange={setSubject} /><button type="button" className={secondaryAction} onClick={() => { setGrade(''); setSubject(''); setSearch(''); }}>清除筛选</button></div>}
        {sheet === 'filter' && <div className="space-y-4"><FilterChoices title="评价指标" value={filterIndicator} values={indicators.map(i => i.id)} labels={indicatorNames} onChange={setFilterIndicator} /><FilterChoices title="成果类别" value={filterCategory} values={[...new Set(records.filter(r => r.teacherId === dossier.id).map(r => r.category).filter(Boolean))] as string[]} onChange={setFilterCategory} /><FilterChoices title="事件等级" value={filterLevel} values={RECORD_LEVELS.map(level => level.name)} onChange={setFilterLevel} /><button type="button" className={secondaryAction} onClick={() => { setFilterIndicator(''); setFilterCategory(''); setFilterLevel(''); }}>清除筛选</button></div>}
        {sheet === 'entry' && (draft ? <div className="space-y-4">{revisionKind && <p className={metaClass}>{draft.requiresReview ? '确认后更新原记录并重新送审，原有计分将按新审核结果更新。' : '确认后更新原记录，积分和统计按本次结果重新计算。'}</p>}<RecordDetails actorId={actorId} preview record={draft} indicator={indicators.find(i => i.id === draft.indicatorId)!} /><button type="button" className={secondaryAction} onClick={() => setDraft(null)}>返回修改</button></div> : <RecordComposer canSelectTeacher={entryCanSelectTarget} teacherName={TEACHER_NAMES[targetId || actorId]} text={text} date={date} imageSampleId={imageSampleId} imageSource={records.find(record => record.id === resubmitId)} error={entryError} onText={setText} onTarget={() => setSheet('target')} onDate={() => setSheet('date')} onImage={() => setSheet('images')} />)}
        {sheet === 'target' && <div>{TEACHERS.map(teacher => <RowButton key={teacher.id} onClick={() => { setTargetId(teacher.id); setSheet('entry'); setEntryError(''); }} description={`${teacher.subject} · ${teacher.grade}`}>{teacher.name}{teacher.id === actorId && '（本人）'}</RowButton>)}</div>}
        {sheet === 'images' && <ImageSamplePicker onSelect={sample => { setTargetId(sample.teacherId); setImageSampleId(sample.id); setInputType('image'); setText(sample.text); setDate(sample.date); setDraft(null); setEntryError(''); setSheet('entry'); }} />}
        {sheet === 'record' && record && <div className="space-y-4"><RecordDetails actorId={actorId} record={record} indicator={indicators.find(i => i.id === record.indicatorId)!} />{record.status === 'pending' && isManager && !canReview(record, actorId) && <p className={metaClass}>本人提交或涉及本人的记录，由另一位管理者审核。</p>}{returning && <label className="block"><span className={`mb-2 block ${bodyClass}`}>未通过原因</span><textarea rows={3} value={reviewReason} onChange={e => setReviewReason(e.target.value)} className={fieldClass} placeholder="请写明未通过的原因和修改建议" /></label>}{entryError && <p role="alert" className={`${bodyClass} text-[var(--tm-status-negative-strong)]`}>{entryError}</p>}</div>}
        {sheet === 'report-detail' && <RecordList records={drillRecords} emptyDescription="当前条件下没有对应记录。" teacherNames={TEACHER_NAMES} indicatorNames={indicatorNames} onOpen={openRecord} showNames={schoolScope} />}
        {sheet === 'help' && <div className={`space-y-5 ${bodyClass}`}><p>在“记录”中输入文字、说话或上传图片，AI匹配指标和学校规则。免审记录自动生效；需要审核的记录，通过后自动计分入档。</p><p>在“档案”中查看个人信息、任职、证书、工作经历与成长记录；在“报表”中查看本期统计。</p>{isManager && <p>管理者在记录页切换“审核”处理待办。记录功能可提交本人或其他教师的评价；档案和报表中的“全校”用于查询学校数据。本人提交或涉及本人的记录，需由其他管理者审核。</p>}<p>审核未通过的记录在“记录 → 未通过”查看原因，修改后重新提交。本人未审核记录和免审记录可在详情中撤回。</p></div>}
      </MobileBottomSheet>
    </div></PhoneMockup></div>
    <DemoControls
      isManager={isManager} onActorChange={changeActor}
      showPhoneShell={showPhoneShell} onPhoneShellChange={setShowPhoneShell}
      preview={gradientPreview} onPreviewChange={setGradientPreview}
      indicators={indicators} onIndicatorsChange={store.setIndicators}
      onReset={() => { store.reset(); setPeriodId(PERIODS[0].id); const cleared = meStore.reset(); setMeFeature(null); setShowIndicators(false); setSheet(null); setNotice(cleared ? '演示数据已重置。' : '评价数据已重置，个人设置清理失败，请重试。'); }}
      storageError={store.storageError}
    />
  </div>;
}
function FilterChoices({ title, value, values, labels, onChange, includeAll = true }: { title: string; value: string; values: string[]; labels?: Record<string, string>; onChange: (value: string) => void; includeAll?: boolean }) {
  return <fieldset><legend className="mb-2 text-[length:var(--tm-font-size-card-title)] font-semibold">{title}</legend><div className={`grid gap-2 ${includeAll ? 'grid-cols-3' : 'grid-cols-2'}`}>{(includeAll ? ['', ...values] : values).map(item => <button type="button" key={item} aria-pressed={value === item} onClick={() => onChange(item)} className={`min-h-[var(--tm-size-touch)] rounded-[var(--tm-radius-control)] px-2 text-[length:var(--tm-font-size-compact)] ${value === item ? 'bg-[var(--tm-brand-primary-soft)] font-semibold text-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)]'}`}>{item ? labels?.[item] ?? item : '全部'}</button>)}</div></fieldset>;
}
