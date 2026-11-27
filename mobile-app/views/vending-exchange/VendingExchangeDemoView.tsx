import React, { useMemo, useState } from 'react';
import { createDemoVendingCabinets, createDemoVendingExchangeRecords } from '../../data/vendingExchange';
import { applyVendingCorrections, getVendingExchangeAuthorizedClasses, type VendingExchangeActions, type VendingExchangeRecord } from '../../domain/vendingExchange';
import { getTeacherClassDisplayName, type TeacherSpaceOption } from '../../domain/teacherSpaceAccess';
import { localToday } from '../../components/ui/mobileDatePickerModel';
import type { ClassInfo, Student, TeacherProfile } from '../../types';
import VendingExchangeView from '../VendingExchangeView';

/** 演示适配层独立于明细页；真实接口传入权限范围、当前货柜库存和历史兑换记录。 */
export default function VendingExchangeDemoView({ space, teacher, classes, getStudents, onBack, corrections = {}, actions }: {
  space: TeacherSpaceOption;
  teacher: TeacherProfile;
  classes: readonly ClassInfo[];
  getStudents: (classId: string) => readonly Student[];
  onBack: () => void;
  corrections?: Readonly<Record<string, VendingExchangeRecord>>;
  actions?: VendingExchangeActions;
}) {
  const [today] = useState(localToday);
  const cabinets = useMemo(() => space.type === 'school' ? createDemoVendingCabinets(space.id) : [], [space.id, space.type]);
  const authorizedClasses = useMemo(() => getVendingExchangeAuthorizedClasses(space, teacher, classes), [space, teacher, classes]);
  const baseRecords = useMemo(() => createDemoVendingExchangeRecords({
    schoolId: space.id, classes: authorizedClasses, classOrder: classes, getStudents, today,
    getClassLabel: item => getTeacherClassDisplayName(item, space),
  }), [space, authorizedClasses, classes, getStudents, today]);
  const records = useMemo(() => applyVendingCorrections(baseRecords, corrections), [baseRecords, corrections]);
  const displayClasses = authorizedClasses.map(item => ({ ...item, name: getTeacherClassDisplayName(item, space) }));
  return <VendingExchangeView schoolId={space.id} authorizedClasses={displayClasses} cabinets={cabinets} records={records} today={today} onBack={onBack} actions={actions} />;
}
