/** 手机端轻量筛选入口：页面仅决定布局，尺寸、文字和状态统一消费教师端令牌。 */
export const mobileFilterButtonClass = 'group flex min-h-[var(--tm-size-touch)] min-w-0 items-center gap-[var(--tm-space-1)] bg-[var(--tm-filter-bg)] text-[length:var(--tm-font-size-compact)] [font-weight:var(--tm-font-weight-regular)] text-[var(--tm-text-primary)] [box-shadow:var(--tm-filter-shadow)] [-webkit-tap-highlight-color:transparent] aria-expanded:text-[var(--tm-brand-primary)] aria-expanded:[font-weight:var(--tm-font-weight-semibold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] disabled:text-[var(--tm-text-secondary)]';

export const mobileFilterIconClass = 'h-[var(--tm-space-4)] w-[var(--tm-space-4)] shrink-0 text-[var(--tm-text-tertiary)] group-aria-expanded:text-[var(--tm-brand-primary)]';

export const mobileFilterChevronClass = `${mobileFilterIconClass} group-aria-expanded:rotate-180`;

export const mobileFilterCheckClass = 'h-[var(--tm-space-5)] w-[var(--tm-space-5)] shrink-0 text-[var(--tm-brand-primary)] [stroke-width:var(--tm-filter-check-stroke-width)]';
