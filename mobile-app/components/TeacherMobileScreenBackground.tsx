import React from 'react';

export type TeacherMobileScreenBackgroundVariant = 'ambient' | 'record';
export type TeacherMobileRecordMode = 'student' | 'class';

interface TeacherMobileScreenBackgroundProps {
    variant?: TeacherMobileScreenBackgroundVariant;
    recordMode?: TeacherMobileRecordMode;
}

const recordPanelClass = 'absolute inset-0 transition-opacity duration-500';

const SharedAmbientBase = () => (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_92%,var(--tm-glow-primary-subtle),transparent_34%),radial-gradient(circle_at_4%_68%,var(--tm-glow-secondary-subtle),transparent_30%),linear-gradient(180deg,var(--tm-bg-page)_0%,var(--tm-bg-page-mid)_58%,var(--tm-bg-page-low)_100%)]" />
);

const RecordBackgroundPanel: React.FC<{
    visible: boolean;
    primaryGlow: string;
    secondaryGlow: string;
}> = ({ visible, primaryGlow, secondaryGlow }) => (
    <div className={`${recordPanelClass} ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div
            className="absolute inset-0"
            style={{
                background: `radial-gradient(circle at 8% -6%, ${primaryGlow}, transparent 34%), radial-gradient(circle at 96% 0%, ${secondaryGlow}, transparent 30%)`,
            }}
        />
    </div>
);

const TeacherMobileScreenBackground: React.FC<TeacherMobileScreenBackgroundProps> = ({
    variant = 'ambient',
    recordMode = 'student',
}) => (
    <div className="absolute inset-0 overflow-hidden bg-[var(--tm-bg-page)]" aria-hidden="true">
        <SharedAmbientBase />
        {variant === 'ambient' ? (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_2%,var(--tm-glow-primary),transparent_32%),radial-gradient(circle_at_94%_18%,var(--tm-glow-secondary),transparent_34%)]" />
        ) : (
            <>
                <RecordBackgroundPanel
                    visible={recordMode === 'student'}
                    primaryGlow="var(--tm-glow-primary)"
                    secondaryGlow="var(--tm-glow-secondary)"
                />
                <RecordBackgroundPanel
                    visible={recordMode === 'class'}
                    primaryGlow="var(--tm-glow-secondary)"
                    secondaryGlow="var(--tm-glow-primary)"
                />
            </>
        )}
    </div>
);

export default TeacherMobileScreenBackground;
