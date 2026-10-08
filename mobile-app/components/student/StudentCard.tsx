import React from 'react';
import type { Student, StudentCardDisplaySettings } from '../../types';
import type { StudentPerformanceSummary } from '../../domain/studentPerformance';
import StudentRosterCard from './StudentRosterCard';
import StudentCompactSelectItem from './StudentCompactSelectItem';

export type StudentCardVariant = 'full' | 'compact';

interface StudentCardBaseProps {
  student: Student;
  onClick: () => void;
}

export interface StudentCardFullProps extends StudentCardBaseProps {
  variant: 'full';
  index: number;
  performance: StudentPerformanceSummary;
  levelNetScore?: number;
  displaySettings: StudentCardDisplaySettings;
  showSelection: boolean;
  selected: boolean;
  selectionStatus?: string;
  contextLabel?: string;
}

export interface StudentCardCompactProps extends StudentCardBaseProps {
  variant: 'compact';
  selected: boolean;
  selectionDescription?: string;
  secondaryLabel?: string;
  showRosterNumber?: boolean;
}

export type StudentCardProps = StudentCardFullProps | StudentCardCompactProps;

/**
 * 教师手机端统一学生卡片入口。
 * full 对应班级列表与小组详情中的完整信息卡片；compact 对应分组、选人等弹窗中的轻量选择卡片。
 */
const StudentCard: React.FC<StudentCardProps> = props => {
  if (props.variant === 'full') {
    return (
      <StudentRosterCard
        student={props.student}
        index={props.index}
        performance={props.performance}
        levelNetScore={props.levelNetScore}
        displaySettings={props.displaySettings}
        showSelection={props.showSelection}
        selected={props.selected}
        selectionStatus={props.selectionStatus}
        contextLabel={props.contextLabel}
        onClick={props.onClick}
      />
    );
  }

  return (
    <StudentCompactSelectItem
      student={props.student}
      selected={props.selected}
      selectionDescription={props.selectionDescription}
      secondaryLabel={props.secondaryLabel}
      showRosterNumber={props.showRosterNumber}
      onClick={props.onClick}
    />
  );
};

export default StudentCard;
