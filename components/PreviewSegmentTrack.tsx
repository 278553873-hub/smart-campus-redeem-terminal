import React from 'react';

/** 预览分段控件共用的滑动底块，按钮语义与业务选择由调用方维护。 */
export default function PreviewSegmentTrack({ index, count, weights, gap = 0, children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement> & { index: number; count: number; weights?: readonly number[]; gap?: number }) {
  const totalWeight = weights?.reduce((sum, weight) => sum + weight, 0) ?? count;
  const weight = weights?.[Math.max(index, 0)] ?? 1;
  const precedingWeight = weights?.slice(0, Math.max(index, 0)).reduce((sum, value) => sum + value, 0) ?? Math.max(index, 0);
  return <div {...props} className={`relative isolate ${className}`}>
    <span aria-hidden="true" className="pointer-events-none absolute bottom-1 left-1 top-1 -z-10 rounded-md bg-white shadow-sm transition-[left,width,transform,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none" style={{ width: `calc((100% - 8px - ${(count - 1) * gap}px) * ${weight / totalWeight})`, left: weights ? `calc(4px + (100% - 8px) * ${precedingWeight / totalWeight})` : undefined, transform: weights ? undefined : `translateX(calc(${Math.max(index, 0) * 100}% + ${Math.max(index, 0) * gap}px))`, opacity: index < 0 ? 0 : 1 }} />
    {children}
  </div>;
}
