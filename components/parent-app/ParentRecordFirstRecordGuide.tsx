import React from 'react';

const EXAMPLES = [
  '今天主动完成阅读，还和家人分享了书里喜欢的故事。',
  '晚饭后主动收拾餐桌，把自己的碗筷洗干净了。',
  '和弟弟一起玩积木时，愿意轮流分享。',
] as const;

export default function ParentRecordFirstRecordGuide() {
  return <section className="pt-[var(--pm-space-4)]" aria-label="首次家长记录引导">
    <h2 className="px-[var(--pm-space-1)] text-center text-[length:var(--pm-font-size-card-title)] font-semibold leading-6 text-[var(--pm-text-primary)]">试试通过语音描述孩子的表现：</h2>
    <ol className="mt-[var(--pm-space-2)] px-[var(--pm-space-1)]">
      {EXAMPLES.map((example, index) => <li key={example} className="flex items-start gap-[var(--pm-space-3)] py-[var(--pm-space-2)]">
        <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--pm-brand-primary-soft)] text-[length:var(--pm-font-size-meta)] font-bold tabular-nums text-[var(--pm-brand-primary)]">{index + 1}</span>
        <span className="text-pretty pt-0.5 text-[length:var(--pm-font-size-body)] font-normal leading-6 text-[var(--pm-text-secondary)]">{example}</span>
      </li>)}
    </ol>
  </section>;
}
