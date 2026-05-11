export const phoneText = {
  navTitle: 'text-[17px] font-bold leading-tight',
  pageTitle: 'text-2xl font-extrabold leading-tight tracking-tight',
  sectionTitle: 'text-[17px] font-semibold leading-snug',
  itemTitle: 'text-[15px] font-normal leading-snug',
  body: 'text-sm font-medium leading-relaxed',
  helper: 'text-xs font-normal leading-snug',
  label: 'text-[11px] font-bold leading-none',
  metric: 'text-[28px] font-black leading-none tracking-tight',
} as const;

export const phoneRadius = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  sheet: 'rounded-[32px]',
  full: 'rounded-full',
} as const;

export const phoneShadow = {
  none: 'shadow-none',
  card: 'shadow-sm',
  raised: 'shadow-[0_20px_50px_-24px_rgba(15,23,42,0.18)]',
  floating: 'shadow-[0_-10px_40px_rgba(15,23,42,0.08)]',
  modal: 'shadow-2xl',
} as const;

export const phoneSpace = {
  pageX: 'px-5',
  sectionGap: 'space-y-5',
  cardMd: 'p-4',
  cardLg: 'p-6',
} as const;

export const phoneTone = {
  brand: {
    box: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    soft: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  },
  violet: {
    box: 'bg-violet-50 text-violet-600 border-violet-100',
    soft: 'bg-violet-50 text-violet-700 border-violet-100',
  },
  blue: {
    box: 'bg-blue-50 text-blue-600 border-blue-100',
    soft: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  teal: {
    box: 'bg-teal-50 text-teal-600 border-teal-100',
    soft: 'bg-teal-50 text-teal-700 border-teal-100',
  },
  success: {
    box: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    soft: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  warning: {
    box: 'bg-amber-50 text-amber-600 border-amber-100',
    soft: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  danger: {
    box: 'bg-rose-50 text-rose-600 border-rose-100',
    soft: 'bg-rose-50 text-rose-700 border-rose-100',
  },
  ai: {
    box: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    soft: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  },
  neutral: {
    box: 'bg-slate-50 text-slate-500 border-slate-100',
    soft: 'bg-slate-50 text-slate-600 border-slate-100',
  },
} as const;

export type PhoneTone = keyof typeof phoneTone;
