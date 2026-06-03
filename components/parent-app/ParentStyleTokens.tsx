export const parentSurface = {
  background: 'bg-[linear-gradient(135deg,#fff6fb_0%,#f4fbff_44%,#f8fffb_100%)]',
  card: 'border border-white/90 bg-white/95',
  subtle: 'border border-slate-100 bg-slate-50/80',
} as const;

export const parentText = {
  title: 'text-slate-950',
  body: 'text-slate-700',
  muted: 'text-slate-500',
  weak: 'text-slate-400',
  success: 'text-emerald-600',
  attention: 'text-orange-500',
} as const;

export const parentIconTone = {
  blue: 'bg-gradient-to-br from-[#0DB4F1] to-[#22D3C5] text-white shadow-[0_12px_22px_-16px_rgba(13,180,241,0.7)]',
  green: 'bg-gradient-to-br from-[#18C978] to-[#82DF46] text-white shadow-[0_12px_22px_-16px_rgba(24,201,120,0.62)]',
  orange: 'bg-gradient-to-br from-[#FFB36C] to-[#FF7E6B] text-white shadow-[0_12px_22px_-16px_rgba(255,126,107,0.62)]',
  softBlue: 'bg-gradient-to-br from-[#8FD7FF] to-[#BCEFFF] text-white shadow-[0_12px_22px_-16px_rgba(13,180,241,0.42)]',
} as const;

export const parentButtonTone = {
  primary: 'bg-gradient-to-br from-[#0DB4F1] to-[#18D0A8] text-white shadow-[0_18px_34px_-24px_rgba(17,184,240,0.68)]',
  secondary: 'border border-[#D8EEF0] bg-white text-emerald-700 shadow-none',
  neutral: 'bg-slate-100 text-slate-600 shadow-none',
  attention: 'bg-gradient-to-br from-[#FFB36C] to-[#FF7E6B] text-white shadow-[0_18px_34px_-24px_rgba(255,126,107,0.58)]',
} as const;

export const parentRadius = {
  icon: 'rounded-[15px]',
  iconSmall: 'rounded-[10px]',
  card: 'rounded-[20px]',
  cardLarge: 'rounded-[22px]',
  input: 'rounded-[14px]',
  button: 'rounded-[16px]',
  sheet: 'rounded-t-[22px]',
} as const;

export const parentShadow = {
  card: 'shadow-[0_18px_42px_-38px_rgba(28,42,58,0.42)]',
  floating: 'shadow-[0_22px_50px_-40px_rgba(28,42,58,0.5)]',
  sheet: 'shadow-[0_-22px_60px_-42px_rgba(28,42,58,0.72)]',
} as const;
