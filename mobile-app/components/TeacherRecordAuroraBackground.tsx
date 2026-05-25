import React from 'react';

interface TeacherRecordAuroraBackgroundProps {
    activeTab: 'student' | 'class';
}

const panelBase = 'absolute inset-0 transition-opacity duration-1000';
const auroraBlob = 'absolute rounded-full animate-aurora mix-blend-multiply';

const TeacherRecordAuroraBackground: React.FC<TeacherRecordAuroraBackgroundProps> = ({ activeTab }) => (
    <div className="absolute inset-0 overflow-hidden bg-white">
        <div
            className={`${panelBase} ${activeTab === 'student' ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden="true"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_84%_10%,rgba(129,140,248,0.15),transparent_30%),radial-gradient(circle_at_50%_92%,rgba(16,185,129,0.12),transparent_34%),radial-gradient(circle_at_12%_78%,rgba(251,191,36,0.10),transparent_28%),linear-gradient(145deg,#FFFFFF_0%,#F8FCFF_42%,#F5F8FF_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.72)_34%,transparent_58%)] opacity-60" />
            <div className={`${auroraBlob} left-[-34%] top-[-30%] h-[142vw] w-[142vw] bg-cyan-300/20`} />
            <div className={`${auroraBlob} right-[-42%] top-[-24%] h-[138vw] w-[138vw] bg-violet-300/18`} style={{ animationDelay: '-6s' }} />
            <div className={`${auroraBlob} bottom-[-36%] left-[-30%] h-[136vw] w-[136vw] bg-emerald-200/16`} style={{ animationDelay: '-11s' }} />
            <div className={`${auroraBlob} bottom-[-30%] right-[-34%] h-[128vw] w-[128vw] bg-amber-200/14`} style={{ animationDelay: '-15s' }} />
        </div>

        <div
            className={`${panelBase} ${activeTab === 'class' ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden="true"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(45,212,191,0.17),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(56,189,248,0.15),transparent_30%),radial-gradient(circle_at_58%_90%,rgba(99,102,241,0.12),transparent_34%),radial-gradient(circle_at_10%_82%,rgba(132,204,22,0.10),transparent_28%),linear-gradient(145deg,#FFFFFF_0%,#F5FFFC_43%,#F5F8FF_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.76)_36%,transparent_62%)] opacity-60" />
            <div className={`${auroraBlob} left-[-36%] top-[-30%] h-[146vw] w-[146vw] bg-teal-300/20`} />
            <div className={`${auroraBlob} right-[-40%] top-[-24%] h-[138vw] w-[138vw] bg-sky-300/18`} style={{ animationDelay: '-7s' }} />
            <div className={`${auroraBlob} bottom-[-36%] left-[-32%] h-[136vw] w-[136vw] bg-lime-200/14`} style={{ animationDelay: '-12s' }} />
            <div className={`${auroraBlob} bottom-[-32%] right-[-34%] h-[132vw] w-[132vw] bg-indigo-300/14`} style={{ animationDelay: '-16s' }} />
        </div>
    </div>
);

export default TeacherRecordAuroraBackground;
