import React from 'react';
import { skeletonBlock } from '../ui/MobileSkeletonList';

/** 请求尚未返回任何数据时的首屏占位；有缓存或演示数据时直接测量真实卡片。 */
const ClassListLoadingCards: React.FC<{ variant: 'class' | 'team' }> = ({ variant }) => (
    <div className="space-y-[var(--tm-space-3)]" aria-hidden="true">
        {[0, 1, 2].map(index => (
            <article key={index} className={`relative flex min-h-[var(--tm-class-list-card-compact-min-height)] flex-col rounded-[var(--tm-class-list-card-radius)] bg-[var(--tm-bg-surface)] pb-1 pt-3 [box-shadow:var(--tm-shadow-card)] ${variant === 'team' ? 'px-4' : 'px-5'}`}>
                {variant === 'team' ? (
                    <div data-skeleton-anchor={`loading-team-content-${index}`} className="flex min-h-[74px] flex-1 items-center gap-3 px-1">
                        <span {...skeletonBlock(0, 'circle')} className="h-14 w-14 shrink-0" />
                        <div className="min-w-0 flex-1">
                            <div {...skeletonBlock(1, 'line', 1, 18)} data-skeleton-right-to={`loading-team-action-end-${index}`} className="h-[27px]" />
                            <div {...skeletonBlock(2, 'line', 0.82, 13)} className="mt-1 h-5" />
                        </div>
                    </div>
                ) : (
                    <div className="min-w-0 flex-1 pr-10">
                        <div {...skeletonBlock(0, 'line', 1, 18)} data-skeleton-right-to={`loading-class-action-end-${index}`} className="h-[27px]" />
                        <div {...skeletonBlock(1, 'line', 0.72, 13)} className="mt-1.5 h-[21.5px]" />
                        <div {...skeletonBlock(2, 'line', 0.72, 13)} className="mt-2 h-5" />
                    </div>
                )}
                <div className={`mt-2 ${variant === 'team' ? 'pt-1' : ''}`}>
                    <div className="h-[var(--tm-class-list-divider-thickness)] bg-[var(--tm-class-list-divider)]" />
                    <div data-skeleton-align-to={variant === 'team' ? `loading-team-content-${index}` : undefined} className="grid h-[var(--tm-class-list-card-action-content-height)] grid-cols-2 items-center">
                        <span {...skeletonBlock(3, 'line', 0.78, 14)} className="block h-11" />
                        <span {...skeletonBlock(3, 'line', 0.78, 14)} data-skeleton-anchor={`loading-${variant}-action-end-${index}`} className="block h-11" />
                    </div>
                </div>
            </article>
        ))}
    </div>
);

export default ClassListLoadingCards;
