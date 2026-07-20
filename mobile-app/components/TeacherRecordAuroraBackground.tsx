import React from 'react';

interface TeacherRecordAuroraBackgroundProps {
    activeTab: 'student' | 'class';
}

const panelBase = 'absolute inset-0 transition-opacity duration-500';

const TeacherRecordAuroraBackground: React.FC<TeacherRecordAuroraBackgroundProps> = ({ activeTab }) => (
    <div className="absolute inset-0 overflow-hidden bg-[var(--tm-bg-page)]">
        <div
            className={`${panelBase} ${activeTab === 'student' ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden="true"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_-6%,var(--tm-glow-primary),transparent_34%),radial-gradient(circle_at_96%_0%,var(--tm-glow-secondary),transparent_30%),linear-gradient(180deg,var(--tm-bg-page)_0%,var(--tm-bg-surface)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(180deg,transparent_0%,var(--tm-bg-surface-glass)_72%,var(--tm-bg-surface)_100%)]" />
        </div>

        <div
            className={`${panelBase} ${activeTab === 'class' ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden="true"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_-6%,var(--tm-glow-secondary),transparent_34%),radial-gradient(circle_at_96%_0%,var(--tm-glow-primary),transparent_30%),linear-gradient(180deg,var(--tm-bg-page)_0%,var(--tm-bg-surface)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(180deg,transparent_0%,var(--tm-bg-surface-glass)_72%,var(--tm-bg-surface)_100%)]" />
        </div>
    </div>
);

export default TeacherRecordAuroraBackground;
