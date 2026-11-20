import React, { useCallback, useRef, useState } from 'react';
import { ASSETS } from '../../assets/images';
import { useDiscreteWheelPaging } from '../../hooks/useDiscreteWheelPaging';
import MobileTag from '../ui/MobileTag';

type EditionId = 'school' | 'personal';

interface Edition {
  id: EditionId;
  title: string;
  description: string;
  background: string;
  features: ReadonlyArray<{ title: string; detail: string; image: string }>;
}

const editions: ReadonlyArray<Edition> = [
  {
    id: 'school',
    title: '学校版',
    description: '全校统一管理，班级、年级多维对比，让育人成效看得见。',
    background: ASSETS.MANAGEMENT.TEACHER_SCHOOL_FEATURE_BACKGROUND,
    features: [
      { title: '自定义评价指标', detail: '定制评价标准，贴合本校育人目标', image: ASSETS.MANAGEMENT.TEACHER_SCHOOL_INDICATORS_FEATURE },
      { title: '更全面的成长报告', detail: '月度、学科及校级分析，多维看成长', image: ASSETS.MANAGEMENT.TEACHER_SCHOOL_REPORTS_FEATURE },
      { title: '更多育人工具', detail: '问卷采集、档案设计，延伸育人场景', image: ASSETS.MANAGEMENT.TEACHER_SCHOOL_TOOLS_FEATURE },
      { title: 'AI助理不限额度', detail: '班主任助理、校长助理，随时对话与分析', image: ASSETS.MANAGEMENT.TEACHER_SCHOOL_AI_FEATURE },
    ],
  },
  {
    id: 'personal',
    title: '个人版',
    description: '老师自主带班，记录日常表现，陪伴学生点滴成长。',
    background: ASSETS.MANAGEMENT.TEACHER_PERSONAL_FEATURE_BACKGROUND,
    features: [
      { title: '通用评价指标', detail: '内置常用评价标准，覆盖日常育人场景', image: ASSETS.MANAGEMENT.TEACHER_SCHOOL_INDICATORS_FEATURE },
      { title: '期末综合报告', detail: '汇总学期评价记录，看见学生成长变化', image: ASSETS.MANAGEMENT.TEACHER_SCHOOL_REPORTS_FEATURE },
      { title: '基础班级管理', detail: 'AI语音与拍照记录，日常管理更轻松', image: ASSETS.MANAGEMENT.TEACHER_SCHOOL_TOOLS_FEATURE },
      { title: 'AI班主任助理', detail: '有限额度的AI对话，辅助班级管理与育人。', image: ASSETS.MANAGEMENT.TEACHER_SCHOOL_AI_FEATURE },
    ],
  },
];

