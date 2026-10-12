import React from 'react';
import { UserRound } from 'lucide-react';
import type { Student } from '../../types';

interface StudentHorizontalCardProps {
  student: Student;
  avatarSrc?: string;
  action?: React.ReactNode;
}

/**
 * 横版学生卡片：一行展示头像、姓名与学号，右侧承载该场景的操作入口。
 * 用于更新人脸等需要逐生操作的列表；头像缺省时回退中性占位图标。
 */
const StudentHorizontalCard: React.FC<StudentHorizontalCardProps> = ({ student, avatarSrc, action }) => (
  <article className="rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-3)] py-[var(--tm-space-2)] [box-shadow:var(--tm-shadow-control)]">
    <div className="flex min-h-[var(--tm-size-touch)] items-center gap-[var(--tm-space-3)]">
      {avatarSrc
        ? <img src={avatarSrc} alt="" className="h-10 w-10 shrink-0 rounded-full bg-[var(--tm-bg-surface-muted)] object-cover" />
        : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-disabled)]" aria-hidden="true"><UserRound className="h-5 w-5" /></span>}
      <div className="min-w-0 flex-1">
        <strong className="block truncate text-[length:var(--tm-font-size-body)] text-[var(--tm-text-primary)]">{student.name}</strong>
        <small className="text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">{student.studentNo ?? student.id}</small>
      </div>
      {action}
    </div>
  </article>
);

export default StudentHorizontalCard;

