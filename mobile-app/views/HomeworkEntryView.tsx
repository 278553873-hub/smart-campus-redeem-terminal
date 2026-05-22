import React, { useState } from 'react';
import { ClassInfo, Student } from '../types';

interface HomeworkEntryViewProps {
    classInfo: ClassInfo;
    students: Student[];
    onBack: () => void;
}

const subjectOptions = ['语文', '书法'];
const statusOptions = ['优', '良', '合格', '待合格', '未交'];

const statusToneMap: Record<string, string> = {
    '优': 'border-green-600 bg-green-600 text-white shadow-green-100',
    '良': 'border-emerald-500 bg-emerald-500 text-white shadow-emerald-100',
    '合格': 'border-lime-500 bg-lime-500 text-white shadow-lime-100',
    '待合格': 'border-amber-500 bg-amber-500 text-white shadow-amber-100',
    '未交': 'border-rose-500 bg-rose-500 text-white shadow-rose-100'
};

const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
const studentGroupSize = 20;

const formatDateValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const parseDateValue = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const getTodayText = () => formatDateValue(new Date());

const getMonthGrid = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const leadingEmptyDays = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [
        ...Array.from({ length: leadingEmptyDays }, () => null),
        ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1))
    ];
};

const addMonths = (date: Date, offset: number) => new Date(date.getFullYear(), date.getMonth() + offset, 1);

const addDays = (date: Date, offset: number) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + offset);
    return nextDate;
};

const buildMockStatusMap = (students: Student[], count: number, shift = 0) => {
    const statusCycle = ['优', '良', '合格', '待合格'];
    return students.slice(0, Math.min(count, students.length)).reduce<Record<string, string>>((nextMap, student, index) => {
        nextMap[student.id] = statusCycle[(index + shift) % statusCycle.length];
        return nextMap;
    }, {});
};

const buildMockHomeworkResults = (students: Student[]) => {
    const today = new Date();
    const yesterday = formatDateValue(addDays(today, -1));
    const threeDaysAgo = formatDateValue(addDays(today, -3));
    const fiveDaysAgo = formatDateValue(addDays(today, -5));
    const eightDaysAgo = formatDateValue(addDays(today, -8));

    return {
        '语文': {
            [yesterday]: buildMockStatusMap(students, students.length),
            [threeDaysAgo]: buildMockStatusMap(students, Math.ceil(students.length * 0.65), 1),
            [eightDaysAgo]: buildMockStatusMap(students, students.length, 2)
        },
        '书法': {
            [formatDateValue(addDays(today, -2))]: buildMockStatusMap(students, Math.ceil(students.length * 0.5), 2),
            [fiveDaysAgo]: buildMockStatusMap(students, students.length, 1)
        }
    };
};