const TeacherEditionComparison: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{ pointerId: number; startX: number; startY: number; finished: boolean } | null>(null);
  const stepEdition = useCallback((direction: -1 | 1) => {
    setActiveIndex(current => Math.max(0, Math.min(editions.length - 1, current + direction)));
  }, []);
  useDiscreteWheelPaging(carouselRef, stepEdition);

  const handleSwipeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    swipeRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, finished: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleSwipeMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const swipe = swipeRef.current;
    if (!swipe || swipe.pointerId !== event.pointerId || swipe.finished) return;
    const distanceX = event.clientX - swipe.startX;
    const distanceY = event.clientY - swipe.startY;
    if (Math.abs(distanceY) > 8 && Math.abs(distanceY) > Math.abs(distanceX)) {
      swipe.finished = true;
      return;
    }
    // Measure in rendered pixels so the desktop phone preview and real phones share the same threshold.
    const threshold = Math.min(32, event.currentTarget.getBoundingClientRect().width * 0.1);
    if (Math.abs(distanceX) < threshold || Math.abs(distanceX) <= Math.abs(distanceY)) return;
    swipe.finished = true;
    stepEdition(distanceX < 0 ? 1 : -1);
  };

  const handleSwipeEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (swipeRef.current?.pointerId !== event.pointerId) return;
    swipeRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleCardNavigation = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    setActiveIndex(event.key === 'ArrowRight' || event.key === 'End' ? editions.length - 1 : 0);
  };

  return (
    <section aria-label="个人版与学校版功能对比" className="mt-[var(--tm-space-2)] min-w-0">
      <div
        ref={carouselRef}
        role="group"
        aria-label="左右滑动查看学校版和个人版"
        tabIndex={0}
        onKeyDown={handleCardNavigation}
        onPointerDown={handleSwipeStart}
        onPointerMove={handleSwipeMove}
        onPointerUp={handleSwipeEnd}
        onPointerCancel={handleSwipeEnd}
        onLostPointerCapture={handleSwipeEnd}
        style={{ '--edition-card-inset': 'calc(var(--tm-space-6) + var(--tm-space-4))', '--edition-card-gap': 'var(--tm-space-3)' } as React.CSSProperties}
        className="group/edition-carousel min-w-0 touch-pan-y select-none overflow-hidden overscroll-x-contain rounded-[var(--tm-radius-card-compact)] outline-none"
      >
        <div
          style={{ transform: activeIndex === 0 ? 'translateX(0)' : 'translateX(calc(-100% + var(--edition-card-inset) + var(--edition-card-inset) - var(--edition-card-gap)))' }}
          className="flex min-w-0 items-stretch gap-[var(--edition-card-gap)] transition-transform [transition-duration:var(--tm-edition-carousel-duration)] [transition-timing-function:var(--tm-edition-carousel-easing)] motion-reduce:transition-none"
        >
          {editions.map(edition => {
            const isSchool = edition.id === 'school';
            return (
              <article
                key={edition.id}
                aria-label={`${edition.title}功能`}
                style={{
                  backgroundImage: `url(${edition.background})`,
                  borderColor: isSchool
                    ? 'color-mix(in srgb, var(--tm-tag-gold-border), var(--tm-tag-gold-strong) 24%)'
                    : 'color-mix(in srgb, var(--tm-border-subtle) 45%, transparent)',
                }}
                className="min-w-0 basis-[calc(100%_-_var(--edition-card-inset))] shrink-0 rounded-[var(--tm-radius-card-compact)] border bg-[var(--tm-bg-surface)] bg-cover bg-top p-[var(--tm-space-5)]"
              >
                <header className={`-mx-[var(--tm-space-5)] -mt-[var(--tm-space-5)] border-b p-[var(--tm-space-5)] ${isSchool ? 'border-[var(--tm-tag-gold-border)]' : 'border-[color:color-mix(in_srgb,var(--tm-border-subtle)_45%,transparent)]'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-[var(--tm-space-2)]">
                    <h2 className={`text-[length:var(--tm-font-size-group-title)] font-bold leading-7 decoration-[var(--tm-text-secondary)] underline-offset-4 group-focus-visible/edition-carousel:underline ${isSchool ? 'text-[var(--tm-tag-gold-strong)]' : 'text-[var(--tm-text-primary)]'}`}>{edition.title}</h2>
                    <MobileTag tone={isSchool ? 'gold' : 'neutral'} size="meta" emphasis="solid">{isSchool ? '功能更全' : '自主带班'}</MobileTag>
                  </div>
                  <p className="mt-[var(--tm-space-2)] min-h-12 text-pretty text-[length:var(--tm-font-size-compact)] font-medium leading-6 text-[var(--tm-text-secondary)]">{edition.description}</p>
                </header>
                <ul className="mt-[var(--tm-space-6)] space-y-[var(--tm-space-6)]">
                  {edition.features.map(feature => (
                    <li key={feature.title} className="flex items-center gap-[var(--tm-space-4)]">
                      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full">
                        <img
                          src={feature.image}
                          alt=""
                          width={48}
                          height={48}
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                          className={`h-12 w-12 max-w-none shrink-0 object-cover ${isSchool ? '' : 'grayscale'}`}
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="text-pretty text-[length:var(--tm-font-size-body)] font-semibold leading-6">{feature.title}</p>
                        <p className="mt-[var(--tm-space-1)] min-h-10 text-pretty text-[length:var(--tm-font-size-compact)] font-medium leading-5 text-[var(--tm-text-secondary)]">{feature.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
      <p aria-live="polite" aria-atomic="true" className="sr-only">当前展示{editions[activeIndex].title}</p>
      <figure className="mt-[var(--tm-space-6)] text-center">
        <img
          src={ASSETS.MANAGEMENT.TEACHER_SCHOOL_CONTACT_QR}
          alt="学校版咨询联系二维码"
          width={1254}
          height={1254}
          loading="lazy"
          decoding="async"
          className="mx-auto block aspect-square h-auto w-48 max-w-full"
        />
        <figcaption className="mt-[var(--tm-space-3)] text-[length:var(--tm-font-size-body)] font-semibold leading-6 text-[var(--tm-tag-gold-strong)]">扫码咨询学校版</figcaption>
      </figure>
    </section>
  );
};

export default TeacherEditionComparison;
