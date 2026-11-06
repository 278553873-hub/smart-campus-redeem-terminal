import React, { useEffect, useState } from 'react';
import { MOCK_CLASSES } from '../../mobile-app/constants';
import { DEFAULT_TEACHER_PROFILE, INITIAL_TEACHER_PROFILES_BY_SPACE, TEACHER_PROFILE_SUBJECTS, TEACHER_PROFILE_DEPARTMENTS } from '../../mobile-app/data/teacherProfile';
import { TEACHER_SPACE_OPTIONS } from '../../mobile-app/data/teacherSpaces';
import { canTeacherSpaceRecordClass, getTeacherClassDisplayName } from '../../mobile-app/domain/teacherSpaceAccess';
import type { TeacherGradientPreviewConfig } from '../../mobile-app/styles/teacherGradientPreview';
import TeacherBottomNavigation, { type TeacherBottomTab } from '../../mobile-app/components/TeacherBottomNavigation';
import TeacherMobileScreenBackground from '../../mobile-app/components/TeacherMobileScreenBackground';
import MobilePageHeader from '../../mobile-app/components/ui/MobilePageHeader';
import MobileToast from '../../mobile-app/components/ui/MobileToast';
import MeView, { ClassSourceSheet } from '../../mobile-app/views/MeView';
import TeacherProfileEditView from '../../mobile-app/views/TeacherProfileEditView';
import TeacherLoginView from '../../mobile-app/views/TeacherLoginView';
import { MineSettingsView, SuggestionFeedbackView } from '../../mobile-app/views/MeFeatureViews';
import ClassLeaderboardView from '../../mobile-app/views/ClassLeaderboardView';
import MoralEducationCockpitView from '../../mobile-app/views/MoralEducationCockpitView';
import AiHeadteacherAssistantV2View from '../../mobile-app/views/AiHeadteacherAssistantV2View';
import TeacherIndicatorCatalogView from '../../mobile-app/views/TeacherIndicatorCatalogView';
import EvaluationRecordsLogView from '../../mobile-app/views/EvaluationRecordsLogView';
import WeeklyDutyScheduleView from '../../mobile-app/views/WeeklyDutyScheduleView';
import PadRecordWorkspace from './PadRecordWorkspace';
import PadClassList from './PadClassList';
import { teacherPadCssVariables } from './teacherPadTokens';
import { padSchool } from './padSchool';
import { teacherPadFeatures, type TeacherPadFeatureFlags } from './teacherPadFeatures';
import './teacherPad.css';

export type TeacherPadPage = TeacherBottomTab | 'ranking' | 'report' | 'assistant' | 'indicators' | 'duty' | 'details' | 'profile' | 'settings' | 'feedback';
const padSpaces = TEACHER_SPACE_OPTIONS.filter(canTeacherSpaceRecordClass);

