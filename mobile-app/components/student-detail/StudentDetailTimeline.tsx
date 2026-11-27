import React from 'react';
import { ChevronRight } from 'lucide-react';
import { getStudentEvaluationDate } from '../../domain/studentDetailGrowth';
import type { StudentEvaluationRecord } from '../../views/student-evaluation/types';
import type { StudentTermOption } from './StudentTermSelector';
import './StudentDetailTimeline.css';

interface StudentDetailTimelineProps {
    records: readonly StudentEvaluationRecord[];
    term: StudentTermOption;
    onOpenRecord: (record: StudentEvaluationRecord) => void;
    onViewAll: () => void;
}

const monthLabel = (value: string) => `${Number(value.slice(5, 7))}月`;

export default function StudentDetailTimeline({
    records,
    term,
    onOpenRecord,
    onViewAll,
}: StudentDetailTimelineProps) {
    const termLabel = term.isCurrent ? '本学期' : '该学期';
    const recentRecords = records.filter(record => {
        const date = getStudentEvaluationDate(record);
        return date >= term.startDate && date <= term.endDate;
    }).sort((left, right) => (
        getStudentEvaluationDate(right).localeCompare(getStudentEvaluationDate(left))
        || (right.timestamp ?? '').localeCompare(left.timestamp ?? '')
    )).slice(0, 5);
    return (
        <section className="student-detail-timeline" aria-labelledby="student-detail-timeline-title">
            <div className="student-detail-timeline-controls">
                <h2 id="student-detail-timeline-title" className="student-detail-timeline-title">动态</h2>
                <button type="button" className="student-detail-timeline-all" onClick={onViewAll}>
                    全部评价 <ChevronRight size={14} aria-hidden="true" />
                </button>
            </div>
            {recentRecords.length > 0 ? (
                <ul>
                    {recentRecords.map(record => {
                        const date = getStudentEvaluationDate(record);
                        const photo = record.images?.[0];
                        return (
                            <li key={record.id}>
                                <button type="button" className="student-detail-timeline-row" onClick={() => onOpenRecord(record)}>
                                    <time className="student-detail-timeline-date" dateTime={date}>
                                        <span className="sr-only">{Number(date.slice(5, 7))}月{date.slice(8, 10)}日</span>
                                        <strong aria-hidden="true">{date.slice(8, 10)}</strong>
                                        <span aria-hidden="true">{monthLabel(date)}</span>
                                    </time>
                                    <span className="student-detail-timeline-copy">
                                        <span className="student-detail-timeline-text">{record.description || record.aiComment}</span>
                                        <span className="student-detail-timeline-author">{record.teacherName || record.guardianRelation}</span>
                                    </span>
                                    {photo && <img className="student-detail-timeline-media" src={photo} alt="" loading="lazy" />}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="student-detail-timeline-empty">{termLabel}暂无评价动态</p>
            )}
        </section>
    );
}
