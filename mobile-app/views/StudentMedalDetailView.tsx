import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { resolveMedalDetailIcon, resolveMedalIcon } from '../assets/medals';
import studentMedalHeader from '../assets/resources/medals/student-medal-header.jpg';
import MedalIconView from '../components/medal/MedalIcon';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import type { MedalDefinition, MedalSummary, StudentMedalSummary, StudentMedalTerm } from '../domain/medal';
import { getSchoolDate } from '../domain/studentTerms';
import { useDiscreteWheelPaging } from '../hooks/useDiscreteWheelPaging';

interface StudentMedalDetailViewProps {
    studentName: string;
    medalTerms: StudentMedalTerm[];
    onBack: () => void;
    backLabel?: string;
}

const headerImageClass = 'absolute inset-0 block h-full w-full max-w-none object-cover';
const formatTermLabel = (term: StudentMedalTerm['term']) => (
    `${term.label.replace(/\s+/g, '')}${term.isCurrent ? '（本学期）' : ''}`
);
const awardTimeFormatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
});

const medalOpeningFrames: Keyframe[] = [
    { transform: 'rotateY(-360deg)', offset: 0, easing: 'cubic-bezier(0.35, 0, 0.75, 0.43)' },
    { transform: 'rotateY(-295deg)', offset: 0.28, easing: 'linear' },
    { transform: 'rotateY(-65deg)', offset: 0.72, easing: 'cubic-bezier(0.25, 0.57, 0.65, 1)' },
    { transform: 'rotateY(0deg)', offset: 1 },
];

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function StudentMedalArtwork({ definition }: { definition: MedalDefinition }) {
    const artworkRef = useRef<HTMLSpanElement>(null);
    const animationRef = useRef<Animation | undefined>(undefined);

    const playFlip = useCallback((delay = 0) => {
        const artwork = artworkRef.current;
        if (!artwork) return;
        animationRef.current?.cancel();
        if (prefersReducedMotion()) return;
        animationRef.current = artwork.animate?.(medalOpeningFrames, { duration: 1120, delay, fill: 'backwards' });
    }, []);

    useEffect(() => {
        playFlip(160);
        return () => animationRef.current?.cancel();
    }, [playFlip]);

    return (
        <button
            type="button"
            aria-label="翻转奖章"
            onClick={() => playFlip()}
            className="block size-[calc(var(--tm-medal-grid-icon-size)*3)] cursor-pointer select-none rounded-[var(--tm-radius-card-compact)] text-[var(--tm-brand-reward-strong)] [perspective:680px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
        >
            <span ref={artworkRef} aria-hidden="true" className="pointer-events-none block h-full w-full">
                <MedalIconView icon={resolveMedalDetailIcon(definition.id, definition.icon)} className="h-full w-full" />
            </span>
        </button>
    );
}

function StudentMedalTile({ definition, quantity, onOpen }: MedalSummary & { onOpen: () => void }) {
    const icon = resolveMedalIcon(definition.id, definition.icon);
    const layerCount = Math.min(quantity, 3);

    return (
        <li className="min-w-0">
            <button
                type="button"
                aria-haspopup="dialog"
                onClick={event => {
                    event.currentTarget.focus({ preventScroll: true });
                    onOpen();
                }}
                className="flex w-full min-w-0 flex-col items-center gap-[var(--tm-space-1)] rounded-[var(--tm-radius-card-compact)] text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
            >
                <span aria-hidden="true" className="relative block aspect-square w-full max-w-[var(--tm-medal-grid-icon-size)] text-[var(--tm-brand-reward-strong)]">
                    {Array.from({ length: layerCount }, (_, index) => {
                        const depth = layerCount - 1 - index;
                        return (
                            <span key={depth} className="absolute inset-0" style={{ transform: `translateX(${depth * 4}px)` }}>
                                <MedalIconView icon={icon} className="h-full w-full" />
                            </span>
                        );
                    })}
                </span>
                <span className="flex w-full min-w-0 items-baseline justify-center gap-[var(--tm-space-1)]">
                    <span className="min-w-0 truncate text-[length:var(--tm-font-size-compact)] font-medium leading-tight text-[var(--tm-text-primary)]" title={definition.name}>{definition.name}</span>
                    {quantity > 1 && (
                        <>
                            <span aria-hidden="true" className="shrink-0 text-xs tabular-nums text-[var(--tm-text-secondary)]">{`*${quantity}`}</span>
                            <span className="sr-only">{quantity} 枚</span>
                        </>
                    )}
                </span>
            </button>
        </li>
    );
}

