import { MOCK_CLASSES } from '../../mobile-app/constants';
import type { TeacherProfile } from '../../mobile-app/types';
import type { TeacherSpaceOption } from '../../mobile-app/domain/teacherSpaceAccess';
import TeacherClassDirectoryView from '../../mobile-app/views/TeacherClassDirectoryView';

export default function PadClassList({ currentSpace, teacherProfile, showLeaderboard, onViewLeaderboard }: {
    currentSpace: TeacherSpaceOption;
    teacherProfile: TeacherProfile;
    showLeaderboard: boolean;
    onViewLeaderboard: () => void;
}) {
    return <TeacherClassDirectoryView classes={MOCK_CLASSES} currentSpace={currentSpace}
        teacherProfile={teacherProfile} showLeaderboard={showLeaderboard} onViewLeaderboard={onViewLeaderboard}
        classNames={{ root: 'pad-class-page', header: 'pad-class-header', content: 'pad-class-scroll', grid: 'pad-class-grid' }} />;
}
