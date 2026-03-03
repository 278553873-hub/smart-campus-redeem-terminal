import React, { useMemo, useState } from 'react';
import { Student, ClassInfo } from '../types';
import { MaleIcon, FemaleIcon, CheckCircleIcon, CircleIcon, UsersIcon } from '../components/Icons';

interface ClassDetailViewProps {
    classInfo: ClassInfo;
    students: Student[];
    onSelectStudent: (student: Student) => void;
    // Lifted selection props
    isSelectionMode: boolean;
    onToggleSelectionMode: () => void;
    selectedIds: Set<string>;
    onSelectionChange: (ids: Set<string>) => void;
    onStartRecord?: (studentIds: string[]) => void;
    onViewRecords?: () => void;
}

// Helper to get consistent color based on index or string
const getAvatarStyle = (student: Student, index: number) => {
    // Palette: [Background, Text, Border]
    const malePalettes = [
        ['bg-blue-50', 'text-blue-600', 'border-blue-100'],
        ['bg-indigo-50', 'text-indigo-600', 'border-indigo-100'],
        ['bg-cyan-50', 'text-cyan-600', 'border-cyan-100'],
        ['bg-sky-50', 'text-sky-600', 'border-sky-100'],
    ];

    const femalePalettes = [
        ['bg-pink-50', 'text-pink-600', 'border-pink-100'],
        ['bg-rose-50', 'text-rose-600', 'border-rose-100'],
        ['bg-purple-50', 'text-purple-600', 'border-purple-100'],
        ['bg-fuchsia-50', 'text-fuchsia-600', 'border-fuchsia-100'],
    ];

    const palettes = student.gender === 'male' ? malePalettes : femalePalettes;
    return palettes[index % palettes.length];
};

const ClassDetailView: React.FC<ClassDetailViewProps> = ({
    classInfo,
    students,
    onSelectStudent,
    isSelectionMode,
    onToggleSelectionMode,
    selectedIds,
    onSelectionChange,
}) => {
    const [sortMode, setSortMode] = useState<'id' | 'pinyin'>('id');

    const sortedStudents = useMemo(() => {
        const list = [...students];
        if (sortMode === 'id') {
            return list.sort((a, b) => a.id.localeCompare(b.id));
        }
        return list.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN-u-co-pinyin'));
    }, [students, sortMode]);

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        onSelectionChange(newSet);
    };

    const handleStudentClick = (student: Student) => {
        if (isSelectionMode) {
            toggleSelection(student.id);
        } else {
            onSelectStudent(student);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC]">
            {/* Top Bar Actions - Simplified (Name removed, Search removed) */}
            <div className="px-4 py-2 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-10 shadow-sm h-[52px]">
                <div className="flex items-center gap-2">
                    {/* Student Count Badge */}
                    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        <UsersIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs font-bold text-slate-600">{students.length}人</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-full px-1.5 py-0.5">
                        <button
                            onClick={() => setSortMode('id')}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition ${sortMode === 'id' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                        >
                            按学号
                        </button>
                        <button
                            onClick={() => setSortMode('pinyin')}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition ${sortMode === 'pinyin' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                        >
                            按拼音
                        </button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onToggleSelectionMode}
                        className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all active:scale-95 shadow-sm border ${isSelectionMode
                                ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                                : 'bg-white border-slate-200 text-slate-700 '
                            }`}
                    >
                        {isSelectionMode ? '取消选择' : '批量点评'}
                    </button>
                </div>
            </div>

            {/* Student Grid - 3 Columns Vertical Layout */}
            <div className="flex-1 overflow-y-auto p-4 pb-40">
                <div className="grid grid-cols-3 gap-3">
                    {sortedStudents.map((student, index) => {
                        const isSelected = selectedIds.has(student.id);
                        const [bgClass, textClass, borderClass] = getAvatarStyle(student, index);
                        const nameChar = student.name.slice(-1);

                        return (
                            <div
                                key={student.id}
                                onClick={() => handleStudentClick(student)}
                                className={`
                            relative rounded-xl p-3 flex flex-col items-center transition-all duration-200 cursor-pointer select-none group
                            ${isSelectionMode && isSelected
                                        ? 'bg-blue-50 ring-1.5 ring-blue-500 shadow-sm'
                                        : 'bg-white border border-slate-100  '
                                    }
                        `}
                            >
                                {/* Selection Checkbox (Top Right) */}
                                {isSelectionMode && (
                                    <div className="absolute top-2 right-2 z-10 animate-in fade-in zoom-in duration-200">
                                        {isSelected
                                            ? <CheckCircleIcon className="w-5 h-5 text-blue-500 fill-white" />
                                            : <CircleIcon className="w-5 h-5 text-slate-200 fill-white" />
                                        }
                                    </div>
                                )}

                                {/* Top: Avatar */}
                                <div className={`
                            w-12 h-12 rounded-full mb-2.5 flex items-center justify-center text-lg font-black shadow-sm relative shrink-0 transition-transform group-
                            ${!student.avatar ? `${bgClass} ${textClass} border ${borderClass}` : 'bg-slate-50 border border-slate-100'}
                        `}>
                                    {student.avatar ? (
                                        <img src={student.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        nameChar
                                    )}

                                    {/* Gender Badge */}
                                    <div className={`
                                absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm
                                ${student.gender === 'male' ? 'bg-blue-400' : 'bg-pink-400'}
                            `}>
                                        {student.gender === 'male'
                                            ? <MaleIcon className="w-2.5 h-2.5 text-white" />
                                            : <FemaleIcon className="w-2.5 h-2.5 text-white" />
                                        }
                                    </div>
                                </div>

                                {/* Bottom: Info */}
                                <div className="w-full text-center flex flex-col items-center">
                                    {/* Name - Allow wrap, clear font */}
                                    <div className={`text-[14px] font-bold leading-tight mb-1.5 w-full break-words ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                                        {student.name}
                                    </div>

                                    {/* ID - Badge style for full visibility */}
                                    <div className={`
                                text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md tracking-tight w-fit max-w-full
                                ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400'}
                             `}>
                                        {student.id}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="h-10 text-center mt-8">
                    <span className="text-[10px] text-slate-300 uppercase tracking-widest opacity-60">- {students.length} Students -</span>
                </div>
            </div>

        </div>
    );
};

export default ClassDetailView;
