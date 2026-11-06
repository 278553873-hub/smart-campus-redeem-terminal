import React, { useMemo, useState } from 'react';
import { createDemoVendingExchangeRecords } from '../../data/vendingExchange';
import { getVendingExchangeAuthorizedClasses } from '../../domain/vendingExchange';
import { getTeacherClassDisplayName, type TeacherSpaceOption } from '../../domain/teacherSpaceAccess';
import { localToday } from '../../components/ui/mobileDatePickerModel';
import type { ClassInfo, Student, TeacherProfile } from '../../types';
import VendingExchangeView from '../VendingExchangeView';

/** 演示适配层独立于明细页；真实接口只需传入权限范围和兑换记录。 */
export default function VendingExchangeDemoView({ space, teacher, classes, getStudents, onBack }: {
  space: TeacherSpaceOption;
  teacher: TeacherProfile;
  classes: readonly ClassInfo[];
  getStudents: (classId: string) => readonly Student[];
  onBack: () => void;
}) {
  const [today] = useState(localToday);
  const authorizedClasses = useMemo(() => getVendingExchangeAuthorizedClasses(space, teacher, classes), [space, teacher, classes]);
  const records = useMemo(() => createDemoVendingExchangeRecords({
    schoolId: space.id, classes: authorizedClasses, getStudents, today,
    getClassLabel: item => getTeacherClassDisplayName(item, space),
  }), [space, authorizedClasses, getStudents, today]);
  const displayClasses = authorizedClasses.map(item => ({ ...item, name: getTeacherClassDisplayName(item, space) }));
  return <VendingExchangeView schoolId={space.id} authorizedClasses={displayClasses} records={records} today={today} onBack={onBack} />;
}
