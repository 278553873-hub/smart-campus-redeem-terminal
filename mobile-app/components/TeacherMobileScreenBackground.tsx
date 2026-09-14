import React from 'react';
import {
    getTeacherGradientPreviewVisual,
    type TeacherGradientDirection,
    type TeacherGradientPreviewConfig,
} from '../styles/teacherGradientPreview';

export type TeacherMobileScreenBackgroundVariant = 'ambient' | 'class-list' | 'me' | 'plain' | 'preview' | 'record' | 'student-detail';
export type TeacherMobileRecordMode = 'student' | 'class';
export type TeacherMobileClassListMode = 'class' | 'team';

interface TeacherMobileScreenBackgroundProps {
    variant?: TeacherMobileScreenBackgroundVariant;
    recordMode?: TeacherMobileRecordMode;
    classListMode?: TeacherMobileClassListMode;
    preview?: TeacherGradientPreviewConfig;
}

const contextPanelClass = 'absolute inset-0 transition-opacity [transition-duration:var(--tm-context-switch-duration)] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none';

const SharedAmbientBase = () => (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_92%,var(--tm-glow-primary-subtle),transparent_34%),radial-gradient(circle_at_4%_68%,var(--tm-glow-secondary-subtle),transparent_30%),linear-gradient(180deg,var(--tm-bg-page)_0%,var(--tm-bg-page-mid)_58%,var(--tm-bg-page-low)_100%)]" />
);

const ContextAmbientPanel: React.FC<{
    visible: boolean;
    primaryGlow: string;
    secondaryGlow: string;
}> = ({ visible, primaryGlow, secondaryGlow }) => (
    <div className={`${contextPanelClass} ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div
            className="absolute inset-0"
            style={{
                background: `radial-gradient(circle at 8% -6%, ${primaryGlow}, transparent 34%), radial-gradient(circle at 96% 0%, ${secondaryGlow}, transparent 30%)`,
            }}
        />
    </div>
);

const PreviewBackgroundPanel: React.FC<{
    visible: boolean;
    preview: TeacherGradientPreviewConfig;
    direction: TeacherGradientDirection;
}> = ({ visible, preview, direction }) => {
    const visual = getTeacherGradientPreviewVisual(preview, direction);

    return (
        <div
            className={`${contextPanelClass} overflow-hidden ${visible ? 'opacity-100' : 'opacity-0'}`}
            style={{
                backgroundColor: visual.backgroundColor,
                backgroundImage: visual.backgroundImage,
                backgroundSize: visual.backgroundSize,
                backgroundPosition: visual.backgroundPosition,
                backgroundRepeat: visual.backgroundRepeat,
            }}
        >
            {visual.overlayBackgroundImage && (
                <div
                    className="absolute -left-[28%] -top-[10%] h-[68%] w-[156%]"
                    style={{
                        backgroundImage: visual.overlayBackgroundImage,
                        filter: 'blur(24px)',
                        transform: 'rotate(-8deg)',
                    }}
                />
            )}
        </div>
    );
};

const TeacherMobileScreenBackground: React.FC<TeacherMobileScreenBackgroundProps> = ({
    variant = 'ambient',
    recordMode = 'student',
    classListMode = 'class',
    preview,
}) => {
    if (variant === 'preview' && preview) {
        const visual = getTeacherGradientPreviewVisual(preview);
        return (
            <div
                className="absolute inset-0 overflow-hidden"
                style={{
                    backgroundColor: visual.backgroundColor,
                    backgroundImage: visual.backgroundImage,
                    backgroundSize: visual.backgroundSize,
                    backgroundPosition: visual.backgroundPosition,
                    backgroundRepeat: visual.backgroundRepeat,
                }}
                aria-hidden="true"
            >
                {visual.overlayBackgroundImage && (
                    <div
                        className="absolute -left-[28%] -top-[10%] h-[68%] w-[156%]"
                        style={{
                            backgroundImage: visual.overlayBackgroundImage,
                            filter: 'blur(24px)',
                            transform: 'rotate(-8deg)',
                        }}
                    />
                )}
            </div>
        );
    }

    if (variant === 'plain') {
        return <div className="absolute inset-0 bg-[var(--tm-page-plain-header-bg)]" aria-hidden="true" />;
    }

    if (variant === 'student-detail') {
        return <div className="absolute inset-0 bg-[var(--tm-page-plain-content-bg)]" aria-hidden="true" />;
    }

    if (variant === 'me') {
        return (
            <div
                className="absolute inset-0 overflow-hidden bg-[var(--tm-me-gradient-base)]"
                style={{
                    backgroundImage: [
                        'linear-gradient(180deg, transparent 52%, var(--tm-me-gradient-tail-field) 100%)',
                        'radial-gradient(ellipse 84% 50% at -8% 24%, var(--tm-me-gradient-primary-field) 0%, transparent 72%)',
                        'radial-gradient(ellipse 82% 52% at 108% 34%, var(--tm-me-gradient-sky-field) 0%, transparent 74%)',
                        'radial-gradient(ellipse 44% 24% at 20% -2%, var(--tm-me-gradient-jade-hint) 0%, transparent 70%)',
                        'linear-gradient(180deg, var(--tm-me-gradient-base) 0%, var(--tm-bg-page-mid) 52%, var(--tm-bg-surface) 82%)',
                    ].join(', '),
                }}
                aria-hidden="true"
            />
        );
    }

    const isContextual = variant === 'record' || variant === 'class-list';
    const isPrimaryContext = variant === 'record'
        ? recordMode === 'student'
        : classListMode === 'class';

    if (isContextual && preview) {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[var(--tm-bg-page)]" aria-hidden="true">
                <PreviewBackgroundPanel visible preview={preview} direction="forward" />
                <PreviewBackgroundPanel visible={!isPrimaryContext} preview={preview} direction="reverse" />
            </div>
        );
    }

    const primaryGlow = variant === 'class-list'
        ? 'var(--tm-class-list-class-glow)'
        : 'var(--tm-glow-primary)';
    const secondaryGlow = variant === 'class-list'
        ? 'var(--tm-class-list-team-glow)'
        : 'var(--tm-glow-secondary)';

    return (
        <div className="absolute inset-0 overflow-hidden bg-[var(--tm-bg-page)]" aria-hidden="true">
            <SharedAmbientBase />
            {variant === 'ambient' ? (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_2%,var(--tm-glow-primary),transparent_32%),radial-gradient(circle_at_94%_18%,var(--tm-glow-secondary),transparent_34%)]" />
            ) : (
                <>
                    <ContextAmbientPanel
                        visible={isPrimaryContext}
                        primaryGlow={primaryGlow}
                        secondaryGlow={secondaryGlow}
                    />
                    <ContextAmbientPanel
                        visible={!isPrimaryContext}
                        primaryGlow={secondaryGlow}
                        secondaryGlow={primaryGlow}
                    />
                </>
            )}
        </div>
    );
};

export default TeacherMobileScreenBackground;
