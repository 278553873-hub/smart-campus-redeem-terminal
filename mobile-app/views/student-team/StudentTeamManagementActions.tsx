import React from 'react';
import { Settings, Trash2, UserPlus, UsersRound } from 'lucide-react';

interface StudentTeamManagementActionsProps {
  onEditMembers: () => void;
  onEditSettings: () => void;
  onInvite: () => void;
  onArchive: () => void;
}

const actionClassName = 'flex min-h-[56px] w-full items-center gap-3 rounded-[var(--tm-radius-inner)] px-3 text-left text-[14px] font-semibold text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-soft)]';

const StudentTeamManagementActions: React.FC<StudentTeamManagementActionsProps> = ({ onEditMembers, onEditSettings, onInvite, onArchive }) => (
  <div className="space-y-1 pb-2">
    <button type="button" onClick={onEditMembers} className={actionClassName}><UsersRound className="h-5 w-5 text-[var(--tm-action-icon-neutral)]" />调整学生</button>
    <button type="button" onClick={onEditSettings} className={actionClassName}><Settings className="h-5 w-5 text-[var(--tm-action-icon-neutral)]" />团队设置</button>
    <button type="button" onClick={onInvite} className={actionClassName}><UserPlus className="h-5 w-5 text-[var(--tm-action-icon-neutral)]" />邀请协作老师</button>
    <button type="button" onClick={onArchive} className={`${actionClassName} text-[var(--tm-status-negative)] active:bg-[var(--tm-status-negative-soft)]`}><Trash2 className="h-5 w-5 text-[var(--tm-action-icon-danger)]" />解散社团或团队</button>
  </div>
);

export default StudentTeamManagementActions;