function StudentMedalAwardDetails({ definition, awards }: StudentMedalSummary) {
    return (
        <>
            <div className="flex flex-col items-center gap-[var(--tm-space-2)] pb-[var(--tm-space-5)] text-center">
                <StudentMedalArtwork definition={definition} />
                <h2 className="text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">{definition.name}</h2>
            </div>
            <section aria-label="发放历史">
                <h3 className="text-sm font-semibold text-[var(--tm-text-primary)]">发放历史</h3>
                <ul className="divide-y divide-[var(--tm-border-subtle)]">
                    {awards.map(award => {
                        const awardedAt = new Date(award.awardedAt);
                        const teacher = award.source === 'composed' ? '系统自动合成' : (award.teacherName || '未记录发放老师');
                        const hasTime = !/^\d{4}-\d{2}-\d{2}$/.test(award.awardedAt);
                        return (
                            <li key={award.id} className="flex min-h-[var(--tm-size-touch)] items-center justify-between gap-[var(--tm-space-3)] py-[var(--tm-space-2)]">
                                <span className="min-w-0 break-words text-sm font-medium text-[var(--tm-text-primary)]">{teacher}</span>
                                <time dateTime={award.awardedAt} className="shrink-0 text-xs tabular-nums text-[var(--tm-text-secondary)]">
                                    {hasTime ? awardTimeFormatter.format(awardedAt) : getSchoolDate(awardedAt)}
                                </time>
                            </li>
                        );
                    })}
                </ul>
            </section>
        </>
    );
}

