import React, { useMemo } from 'react';
import { createDemoVendingExchangeRecords } from '../../data/vendingExchange';
import { applyManualVendingRefunds, getVendingExchangeAuthorizedClasses, type VendingExchangeRecord } from '../../domain/vendingExchange';
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
  onRevokeEntry: (entryId: string) => void;
  onBack: () => void;
  manualRefunds?: readonly VendingExchangeRecord[];
  onRefundRecord?: (record: VendingExchangeRecord) => void;
  canRefundRecord?: (record: VendingExchangeRecord) => boolean;
}

/** 演示适配层：沿用货柜管理的同一批兑换记录，只截取当前班级。 */
export default function ClassExchangeRecordsDemoView({
  classInfo, space, hasCabinet = true, teacher, classes, getStudents, students, entries, onRevokeEntry, onBack,
  manualRefunds = [], onRefundRecord, canRefundRecord,
}: Props) {
  const today = useMemo(() => localToday(), []);
  const cabinetClassInfo = useMemo(() => ({
    ...classInfo,
    name: getTeacherClassDisplayName(classInfo, space),
  }), [classInfo, space]);
  const cabinet = useMemo(() => {
    if (space.type !== 'school' || !hasCabinet) return null;
    const authorizedClasses = getVendingExchangeAuthorizedClasses(space, teacher, classes);
    const records = createDemoVendingExchangeRecords({
      schoolId: space.id,
      classes: authorizedClasses,
      getStudents,
      today,
      getClassLabel: item => getTeacherClassDisplayName(item, space),
    });
    return {
      schoolId: space.id,
      classInfo: cabinetClassInfo,
      records: applyManualVendingRefunds(records.filter(record => record.classId === classInfo.id), manualRefunds),
    };
  }, [cabinetClassInfo, classInfo.id, classes, getStudents, hasCabinet, manualRefunds, space, teacher, today]);

  return (
    <ClassExchangeRecordView
      students={students}
      entries={entries}
      cabinet={cabinet}
      onRefundRecord={onRefundRecord}
      canRefundRecord={canRefundRecord}
      onRevokeEntry={onRevokeEntry}
      onBack={onBack}
    />
  );
}