const HomeworkEntryView: React.FC<HomeworkEntryViewProps> = ({ classInfo, students, onBack }) => {
    const defaultSubject = subjectOptions[0];
    const [subject, setSubject] = useState(defaultSubject);
    const [homeworkName, setHomeworkName] = useState('');
    const [homeworkDate, setHomeworkDate] = useState(getTodayText());
    const [calendarMonth, setCalendarMonth] = useState(() => parseDateValue(getTodayText()));
    const [stickyContextProgress, setStickyContextProgress] = useState(0);
    const [homeworkResultsBySubject, setHomeworkResultsBySubject] = useState<Record<string, Record<string, Record<string, string>>>>(() => buildMockHomeworkResults(students));

    const todayText = getTodayText();
    const monthDays = getMonthGrid(calendarMonth);
    const subjectResultsByDate = homeworkResultsBySubject[subject] || {};
    const statusMap = subjectResultsByDate[homeworkDate] || {};
    const sortedStudents = [...students].sort((a, b) => {
        const firstStudentNo = a.studentNo || a.id;
        const secondStudentNo = b.studentNo || b.id;
        return firstStudentNo.localeCompare(secondStudentNo, 'zh-Hans-CN', { numeric: true });
    });
    const studentGroups = Array.from({ length: Math.ceil(sortedStudents.length / studentGroupSize) }, (_, index) => {
        const start = index * studentGroupSize;
        const items = sortedStudents.slice(start, start + studentGroupSize);
        return {
            key: `student-group-${index + 1}`,
            label: `${start + 1}-${Math.min(start + studentGroupSize, sortedStudents.length)}`,
            items
        };
    });
    const completedCount = students.filter(student => statusMap[student.id]).length;
    const progressText = `${completedCount}/${students.length}`;
    const selectedDate = parseDateValue(homeworkDate);
    const selectedDateText = `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日`;

    const updateHomeworkDateResults = (updater: (currentMap: Record<string, string>) => Record<string, string>) => {
        setHomeworkResultsBySubject(prev => {
            const currentSubjectResults = prev[subject] || {};
            const nextMap = updater(currentSubjectResults[homeworkDate] || {});
            return {
                ...prev,
                [subject]: {
                    ...currentSubjectResults,
                    [homeworkDate]: nextMap
                }
            };
        });
    };

    const getCalendarDateResultTone = (dateValue: string) => {
        const dateStatusMap = subjectResultsByDate[dateValue];
        if (!dateStatusMap) return '';
        const dateCompletedCount = students.filter(student => dateStatusMap[student.id]).length;
        if (dateCompletedCount === 0) return '';
        return dateCompletedCount === students.length ? 'bg-green-500' : 'bg-amber-500';
    };

    const scrollToStudentGroup = (groupKey: string) => {
        document.getElementById(groupKey)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const updateStudentStatus = (studentId: string, status: string) => {
        updateHomeworkDateResults(prev => {
            if (prev[studentId] === status) {
                const { [studentId]: _removed, ...rest } = prev;
                return rest;
            }
            return { ...prev, [studentId]: status };
        });
    };

    const applyQuickStatus = (status: string) => {
        updateHomeworkDateResults(() => students.reduce<Record<string, string>>((nextMap, student) => {
            nextMap[student.id] = status;
            return nextMap;
        }, {}));
    };

    const selectCalendarDate = (date: Date) => {
        setHomeworkDate(formatDateValue(date));
    };

    const jumpToToday = () => {
        const today = new Date();
        setHomeworkDate(formatDateValue(today));
        setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    };

    const handlePageScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const scrollTop = event.currentTarget.scrollTop;
        const nextProgress = Math.min(1, Math.max(0, (scrollTop - 180) / 80));
        setStickyContextProgress(nextProgress);
    };

    return (
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#F8FAFC]">
            <div className="flex-1 overflow-y-auto px-4 py-3 pb-4 no-scrollbar" onScroll={handlePageScroll}>
                <div className="-mx-4 overflow-visible bg-[#F8FAFC] px-6 pt-2">
                    <div className="flex items-end gap-2 overflow-x-auto pl-1 no-scrollbar">
                        {subjectOptions.map(item => {
                            const active = subject === item;
                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setSubject(item)}
                                    className={`relative shrink-0 px-6 text-[17px] font-semibold transition-all active:scale-95 ${active ? 'h-12 rounded-t-[24px] rounded-b-none bg-blue-600 text-white shadow-[0_-10px_24px_-18px_rgba(37,99,235,0.7)]' : 'h-10 rounded-t-[20px] rounded-b-none bg-white/78 text-slate-500 ring-1 ring-slate-200 shadow-sm shadow-slate-200/40'}`}
                                >
                                    {item}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <section className="-mt-px rounded-b-3xl rounded-tr-3xl border border-slate-100 bg-white p-3 shadow-sm">
                    <div className="mb-4 rounded-2xl bg-white">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCalendarMonth(prev => addMonths(prev, -1))}
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-slate-300 active:bg-slate-100"
                                    aria-label="上个月"
                                >
                                    ‹
                                </button>
                                <div className="min-w-[116px] text-center text-[17px] font-semibold text-slate-900">
                                    {calendarMonth.getFullYear()}年 {calendarMonth.getMonth() + 1}月
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCalendarMonth(prev => addMonths(prev, 1))}
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-slate-300 active:bg-slate-100"
                                    aria-label="下个月"
                                >
                                    ›
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={jumpToToday}
                                className="h-8 rounded-full border border-orange-300 px-4 text-sm font-semibold text-orange-500 active:bg-orange-50"
                            >
                                今天
                            </button>
                        </div>
                        <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-400">
                            {weekDays.map(day => (
                                <div key={day} className="py-2">{day}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-y-1 text-center">
                            {monthDays.map((date, index) => {
                                if (!date) return <div key={`empty-${index}`} className="h-10" />;
                                const value = formatDateValue(date);
                                const selected = value === homeworkDate;
                                const today = value === todayText;
                                const resultTone = getCalendarDateResultTone(value);
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => selectCalendarDate(date)}
                                        className="flex h-11 flex-col items-center justify-center"
                                    >
                                        <span className={`flex h-9 w-9 items-center justify-center rounded-full text-base font-medium ${selected ? 'bg-yellow-400 text-slate-950' : today ? 'bg-slate-100 text-slate-900' : 'text-slate-900'}`}>
                                            {today && !selected ? '今' : date.getDate()}
                                        </span>
                                        <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${resultTone || 'bg-transparent'}`} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <input
                        value={homeworkName}
                        onChange={event => setHomeworkName(event.target.value)}
                        placeholder="作业名称（选填）"
                        className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
                    />
                </section>

                <section className="rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-slate-900">批量操作</div>
                        <div className="text-sm font-semibold text-slate-500">{progressText}</div>
                    </div>
                    <div className="mb-3 grid grid-cols-5 gap-1.5">
                        {statusOptions.map(status => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => applyQuickStatus(status)}
                                className={`h-8 rounded-lg border text-xs font-semibold shadow-sm transition-transform active:scale-95 ${statusToneMap[status]}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                        {studentGroups.map(group => (
                            <button
                                key={group.key}
                                type="button"
                                onClick={() => scrollToStudentGroup(group.key)}
                                className="h-7 shrink-0 rounded-full bg-slate-100 px-3 text-xs font-semibold text-slate-600 active:bg-slate-200"
                            >
                                {group.label}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3">
                        {studentGroups.map(group => (
                            <div key={group.key} id={group.key} className="scroll-mt-3">
                                <div className="mb-1.5 px-1 text-xs font-semibold text-slate-500">第{group.label}人</div>
                                <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100">
                                    {group.items.map((student) => {
                                        const currentStatus = statusMap[student.id] || '';
                                        return (
                                            <div key={student.id} className="grid min-h-[46px] grid-cols-[76px_minmax(0,1fr)] items-center gap-2 bg-white px-2 py-1.5">
                                                <div className="min-w-0">
                                                    <div className="truncate text-[14px] font-semibold leading-5 text-slate-900">{student.name}</div>
                                                    <div className="text-[10px] font-medium leading-3 text-slate-400">{student.studentNo || student.id}</div>
                                                </div>
                                                <div className="grid grid-cols-5 gap-1">
                                                    {statusOptions.map(status => {
                                                        const active = currentStatus === status;
                                                        return (
                                                            <button
                                                                key={status}
                                                                type="button"
                                                                onClick={() => updateStudentStatus(student.id, status)}
                                                                className={`h-8 rounded-lg border text-[11px] font-semibold transition-all active:scale-95 ${active ? statusToneMap[status] : 'border-slate-200 bg-slate-50 text-slate-500'}`}
                                                            >
                                                                {status}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>


            <div
                aria-hidden={stickyContextProgress === 0}
                className="pointer-events-none absolute left-0 right-0 top-0 z-40 transition-[opacity,transform] duration-300 ease-out"
                style={{
                    opacity: stickyContextProgress,
                    transform: `translateY(${(1 - stickyContextProgress) * -12}px)`
                }}
            >
                <div className="flex h-11 items-center justify-between border-b border-slate-100 bg-white/96 px-8 text-xs font-semibold text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur-xl">
                    <span>{subject}</span>
                    <span>{selectedDateText}</span>
                </div>
            </div>

        </div>
    );
};

export default HomeworkEntryView;
