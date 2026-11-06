import './classroomControls.css';
import React from 'react';
import type { ClassroomDisplayConfig } from '../../shared/classroomDisplay';

export interface ClassroomEvaluationOption {
  id: string;
  label: string;
  type: 'positive' | 'negative';
  category: string;
}

interface ClassroomEvaluationOptionsProps {
  categories: string[];
  options: ClassroomEvaluationOption[];
  tab: ClassroomEvaluationOption['type'];
  layout: ClassroomDisplayConfig['evaluation'];
  onSelect: (option: ClassroomEvaluationOption) => void;
  adaptive?: boolean;
}

/** 单人伙伴详情与原批量点评共用同一组评价项。 */
export default function ClassroomEvaluationOptions({ categories, options, tab, layout, onSelect, adaptive = false }: ClassroomEvaluationOptionsProps) {
  const colors = ['bg-blue-500', 'bg-violet-500', 'bg-orange-500', 'bg-pink-500', 'bg-emerald-500'];
  return (
    <div className="flex flex-col" style={{ gap: layout.categoryGap, padding: adaptive ? Math.round(layout.contentPadding * 0.75) : layout.contentPadding }}>
      {categories.map((category, index) => {
        const items = options.filter(option => option.type === tab && option.category === category);
        if (!items.length) return null;
        return (
          <section key={category} className="flex flex-col" aria-label={category} style={{ gap: layout.categoryHeaderGap }}>
            <h3 className="ml-1 flex items-center gap-2.5 font-semibold text-slate-500" style={{ fontSize: layout.categoryFontSize }}>
              <span aria-hidden="true" className={`w-1 rounded-full ${colors[index % colors.length]}`} style={{ height: layout.categoryFontSize + 4 }} />
              {category}
            </h3>
            <div className="grid w-full" style={{
              gridTemplateColumns: adaptive ? `repeat(auto-fill, minmax(min(100%, ${Math.round(layout.optionFontSize * 7.5)}px), 1fr))` : `repeat(${layout.optionColumns}, minmax(0, 1fr))`,
              gap: layout.optionGap,
            }}>
              {items.map(option => (
                <button key={option.id} type="button" onClick={() => onSelect(option)}
                  className={`classroom-control border px-3 text-center font-semibold leading-snug text-slate-700 transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:bg-blue-100 ${adaptive ? 'border-slate-100 bg-slate-50' : 'border-slate-200 bg-white'}`}
                  style={{ minHeight: layout.optionHeight, fontSize: layout.optionFontSize }}>
                  {option.label}
                </button>
              ))}
            </div>
          </section>
        );
      })}
      {!options.some(option => option.type === tab && categories.includes(option.category)) && <p className="py-8 text-center text-slate-500">暂无评价项</p>}
    </div>
  );
}