export default function TeacherPad({ initialPage = 'record', features = teacherPadFeatures }: { initialPage?: TeacherPadPage; features?: TeacherPadFeatureFlags }) {
    const [page, setPage] = useState<TeacherPadPage>(initialPage);
    const [tab, setTab] = useState<TeacherBottomTab>(['record', 'class', 'me'].includes(initialPage) ? initialPage as TeacherBottomTab : 'record');
    const [history, setHistory] = useState<TeacherPadPage[]>([]);
    const [spaceId, setSpaceId] = useState(padSchool.id);
    const [profiles, setProfiles] = useState(INITIAL_TEACHER_PROFILES_BY_SPACE);
    const [spaceSheetOpen, setSpaceSheetOpen] = useState(false);
    const [authenticated, setAuthenticated] = useState(true);
    const [classId, setClassId] = useState('c_2025_4');
    const [inputOpen, setInputOpen] = useState(false);
    const [recordModalOpen, setRecordModalOpen] = useState(false);
    const [suggestionText, setSuggestionText] = useState('');
    const [suggestionImages, setSuggestionImages] = useState<string[]>([]);
    const [feedbackToast, setFeedbackToast] = useState('');
    useEffect(() => {
        if (!feedbackToast) return;
        const timer = window.setTimeout(() => setFeedbackToast(''), 1800);
        return () => window.clearTimeout(timer);
    }, [feedbackToast]);
    const [gradientPreview, setGradientPreview] = useState<TeacherGradientPreviewConfig>({ schemeId: 'scheme-6', styleId: 'diffuse' });
    const currentSpace = padSpaces.find(space => space.id === spaceId) ?? padSchool;
    const profile = profiles[currentSpace.id] ?? DEFAULT_TEACHER_PROFILE;
    const homeroomClasses = MOCK_CLASSES.filter(c => profile.homeroomClassIds.includes(c.id));
    const label = (c: typeof MOCK_CLASSES[number]) => getTeacherClassDisplayName(c, currentSpace);
    const primary = ['record', 'class', 'me'].includes(page);
    useEffect(() => {
        const unavailable = (!features.managementTools && (page === 'assistant' || page === 'report'))
            || (!features.weeklyDutySchedule && page === 'duty')
            || (!features.classLeaderboard && (page === 'ranking' || page === 'details'));
        if (unavailable) {
            setPage(tab);
            setHistory([]);
        }
    }, [features.managementTools, features.weeklyDutySchedule, features.classLeaderboard, page, tab]);
    const openPage = (next: TeacherPadPage) => { setHistory(current => [...current, page]); setPage(next); };
    const back = () => { setPage(history.at(-1) ?? tab); setHistory(current => current.slice(0, -1)); };
    const navigate = (next: TeacherBottomTab) => { setTab(next); setHistory([]); setPage(next); };
    const canEditRecords = currentSpace.type === 'school' && ['administrator', 'leader', 'homeroomTeacher', 'teacher'].includes(currentSpace.role);
    const canDeleteRecords = currentSpace.type === 'school' && ['administrator', 'leader'].includes(currentSpace.role);

    return <div className={`teacher-pad ${authenticated && primary && !inputOpen ? 'pad-primary-page' : ''}`} style={teacherPadCssVariables}>
        <TeacherMobileScreenBackground variant={!authenticated ? 'plain' : page === 'record' ? 'record' : page === 'me' ? 'me' : page === 'class' ? 'class-list' : 'plain'} recordMode="class" preview={gradientPreview} />
        <main className={`pad-main pad-page-${page}`} style={recordModalOpen ? { zIndex: 100 } : undefined}>
            {!authenticated ? <TeacherLoginView showWechatLogin={features.wechatQuickLogin} onLogin={() => { setAuthenticated(true); navigate('record'); }} /> : <>
                <div hidden={page !== 'record'} className="pad-preserved-record">
                    <PadRecordWorkspace key={currentSpace.id} currentSpace={currentSpace} onInputOpenChange={setInputOpen}
                        onModalChange={setRecordModalOpen} onIndicators={() => openPage('indicators')} />
                </div>
                {page === 'class' && <PadClassList key={currentSpace.id} currentSpace={currentSpace} teacherProfile={profile} showLeaderboard={features.classLeaderboard} onViewLeaderboard={() => openPage('ranking')} />}
                {page === 'me' && <div className="pad-me-page">
                    <MeView teacherProfile={profile} currentSpace={currentSpace} isSpaceSheetOpen={spaceSheetOpen}
                        pendingCollectionCount={0} onEditTeacherProfile={() => openPage('profile')}
                        onOpenSettings={() => openPage('settings')} onToggleSpaceSheet={() => setSpaceSheetOpen(true)}
                        onOpenAiHeadteacherAssistant={features.managementTools ? () => openPage('assistant') : undefined}
                        onOpenMoralEducationCockpit={features.managementTools ? () => openPage('report') : undefined}
                        onOpenWeeklyDutySchedule={features.weeklyDutySchedule ? () => openPage('duty') : undefined}
                        onOpenSuggestionFeedback={() => openPage('feedback')} />
                </div>}
                {page === 'profile' && <TeacherProfileEditView profile={profile} classes={MOCK_CLASSES}
                    subjects={TEACHER_PROFILE_SUBJECTS} departments={TEACHER_PROFILE_DEPARTMENTS} currentSpace={currentSpace}
                    onBack={back} onChange={next => setProfiles(current => ({ ...current, [currentSpace.id]: next }))} />}
                {page === 'settings' && <div className="pad-secondary-page"><MobilePageHeader title="设置" onBack={back} />
                    <div className="pad-secondary-scroll"><MineSettingsView gradientPreview={gradientPreview} onGradientPreviewChange={setGradientPreview}
                        onLogout={() => { setAuthenticated(false); setHistory([]); setSpaceSheetOpen(false); setInputOpen(false); setRecordModalOpen(false); }} /></div>
                </div>}
                {page === 'feedback' && <div className="pad-secondary-page"><MobilePageHeader title="建议反馈" onBack={back} />
                    <div className="pad-secondary-scroll"><SuggestionFeedbackView text={suggestionText} images={suggestionImages}
                        onTextChange={setSuggestionText}
                        onAddImage={() => setSuggestionImages(current => current.length >= 5 ? current : [...current, `图片${current.length + 1}`])}
                        onRemoveImage={index => setSuggestionImages(current => current.filter((_, imageIndex) => imageIndex !== index))}
                        onSubmit={() => {
                            if (!suggestionText.trim()) return;
                            setSuggestionText(''); setSuggestionImages([]);
                            setFeedbackToast('反馈已提交'); navigate('me');
                        }} /></div>
                </div>}
                {page === 'ranking' && <div className="pad-secondary-page"><MobilePageHeader title="排行榜" onBack={back} />
                    <div className="pad-secondary-scroll"><ClassLeaderboardView settlementCycle={currentSpace.classLeaderboardSettlementCycle ?? 'week'}
                        currentSpace={currentSpace} classes={MOCK_CLASSES} onOpenEvaluationRecords={() => openPage('details')} /></div>
                </div>}
                {page === 'report' && <MoralEducationCockpitView onBack={back} currentSpace={currentSpace} />}
                {page === 'assistant' && <AiHeadteacherAssistantV2View onBack={back} homeroomClasses={homeroomClasses}
                    activeClassId={homeroomClasses.some(c => c.id === classId) ? classId : homeroomClasses[0]?.id ?? ''}
                    onClassChange={setClassId} showStudentEvaluation={false} showClassEvaluation getClassLabel={label}
                    onOpenWeeklyActionAdvice={() => {}} onOpenEvaluationReview={() => {}} />}
                {page === 'indicators' && <TeacherIndicatorCatalogView scope="class" onBack={back} />}
                {page === 'duty' && <WeeklyDutyScheduleView onBack={back} />}
                {page === 'details' && <div className="pad-secondary-page"><MobilePageHeader title="评价记录明细" onBack={back} />
                    <div className="pad-secondary-scroll"><EvaluationRecordsLogView classes={MOCK_CLASSES} currentSpace={currentSpace}
                        canEditRecords={canEditRecords} canDeleteRecords={canDeleteRecords} /></div>
                </div>}
            </>}
        </main>
        <MobileToast message={feedbackToast} />
        <div id="teacher-mobile-overlay-root" className="pointer-events-none absolute inset-0 z-[1000]" />
        {authenticated && primary && !inputOpen && <TeacherBottomNavigation activeTab={tab} onTabChange={navigate} />}
        {authenticated && spaceSheetOpen && <ClassSourceSheet currentSpace={currentSpace} spaceOptions={padSpaces}
            onClose={() => setSpaceSheetOpen(false)} onSelectSpace={id => { setSpaceId(id); setHistory([]); setInputOpen(false); setRecordModalOpen(false); }} />}
    </div>;
}
