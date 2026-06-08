import React from 'react';

interface TeacherRecordAuroraBackgroundProps {
    activeTab: 'student' | 'class';
}

const panelBase = 'absolute inset-0 transition-opacity duration-500';

const TeacherRecordAuroraBackground: React.FC<TeacherRecordAuroraBackgroundProps> = ({ activeTab }) => (
    <div className="absolute inset-0 overflow-hidden bg-white">
        <div
            className={`${panelBase} ${activeTab === 'student' ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden="true"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_-5%,rgba(207,250,254,0.42),transparent_36%),radial-gradient(circle_at_96%_0%,rgba(224,231,255,0.34),transparent_34%),linear-gradient(180deg,#FCFEFF_0%,#F9FCFF_58%,#FFFFFF_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-white/0 via-white/92 to-white" />
        </div>

        <div
            className={`${panelBase} ${activeTab === 'class' ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden="true"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_-5%,rgba(237,233,254,0.42),transparent_36%),radial-gradient(circle_at_96%_0%,rgba(250,232,255,0.30),transparent_34%),linear-gradient(180deg,#FEFDFF_0%,#FBFAFF_58%,#FFFFFF_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-white/0 via-white/92 to-white" />
        </div>
    </div>
);

export default TeacherRecordAuroraBackground;
