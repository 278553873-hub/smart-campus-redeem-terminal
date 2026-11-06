import React, { useMemo, useState } from 'react';
import { ASSETS } from '../assets/images';
import type { ClassInfo, TeacherProfile } from '../types';
import { TeacherClassListCard, TeacherClassListToolbar } from './ClassListView';
import MobileGradePickerSheet from '../components/ui/MobileGradePickerSheet';
import MobileEmptyState from '../components/ui/MobileEmptyState';
import {
    canViewClassLeaderboard, getTeacherGradeStage, getTeacherSchoolGradeOptions,
    shouldGroupTeacherGrades, type TeacherSpaceOption,
} from '../domain/teacherSpaceAccess';

interface TeacherClassDirectoryViewProps {
    classes: ClassInfo[];
    currentSpace: TeacherSpaceOption;
    teacherProfile: TeacherProfile;
    addDemoTopBreathingSpace?: boolean;
    showLeaderboard?: boolean;
    onViewLeaderboard?: () => void;
    classNames?: Partial<Record<'root' | 'header' | 'content' | 'grid', string>>;
}

/** 只读班级目录，复用班级卡片和筛选规则，不携带班级管理入口。 */
export default function TeacherClassDirectoryView({
    classes, currentSpace, teacherProfile, addDemoTopBreathingSpace = false,
    showLeaderboard = false, onViewLeaderboard, classNames = {},
}: TeacherClassDirectoryViewProps) {
    const [gradeFilter, setGradeFilter] = useState('全部');
    const [showGradeFilter, setShowGradeFilter] = useState(false);
    const [showTeachingOnly, setShowTeachingOnly] = useState(false);
    const assignedIds = useMemo(() => new Set([
        ...teacherProfile.homeroomClassIds, ...(teacherProfile.deputyHomeroomClassIds ?? []),
        ...teacherProfile.teachingAssignments.map(item => item.classId),
    ]), [teacherProfile]);
    const grades = getTeacherSchoolGradeOptions(currentSpace) ?? [...new Set(classes.map(item => item.gradeLevel))];
    const visibleClasses = classes.filter(item => (gradeFilter === '全部' || item.gradeLevel === gradeFilter)
        && (!showTeachingOnly || assignedIds.has(item.id)));

    return <div className={classNames.root ?? 'relative flex h-full min-h-0 flex-col overflow-hidden'}>
        <header className={classNames.header ?? `shrink-0 px-5 ${addDemoTopBreathingSpace ? 'pt-5' : ''}`}>
            <TeacherClassListToolbar gradeFilter={gradeFilter} showGradeFilter={showGradeFilter}
                showTeachingOnly={showTeachingOnly} onOpenGradeFilter={() => setShowGradeFilter(true)}
                onTeachingOnlyChange={setShowTeachingOnly}
                showLeaderboard={showLeaderboard && Boolean(onViewLeaderboard) && canViewClassLeaderboard(currentSpace)}
                onViewLeaderboard={() => onViewLeaderboard?.()} />
        </header>
        <div className={classNames.content ?? 'min-h-0 flex-1 overflow-y-auto px-5 pt-[var(--tm-space-2)] pb-[calc(var(--teacher-tabbar-height)+var(--teacher-tabbar-bottom)+var(--teacher-tabbar-content-gap))]'}>
            <p className="mb-2 pl-[var(--tm-space-1)] text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]" aria-live="polite">共{visibleClasses.length}个</p>
            <div className={classNames.grid ?? 'grid grid-cols-1 gap-[var(--tm-layout-card-gap)]'}>
                {visibleClasses.map(classInfo => <TeacherClassListCard key={classInfo.id} classInfo={classInfo}
                    teacherProfile={teacherProfile} currentSpace={currentSpace} />)}
            </div>
            {visibleClasses.length === 0 && <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.CHAIR} title="没有符合条件的班级" className="py-6" />}
        </div>
        <MobileGradePickerSheet open={showGradeFilter} selectionMode="single" value={gradeFilter}
            title="选择年级" options={grades.map(value => ({ value, label: value, stage: getTeacherGradeStage(value) }))}
            showAllGradesOption allGradesValue="全部" showStageName={shouldGroupTeacherGrades(currentSpace)}
            onChange={setGradeFilter} onClose={() => setShowGradeFilter(false)} ariaLabel="班级列表年级筛选" />
    </div>;
}
