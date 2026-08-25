import React from 'react';
import type { Student } from '../../types';
import StudentCompactSelectItem from './StudentCompactSelectItem';

export interface StudentCompactSelectSection {
  id: string;
  label?: string;
  students: Student[];
}

interface StudentCompactSelectGridProps {
  sections: StudentCompactSelectSection[];
  isSelected: (studentId: string) => boolean;
  getSelectionDescription?: (student: Student) => string | undefined;
  onToggle: (studentId: string) => void;
  className?: string;
}

const StudentCompactSelectGrid: React.FC<StudentCompactSelectGridProps> = ({
  sections,
  isSelected,
  getSelectionDescription,
  onToggle,
  className = '',
}) => (
  <div className={`student-compact-select-sections space-y-3 pb-3 ${className}`}>
    {sections.map(section => (
      <section key={section.id} aria-labelledby={section.label ? `student-select-section-${section.id}` : undefined}>
        {section.label && (
          <div className="flex h-8 items-center text-[13px] font-semibold text-[var(--tm-text-secondary)]">
            <h3 id={`student-select-section-${section.id}`}>{section.label}</h3>
            <span className="ml-auto text-[12px] font-normal text-[var(--tm-text-tertiary)]">{section.students.length}人</span>
          </div>
        )}
        <div className="student-compact-select-grid grid gap-2">
          {section.students.map(student => (
            <StudentCompactSelectItem
              key={student.id}
              student={student}
              selected={isSelected(student.id)}
              selectionDescription={getSelectionDescription?.(student)}
              onClick={() => onToggle(student.id)}
            />
          ))}
        </div>
      </section>
    ))}
  </div>
);

export default StudentCompactSelectGrid;
