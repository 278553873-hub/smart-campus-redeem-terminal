import React, { useEffect, useRef, useState } from 'react';
import { Check, FileText, Settings2, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import PhoneMockup from '../../components/PhoneMockup';
import TeacherMobileScreenBackground from '../components/TeacherMobileScreenBackground';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobilePageHeader from '../components/ui/MobilePageHeader';
import MobileToast from '../components/ui/MobileToast';
import MobileDateCalendar from '../components/ui/MobileDateCalendar';
import MobileSearchInput from '../components/ui/MobileSearchInput';
import { MobileCard } from '../components/ui/MobileCard';
import CompactSegmentedControl from '../components/ui/CompactSegmentedControl';
import TeacherRecordInputBar from '../components/TeacherRecordInputBar';
import MobileBottomNavigation from '../components/ui/MobileBottomNavigation';
import useHoldToSpeak from '../components/useHoldToSpeak';
import { developmentNavigationItems } from './navigationAssets';
import RecordView, { type RecordMode, type RecordState } from './RecordView';
import RecordHeader from './RecordHeader';
import RecordComposer from './RecordComposer';
import RecordInputContent from './RecordInputContent';
import { demoInputImage } from './demoImages';
import { teacherBrandCssVariables } from '../styles/teacherMobileTokens';
import ArchiveView, { PROFILE_PARTS, ProfileDetails, type ProfilePart } from './ArchiveView';
import ReportsView, { type ReportDrill } from './ReportsView';
import { DEMO_TODAY, IMAGE_SAMPLES, PERIODS, SCHOOL, TEACHERS, type DevelopmentIndicator, type DevelopmentRecord, type RecordInputType } from './data';
import { canReview, inPeriod, recognizeRecord, recordInbox, reviewInbox, reviewRecord, saveRecord, teacherScore } from './domain';
import { useDevelopmentStore } from './useDevelopmentStore';
import { bodyClass, EmptyState, fieldClass, metaClass, primaryAction, RecordList, RowButton, ScoreChange, secondaryAction, Section, SelectButton, StatusLabel } from './ui';

export type DevelopmentTab = 'record' | 'archive' | 'report' | 'me';
const TABS = developmentNavigationItems;
const TEACHER_NAMES = Object.fromEntries(TEACHERS.map(t => [t.id, t.name]));
const TODAY = DEMO_TODAY;
type Sheet = 'profile' | 'record' | 'entry' | 'target' | 'images' | 'period' | 'filter' | 'school-filter' | 'rules' | 'report-detail' | 'help' | 'date' | null;
interface Props { initialTab?: DevelopmentTab; initialActorId?: string; initialSelectedTeacherId?: string; initialRecordMode?: RecordMode; }
export function RecordDetails({ record, indicator, preview = false }: { record: DevelopmentRecord; indicator: DevelopmentIndicator; preview?: boolean }) {
  return <div className="space-y-5"><div><div className="flex items-center justify-between gap-3"><h3 className="text-[length:var(--tm-font-size-section-title)] font-bold">{TEACHER_NAMES[record.teacherId]}</h3>{preview ? <span className={metaClass}>{record.status === 'approved' ? '提交后免审生效' : record.status === 'pending' ? '提交后待审核' : '未通过'}</span> : <StatusLabel record={record} />}</div><p className={`mt-1 ${metaClass}`}>{record.date} · {indicator.name}</p></div><RecordInputContent record={record} /><div className="rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] p-4"><div className="flex items-center gap-2"><Sparkles size={18} className="text-[var(--tm-action-icon-brand)]" aria-hidden="true" /><h4 className="text-[length:var(--tm-font-size-card-title)] font-semibold">AI识别结果</h4></div><dl className="mt-3 space-y-2 text-[length:var(--tm-font-size-body)]"><div className="flex justify-between gap-2"><dt className="text-[var(--tm-text-secondary)]">匹配指标</dt><dd>{indicator.dimension} / {indicator.name}</dd></div>{record.category && <div className="flex justify-between gap-2"><dt className="text-[var(--tm-text-secondary)]">成果类别</dt><dd>{record.category}</dd></div>}{record.level && <div className="flex justify-between gap-2"><dt className="text-[var(--tm-text-secondary)]">成果级别</dt><dd>{record.level}</dd></div>}{record.contribution && <div className="flex justify-between gap-2"><dt className="text-[var(--tm-text-secondary)]">本人贡献</dt><dd>{record.contribution}</dd></div>}<div className="flex justify-between gap-2"><dt className="text-[var(--tm-text-secondary)]">规则分值</dt><dd><ScoreChange delta={record.delta} /></dd></div></dl><p className={`mt-3 ${bodyClass}`}>{record.rule}</p><p className={`mt-2 ${metaClass}`}>指标基础{indicator.base}分 · 上限{indicator.upper}分 · 下限{indicator.lower}分</p></div>{record.note && <p role="status" className={`${bodyClass} text-[var(--tm-status-negative-strong)]`}>未通过原因：{record.note}</p>}<div><h4 className="text-[length:var(--tm-font-size-card-title)] font-semibold">{preview ? '提交信息' : '处理记录'}</h4><ol className={`mt-3 space-y-2 ${metaClass}`}>{!preview && record.history.map((item, index) => <li key={index}>{item}</li>)}</ol><p className={`mt-3 ${metaClass}`}>提交人：{TEACHER_NAMES[record.authorId]}{record.reviewerId ? ` · 审核人：${TEACHER_NAMES[record.reviewerId]}` : ''}</p></div></div>;
}
export default function TeacherDevelopmentApp({ initialTab = 'archive', initialActorId = 't1', initialSelectedTeacherId, initialRecordMode = 'record' }: Props) {
  const store = useDevelopmentStore();
  const { records, indicators } = store;
  const [actorId, setActorId] = useState(initialActorId);
  const actor = TEACHERS.find(t => t.id === actorId) ?? TEACHERS[0];
  const isManager = !!actor.manager;
  const [tab, setTab] = useState<DevelopmentTab>(initialTab);
  const [scope, setScope] = useState<'school' | 'self'>(actor.manager ? 'school' : 'self');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(initialSelectedTeacherId ?? null);
  const [periodId, setPeriodId] = useState(PERIODS[0].id);
  const [sheet, setSheet] = useState<Sheet>(null);
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
  const [recordState, setRecordState] = useState<RecordState>('all');
  const [reviewState, setReviewState] = useState<RecordState>('pending');
  const [entryCanSelectTarget, setEntryCanSelectTarget] = useState(isManager);
  const [text, setText] = useState('');
  const [date, setDate] = useState(TODAY);
  const [targetId, setTargetId] = useState('');
  const [imageSampleId, setImageSampleId] = useState<string | undefined>();
  const [inputType, setInputType] = useState<RecordInputType>('text');
  const [resubmitId, setResubmitId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DevelopmentRecord | null>(null);
  const [entryError, setEntryError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 3500); return () => window.clearTimeout(timer); }, [notice]);
  const [drill, setDrill] = useState<ReportDrill | null>(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const submitLocked = useRef(false);
  const mainRef = useRef<HTMLElement>(null);
  const schoolScope = isManager && scope === 'school';
  const dossier = TEACHERS.find(t => t.id === (schoolScope && selectedTeacherId ? selectedTeacherId : actor.id))!;
  const filteredTeachers = TEACHERS.filter(t => (!subject || t.subject === subject) && (!grade || t.grade === grade) && (!search.trim() || `${t.name}${t.subject}${t.grade}`.includes(search.trim())));
  const scopedTeachers = schoolScope ? filteredTeachers : [actor];
  const scopedRecords = records.filter(r => (schoolScope ? scopedTeachers.some(t => t.id === r.teacherId) : r.teacherId === actor.id) && inPeriod(r, periodId));
  const activeRecordState = recordMode === 'review' ? reviewState : recordState;
  const ownRecords = recordInbox(records, actorId);
  const pendingCount = reviewInbox(records, actorId).length;
  const shownRecords = recordMode === 'review'
    ? reviewInbox(records, actorId, reviewState === 'all' ? 'pending' : reviewState)
    : ownRecords.filter(r => recordState === 'all' || r.status === recordState);
  const record = records.find(r => r.id === selectedRecordId);
  const filterLabel = [indicators.find(i => i.id === filterIndicator)?.name, filterLevel, filterCategory].filter(Boolean).join(' · ') || '筛选';
  const indicatorNames = Object.fromEntries(indicators.map(i => [i.id, i.name]));
  const closeSheet = () => { setSheet(sheet === 'date' || sheet === 'target' ? 'entry' : sheet === 'images' ? 'entry' : sheet === 'record' && recordOrigin === 'report' ? 'report-detail' : null); setEntryError(''); };
  const changeTab = (value: DevelopmentTab) => { setTab(value); setSelectedTeacherId(null); setSheet(null); setNotice(''); mainRef.current?.scrollTo({ top: 0 }); };
  const changeActor = (id: string) => { setActorId(id); setScope(TEACHERS.find(t => t.id === id)?.manager ? 'school' : 'self'); mainRef.current?.scrollTo({ top: 0 }); setSelectedTeacherId(null); setSheet(null); setSearch(''); setSubject(''); setGrade(''); setRecordState('all'); setRecordMode('record'); setReviewState('pending'); setNotice(''); setFilterIndicator(''); setFilterLevel(''); setFilterCategory(''); };
  const changeScope = (value: 'school' | 'self') => { setScope(value); mainRef.current?.scrollTo({ top: 0 }); setSelectedTeacherId(null); setRecordState('all');  setSearch(''); setSubject(''); setGrade(''); };
  const openRecord = (item: DevelopmentRecord) => { setRecordOrigin(sheet === 'report-detail' ? 'report' : 'page'); setSelectedRecordId(item.id); setDraft(null); setSheet('record'); setReviewReason(''); setReturning(false); setEntryError(''); };
  const changeRecordMode = (value: RecordMode) => { setRecordMode(value); setSheet(null); setNotice(''); mainRef.current?.scrollTo({ top: 0 }); };
  const changeRecordState = (value: RecordState) => { if (recordMode === 'review') setReviewState(value); else setRecordState(value); mainRef.current?.scrollTo({ top: 0 }); };
  const openEntry = (mode: 'text' | 'photo' = 'text') => {
    const selectable = isManager && (tab === 'record' || schoolScope);
    setEntryCanSelectTarget(selectable); setTargetId(selectable ? selectedTeacherId ?? '' : actor.id); setDate(TODAY); setDraft(null); setEntryError(''); setImageSampleId(undefined); setInputType(mode === 'photo' ? 'image' : 'text'); setNotice(''); setResubmitId(null);
    setText('');
    setSheet(mode === 'photo' ? 'images' : 'entry');
  };
  const appendRecord = (item: DevelopmentRecord, replacesId = resubmitId) => {
    store.setRecords(prev => saveRecord(prev, item, actorId, replacesId));
    const targetPeriod = PERIODS.find(p => item.date >= p.start && item.date <= p.end);
    if (targetPeriod) setPeriodId(targetPeriod.id);
    setResubmitId(null);
    setTab('record'); setRecordMode('record'); setSelectedTeacherId(null);  mainRef.current?.scrollTo({ top: 0 }); setRecordState('all'); setSubject(''); setGrade(''); setSearch(''); setSheet(null); setDraft(null);
    setNotice(item.status === 'approved' ? `已记录 · ${item.delta === 0 ? '仅归档' : `${item.delta > 0 ? '+' : ''}${item.delta}分`}，可在详情中撤回。` : item.status === 'pending' ? '已提交审核，通过后自动计分入档。' : '本次审核未通过，请查看原因。');
  };
  const sendVoiceRecord = () => {
    const result = recognizeRecord({
      text: '今天，我与刘甜家长沟通学生学习习惯，商量了每天阅读二十分钟的安排。', inputType: 'voice',
      actorId, role: isManager ? 'manager' : 'teacher', targetId: actorId, date: TODAY,
    }, indicators, records);
    if (result.ok === false) { setNotice(result.question); return; }
    appendRecord(result.record, null);
  };
  const { voicePressState, onVoicePointerDown } = useHoldToSpeak(sendVoiceRecord, tab === 'record' && recordMode === 'record' && !sheet, `${actorId}:${tab}:${recordMode}:${sheet ?? ''}`);
  const submit = () => {
    if (submitLocked.current) return;
    if (!text.trim()) { setEntryError('请输入本次事件或选择一张图片。'); return; }
    submitLocked.current = true;
    try {
      const submissionText = inputType === 'image' ? IMAGE_SAMPLES.find(sample => sample.id === imageSampleId)?.text(TEACHER_NAMES[targetId || actorId], date) ?? text : text;
      const result = recognizeRecord({ text: submissionText, actorId, role: entryCanSelectTarget ? 'manager' : 'teacher', targetId: entryCanSelectTarget ? targetId || (TEACHERS.some(t => text.includes(t.name)) ? undefined : actorId) : actorId, date, inputType, imageSampleId }, indicators, records.filter(r => r.id !== resubmitId));
      if (result.ok === false) { setEntryError(result.question); return; }
      setEntryError('');
      if (entryCanSelectTarget && result.record.teacherId !== actorId) setDraft(result.record); else appendRecord(result.record);
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
  const resubmit = () => { if (!record || record.authorId !== actorId || record.status !== 'returned') return; setEntryCanSelectTarget(isManager); setResubmitId(record.id); setText(record.text); setDate(record.date); setTargetId(record.teacherId); setImageSampleId(record.imageSampleId); setInputType(record.inputType); setDraft(null); setEntryError(''); setSheet('entry'); };
  const pageTitle = selectedTeacherId && tab === 'archive' ? `${dossier.name}的档案` : TABS.find(t => t.id === tab)!.label;
  const sheetTitle = sheet === 'date' ? '发生日期' : sheet === 'profile' ? PROFILE_PARTS.find(p => p.id === profilePart)!.name : sheet === 'record' ? '记录详情' : sheet === 'entry' ? draft ? '确认评价' : '快速记录' : sheet === 'target' ? '选择教师' : sheet === 'images' ? '选择图片' : sheet === 'period' ? '考核周期' : sheet === 'filter' ? '筛选成长记录' : sheet === 'school-filter' ? '筛选教师' : sheet === 'rules' ? '指标说明' : sheet === 'report-detail' ? drill?.title ?? '记录明细' : '使用帮助';
  const drillRecords = scopedRecords.filter(r => r.status === 'approved' && (!drill?.teacherId || r.teacherId === drill.teacherId) && (!drill?.dimension || indicators.find(i => i.id === r.indicatorId)?.dimension === drill.dimension) && (!drill?.category || (r.category ?? '日常记录') === drill.category) && (!drill?.level || (r.level ?? '不适用') === drill.level));
  const canWithdraw = !!record && record.authorId === actorId && record.status !== 'withdrawn' && !(record.status === 'approved' && record.requiresReview);
  const entryTargetsOther = entryCanSelectTarget && (targetId ? targetId !== actorId : TEACHERS.some(t => t.id !== actorId && text.includes(t.name)));
  const sheetFooter = sheet === 'entry' ? <button type="button" className={primaryAction} onClick={draft ? () => appendRecord(draft) : submit}><Sparkles size={18} aria-hidden="true" />{draft ? '确认提交' : entryTargetsOther ? 'AI识别' : 'AI识别并提交'}</button> : sheet === 'record' && record ? canReview(record, actorId) ? returning ? <div className="flex gap-3"><button type="button" className={secondaryAction} onClick={() => { setReturning(false); setEntryError(''); }}>取消</button><button type="button" className={primaryAction} onClick={() => approve(false)}>确认未通过</button></div> : <div className="flex gap-3"><button type="button" className={secondaryAction} onClick={() => setReturning(true)}>不通过</button><button type="button" className={primaryAction} onClick={() => approve(true)}>审核通过</button></div> : record.authorId === actorId && record.status === 'returned' ? <button type="button" className={primaryAction} onClick={resubmit}>修改后重新提交</button> : canWithdraw ? <button type="button" className={secondaryAction} onClick={withdraw}>撤回记录</button> : undefined : sheet === 'filter' || sheet === 'school-filter' ? <button type="button" className={primaryAction} onClick={() => setSheet(null)}>完成</button> : undefined;
  return <div className="teacher-mobile-app grid h-[100dvh] grid-cols-1 grid-rows-[auto_minmax(0,1fr)] items-center justify-center gap-3 bg-[var(--tm-bg-page)] p-4 text-[var(--tm-text-primary)] lg:grid-cols-[208px_minmax(0,450px)] lg:grid-rows-1 lg:gap-6" style={teacherBrandCssVariables as React.CSSProperties}>
    <aside className="max-h-[25dvh] overflow-y-auto rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 text-[length:var(--tm-font-size-compact)] lg:max-h-[80dvh] lg:self-center" aria-label="教师评价演示控制"><h2 className="font-bold">教师评价</h2><p className={`mt-2 ${metaClass}`}>精简推荐版 · 虚构演示数据</p><p className={`mt-1 ${metaClass}`}>文字、语音和图片识别采用预置模拟，未接入真实AI。加分规则仅用于本轮演示。</p><div className="mt-3 grid grid-cols-3 gap-1 lg:grid-cols-1">{[['t1', '教师 · 张敏'], ['t2', '管理者 · 李岩'], ['t4', '管理者 · 陈晨']].map(([id, label]) => <button type="button" key={id} onClick={() => changeActor(id)} aria-pressed={actorId === id} className={`min-h-[var(--tm-size-touch)] rounded-[var(--tm-radius-control)] px-3 text-left ${actorId === id ? 'bg-[var(--tm-brand-primary-soft)] font-bold text-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-soft)]'}`}>{label}</button>)}</div><button type="button" onClick={() => setControlsOpen(!controlsOpen)} aria-expanded={controlsOpen} className="mt-2 flex min-h-[var(--tm-size-touch)] items-center gap-2"><Settings2 size={16} />指标演示配置</button>{controlsOpen && <div className="space-y-4"><p className={metaClass}>角色和审核设置只影响新提交。既有记录保留提交时配置。</p>{indicators.map(indicator => <div key={indicator.id}><h3 className="font-semibold">{indicator.name}</h3><label className="mt-2 block">评价角色<select aria-label={`${indicator.name}评价角色`} value={indicator.roles.join(',')} onChange={e => store.setIndicators(indicators.map(i => i.id === indicator.id ? { ...i, roles: e.target.value.split(',') as DevelopmentIndicator['roles'] } : i))} className={fieldClass}><option value="teacher,manager">教师、管理者</option><option value="teacher">教师</option><option value="manager">管理者</option></select></label><label className="mt-1 flex min-h-[var(--tm-size-touch)] items-center gap-2"><input type="checkbox" aria-label={`${indicator.name}需审核`} checked={indicator.requiresReview} onChange={e => store.setIndicators(indicators.map(i => i.id === indicator.id ? { ...i, requiresReview: e.target.checked } : i))} />需审核</label></div>)}<button type="button" className={secondaryAction} onClick={() => setResetConfirm(true)}>重置演示数据</button>{resetConfirm && <div><p className={metaClass}>将清除本轮新增记录并恢复预置配置。</p><div className="mt-2 flex gap-2"><button type="button" className={secondaryAction} onClick={() => setResetConfirm(false)}>取消</button><button type="button" className={primaryAction} onClick={() => { store.reset(); setResetConfirm(false); setControlsOpen(false); setSheet(null); setNotice('演示数据已重置。'); }}>重置</button></div></div>}</div>}{store.storageError && <p role="alert" className={`mt-2 ${metaClass}`}>浏览器未允许保存数据，刷新后将恢复预置记录。</p>}</aside>
    <div className="h-full min-h-0 min-w-0"><PhoneMockup showDeviceFrame contentTopInsetMode="status-bar" screenOverlayRootId="teacher-mobile-overlay-root" screenBackground={<TeacherMobileScreenBackground variant={tab === 'record' ? 'record' : tab === 'me' ? 'me' : 'plain'} />}><div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {tab === 'record' ? <RecordHeader manager={isManager} mode={recordMode} pendingCount={pendingCount} stateCounts={recordMode === 'review' ? { pending: pendingCount, returned: reviewInbox(records, actorId, 'returned').length } : { pending: ownRecords.filter(r => r.status === 'pending').length, returned: ownRecords.filter(r => r.status === 'returned').length }} state={activeRecordState} onMode={changeRecordMode} onState={changeRecordState} onIndicators={() => setSheet('rules')} /> : selectedTeacherId && tab === 'archive' ? <MobilePageHeader title={pageTitle} onBack={() => setSelectedTeacherId(null)} /> : <header className={`flex h-11 shrink-0 items-center pl-[var(--tm-space-5)] [padding-right:max(var(--tm-space-5),var(--mini-program-capsule-right-inset,0px))] ${tab === 'archive' || tab === 'report' ? 'bg-[var(--tm-page-plain-header-bg)]' : ''}`}><h1 className="text-[length:var(--tm-font-size-page-title)] font-bold">{pageTitle}</h1></header>}
      {tab !== 'me' && tab !== 'record' && <div className={`shrink-0 px-[var(--tm-space-5)] ${tab === 'archive' || tab === 'report' ? 'bg-[var(--tm-page-plain-content-bg)]' : ''}`}><div className="flex min-h-[var(--tm-size-touch)] items-center justify-between gap-3">{isManager ? <CompactSegmentedControl density="compact" semantics="group" value={scope} items={[{ value: 'school', label: '全校' }, { value: 'self', label: '我的' }]} onChange={changeScope} ariaLabel="数据范围" /> : <span className={metaClass}>{actor.name} · {SCHOOL}</span>}<SelectButton onClick={() => setSheet('period')} label="切换考核周期">{PERIODS.find(p => p.id === periodId)?.label}</SelectButton></div></div>}
      <main ref={mainRef} className={`min-h-0 flex-1 overflow-y-auto px-[var(--tm-report-page-inline)] pb-20 pt-3 ${tab === 'archive' || tab === 'report' ? 'bg-[var(--tm-page-plain-content-bg)]' : ''}`}>

        {schoolScope && !selectedTeacherId && tab !== 'me' && tab !== 'record' && <div className="mb-3 flex items-center gap-3"><MobileSearchInput aria-label="搜索教师" containerClassName="min-w-0 flex-1" value={search} onChange={e => setSearch(e.target.value)} placeholder="姓名、学科、年级" /><SelectButton onClick={() => setSheet('school-filter')} label="筛选教师">{[grade, subject].filter(Boolean).join(' · ') || '筛选'}</SelectButton></div>}
        {tab === 'archive' && (schoolScope && !selectedTeacherId ? <Section title={`全校教师 · ${filteredTeachers.length}人`}><MobileCard>{filteredTeachers.map(teacher => <RowButton key={teacher.id} onClick={() => { setSelectedTeacherId(teacher.id); setFilterIndicator(''); setFilterCategory(''); setFilterLevel(''); mainRef.current?.scrollTo({ top: 0 }); }} description={`${teacher.subject} · ${teacher.grade} · ${teacher.title}`}><span className="flex items-center justify-between gap-2"><span>{teacher.name}</span><span className="text-[length:var(--tm-font-size-body)] tabular-nums">{teacherScore(indicators, records, teacher.id, periodId)}分</span></span></RowButton>)}{!filteredTeachers.length && <EmptyState title="没有找到教师" />}</MobileCard></Section> : <ArchiveView teacher={dossier} indicators={indicators} records={records} periodId={periodId} teacherNames={TEACHER_NAMES} onProfile={part => { setProfilePart(part); setSheet('profile'); }} onRecord={openRecord} onFilter={() => setSheet('filter')} filterLabel={filterLabel} filterIndicator={filterIndicator} filterCategory={filterCategory} filterLevel={filterLevel} onIndicator={setFilterIndicator} onEvaluate={schoolScope ? () => openEntry() : undefined} />)}
        {tab === 'record' && <RecordView records={shownRecords} indicators={indicators} teacherNames={TEACHER_NAMES} actorId={actorId} mode={recordMode} state={activeRecordState} onOpen={openRecord} />}
        {tab === 'report' && <ReportsView teachers={scopedTeachers} records={records} indicators={indicators} periodId={periodId} schoolScope={schoolScope} onDrill={item => { setDrill(item); setSheet('report-detail'); }} onTeacher={id => { setTab('archive'); setSelectedTeacherId(id); setFilterIndicator(''); setFilterCategory(''); setFilterLevel(''); mainRef.current?.scrollTo({ top: 0 }); }} />}
        {tab === 'me' && <div className="space-y-4"><MobileCard><h2 className="text-[length:var(--tm-font-size-group-title)] font-bold">{actor.name}</h2><p className={`mt-2 ${metaClass}`}>{isManager ? '管理者' : '教师'} · {actor.subject} · {SCHOOL}</p></MobileCard><MobileCard><RowButton onClick={() => { setScope('self'); changeTab('archive'); }} description="个人资料、任职、资格与工作经历" icon={<UserRound size={20} />}>我的档案</RowButton><RowButton onClick={() => setSheet('rules')} description="指标定义、基础分与计分边界" icon={<ShieldCheck size={20} />}>指标说明</RowButton><RowButton onClick={() => setSheet('help')} icon={<FileText size={20} />}>使用帮助</RowButton></MobileCard></div>}
      </main>
      {tab === 'record' && recordMode === 'record' && <TeacherRecordInputBar
        showKeyboard={false} showTabBar inputText="" hasSelectionTarget emptySelectionPrompt="" isMultiSelectMode={false} selectedTargetCount={0} selectedTargetUnit="人" voicePressState={voicePressState}
        onCloseKeyboard={() => {}} onCameraClick={() => openEntry('photo')} onVoicePointerDown={onVoicePointerDown} onVoiceContextMenu={event => event.preventDefault()} onKeyboardClick={() => openEntry()}
        onVoiceKeyboardActivate={sendVoiceRecord}
      />}
      <MobileBottomNavigation activeTab={tab} items={TABS} onTabChange={changeTab} ariaLabel="教师评价主要导航" />
      <MobileToast message={notice} />
      <MobileBottomSheet open={!!sheet} title={sheetTitle} onClose={closeSheet} size={(sheet === 'entry' && !!draft) || sheet === 'record' || sheet === 'filter' || sheet === 'rules' || sheet === 'report-detail' ? 'tall' : 'content'} contentTone={sheet === 'report-detail' ? 'plain' : 'surface'} footer={sheetFooter}>
        {sheet === 'date' && <MobileDateCalendar value={{ start: date, end: date }} min={PERIODS[1].start} max={PERIODS[0].end} onSelect={value => { setDate(value); setSheet('entry'); }} />}
        {sheet === 'profile' && <ProfileDetails teacher={dossier} part={profilePart} />}
        {sheet === 'period' && <div>{PERIODS.map(period => <RowButton key={period.id} description={`${period.start} 至 ${period.end}`} onClick={() => { setPeriodId(period.id); setSheet(null); }}>{period.label}{period.id === periodId && <Check size={16} className="ml-2 inline text-[var(--tm-brand-primary)]" aria-label="当前周期" />}</RowButton>)}</div>}
        {sheet === 'school-filter' && <div className="space-y-4"><FilterChoices title="年级" value={grade} values={['高一', '高二']} onChange={setGrade} /><FilterChoices title="学科" value={subject} values={TEACHERS.map(t => t.subject)} onChange={setSubject} /><button type="button" className={secondaryAction} onClick={() => { setGrade(''); setSubject(''); setSearch(''); }}>清除筛选</button></div>}
        {sheet === 'filter' && <div className="space-y-4"><FilterChoices title="评价指标" value={filterIndicator} values={indicators.map(i => i.id)} labels={indicatorNames} onChange={setFilterIndicator} /><FilterChoices title="成果类别" value={filterCategory} values={[...new Set(records.filter(r => r.teacherId === dossier.id).map(r => r.category).filter(Boolean))] as string[]} onChange={setFilterCategory} /><FilterChoices title="成果级别" value={filterLevel} values={['国家级', '省级', '市级', '区县级', '集团级', '校级']} onChange={setFilterLevel} /><button type="button" className={secondaryAction} onClick={() => { setFilterIndicator(''); setFilterCategory(''); setFilterLevel(''); }}>清除筛选</button></div>}
        {sheet === 'entry' && (draft ? <div className="space-y-4"><RecordDetails preview record={draft} indicator={indicators.find(i => i.id === draft.indicatorId)!} /><button type="button" className={secondaryAction} onClick={() => setDraft(null)}>返回修改</button></div> : <RecordComposer canSelectTeacher={entryCanSelectTarget} teacherName={TEACHER_NAMES[targetId || actorId]} text={text} date={date} imageSampleId={imageSampleId} error={entryError} onText={setText} onTarget={() => setSheet('target')} onDate={() => setSheet('date')} onImage={() => setSheet('images')} />)}
        {sheet === 'target' && <div>{TEACHERS.map(teacher => <RowButton key={teacher.id} onClick={() => { setTargetId(teacher.id); setSheet('entry'); setEntryError(''); }} description={`${teacher.subject} · ${teacher.grade}`}>{teacher.name}{teacher.id === actorId && '（本人）'}</RowButton>)}</div>}
        {sheet === 'images' && <div className="grid grid-cols-2 gap-3">{IMAGE_SAMPLES.map(sample => <button type="button" key={sample.id} onClick={() => { const teacher = TEACHERS.find(t => t.id === targetId) ?? actor; setTargetId(teacher.id); setImageSampleId(sample.id); setInputType('image'); setText(sample.text(teacher.name, date)); setDraft(null); setSheet('entry'); }} className="min-h-[var(--tm-size-touch)] rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] p-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tm-brand-primary)]"><img src={demoInputImage(sample.id, TEACHER_NAMES[targetId || actorId], date)} alt={`${sample.label}图片`} className="aspect-[760/520] w-full rounded-[var(--tm-radius-inner)] object-contain" /><span className={`mt-2 block ${bodyClass}`}>{sample.label}</span></button>)}</div>}
        {sheet === 'record' && record && <div className="space-y-4"><RecordDetails record={record} indicator={indicators.find(i => i.id === record.indicatorId)!} />{record.status === 'pending' && isManager && !canReview(record, actorId) && <p className={metaClass}>本人提交或涉及本人的记录，由另一位管理者审核。</p>}{returning && <label className="block"><span className={`mb-2 block ${bodyClass}`}>未通过原因</span><textarea rows={3} value={reviewReason} onChange={e => setReviewReason(e.target.value)} className={fieldClass} placeholder="请写明未通过的原因和修改建议" /></label>}{entryError && <p role="alert" className={`${bodyClass} text-[var(--tm-status-negative-strong)]`}>{entryError}</p>}</div>}
        {sheet === 'report-detail' && <RecordList records={drillRecords} teacherNames={TEACHER_NAMES} indicatorNames={indicatorNames} onOpen={openRecord} showNames={schoolScope} />}
        {sheet === 'rules' && <div className="space-y-6">{indicators.map(indicator => <article key={indicator.id}><h3 className="text-[length:var(--tm-font-size-card-title)] font-bold">{indicator.dimension} / {indicator.name}</h3><p className={`mt-2 ${bodyClass}`}>{indicator.definition}</p><p className={`mt-2 ${bodyClass}`}>{indicator.rule}</p><p className={`mt-2 ${metaClass}`}>评价角色：{indicator.roles.map(role => role === 'teacher' ? '教师' : '管理者').join('、')} · {indicator.requiresReview ? '需审核' : '免审'}</p><p className={metaClass}>基础{indicator.base}分 · 上限{indicator.upper}分 · 下限{indicator.lower}分</p></article>)}</div>}
        {sheet === 'help' && <div className={`space-y-5 ${bodyClass}`}><p>在“记录”中输入文字、说话或上传图片，AI匹配指标和学校规则。免审记录自动生效；需要审核的记录，通过后自动计分入档。</p><p>在“档案”中查看个人信息、任职、证书、工作经历与成长记录；在“报表”中查看本期统计。</p>{isManager && <p>管理者在记录页切换“审核”处理待办。记录功能可提交本人或其他教师的评价；档案和报表中的“全校”用于查询学校数据。本人提交或涉及本人的记录，需由其他管理者审核。</p>}<p>审核未通过的记录在“记录 → 未通过”查看原因，修改后重新提交。本人未审核记录和免审记录可在详情中撤回。</p></div>}
      </MobileBottomSheet>
    </div></PhoneMockup></div>
  </div>;
}
function FilterChoices({ title, value, values, labels, onChange, includeAll = true }: { title: string; value: string; values: string[]; labels?: Record<string, string>; onChange: (value: string) => void; includeAll?: boolean }) {
  return <fieldset><legend className="mb-2 text-[length:var(--tm-font-size-card-title)] font-semibold">{title}</legend><div className={`grid gap-2 ${includeAll ? 'grid-cols-3' : 'grid-cols-2'}`}>{(includeAll ? ['', ...values] : values).map(item => <button type="button" key={item} aria-pressed={value === item} onClick={() => onChange(item)} className={`min-h-[var(--tm-size-touch)] rounded-[var(--tm-radius-control)] px-2 text-[length:var(--tm-font-size-compact)] ${value === item ? 'bg-[var(--tm-brand-primary-soft)] font-semibold text-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)]'}`}>{item ? labels?.[item] ?? item : '全部'}</button>)}</div></fieldset>;
}
