import React from 'react';
import { UserPlus, UsersRound } from 'lucide-react';

interface StudentTeamManagementActionsProps {
  onEditMembers: () => void;
  onInvite: () => void;
}

const gridItemClass = 'group flex min-h-[var(--tm-action-grid-item-height)] min-w-0 flex-col items-center justify-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] px-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]';

const StudentTeamManagementActions: React.FC<StudentTeamManagementActionsProps> = ({ onEditMembers, onInvite }) => {
  const items = [
    { label: '调整学生', icon: UsersRound, onClick: onEditMembers },
    { label: '邀请老师', icon: UserPlus, onClick: onInvite },
  ];
  return (
    <div className="grid grid-cols-4 gap-x-[var(--tm-space-3)] gap-y-[var(--tm-space-3)]">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <button key={item.label} type="button" onClick={item.onClick} className={gridItemClass}>
            <span className="relative flex h-[var(--tm-action-grid-icon-bg-size)] w-[var(--tm-action-grid-icon-bg-size)] shrink-0 items-center justify-center rounded-[var(--tm-action-grid-icon-radius)] bg-[var(--tm-class-action-collaboration-bg)]">
              <Icon className={`h-[var(--tm-action-grid-icon-size)] w-[var(--tm-action-grid-icon-size)] text-[var(--tm-class-action-collaboration-icon)]`} />
            </span>
            <span className="h-[var(--tm-action-grid-label-height)] max-w-full truncate whitespace-nowrap text-[length:var(--tm-font-size-meta)] font-medium leading-[18px] text-[var(--tm-text-primary)]">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default StudentTeamManagementActions;
