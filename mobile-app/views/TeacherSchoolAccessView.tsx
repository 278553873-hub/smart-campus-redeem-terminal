import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import TeacherEditionComparison from '../components/login/TeacherEditionComparison';
import MobileQuoteNote from '../components/ui/MobileQuoteNote';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import { mobileSheetActionClass } from '../components/ui/mobileSheetActionStyles';
import { maskTeacherLoginPhone } from '../domain/teacherLoginAccess';

interface TeacherSchoolAccessViewProps {
  phone: string;
  onEnterPersonal: () => void;
  onReturnToLogin: () => void;
}

const TeacherSchoolAccessView: React.FC<TeacherSchoolAccessViewProps> = ({ phone, onEnterPersonal, onReturnToLogin }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [schoolLoginOpen, setSchoolLoginOpen] = useState(false);
  useEffect(() => titleRef.current?.focus({ preventScroll: true }), []);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)] antialiased">
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-[var(--tm-space-6)] pb-[calc(var(--tm-space-6)+var(--mini-program-bottom-safe-area,env(safe-area-inset-bottom)))] pt-[calc(var(--mini-program-status-bar-height,0px)+var(--mini-program-title-bar-height,0px)+var(--tm-space-4))]">
        <header>
          <h1 tabIndex={-1} ref={titleRef} className="text-balance text-[length:var(--tm-font-size-page-title)] font-bold leading-tight outline-none">暂未关联学校</h1>
        </header>

        <MobileQuoteNote
          ariaLabel="学校关联提醒"
          summary="学校已统一使用？"
          supplement="请联系学校负责人添加账号，避免重新建班、导入学生。"
          className="mt-[var(--tm-space-4)]"
        />

        <div className="mx-[var(--tm-space-4)] mt-[var(--tm-space-6)]">
          <button type="button" onClick={onEnterPersonal} className="flex min-h-12 w-full items-center justify-center rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-brand-primary)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-inverse)] transition-colors [transition-duration:var(--tm-duration-fast)] active:bg-[var(--tm-brand-primary-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] focus-visible:ring-offset-2 motion-reduce:transition-none">
            个人版（试用）
          </button>
          <button type="button" onClick={() => setSchoolLoginOpen(true)} aria-haspopup="dialog" className="mt-[var(--tm-space-2)] flex min-h-11 w-full items-center justify-center rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-brand-primary-soft)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-brand-primary)] transition-colors [transition-duration:var(--tm-duration-fast)] active:bg-[var(--tm-brand-primary-soft-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] motion-reduce:transition-none">
            学校版（登录）
          </button>
        </div>

        <details className="group mt-[var(--tm-space-4)]">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-[var(--tm-space-3)] rounded-[var(--tm-radius-control-compact)] text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] [&::-webkit-details-marker]:hidden">
            个人版与学校版有什么不同？
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-[var(--tm-duration-fast)] group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
          </summary>
          <TeacherEditionComparison />
        </details>
      </main>
      <MobileBottomSheet
        open={schoolLoginOpen}
        title="请先添加学校账号"
        onClose={() => setSchoolLoginOpen(false)}
        footer={(
          <button type="button" onClick={onReturnToLogin} className={`${mobileSheetActionClass} flex w-full items-center justify-center bg-[var(--tm-brand-primary)] px-[var(--tm-space-4)] font-semibold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] focus-visible:ring-offset-2`}>
            退出登录
          </button>
        )}
      >
        <p className="text-pretty text-[length:var(--tm-font-size-body)] font-medium leading-6 text-[var(--tm-text-secondary)]">
          请联系学校负责人，将此账号<span className="whitespace-nowrap tabular-nums">（{maskTeacherLoginPhone(phone)}）</span>添加至学校。添加完成后，重新登录即可使用学校版。
        </p>
      </MobileBottomSheet>
    </div>
  );
};

export default TeacherSchoolAccessView;
