import React from 'react';
import { Check, X } from 'lucide-react';
import type { ClassInfo } from '../types';

interface HomeroomClassPickerSheetProps {
    classes: ClassInfo[];
    selectedClassId?: string;
    onSelect: (classId: string) => void;
    onClose: () => void;
}

const HomeroomClassPickerSheet: React.FC<HomeroomClassPickerSheetProps> = ({
    classes,
    selectedClassId,
    onSelect,
    onClose,
}) => (
    <div className="absolute inset-0 z-[120] flex items-end bg-slate-950/25 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="选择班级">
        <button type="button" className="absolute inset-0" onClick={onClose} aria-label="关闭选择班级" />
        <section className="relative w-full rounded-t-[28px] border border-white bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-20px_50px_-34px_rgba(15,23,42,0.52)]">
            <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-200" aria-hidden="true" />
            <div className="mt-2 flex h-12 items-center justify-between">
                <h2 className="text-[17px] font-bold text-slate-900">选择班级</h2>
                <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full text-slate-400 active:bg-slate-50" aria-label="关闭">
                    <X className="h-5 w-5" strokeWidth={2.1} />
                </button>
            </div>
            <div className="max-h-[52vh] overflow-y-auto no-scrollbar">
                {classes.map((classInfo) => {
                    const selected = classInfo.id === selectedClassId;
                    return (
                        <button
                            key={classInfo.id}
                            type="button"
                            onClick={() => onSelect(classInfo.id)}
                            className={`flex min-h-14 w-full items-center border-b border-slate-100 px-1 text-left transition active:bg-slate-50 ${selected ? 'text-[#1E9AAA]' : 'text-slate-700'}`}
                        >
                            <span className="min-w-0 flex-1 text-[15px] font-semibold">{classInfo.name}</span>
                            {selected && <Check className="h-5 w-5 shrink-0" strokeWidth={2.3} aria-hidden="true" />}
                        </button>
                    );
                })}
            </div>
        </section>
    </div>
);

export default HomeroomClassPickerSheet;
