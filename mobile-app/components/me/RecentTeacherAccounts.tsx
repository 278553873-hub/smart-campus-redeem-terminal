import { useEffect, useRef, useState } from 'react';
import { getRecentTeacherLoginDestination, type RecentTeacherLogin } from '../../data/recentTeacherLogins';
import { maskTeacherLoginPhone } from '../../domain/teacherLoginAccess';
import MobileBottomSheet from '../ui/MobileBottomSheet';

interface Props {
    accounts: RecentTeacherLogin[];
    loginPhone?: string;
    onSwitch: (phone: string, signal: AbortSignal) => Promise<string | undefined>;
}

export default function RecentTeacherAccounts({ accounts, loginPhone, onSwitch }: Props) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState('');
    const [switchingPhone, setSwitchingPhone] = useState<string>();
    const request = useRef<AbortController | null>(null);
    useEffect(() => () => request.current?.abort(), []);

    const close = () => {
        request.current?.abort();
        request.current = null;
        setSwitchingPhone(undefined);
        setOpen(false);
    };

    const switchAccount = async (phone: string) => {
        if (request.current || phone === loginPhone) return;
        const controller = new AbortController();
        request.current = controller;
        setSwitchingPhone(phone);
        setError('');
        try {
            const failure = await onSwitch(phone, controller.signal);
            if (controller.signal.aborted) return;
            if (failure) setError(failure);
            else close();
        } finally {
            if (request.current === controller) {
                request.current = null;
                setSwitchingPhone(undefined);
            }
        }
    };

    return (
        <>
            <button type="button" aria-haspopup="dialog" aria-expanded={open}
                onClick={() => { setError(''); setOpen(true); }}
                className="flex min-h-[60px] w-full items-center justify-center rounded-[var(--tm-form-control-radius)] bg-[var(--tm-bg-surface)] px-3 text-[14px] font-semibold text-[var(--tm-text-primary)] [box-shadow:var(--tm-shadow-control)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tm-focus-ring)]">
                切换账号
            </button>
            <MobileBottomSheet open={open} title="切换账号" onClose={close}>
                {error && <p role="alert" className="pt-2 text-[length:var(--tm-font-size-meta)] text-[var(--tm-status-negative-strong)]">{error}</p>}
                <ul role="list" className="divide-y divide-[var(--tm-border-subtle)]" aria-label="最近登录的账号">
                    {accounts.map(login => {
                        const { account, name } = login;
                        const isCurrent = account.phone === loginPhone;
                        const maskedPhone = maskTeacherLoginPhone(account.phone);
                        const { spaceName, schoolCount, canRestore } = getRecentTeacherLoginDestination(login);
                        return (
                            <li key={account.phone} className="flex items-center justify-between gap-3 py-3">
                                <div className="min-w-0 break-words">
                                    <div className="flex flex-wrap items-baseline gap-x-2">
                                        <span className="text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{name}</span>
                                        <span className="text-[length:var(--tm-font-size-meta)] tabular-nums text-[var(--tm-text-secondary)]">{maskedPhone}</span>
                                    </div>
                                    <p className="mt-1 text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">
                                        {canRestore ? '上次使用：' : '进入：'}{spaceName}{schoolCount > 1 && ` · 共关联 ${schoolCount} 所学校`}
                                    </p>
                                </div>
                                <button type="button" disabled={isCurrent || Boolean(switchingPhone)} aria-label={isCurrent ? `${name}，当前账号` : `切换至${name}（${maskedPhone}）`}
                                    onClick={() => switchAccount(account.phone)}
                                    className="min-h-11 min-w-[4.5rem] shrink-0 rounded-[var(--tm-form-control-radius)] px-2 text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-brand-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tm-focus-ring)] disabled:text-[var(--tm-text-secondary)]">
                                    {isCurrent ? '当前账号' : switchingPhone === account.phone ? '切换中…' : '切换'}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </MobileBottomSheet>
        </>
    );
}
