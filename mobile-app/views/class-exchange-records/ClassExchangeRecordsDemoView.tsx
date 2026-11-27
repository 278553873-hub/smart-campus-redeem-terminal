import React, { useMemo } from 'react';
import { createDemoVendingExchangeRecords } from '../../data/vendingExchange';
import { applyVendingCorrections, getVendingExchangeAuthorizedClasses, type VendingExchangeActions, type VendingExchangeRecord } from '../../domain/vendingExchange';
import { getTeacherClassDisplayName, type TeacherSpaceOption } from '../../domain/teacherSpaceAccess';
import { localToday } from '../../components/ui/mobileDatePickerModel';
import type { CampusCoinLedgerEntry } from '../../domain/campusCoinLedger';
import type { ClassInfo, Student, TeacherProfile } from '../../types';
import ClassExchangeRecordView from '../ClassExchangeRecordView';

interface Props {
  classInfo: ClassInfo;
  space: TeacherSpaceOption;
  hasCabinet?: boolean;
  teacher: TeacherProfile;
  classes: readonly ClassInfo[];
  getStudents: (classId: string) => readonly Student[];
  students: Student[];
  entries: CampusCoinLedgerEntry[];
  onRevokeEntry: (entryId: string) => void | Promise<void>;
  onBack: () => void;
  corrections?: Readonly<Record<string, VendingExchangeRecord>>;
  actions?: VendingExchangeActions;
}

/** 演示适配层：沿用货柜管理的同一批兑换记录，只截取当前班级。 */
export default function ClassExchangeRecordsDemoView({
  classInfo, space, hasCabinet = true, teacher, classes, getStudents, students, entries, onRevokeEntry, onBack,
  corrections = {}, actions,
}: Props) {
  const today = useMemo(() => localToday(), []);
  const cabinetClassInfo = useMemo(() => ({
    ...classInfo,
    name: getTeacherClassDisplayName(classInfo, space),
  }), [classInfo, space]);
  const cabinet = useMemo(() => {
    if (space.type !== 'school' || !hasCabinet) return null;
    const authorizedClasses = getVendingExchangeAuthorizedClasses(space, teacher, classes);
    if (!authorizedClasses.some(item => item.id === classInfo.id)) return null;
    const records = createDemoVendingExchangeRecords({
      schoolId: space.id,
      classes: [classInfo],
      classOrder: classes,
      getStudents,
      today,
      getClassLabel: item => getTeacherClassDisplayName(item, space),
    });
    return {
      schoolId: space.id,
      classInfo: cabinetClassInfo,
      records: applyVendingCorrections(records, corrections).filter(record => record.classId === classInfo.id),
    };
  }, [cabinetClassInfo, classInfo, classes, getStudents, hasCabinet, corrections, space, teacher, today]);

  return (
    <ClassExchangeRecordView
      students={students}
      entries={entries}
      cabinet={cabinet}
      actions={actions}
      onRevokeEntry={onRevokeEntry}
      onBack={onBack}
    />
  );
}