export default function StudentMedalDetailView({ studentName, medalTerms, onBack, backLabel = '返回学生详情' }: StudentMedalDetailViewProps) {
    const headerClipId = useId();
    const titleRef = useRef<HTMLHeadingElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);
    const currentPageButtonRef = useRef<HTMLButtonElement>(null);
    const swipe = useRef<{ id: number; x: number; y: number; index: number } | null>(null);
    const suppressSwipeClick = useRef(false);
    const [selectedTerm, setSelectedTerm] = useState<string>();
    const [medalDetails, setMedalDetails] = useState<StudentMedalSummary | null>(null);
    const lastIndex = medalTerms.length - 1;
    const currentIndex = medalTerms.findIndex(({ term }) => term.isCurrent);
    const defaultIndex = currentIndex < 0 ? lastIndex : currentIndex;
    const selectedIndex = medalTerms.findIndex(({ term }) => term.value === selectedTerm);
    const activeIndex = selectedIndex < 0 ? defaultIndex : selectedIndex;
    const activeTerm = medalTerms[activeIndex]?.term;
    const activeIndexRef = useRef(activeIndex);
    activeIndexRef.current = activeIndex;

    useEffect(() => {
        titleRef.current?.focus({ preventScroll: true });
    }, []);

    useEffect(() => {
        const button = currentPageButtonRef.current;
        const pagination = button?.closest('nav');
        if (button && pagination && pagination.scrollWidth > pagination.clientWidth) {
            button.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    }, [activeIndex, medalTerms.length]);

    const selectTerm = useCallback((index: number) => {
        const nextIndex = Math.max(0, Math.min(lastIndex, index));
        const nextTerm = medalTerms[nextIndex]?.term;
        if (!nextTerm) return;
        // 下一次手势从刚选定的学期开始，动画过程不参与翻页计算。
        activeIndexRef.current = nextIndex;
        setSelectedTerm(nextTerm.value);
    }, [lastIndex, medalTerms]);

    const stepTerm = useCallback((direction: -1 | 1) => {
        selectTerm(activeIndexRef.current + direction);
    }, [selectTerm]);
    useDiscreteWheelPaging(cardsRef, stepTerm, { allowInertiaInterrupt: true });

    const startSwipe = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!event.isPrimary || event.button !== 0) return;
        suppressSwipeClick.current = false;
        swipe.current = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            index: activeIndexRef.current,
        };
    };

    const getSwipeDirection = (event: React.PointerEvent<HTMLDivElement>, start: { x: number; y: number }) => {
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        const threshold = Math.min(24, event.currentTarget.getBoundingClientRect().width * 0.08);
        if (Math.abs(dx) < threshold || Math.abs(dx) <= Math.abs(dy)) return 0;
        return dx < 0 ? 1 : -1;
    };

    const captureSwipe = (event: React.PointerEvent<HTMLDivElement>) => {
        const start = swipe.current;
        if (start?.id !== event.pointerId || suppressSwipeClick.current || !getSwipeDirection(event, start)) return;
        suppressSwipeClick.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const cancelSwipe = (event: React.PointerEvent<HTMLDivElement>) => {
        if (swipe.current?.id === event.pointerId) swipe.current = null;
    };

    const finishSwipe = (event: React.PointerEvent<HTMLDivElement>) => {
        const start = swipe.current;
        if (!start || start.id !== event.pointerId) return;
        swipe.current = null;
        const direction = getSwipeDirection(event, start);
        if (!direction) return;
        suppressSwipeClick.current = true;
        selectTerm(start.index + direction);
    };

    return (
        <div className="flex h-full min-h-0 w-full flex-col bg-[var(--tm-page-plain-content-bg)]">
            <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true" focusable="false">
                <defs>
                    <clipPath id={headerClipId} clipPathUnits="objectBoundingBox">
                        <path d="M0 0 H1 V.948 C.833 .994 .667 1 .5 1 S.167 .994 0 .948 Z" />
                    </clipPath>
                </defs>
            </svg>
            <header
                className="relative w-full flex-none overflow-hidden bg-[var(--tm-brand-reward-soft)] pt-[min(var(--tm-space-6),max(var(--mini-program-status-bar-height,0px),env(safe-area-inset-top,0px)))]"
                style={{ clipPath: `url(#${headerClipId})` }}
            >
                <h1 ref={titleRef} tabIndex={-1} className="relative m-0 aspect-[15/8] max-h-60 focus:outline-none">
                    <img
                        src={studentMedalHeader}
                        alt="我的奖章"
                        width={1937}
                        height={812}
                        className={headerImageClass}
                    />
                    {/* 镜像头图最上方的金色背景，连续填充灵动岛所在区域。 */}
                    <img src={studentMedalHeader} alt="" aria-hidden="true" className={`${headerImageClass} origin-top -scale-y-100`} />
                </h1>
                <button
                    type="button"
                    onClick={onBack}
                    className="absolute left-[var(--tm-space-2)] top-[max(var(--mini-program-status-bar-height,0px),env(safe-area-inset-top,0px))] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                    aria-label={backLabel}
                >
                    <ChevronLeft className="h-6 w-6" strokeWidth={2.2} aria-hidden="true" />
                </button>
            </header>

            <section aria-label={`${studentName}的奖章`} className="flex min-h-0 min-w-0 flex-1 flex-col pt-[var(--tm-space-2)] pb-[max(var(--tm-space-2),var(--mini-program-bottom-safe-area,0px),env(safe-area-inset-bottom,0px))]">
                <p aria-live="polite" className="sr-only">{activeTerm && formatTermLabel(activeTerm)}</p>

                <div
                    ref={cardsRef}
                    onPointerDown={startSwipe}
                    onPointerMove={captureSwipe}
                    onPointerUp={finishSwipe}
                    onPointerCancel={cancelSwipe}
                    onLostPointerCapture={cancelSwipe}
                    onDragStart={event => event.preventDefault()}
                    onClickCapture={event => {
                        if (!suppressSwipeClick.current || event.detail === 0) return;
                        event.preventDefault();
                        event.stopPropagation();
                    }}
                    className="min-h-0 min-w-0 flex-1 select-none overflow-clip [touch-action:pan-y_pinch-zoom]"
                    style={{
                        '--medal-term-card-gap': 'var(--tm-space-2)',
                        '--medal-term-card-gutter': medalTerms.length > 1 ? 'var(--tm-space-6)' : 'var(--tm-space-4)',
                    } as React.CSSProperties}
                >
                    <div
                        className="flex h-full w-full gap-[var(--medal-term-card-gap)] px-[var(--medal-term-card-gutter)] transition-transform [transition-duration:var(--tm-duration-standard)] ease-out motion-reduce:transition-none"
                        style={{
                            transform: activeIndex > 0
                                ? `translateX(calc(-${activeIndex} * (100% - 2 * var(--medal-term-card-gutter) + var(--medal-term-card-gap))))`
                                : 'none',
                        }}
                    >
                        {medalTerms.map(({ term, medals }, index) => (
                            <article
                                key={term.value}
                                inert={index !== activeIndex}
                                aria-label={term.label}
                                data-view-scroll-root={index === activeIndex || undefined}
                                tabIndex={index === activeIndex ? 0 : undefined}
                                className="h-full w-full min-w-0 shrink-0 overflow-x-hidden overflow-y-auto overscroll-y-contain rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-3)] no-scrollbar [touch-action:pan-y_pinch-zoom] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]"
                            >
                                <h2 className="sticky top-0 z-10 flex min-h-[var(--tm-size-touch)] items-center justify-center bg-[var(--tm-bg-surface)] px-[var(--tm-space-2)] text-center text-sm font-semibold text-[var(--tm-text-primary)]">
                                    {formatTermLabel(term)}
                                </h2>
                                {medals.length > 0 ? (
                                    <ul className="grid grid-cols-3 gap-x-[var(--tm-space-2)] gap-y-[var(--tm-space-4)] pt-[var(--tm-space-2)] pb-[var(--tm-space-4)]">
                                        {medals.map(medal => (
                                            <StudentMedalTile key={medal.definition.id} {...medal} onOpen={() => setMedalDetails(medal)} />
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="py-8 text-center text-sm text-[var(--tm-text-secondary)]">
                                        {term.isCurrent ? '本学期暂无奖章' : '该学期暂无奖章'}
                                    </p>
                                )}
                            </article>
                        ))}
                    </div>
                </div>
                {medalTerms.length > 1 && (
                    <nav aria-label="切换奖章学期" className="min-w-0 shrink-0 overflow-x-auto no-scrollbar">
                        <div className="mx-auto flex w-max px-[var(--tm-space-2)]">
                            {medalTerms.map(({ term }, index) => {
                                const isActive = index === activeIndex;
                                return (
                                    <button
                                        key={term.value}
                                        ref={isActive ? currentPageButtonRef : undefined}
                                        type="button"
                                        aria-label={term.label}
                                        aria-current={isActive ? 'page' : undefined}
                                        onClick={() => selectTerm(index)}
                                        className="group grid h-[var(--tm-size-touch)] w-[58px] shrink-0 items-end justify-items-center rounded-[var(--tm-radius-card-compact)] px-[3px] pb-[var(--tm-space-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]"
                                    >
                                        <span aria-hidden="true" className={`h-0.5 w-full rounded-full group-hover:bg-[#567d8b] ${isActive ? 'bg-[#18647950]' : 'bg-[#18647920]'}`} />
                                    </button>
                                );
                            })}
                        </div>
                    </nav>
                )}
            </section>
            <MobileBottomSheet
                open={medalDetails !== null}
                title={medalDetails?.definition.name ?? '奖章详情'}
                titleContent={<></>}
                onClose={() => setMedalDetails(null)}
            >
                {medalDetails && <StudentMedalAwardDetails {...medalDetails} />}
            </MobileBottomSheet>
        </div>
    );
}
